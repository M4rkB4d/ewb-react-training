# B03 — API Integration

> **EastWest Bank — Digital Platforms & Innovations**
>
> Part B (Vite SPA) · Level 5 — Data and Auth

---

## What You Will Learn

By the end of this guide, you will:

- Make your first API call with `fetch()` and validate the response with Zod
- Configure Axios as a robust HTTP client with base URL, timeout, and credentials
- Add interceptors for authentication and error handling
- Build a type-safe API layer with Zod schemas for all endpoints
- Integrate with TanStack Query for declarative data fetching
- Handle mutations with server-confirmed cache invalidation (no optimistic updates)
- Build structured error handling with custom error classes and smart retry logic
- Test the full API stack with MSW
- Build account feature components with DPA-compliant data masking
- Virtualize long transaction lists with `@tanstack/react-virtual`
- Organize feature modules with barrel exports

---

## Prerequisites

| Requirement | Where |
|------------|-------|
| Completed A09 — State Management | Level 4 |
| Completed A10 — Testing Components and Hooks | Level 4 |
| Axios installed | B01 |
| TanStack Query configured | A09 |

---

## Phase 1 — Your First API Call

Before reaching for any library, you need to understand what an API call actually does at the browser level. In this phase, you will make a raw `fetch()` call and validate the response with Zod. Once you see the pattern, you will understand exactly what Axios improves upon in Phase 2.

### Raw fetch with Zod validation

```tsx
// src/lib/fetch-accounts.ts
import { z } from 'zod';

const accountSchema = z.object({
  id: z.string(),
  name: z.string(),
  balance: z.number().int().nonnegative(),
});

type Account = z.infer<typeof accountSchema>;

export async function fetchAccounts(): Promise<Account[]> {
  const response = await fetch('/api/accounts', {
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const json: unknown = await response.json();
  return z.array(accountSchema).parse(json); // Zod validates at runtime
}
```

This works — but notice the friction. You must manually check `response.ok`, manually parse JSON, and there is no built-in way to attach auth tokens or retry logic to every request. Every API function would repeat this boilerplate.

### A simple MSW mock to test against

Before calling a real backend, set up a mock so you can develop and test in isolation:

```tsx
// src/test/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/accounts', () => {
    return HttpResponse.json([
      { id: 'acc-1', name: 'Personal Savings', balance: 15_000_000 }, // centavos — ₱150,000.00
    ]);
  }),
];
```

With MSW intercepting network requests, your `fetchAccounts()` function works without a running backend. The Zod schema catches any shape mismatch between what the mock returns and what your code expects.

### Checkpoint 1

Try removing the `id` field from the MSW mock response. What error does Zod throw? This is the safety net — if the backend changes its response shape, you find out immediately instead of rendering `undefined` in the UI.

---

## Phase 2 — Axios Client Setup

Now that you understand raw `fetch()` and its limitations, it is time to introduce Axios. Axios solves the boilerplate problems you just encountered: it throws on non-2xx status codes automatically, parses JSON by default, and — most importantly — supports interceptors that let you attach auth tokens and error handling to every request without modifying individual API functions.

### Why Axios over fetch

EastWest Bank standardizes on Axios for all HTTP communication:

| Feature | fetch | Axios |
|---------|-------|-------|
| Request/response interceptors | No | Yes |
| Automatic JSON parsing | No | Yes |
| Request cancellation | AbortController | Built-in + AbortController |
| Timeout configuration | Manual | Built-in |
| Error handling | Must check `response.ok` | Throws on 4xx/5xx |
| Request/response transform | Manual | Built-in |

Interceptors are the critical differentiator — they enable centralized auth token
injection, error logging, and audit trail capture without modifying individual API calls.

> **Security Note:** Always use the latest stable Axios version. Run
> `npm audit` regularly — Axios has had past vulnerabilities including
> CSRF token leakage (CVE-2023-45857) and SSRF via proxy misconfiguration.

### Base client setup

```tsx
// src/lib/api-client.ts
import axios from 'axios';
import { env } from './env';

export const apiClient = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Send HttpOnly cookies (refresh token)
});
```

`withCredentials: true` ensures the browser sends HttpOnly cookies with every
request. The refresh token lives in an HttpOnly cookie managed by the backend —
our frontend never reads or writes it directly.

Compare this to the raw `fetch()` version: base URL, timeout, headers, and credentials are configured once. Every call through `apiClient` inherits them automatically — the same improvement pattern as a `cn()` utility over raw class string concatenation.

### TypeScript module augmentation

Before adding interceptors in the next phase, you need to extend the Axios type definitions to support a `_retry` flag. This flag will prevent infinite refresh loops when a 401 is encountered:

```tsx
// src/lib/api-client.ts (continued)

// Extend Axios config to track retry state (TypeScript-safe)
declare module 'axios' {
  interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}
```

This is a TypeScript module augmentation — it adds the `_retry` property to Axios's internal config type so you can use it without type errors. You will see it in action in Phase 3.

### Checkpoint 2

Explain why `withCredentials: true` is necessary for our auth strategy but would
be a security risk if the API allowed `Access-Control-Allow-Origin: *`.

---

## Phase 3 — Auth Interceptors

With the base client configured, you can now add the behavior that makes Axios worth the dependency: interceptors. Request interceptors run before every outgoing request (injecting the auth token). Response interceptors run after every response (handling 401s with silent token refresh). This is the centralized auth layer — individual API functions never think about tokens.

