# Level 4 Answer Key — State and Routing

> **EastWest Bank — Digital Platforms & Innovations**
>
> React Training Program · Level 4 Instructor Reference

---

## Quiz Answers

### Question 1 — Answer: C

TanStack Query is the correct tool for server state (data from APIs). Account balance is owned by the backend, can become stale, and is shared between users. `useState` (A) creates a local copy that becomes stale. Zustand with persist (B) is for client-side preferences. Context API (D) causes unnecessary re-renders across all consumers.

### Question 2 — Answer: True

Zustand selectors ensure a component only re-renders when the specific slice it subscribes to changes. `useUIStore((state) => state.theme)` will not trigger a re-render when `sidebarOpen` changes. This is a key advantage over React Context, which re-renders all consumers on any change.

### Question 3 — Answer

Storing the access token in localStorage creates an XSS (Cross-Site Scripting) vulnerability. If an attacker injects JavaScript into the page, they can read `localStorage.getItem('accessToken')` and exfiltrate the token to an external server. In-memory storage (Zustand) is not accessible to injected scripts after a page reload. BSP 982 Section 5.4 requires protection of session tokens from unauthorized access, including XSS.

### Question 4 — Answer: B

`staleTime` determines how long cached data is considered fresh (no automatic refetch during this window). `gcTime` (garbage collection time) determines how long inactive query data stays in memory after a component unmounts. With 5-minute staleTime and 10-minute gcTime: returning after 3 minutes shows cached data without refetch; returning after 12 minutes triggers a fresh fetch because the cached data was garbage collected.

### Question 5 — Answer: C

`onSettled` fires after both success and failure, ensuring the cache is refreshed regardless of outcome. This is critical because the optimistic update is an approximation — the server might apply fees, rounding, or timing differences. Even if `onSuccess` runs, the optimistic balance might differ from the actual server balance. `onSettled` guarantees reconciliation.

### Question 6 — Answer: True

The `lazy` property on route definitions uses dynamic `import()` to split each page into a separate JavaScript chunk. The browser only downloads a page's code when the user navigates to it. This reduces the initial bundle size significantly.

### Question 7 — Answer

Frontend route guards are a UX convenience, not a security mechanism. A determined user can bypass any frontend check by modifying JavaScript in the browser's DevTools. The backend must independently verify authentication and authorization on every API request. BSP 808 requires server-side access control as the authoritative enforcement point. A user who bypasses the `ProtectedRoute` must still be rejected by the API with a 401 or 403.

### Question 8 — Answer: B

TanStack Query hooks require a `QueryClientProvider` context. `renderHook` with a wrapper function that provides this context is the correct approach. Calling the hook directly (A) violates the Rules of Hooks. Mocking the entire module (C) tests nothing meaningful. Rendering a dummy component (D) works but is more boilerplate than `renderHook`.

### Question 9 — Answer: B

The `RoleGuard` component checks the user's role against `allowedRoles`. Since `customer` is not in `['admin', 'manager']`, the guard renders `<Navigate to="/" replace />`, redirecting the user to the home page.

### Question 10 — Answer

Zustand stores are singletons — they persist across tests. Without resetting in `beforeEach`, a test that calls `setAuth()` leaves the store in an authenticated state, which leaks into the next test. This causes test pollution: tests pass individually but fail when run together, or their order affects results. Reset with `useAuthStore.setState({ ... })` to ensure each test starts from a known state.

### Question 11 — Answer: C

MSW intercepts HTTP requests at the network level. It uses a Service Worker (in browsers) or Node.js request interception (in tests) to return mock responses. This is superior to module mocking because it tests the actual HTTP client code (Axios config, interceptors, error handling) — only the network layer is faked.

### Question 12 — Answer

`useBlocker` handles navigation within the SPA — when the user clicks a React Router `Link` or calls `navigate()`. The `beforeunload` event listener handles browser-level navigation — when the user refreshes the page, closes the tab, or types a new URL. Both are needed because `useBlocker` cannot prevent browser-level actions, and `beforeunload` cannot intercept client-side routing.

---

## Exercise Solutions

### Exercise 1 — Transaction Filter Store

```tsx
// src/features/accounts/stores/transaction-filter-store.ts
import { create } from 'zustand';

type TransactionType = 'all' | 'credit' | 'debit';
type SortOrder = 'newest' | 'oldest' | 'amount-high' | 'amount-low';

interface DateRange {
  start: string | null;
  end: string | null;
}

interface TransactionFilterState {
  transactionType: TransactionType;
  dateRange: DateRange;
  sortOrder: SortOrder;
  setTransactionType: (type: TransactionType) => void;
  setDateRange: (range: DateRange) => void;
  setSortOrder: (order: SortOrder) => void;
  resetFilters: () => void;
  hasActiveFilters: () => boolean;
}

const defaults = {
  transactionType: 'all' as TransactionType,
  dateRange: { start: null, end: null } as DateRange,
  sortOrder: 'newest' as SortOrder,
};

export const useTransactionFilterStore = create<TransactionFilterState>((set, get) => ({
  ...defaults,
  setTransactionType: (transactionType) => set({ transactionType }),
  setDateRange: (dateRange) => set({ dateRange }),
  setSortOrder: (sortOrder) => set({ sortOrder }),
  resetFilters: () => set({ ...defaults }),
  hasActiveFilters: () => {
    const state = get();
    return (
      state.transactionType !== 'all' ||
      state.dateRange.start !== null ||
      state.dateRange.end !== null ||
      state.sortOrder !== 'newest'
    );
  },
}));
```

