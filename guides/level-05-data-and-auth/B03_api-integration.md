# B03 — API Integration

> **EastWest Bank — Digital Platforms & Innovations**
>
> Part B (Vite SPA) · Level 5 — Data and Auth · Est. 3.5 hours

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
  balance: z.number().int(),
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
      { id: 'acc-1', name: 'Personal Savings', balance: 150000_00 },
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

> **Security Note:** Use Axios >= 1.13.5. Earlier versions are affected by
> CVE-2026-25639 (DoS via prototype pollution in `mergeConfig`).

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
  balance: z.number().int(), // Centavos — avoids IEEE 754 floating-point errors
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
```

### Why centavos, not pesos?

All monetary amounts in our API use **integer centavos** (₱100.50 = `10050`). This avoids
IEEE 754 floating-point errors where `0.1 + 0.2 !== 0.3` in JavaScript. In banking,
a rounding error of even one centavo across thousands of transactions is unacceptable.

The frontend converts to display format only at the presentation layer:

```tsx
// src/lib/format-currency.ts
export function formatPeso(centavos: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(centavos / 100);
}

// Usage: formatPeso(10050) → "₱100.50"
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
  date: z.iso.datetime(),
  description: z.string(),
  amount: z.number().int(), // Centavos
  type: z.enum(['credit', 'debit']),
  balance: z.number().int(), // Centavos
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
  timestamp: z.iso.datetime(),
});

export type TransferResponse = z.infer<typeof transferResponseSchema>;

export async function createTransfer(payload: TransferRequest): Promise<TransferResponse> {
  // Validate outgoing payload too — defense in depth
  const validated = transferRequestSchema.parse(payload);
  const response = await apiClient.post('/transfers', validated);
  return transferResponseSchema.parse(response.data);
}
```

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
        // Never retry auth errors
        if (error instanceof ApiError && error.isAuthError) return false;
        // Never retry validation errors
        if (error instanceof ApiError && error.isValidationError) return false;
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
        balance: 150000_00, // ₱150,000.00 in centavos
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
      balance: 150000_00, // ₱150,000.00 in centavos
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
          amount: -2500_00, // -₱2,500.00 in centavos
          type: 'debit',
          balance: 147500_00, // ₱147,500.00 in centavos
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

---

## Exercises

### Exercise 1 — Request Retry with Backoff
Add an Axios interceptor that retries failed requests (5xx only) with exponential
backoff: 1s, 2s, 4s, max 3 retries.

### Exercise 2 — Request Cancellation
Build a `useSearchAccounts` hook that cancels the previous request when a new
search term is typed, using `AbortController` and TanStack Query's `signal`.

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