### Auth token injection

```tsx
// src/lib/api-client.ts (continued)
import { useAuthStore } from '@/stores/auth-store';

// Request interceptor — attach access token
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;

    if (token != null) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // BSP 1019 — Request correlation ID for audit trail
    config.headers['X-Request-ID'] = crypto.randomUUID();
    config.headers['X-Timestamp'] = new Date().toISOString();

    return config;
  },
  (error) => Promise.reject(error),
);
```

We read the token from the Zustand store using `getState()` — this works outside
of React components because Zustand stores are plain JavaScript objects.

### Response interceptor with token refresh

```tsx
// src/lib/api-client.ts (continued)

// Refresh token race condition prevention:
// When multiple requests fail with 401 simultaneously (e.g., a dashboard
// loading 5 API calls at once), without this guard each would trigger its
// own refresh request. The first would succeed but the rest would fail
// (the old refresh token is now invalidated). This mutex ensures only one
// refresh runs; all others wait for its result.
let refreshPromise: Promise<string> | null = null;

function refreshAccessToken(): Promise<string> {
  if (refreshPromise != null) return refreshPromise;

  refreshPromise = axios
    .post(`${env.VITE_API_BASE_URL}/auth/refresh`, null, {
      withCredentials: true,
    })
    .then(({ data }) => {
      useAuthStore.getState().setAuth(data.user, data.accessToken);
      return data.accessToken as string;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const originalRequest = error.config;

    // 401 — Token expired, attempt refresh (with race condition guard)
    if (status === 401 && originalRequest != null && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newToken = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch {
        // If multiple requests 401 simultaneously, each enters this catch
        // after the single refresh attempt fails. clearAuth() and the redirect
        // are idempotent — calling them more than once is harmless.
        useAuthStore.getState().clearAuth();
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    // 403 — Insufficient permissions
    if (status === 403) {
      console.error('[API] Forbidden:', originalRequest?.url);
    }

    // 429 — Rate limited
    if (status === 429) {
      console.warn('[API] Rate limited:', originalRequest?.url);
    }

    return Promise.reject(error);
  },
);
```

The 401 interceptor implements **silent token refresh**: when the access token
expires, the interceptor calls `/auth/refresh` (which uses the HttpOnly cookie),
gets a new access token, updates the auth store, and retries the original request.
The user never sees a login screen for expired tokens.

The `refreshPromise` mutex is critical for banking dashboards. A typical dashboard
page fires 5–10 API calls on mount. If the access token expires between sessions,
all of them hit 401 simultaneously. Without the mutex, you get 5–10 concurrent
refresh requests — the first succeeds and invalidates the refresh token, but the
remaining requests fail because they are trying to use an already-consumed refresh
token. The mutex ensures exactly one refresh call runs; every other 401 handler
awaits the same promise and retries with the new token.

> **BSP 982 Critical:** The refresh endpoint uses `withCredentials: true` on a
> fresh Axios instance (not `apiClient`) to avoid infinite loops. The refresh
> token in the HttpOnly cookie is the only credential sent — no access token
> needed.

### Request logging interceptor

```tsx
// src/lib/api-client.ts (continued)

// BSP 1019 — Structured request/response logging
apiClient.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.info('[API]', response.config.method?.toUpperCase(), response.config.url, response.status);
    }
    return response;
  },
);
```

### Checkpoint 3

Why does the 401 refresh logic use a plain `axios.post()` instead of `apiClient.post()`?
What would happen if it used `apiClient`?

Answer: Infinite loop. If `apiClient.post('/auth/refresh')` returned 401, the
interceptor would try to refresh again, which would 401 again, creating an
infinite loop. Using plain `axios` bypasses the interceptors.

---

## Phase 4 — Type-Safe API Functions

You now have a fully configured HTTP client with auth and error handling built in. The next step is building the API functions that the rest of the application calls. Each function defines a Zod schema for its response, makes the request through `apiClient`, and validates the data before returning it. This is the contract between your frontend and the backend.

### Shared type definitions

Before building API functions, define the shared domain types that multiple features
will reference. These plain TypeScript interfaces mirror the shapes validated by Zod
but are available to components that don't need runtime validation:

```tsx
// src/types/account.ts
export type AccountType = 'savings' | 'checking' | 'time-deposit' | 'current';
export type AccountStatus = 'active' | 'dormant' | 'frozen' | 'closed';
export type Currency = 'PHP' | 'USD' | 'EUR' | 'JPY' | 'CNY';

export interface Account {
  id: string;
  accountNumber: string;
  accountName: string;
  type: AccountType;
  /** Balance in centavos (integer). */
  balance: number;
  /** Available balance in centavos (integer). */
  availableBalance: number;
  currency: Currency;
  status: AccountStatus;
  openedDate: string;
  lastActivityDate: string;
}
```

```tsx
// src/types/transaction.ts
import type { Currency } from './account';

export type TransactionType = 'credit' | 'debit' | 'transfer' | 'payment' | 'fee';

export type TransactionStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'reversed'
  | 'cancelled';

export interface TransactionMetadata {
  channel: 'web' | 'mobile' | 'atm' | 'branch';
  ipAddress?: string;
  deviceId?: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  type: TransactionType;
  amount: number;
  currency: Currency;
  description: string;
  referenceNumber: string;
  status: TransactionStatus;
  createdAt: string;
  processedAt: string | null;
  metadata: TransactionMetadata;
}
```