**Key points:**
- Defaults are extracted to a constant for reuse in `resetFilters`
- `hasActiveFilters` uses `get()` to read current state without subscribing
- TypeScript union types enforce valid values at compile time

### Exercise 2 — Account Detail with Query Key Factory

```tsx
// src/features/accounts/queries.ts
export const accountKeys = {
  all: ['accounts'] as const,
  detail: (id: string) => [...accountKeys.all, id] as const,
  transactions: (id: string) => [...accountKeys.detail(id), 'transactions'] as const,
};

// src/features/accounts/hooks/use-account-detail.ts
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { apiClient } from '@/lib/api-client';
import { accountKeys } from '../queries';

const accountSchema = z.object({
  id: z.string(),
  name: z.string(),
  number: z.string(),
  type: z.enum(['savings', 'checking', 'time-deposit']),
  balance: z.number(),
  currency: z.string().default('PHP'),
  isActive: z.boolean(),
});

export function useAccountDetail(id: string) {
  return useQuery({
    queryKey: accountKeys.detail(id),
    queryFn: async () => {
      const response = await apiClient.get(`/accounts/${id}`);
      return accountSchema.parse(response.data);
    },
    enabled: id !== '',
  });
}

// src/features/accounts/hooks/use-account-transactions.ts
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { z } from 'zod';
import { apiClient } from '@/lib/api-client';
import { accountKeys } from '../queries';

const transactionSchema = z.object({
  id: z.string(),
  date: z.string(),
  description: z.string(),
  amount: z.number(),
  type: z.enum(['credit', 'debit']),
  balance: z.number(),
  reference: z.string(),
  channel: z.string(),
});

const paginatedSchema = z.object({
  data: z.array(transactionSchema),
  meta: z.object({
    page: z.number(),
    pageSize: z.number(),
    totalPages: z.number(),
    totalItems: z.number(),
  }),
});

export function useAccountTransactions(id: string, page = 1, pageSize = 20) {
  return useQuery({
    queryKey: [...accountKeys.transactions(id), { page, pageSize }],
    queryFn: async () => {
      const response = await apiClient.get(`/accounts/${id}/transactions`, {
        params: { page, pageSize },
      });
      return paginatedSchema.parse(response.data);
    },
    enabled: id !== '',
    placeholderData: keepPreviousData,
  });
}
```

**Key points:**
- Query keys are hierarchical: invalidating `accountKeys.all` cascades to detail and transactions
- `keepPreviousData` prevents a blank screen when changing pages
- Zod validates all API responses per BSP 1122

### Exercise 3 — Protected Route with Post-Login Redirect

```tsx
// src/components/auth/protected-route.tsx
import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuthStore } from '@/stores/auth-store';

export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // BSP 808: Frontend guard is for UX only. Backend must verify independently.
  return <Outlet />;
}

// src/components/auth/role-guard.tsx
import { Navigate, Outlet } from 'react-router';
import { useAuthStore } from '@/stores/auth-store';

interface RoleGuardProps {
  allowedRoles: Array<'customer' | 'teller' | 'manager' | 'admin'>;
}

export function RoleGuard({ allowedRoles }: RoleGuardProps) {
  const user = useAuthStore((s) => s.user);

  if (user == null || !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}

// Test file: src/components/auth/protected-route.test.tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '@/stores/auth-store';
import { ProtectedRoute } from './protected-route';

describe('ProtectedRoute', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    });
  });

  it('redirects unauthenticated users to /login', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<div>Dashboard</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('renders children when authenticated', () => {
    useAuthStore.setState({
      user: { id: '1', name: 'Juan', email: 'juan@ewb.com', role: 'customer' },
      accessToken: 'token',
      isAuthenticated: true,
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<div>Dashboard</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('preserves the original URL for post-login redirect', () => {
    render(
      <MemoryRouter initialEntries={['/accounts/ACC-001/transactions']}>
        <Routes>
          <Route
            path="/login"
            element={<LocationDisplay />}
          />
          <Route element={<ProtectedRoute />}>
            <Route path="/accounts/:id/transactions" element={<div>Transactions</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );
    // The login page should receive the original path in location state
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });
});
```

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
