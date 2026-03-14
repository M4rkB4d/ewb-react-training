# Level 4 Exercises — State and Routing

> **EastWest Bank — Digital Platforms & Innovations**
>
> React Training Program · Level 4 Hands-On Exercises

---

## Exercise 1 — Transaction Filter Store

**Difficulty:** Starter


### Learning Objectives

- Create a Zustand store with typed state and actions
- Use selectors to subscribe to specific state slices
- Connect a store to a component that renders filtered data

### Scenario

The Accounts team needs a filter panel for the transaction history page. Users should be able to filter by transaction type, date range, and sort order. The filter state must be shared between the filter panel and the transaction list.

### Requirements

1. Create a `useTransactionFilterStore` with the following state:
   - `transactionType`: `'all' | 'credit' | 'debit'` (default: `'all'`)
   - `dateRange`: `{ start: string | null; end: string | null }` (default: both `null`)
   - `sortOrder`: `'newest' | 'oldest' | 'amount-high' | 'amount-low'` (default: `'newest'`)
2. Implement actions: `setTransactionType`, `setDateRange`, `setSortOrder`, `resetFilters`
3. Add a computed method `hasActiveFilters()` that returns `true` when any filter differs from its default
4. Build a `TransactionFilterPanel` component that reads and updates the store
5. Build a `FilterBadge` component that shows the count of active filters

### Starter Code

```tsx
// src/features/accounts/stores/transaction-filter-store.ts
import { create } from 'zustand';

interface TransactionFilterState {
  // Define your state and actions here
}

export const useTransactionFilterStore = create<TransactionFilterState>((set, get) => ({
  // Implement here
}));
```

### Acceptance Criteria

- [ ] Store is typed with TypeScript strict mode
- [ ] Each filter can be set independently
- [ ] `resetFilters` returns all values to defaults
- [ ] `hasActiveFilters()` correctly reflects whether any filter is active
- [ ] Components using selectors only re-render when their selected state changes
- [ ] All store actions are testable with `getState()` and `setState()`

---

## Exercise 2 — Account Detail with Query Key Factory

**Difficulty:** Intermediate


### Learning Objectives

- Implement query key factories for hierarchical cache management
- Use TanStack Query with Zod validation on API responses
- Handle loading, error, and empty states in components

### Scenario

The portal needs an account detail page that shows account information and its recent transactions. Both queries must use the query key factory pattern so that invalidating an account also invalidates its transactions.

### Requirements

1. Define a query key factory:
   ```tsx
   export const accountKeys = {
     all: ['accounts'] as const,
     detail: (id: string) => [...accountKeys.all, id] as const,
     transactions: (id: string) => [...accountKeys.detail(id), 'transactions'] as const,
   };
   ```
2. Build a `useAccountDetail` hook that fetches `GET /accounts/:id` and validates with Zod
3. Build a `useAccountTransactions` hook that fetches `GET /accounts/:id/transactions` with pagination (`page`, `pageSize`), validates with Zod, and uses `placeholderData: keepPreviousData`
4. Build an `AccountDetailPage` component that displays the account info and a paginated transaction list
5. After a successful transfer, invalidate `accountKeys.all` and verify both queries refetch

### Acceptance Criteria

- [ ] Query keys follow the factory pattern
- [ ] Zod schemas validate all API responses
- [ ] Loading, error, and empty states are handled with appropriate UI and ARIA attributes
- [ ] Pagination works without a loading flash (using `keepPreviousData`)
- [ ] Cache invalidation at `accountKeys.all` triggers refetch of both detail and transactions

---

## Exercise 3 — Protected Route with Post-Login Redirect

**Difficulty:** Challenge


### Learning Objectives

- Implement authentication route guards with React Router 7
- Preserve the user's intended destination through the login flow
- Test routing behavior with `MemoryRouter`

### Scenario

When an unauthenticated user tries to visit `/accounts/ACC-001/transactions`, they should be redirected to `/login`. After successful login, they should be sent back to `/accounts/ACC-001/transactions` — not to the dashboard.

### Requirements

1. Implement a `ProtectedRoute` component that:
   - Reads `isAuthenticated` from the auth store
   - Redirects to `/login` with `state: { from: location.pathname }` when not authenticated
   - Renders child routes via `<Outlet />` when authenticated
2. Implement a `RoleGuard` component that:
   - Accepts an `allowedRoles` prop
   - Redirects to `/unauthorized` if the user's role is not in the allowed list
3. Update the login hook to read `location.state.from` and navigate there after successful auth
4. Write at least 3 tests:
   - Unauthenticated user is redirected to `/login`
   - Authenticated user sees the protected content
   - Post-login redirect goes to the originally requested page

### Acceptance Criteria

- [ ] Unauthenticated users never see protected content (even briefly)
- [ ] The original URL is preserved through the full login flow
- [ ] Role-based routes correctly restrict access by role
- [ ] Tests use `MemoryRouter` with `initialEntries` for route simulation
- [ ] BSP 808 reminder: backend authorization is also required (add a code comment)

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