These are the "full" domain types used across the application. Each feature may also
define its own narrower types — the API functions below infer types from Zod schemas,
which is the preferred approach for data coming directly from API responses. The shared
types above are useful for props interfaces, store state, and cross-feature contracts.

### Feature-level types

The accounts feature defines its own lean types for internal use — smaller than the
shared types, focused on what the account UI actually renders:

```tsx
// src/features/accounts/types.ts
export type AccountType = 'savings' | 'checking' | 'time-deposit';

export interface Account {
  id: string;
  name: string;
  number: string;
  type: AccountType;
  /** Balance in centavos (integer). ₱1,500.00 = 150000. */
  balance: number;
  currency: string;
  isActive: boolean;
}

export type TransactionType = 'debit' | 'credit';

export interface Transaction {
  id: string;
  date: string;
  description: string;
  /** Amount in centavos (integer). */
  amount: number;
  type: TransactionType;
  /** Running balance in centavos (integer). */
  balance: number;
  reference: string;
  channel: string;
}
```

Notice the feature types are leaner than the shared types — they only include the fields
the account feature's components actually use. The Zod schemas in the API functions
(below) validate against this shape. If the backend adds new fields, Zod strips them
by default (`z.object` ignores unknown keys), keeping the feature boundary clean.

### API function pattern

```tsx
// src/features/accounts/api/accounts-api.ts
import { z } from 'zod';
import { apiClient } from '@/lib/api-client';

// 1. Define the schema
const accountSchema = z.object({
  id: z.string(),
  name: z.string(),
  number: z.string(),
  type: z.enum(['savings', 'checking', 'time-deposit']),
  balance: z.number().int().nonnegative(), // Centavos — avoids IEEE 754 floating-point errors
  currency: z.string().default('PHP'),
  isActive: z.boolean(),
});

export type Account = z.infer<typeof accountSchema>;

// 2. Define the API function with Zod validation
export async function getAccounts(): Promise<Account[]> {
  const response = await apiClient.get('/accounts');
  // BSP 1122 — Validate all external data
  return z.array(accountSchema).parse(response.data);
}

export async function getAccount(id: string): Promise<Account> {
  const response = await apiClient.get(`/accounts/${id}`);
  return accountSchema.parse(response.data);
}

// Object-style API for hooks that prefer method syntax
export const accountsApi = {
  getAll: getAccounts,
  getById: getAccount,
};
```

The object-style `accountsApi` export gives hooks a cleaner import — `accountsApi.getById`
reads better inside a `queryFn` than a bare `getAccount`. Both forms are available;
standalone functions work fine for one-off calls.

### Why centavos, not pesos?

All monetary amounts in our API use **integer centavos** (₱100.50 = `10050`). This avoids
IEEE 754 floating-point errors where `0.1 + 0.2 !== 0.3` in JavaScript. In banking,
a rounding error of even one centavo across thousands of transactions is unacceptable.

The frontend converts to display format only at the presentation layer:

```tsx
// src/lib/format.ts
export function formatPHP(centavos: number, locale: string = 'en-PH'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(centavos / 100);
}

// Usage: formatPHP(10050) → "₱100.50"
```

This is a standard practice across all financial APIs. Never store or transmit money
as a floating-point number.

### Transaction API with pagination

```tsx
// src/features/accounts/api/transactions-api.ts
import { z } from 'zod';
import { apiClient } from '@/lib/api-client';

const transactionSchema = z.object({
  id: z.string(),
  date: z.string().datetime(),
  description: z.string(),
  amount: z.number().int(), // Centavos
  type: z.enum(['credit', 'debit']),
  balance: z.number().int().nonnegative(), // Centavos
  reference: z.string(),
  channel: z.string(),
});

export type Transaction = z.infer<typeof transactionSchema>;

const paginatedResponseSchema = z.object({
  data: z.array(transactionSchema),
  meta: z.object({
    page: z.number(),
    pageSize: z.number(),
    totalPages: z.number(),
    totalItems: z.number(),
  }),
});

export type PaginatedTransactions = z.infer<typeof paginatedResponseSchema>;

interface TransactionParams {
  accountId: string;
  page?: number;
  pageSize?: number;
  startDate?: string;
  endDate?: string;
}

export async function getTransactions(params: TransactionParams): Promise<PaginatedTransactions> {
  const { accountId, page = 1, pageSize = 20, startDate, endDate } = params;

  const response = await apiClient.get(`/accounts/${accountId}/transactions`, {
    params: { page, pageSize, startDate, endDate },
  });

  return paginatedResponseSchema.parse(response.data);
}
```

### Transfer API

```tsx
// src/features/transfers/api/transfers-api.ts
import { z } from 'zod';
import { apiClient } from '@/lib/api-client';

const transferRequestSchema = z.object({
  fromAccount: z.string(),
  toAccount: z.string(),
  amount: z.number().int().positive(), // Centavos — ₱100.50 is stored as 10050
  notes: z.string().optional(),
});

export type TransferRequest = z.infer<typeof transferRequestSchema>;

const transferResponseSchema = z.object({
  id: z.string(),
  status: z.enum(['completed', 'pending', 'failed']),
  referenceNumber: z.string(),
  timestamp: z.string().datetime(),
});

export type TransferResponse = z.infer<typeof transferResponseSchema>;

export async function createTransfer(payload: TransferRequest): Promise<TransferResponse> {
  // Validate outgoing payload too — defense in depth
  const validated = transferRequestSchema.parse(payload);
  const response = await apiClient.post('/transfers', validated);
  return transferResponseSchema.parse(response.data);
}
```

### Transfer form schema

The transfer form needs its own Zod schema separate from the API request schema.
Form schemas validate user input (amounts in pesos, human-readable format), while
API schemas validate wire format (amounts in centavos, machine format). The
conversion happens at the boundary between form and API:

```tsx
// src/schemas/transferForm.ts
import { z } from 'zod';

export const transferFormSchema = z.object({
  fromAccount: z.string().min(1, 'Select a source account'),
  toAccount: z.string().min(1, 'Select a destination account'),
  amount: z
    .number({ invalid_type_error: 'Amount must be a number' })
    .positive('Amount must be greater than zero')
    .max(1_000_000, 'Maximum transfer amount is ₱1,000,000'),
  note: z.string().max(200, 'Note must be 200 characters or less').optional(),
}).refine(
  (data) => data.fromAccount !== data.toAccount,
  {
    message: 'Source and destination accounts must be different',
    path: ['toAccount'],
  }
);

export type TransferFormData = z.infer<typeof transferFormSchema>;
```

The `.refine()` at the end is a cross-field validation — it checks a condition that
depends on multiple fields (source ≠ destination). Zod runs `.refine()` validators
after all individual field validations pass. The `path: ['toAccount']` tells Zod
which field to attach the error to, so your form can highlight the right input.

### Checkpoint 4

Why do we validate the outgoing payload in `createTransfer` even though the
server will also validate it?

---

## Phase 5 — TanStack Query (Reads)

With type-safe API functions in place, you can now connect them to React's rendering cycle. TanStack Query handles caching, background refetching, loading states, and error states — all declaratively. This phase covers read operations only. Mutations (writes) come in Phase 6, because reads and writes have fundamentally different cache semantics.

### Query key factories

```tsx
// src/features/accounts/queries.ts
export const accountKeys = {
  all: ['accounts'] as const,
  lists: () => [...accountKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...accountKeys.lists(), filters] as const,
  details: () => [...accountKeys.all, 'detail'] as const,
  detail: (id: string) => [...accountKeys.details(), id] as const,
  transactions: (id: string, filters?: Record<string, unknown>) =>
    [...accountKeys.detail(id), 'transactions', ...(filters != null ? [filters] : [])] as const,
  balance: (id: string) => [...accountKeys.detail(id), 'balance'] as const,
};
```

### Query hooks

```tsx
// src/features/accounts/hooks/use-accounts.ts
import { useQuery } from '@tanstack/react-query';
import { getAccounts } from '../api/accounts-api';
import { accountKeys } from '../queries';

export function useAccounts() {
  return useQuery({
    queryKey: accountKeys.lists(),
    queryFn: getAccounts,
  });
}
```

```tsx
// src/features/accounts/hooks/use-account.ts
import { useQuery } from '@tanstack/react-query';
import { getAccount } from '../api/accounts-api';
import { accountKeys } from '../queries';

export function useAccount(id: string) {
  return useQuery({
    queryKey: accountKeys.detail(id),
    queryFn: () => getAccount(id),
    enabled: id !== '',
  });
}
```

```tsx
// src/features/accounts/hooks/use-transactions.ts
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getTransactions } from '../api/transactions-api';
import { accountKeys } from '../queries';

interface UseTransactionsOptions {
  accountId: string;
  page?: number;
  pageSize?: number;
  startDate?: string;
  endDate?: string;
}

export function useTransactions(options: UseTransactionsOptions) {
  const { accountId, page = 1, pageSize = 20, startDate, endDate } = options;

  return useQuery({
    queryKey: accountKeys.transactions(accountId, { page, pageSize, startDate, endDate }),
    queryFn: () => getTransactions({ accountId, page, pageSize, startDate, endDate }),
    enabled: accountId !== '',
    placeholderData: keepPreviousData, // Smooth pagination transitions
  });
}
```

### Derived query: account balance

Sometimes you need a single derived value from a query. The `select` option transforms
the cached data without a separate network request:

```tsx
// src/features/accounts/hooks/use-account-balance.ts
import { useQuery } from '@tanstack/react-query';
import { accountsApi } from '../api/accounts-api';
import { accountKeys } from '../queries';

export function useAccountBalance(accountId: string) {
  return useQuery({
    queryKey: accountKeys.balance(accountId),
    queryFn: () => accountsApi.getById(accountId),
    select: (account) => account.balance,
    enabled: accountId !== '',
  });
}
```

The `select` function runs on the cached data — it does not make an additional network
request. TanStack Query only re-renders the component when the _selected_ value changes,
not when other fields in the account object change. This is a performance optimization
for components that only care about the balance.

### Checkpoint 5

Explain what `placeholderData: keepPreviousData` does in the transactions hook.
What would the user experience be without it when changing pages?

---

## Phase 6 — Mutations & Cache Invalidation

Reading data is straightforward — TanStack Query caches it and keeps it fresh. Writing data is different. When a user initiates a transfer, you must send it to the server, wait for confirmation, and only then update the UI. In banking, there are no optimistic updates. This phase introduces `useMutation` and the server-confirmed cache invalidation pattern.

### Mutation hooks with cache updates

```tsx
// src/features/transfers/hooks/use-create-transfer.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTransfer } from '../api/transfers-api';
import type { TransferRequest } from '../api/transfers-api';
import { accountKeys } from '@/features/accounts/queries';

export function useCreateTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TransferRequest) => createTransfer(payload),

    // IMPORTANT: No optimistic updates for financial transactions.
    // We NEVER show a transfer as successful before the server confirms it.
    // A failed transfer displayed as successful is a compliance incident
    // and erodes user trust. Wait for the server response, then invalidate.

    onSuccess: () => {
      // Server confirmed the transfer — now refresh account data
      queryClient.invalidateQueries({ queryKey: accountKeys.all });
    },

    // onError is handled by the component (show error state to user)
  });
}
```

### Checkpoint 6

Why does this mutation use `invalidateQueries` instead of `setQueryData` with an
optimistic update? What could go wrong if you optimistically showed a transfer as
successful before the server responded?

---

## Phase 7 — Error Handling

With reads, writes, and cache management in place, the final runtime concern is what happens when things go wrong. Network failures, expired sessions, validation errors, and server errors all need different treatment. This phase builds a structured error handling layer that gives components rich context about failures and configures TanStack Query to retry intelligently.

### Custom error class

```tsx
// src/lib/api-error.ts
import axios from 'axios';

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly requestId: string | undefined;

  constructor(error: unknown) {
    if (axios.isAxiosError(error) && error.response != null) {
      const message = error.response.data?.message ?? error.message;
      super(message);
      this.status = error.response.status;
      this.code = error.response.data?.code ?? 'UNKNOWN';
      this.requestId = error.config?.headers?.['X-Request-ID'] as string | undefined;
    } else if (error instanceof Error) {
      super(error.message);
      this.status = 0;
      this.code = 'NETWORK_ERROR';
      this.requestId = undefined;
    } else {
      super('An unexpected error occurred');
      this.status = 0;
      this.code = 'UNKNOWN';
      this.requestId = undefined;
    }
    this.name = 'ApiError';
  }

  get isNetworkError(): boolean {
    return this.status === 0;
  }

  get isAuthError(): boolean {
    return this.status === 401 || this.status === 403;
  }

  get isServerError(): boolean {
    return this.status >= 500;
  }

  get isValidationError(): boolean {
    return this.status === 422;
  }
}
```

### Using errors in components

```tsx
// src/features/accounts/components/account-list.tsx
import { useAccounts } from '../hooks/use-accounts';
import { ApiError } from '@/lib/api-error';

export function AccountList() {
  const { data: accounts, isLoading, error } = useAccounts();

  if (isLoading) {
    return <div aria-busy="true">Loading accounts...</div>;
  }

  if (error != null) {
    const apiError = error instanceof ApiError ? error : new ApiError(error);

    if (apiError.isNetworkError) {
      return (
        <div role="alert">
          Unable to connect. Please check your internet connection.
        </div>
      );
    }

    return (
      <div role="alert">
        Failed to load accounts. Please try again.
        {apiError.requestId != null && (
          <p className="text-xs text-gray-500">Reference: {apiError.requestId}</p>
        )}
      </div>
    );
  }

  if (accounts == null || accounts.length === 0) {
    return <p>No accounts found.</p>;
  }

  return (
    <ul className="space-y-4">
      {accounts.map((account) => (
        <li key={account.id}>{account.name}</li>
      ))}
    </ul>
  );
}
```

### Global error handler

```tsx
// src/lib/query-client.ts
import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import axios from 'axios';

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      // BSP 1019 — Log all API errors for monitoring
      console.error('[QueryCache Error]', error);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      console.error('[MutationCache Error]', error);
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: (failureCount, error) => {
        // The interceptor rejects with raw AxiosError, so check status directly
        if (axios.isAxiosError(error)) {
          const status = error.response?.status;
          // Never retry auth errors (401 already handled by interceptor)
          if (status === 401 || status === 403) return false;
          // Never retry validation errors
          if (status === 422) return false;
        }
        // Retry everything else up to 2 times
        return failureCount < 2;
      },
    },
  },
});
```

### Checkpoint 7

Why should the retry function never retry 401 or 422 errors? What would happen
if TanStack Query retried a 401 three times while the response interceptor was
also attempting a token refresh?

---

## Phase 8 — Testing the Full Stack

Every layer built in Phases 1 through 7 is testable in isolation thanks to MSW. In this final phase, you will set up comprehensive mock handlers for all endpoints and write tests that verify the API client, auth token injection, and request correlation IDs all work correctly.

### MSW handlers for the full API

Handler paths must match the full URL that Axios resolves. Since `apiClient` has
`baseURL: env.VITE_API_BASE_URL` and your test setup sets this to something like
`http://localhost:3000/api`, a call to `apiClient.get('/accounts')` resolves to
`http://localhost:3000/api/accounts` — so the MSW handler uses `/api/accounts`.

```tsx
// src/test/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/accounts', () => {
    return HttpResponse.json([
      {
        id: 'acc-1',
        name: 'Personal Savings',
        number: '1234567890',
        type: 'savings',
        balance: 15_000_000, // centavos — ₱150,000.00
        currency: 'PHP',
        isActive: true,
      },
    ]);
  }),

  http.get('/api/accounts/:id', ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      name: 'Personal Savings',
      number: '1234567890',
      type: 'savings',
      balance: 15_000_000, // centavos — ₱150,000.00
      currency: 'PHP',
      isActive: true,
    });
  }),

  http.get('/api/accounts/:id/transactions', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? '1');

    return HttpResponse.json({
      data: [
        {
          id: 'txn-1',
          date: '2026-03-10T08:30:00Z',
          description: 'POS Purchase — SM Megamall',
          amount: -250_000, // centavos — -₱2,500.00
          type: 'debit',
          balance: 14_750_000, // centavos — ₱147,500.00
          reference: 'REF-001',
          channel: 'POS',
        },
      ],
      meta: { page, pageSize: 20, totalPages: 5, totalItems: 98 },
    });
  }),

  http.post('/api/transfers', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: 'txn-001',
      status: 'completed',
      referenceNumber: 'EWB-2026-0001',
      timestamp: new Date().toISOString(),
      ...body,
    });
  }),

  http.post('/api/auth/refresh', () => {
    return HttpResponse.json({
      user: { id: '1', name: 'Juan Santos', email: 'juan@ewb.com', role: 'customer' },
      accessToken: 'new-token-123',
    });
  }),
];
```

### Testing the API client

```tsx
// src/lib/api-client.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { server } from '@/test/mocks/server';
import { http, HttpResponse } from 'msw';
import { apiClient } from './api-client';
import { useAuthStore } from '@/stores/auth-store';

describe('apiClient', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    });
  });

  it('attaches the auth token to requests', async () => {
    useAuthStore.getState().setAuth(
      { id: '1', name: 'Juan', email: 'juan@ewb.com', role: 'customer' },
      'test-token',
    );

    let capturedAuth: string | undefined;
    server.use(
      http.get('/api/test', ({ request }) => {
        capturedAuth = request.headers.get('Authorization') ?? undefined;
        return HttpResponse.json({ ok: true });
      }),
    );

    await apiClient.get('/test');
    expect(capturedAuth).toBe('Bearer test-token');
  });

  it('adds X-Request-ID header to every request', async () => {
    let capturedId: string | undefined;
    server.use(
      http.get('/api/test', ({ request }) => {
        capturedId = request.headers.get('X-Request-ID') ?? undefined;
        return HttpResponse.json({ ok: true });
      }),
    );

    await apiClient.get('/test');
    expect(capturedId).toBeDefined();
    expect(capturedId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
  });
});
```

---

## Phase 9 — Account UI Components

With the full data layer in place — API functions, TanStack Query hooks, error handling,
and MSW mocks — you can now build the feature components that consume it. Each component
below lives inside `src/features/accounts/components/` and uses the hooks from Phase 5.

### Account card

The account card is the primary display component for a single account. It demonstrates
several banking UI patterns: DPA-compliant data masking, centavos formatting, and
conditional action rendering based on account status.

```tsx
// src/features/accounts/components/account-card.tsx

interface AccountCardProps {
  accountName: string;
  accountNumber: string;
  accountType: 'savings' | 'checking' | 'time-deposit';
  balance: number;
  currency?: string;
  isActive: boolean;
  onTransfer?: (accountNumber: string) => void;
  onViewDetails?: (accountNumber: string) => void;
}

export function AccountCard({
  accountName,
  accountNumber,
  accountType,
  balance,
  currency = 'PHP',
  isActive,
  onTransfer,
  onViewDetails,
}: AccountCardProps) {
  // DPA compliance: mask account number (show last 4 only)
  const maskedNumber = `••••${accountNumber.slice(-4)}`;

  // Format currency — balance is in centavos
  const formattedBalance = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(balance / 100);

  const typeLabels: Record<AccountCardProps['accountType'], string> = {
    savings: 'Savings',
    checking: 'Checking',
    'time-deposit': 'Time Deposit',
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{accountName}</h3>
          <p className="text-sm text-gray-500">{maskedNumber}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-ewb-purple-100 px-3 py-1 text-xs font-medium text-ewb-purple-700">
            {typeLabels[accountType]}
          </span>
          <span
            aria-hidden="true"
            className={`inline-block h-2 w-2 rounded-full ${
              isActive ? 'bg-emerald-500' : 'bg-red-500'
            }`}
          />
          <span className="sr-only">{isActive ? 'Active account' : 'Inactive account'}</span>
        </div>
      </div>

      {/* Balance */}
      <div className="mt-4">
        <p className="text-sm text-gray-500">Available Balance</p>
        <p className="text-2xl font-bold text-gray-900">{formattedBalance}</p>
      </div>

      {/* Actions — only for active accounts */}
      {isActive && (onTransfer != null || onViewDetails != null) && (
        <div className="mt-4 flex gap-2 border-t border-gray-100 pt-4">
          {onTransfer != null && (
            <button
              type="button"
              onClick={() => onTransfer(accountNumber)}
              className="rounded-lg bg-ewb-purple px-4 py-2 text-sm text-white hover:bg-ewb-purple-700"
            >
              Transfer
            </button>
          )}
          {onViewDetails != null && (
            <button
              type="button"
              onClick={() => onViewDetails(accountNumber)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              View Details
            </button>
          )}
        </div>
      )}
    </div>
  );
}
```

Key patterns in this component:

- **DPA data masking:** Account numbers are masked by default (`••••1234`). The BSP
  Data Privacy Act requires masking PII in displays. Never show full account numbers
  without explicit user action.
- **Centavos → display conversion:** `balance / 100` happens only at the presentation
  layer. The component receives centavos, formats for display. No floating-point math.
- **Accessibility:** The status dot uses `aria-hidden="true"` with a `sr-only` text
  alternative. Screen readers announce "Active account" or "Inactive account" instead
  of seeing a colored dot.
- **Conditional rendering:** Actions are only rendered for active accounts. Inactive
  accounts cannot initiate transfers — enforced in the UI, not just the backend.

### Supporting components

The account feature also includes several smaller components that compose together:

```tsx
// src/features/accounts/components/account-header.tsx
interface AccountHeaderProps {
  accountName: string;
  accountType: 'savings' | 'checking' | 'time-deposit';
}

export function AccountHeader({ accountName, accountType }: AccountHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-semibold text-gray-900">{accountName}</h2>
      <span className="rounded-full bg-ewb-purple-100 px-3 py-1 text-sm text-ewb-purple-700">
        {accountType}
      </span>
    </div>
  );
}
```

```tsx
// src/features/accounts/components/account-actions.tsx
interface AccountActionsProps {
  accountId: string;
  onTransfer: (accountId: string) => void;
  onViewHistory: (accountId: string) => void;
}

export function AccountActions({
  accountId,
  onTransfer,
  onViewHistory,
}: AccountActionsProps) {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => onTransfer(accountId)}
        className="rounded-lg bg-ewb-purple px-4 py-2 text-sm text-white hover:bg-ewb-purple-700"
      >
        Transfer
      </button>
      <button
        type="button"
        onClick={() => onViewHistory(accountId)}
        className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
      >
        History
      </button>
    </div>
  );
}
```

### Account selector

The account selector is a form component that lets users pick an account from a
dropdown. It fetches the account list using the `useAccounts` hook and displays
each account with its masked number and formatted balance:

```tsx
// src/features/accounts/components/account-selector.tsx
import { useId } from 'react';
import { useAccounts } from '../hooks/use-accounts';
import { formatPHP } from '@/lib/format';
import type { Account } from '../types';

interface AccountSelectorProps {
  value: string;
  onChange: (accountId: string) => void;
  label?: string;
}

export function AccountSelector({ value, onChange, label = 'Select Account' }: AccountSelectorProps) {
  const { data: accounts, isLoading } = useAccounts();
  const selectId = useId();

  return (
    <div>
      <label htmlFor={selectId} className="mb-1 block text-sm font-medium">
        {label}
      </label>
      <select
        id={selectId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={isLoading}
        className="w-full rounded border px-3 py-2"
      >
        <option value="">— Choose an account —</option>
        {accounts?.map((account: Account) => (
          <option key={account.id} value={account.id}>
            {account.name} ({account.number}) — {formatPHP(account.balance)}
          </option>
        ))}
      </select>
    </div>
  );
}
```

`useId()` generates a stable, unique ID for the label/input association without
relying on manually chosen IDs that could collide.

### Virtualized transaction list

For accounts with hundreds or thousands of transactions, rendering all rows
simultaneously would degrade performance. The `TransactionList` uses
`@tanstack/react-virtual` to render only the rows visible in the viewport, plus
a small overscan buffer:

```tsx
// src/features/accounts/components/transaction-list.tsx
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';
import { formatPHP } from '@/lib/format';
import type { Transaction } from '../types';

function TransactionRow({ transaction }: { transaction: Transaction }) {
  const isDebit = transaction.type === 'debit';

  return (
    <div className="flex items-center justify-between border-b px-4 py-3">
      <div>
        <p className="font-medium">{transaction.description}</p>
        <p className="text-sm text-gray-500">
          {new Date(transaction.date).toLocaleDateString('en-PH', {
            year: 'numeric', month: 'short', day: 'numeric',
          })} · {transaction.channel}
        </p>
      </div>
      <div className="text-right">
        <p className={isDebit ? 'text-red-600' : 'text-emerald-600'}>
          {isDebit ? '-' : '+'}{formatPHP(Math.abs(transaction.amount))}
        </p>
        <p className="text-xs text-gray-400">{transaction.reference}</p>
      </div>
    </div>
  );
}

export function TransactionList({ transactions }: { transactions: Transaction[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: transactions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 72,
    overscan: 10,
  });

  return (
    <div
      ref={parentRef}
      className="h-[600px] overflow-auto"
      role="list"
      aria-label="Transaction history"
    >
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const transaction = transactions[virtualRow.index];
          if (transaction == null) return null;

          return (
            <div
              key={transaction.id}
              role="listitem"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <TransactionRow transaction={transaction} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

Key virtualization concepts:

- **`estimateSize: () => 72`** — Each row is estimated at 72px tall. If rows vary in
  height, use `measureElement` for dynamic measurement.
- **`overscan: 10`** — Render 10 extra rows above and below the visible viewport.
  This prevents white flashes during fast scrolling.
- **Absolute positioning with `transform`** — Each row is absolutely positioned and
  translated to its correct offset. This is more performant than using `top` directly
  because `transform` triggers GPU compositing instead of layout recalculation.

### Lazy-loaded chart

Charts are heavy dependencies. The `TransactionChart` wrapper uses React's `lazy()` and
`Suspense` to split the chart into a separate bundle that only loads when rendered:

```tsx
// src/features/accounts/components/chart-component.tsx
interface ChartComponentProps {
  data: { date: string; amount: number }[];
}

export default function ChartComponent({ data }: ChartComponentProps) {
  return (
    <div className="h-64">
      {/* Integrate with recharts or similar charting library */}
      <p className="text-sm text-gray-500">Chart: {data.length} data points</p>
    </div>
  );
}
```

```tsx
// src/features/accounts/components/transaction-chart.tsx
import { lazy, Suspense } from 'react';

const Chart = lazy(() => import('./chart-component'));

interface ChartData {
  date: string;
  amount: number;
}

export function TransactionChart({ data }: { data: ChartData[] }) {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse bg-gray-100" />}>
      <Chart data={data} />
    </Suspense>
  );
}
```

The `chart-component` uses a `default` export because `React.lazy()` requires it.
This is the one case where default exports are preferred — `lazy()` cannot import
named exports. The wrapper component `TransactionChart` uses a named export so the
rest of the application follows the standard pattern.

### Account detail (placeholder)

The account detail component displays live connection status and will be expanded
in later guides with transaction alerts (A19) and error handling (A13):

```tsx
// src/features/accounts/components/account-detail.tsx

export function AccountDetail({ accountId }: { accountId: string }) {
  // TODO: In A19 (Real-Time & Streaming), add useTransactionAlerts(accountId)
  // for SSE-based live transaction notifications.

  return (
    <div>
      <p className="text-sm text-gray-500">Account: {accountId}</p>
      {/* Exercise — Wire useAccount(accountId) and useTransactions() here
          to display account info and recent transactions. */}
    </div>
  );
}
```

### Checkpoint 9

The `TransactionList` uses `@tanstack/react-virtual` for virtualization.
What problem does virtualization solve, and why is it particularly important
for banking transaction histories that can contain thousands of entries?

---

## Phase 10 — Feature Barrel Export

Each feature exposes a public API through its `index.ts` barrel file. Only the
exports listed here can be imported by other features — everything else is internal:

```tsx
// src/features/accounts/index.ts

// Components
export { AccountCard } from './components/account-card';
export { AccountList } from './components/account-list';
export { AccountSelector } from './components/account-selector';

// Hooks
export { useAccounts } from './hooks/use-accounts';
export { useAccountBalance } from './hooks/use-account-balance';

// Query keys (for cross-feature cache invalidation)
export { accountKeys } from './queries';

// Types
export type { Account, AccountType, Transaction } from './types';
```

This barrel enforces feature encapsulation. Other features import from
`@/features/accounts` — never from internal paths like
`@/features/accounts/components/account-card`. This means you can refactor the
internal structure (rename files, split components, reorganize folders) without
breaking any imports outside the feature boundary.

The `query-keys.ts` file in `api/` re-exports from the root `queries.ts` as
a convenience alias (some teams prefer importing query keys from the `api/` directory):

```tsx
// src/features/accounts/api/query-keys.ts
// Re-export from the canonical query key factory.
// All new code should import from '../queries' directly.
export { accountKeys } from '../queries';
```

---

## Key Takeaways

1. **Start with the fundamentals.** Raw `fetch()` + Zod proves the concept before
   adding tooling. Understand what Axios abstracts before relying on it.

2. **Axios is the standard.** Interceptors enable centralized auth, logging, and
   error handling without modifying individual API calls.

3. **Silent token refresh** keeps users logged in without interruption. The
   interceptor handles 401s transparently.

4. **Validate everything with Zod** — incoming and outgoing data (BSP 1122).

5. **Query key factories** enable precise cache invalidation. Structure keys
   hierarchically.

6. **Server-confirmed mutations only.** In banking, never show a write as
   successful before the server confirms it.

7. **Custom error classes** give components rich error context — network errors,
   auth errors, and server errors each get appropriate UI treatment.

8. **Smart retry logic** in TanStack Query — never retry auth or validation
   errors, retry server errors up to 2 times.

9. **DPA-compliant masking** — always mask account numbers by default. Show
   full numbers only on explicit user action, never in logs.

10. **Virtualize long lists** — banking transaction histories can contain
    thousands of entries. `@tanstack/react-virtual` renders only visible rows.

11. **Feature barrel exports** enforce encapsulation. Import from
    `@/features/accounts`, never from internal component paths.

---

## Exercises

### Exercise 1 — Request Retry with Backoff
Add an Axios interceptor that retries failed requests (5xx only) with exponential
backoff: 1s, 2s, 4s, max 3 retries.

### Exercise 2 — Request Cancellation
Build a `useSearchAccounts` hook that cancels the previous request when a new
search term is typed, using `AbortController` and TanStack Query's `signal`.

> **Hint:** TanStack Query passes a `signal` to your `queryFn` automatically.
> Forward it to Axios:
>
> ```tsx
> queryFn: ({ signal }) => apiClient.get('/accounts/search', {
>   params: { q: term },
>   signal, // Axios cancels the request if the query is invalidated
> }),
> ```
>
> When the search term changes, TanStack Query aborts the in-flight request
> and starts a new one. No manual `AbortController` management needed.

### Exercise 3 — Offline Detection
Build a `useNetworkStatus` hook and an `OfflineBanner` component. When the user
is offline, show a banner and pause all queries. Resume when back online.

---

## What Comes Next

**Next guide:** [A11 — Authentication Part 1](A11_authentication-part1.md) —
where you learn JWT anatomy, secure token storage, RBAC, MFA, and the AFASA
mandate for phishing-resistant authentication.

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
