# A09 — State Management

> **EastWest Bank — Digital Platforms & Innovations**
>
> Part A (Core) · Level 4 — State and Routing

---

## What You Will Learn

By the end of this guide, you will:

- Distinguish client state from server state
- Build global stores with Zustand 5
- Manage server data with TanStack Query 5
- Implement optimistic updates for banking transactions
- Structure stores using the slice pattern
- Handle loading, error, and stale states correctly
- Understand why Context API is not used at EastWest Bank

---

## Prerequisites

| Requirement | Where |
|------------|-------|
| Completed A04 — Components and JSX | Level 2 |
| Completed A05 — Your First Test | Level 2 |
| Zustand and TanStack Query installed | B01 |

---

## Phase 1 — Two Kinds of State

### Client state vs server state

| | Client State | Server State |
|-|-------------|-------------|
| **Owned by** | The browser | The backend API |
| **Examples** | Theme preference, sidebar open/closed, current wizard step, selected filters | Account list, transaction history, user profile, balances |
| **Persistence** | Session or localStorage | Database |
| **Shared between users** | No | Yes |
| **Can become stale** | No | Yes — another user might change it |
| **Tool** | Zustand | TanStack Query |

The most common mistake in React applications is putting server data in client state.
When you store API response data in `useState` or a Zustand store, you create a copy
that can become stale. TanStack Query keeps server data fresh automatically.

### The EWB state architecture

```
┌──────────────────────────────────────────────┐
│              React Components                 │
├──────────────────────┬───────────────────────┤
│   Zustand Stores     │   TanStack Query      │
│   (Client State)     │   (Server State)      │
│                      │                       │
│ • UI preferences     │ • GET /accounts       │
│ • Auth status (in-memory only — never persisted) │ • GET /transactions   │
│ • Wizard steps       │ • GET /user/profile   │
│ • Selected filters   │ • POST /transfers     │
│ • Modal open/closed  │ • PUT /settings       │
└──────────────────────┴───────────────────────┘
```

### Checkpoint 1

Classify each as client or server state:
1. User's account balance — **Server** (comes from API, can change)
2. Whether dark mode is active — **Client** (user preference)
3. The list of recent transactions — **Server** (database data)
4. Which tab is selected in the dashboard — **Client** (UI state)
5. The user's notification preferences — **Server** (stored in DB)

---

## Phase 2 — Zustand 5 for Client State

### Your first store

```tsx
// src/stores/ui-store.ts
import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  theme: 'system',
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setTheme: (theme) => set({ theme }),
}));
```

### Using the store in components

```tsx
// src/components/layout/sidebar.tsx
import { useUIStore } from '@/stores/ui-store';

export function Sidebar() {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);

  if (!sidebarOpen) return null;

  return (
    <aside className="w-64 border-r bg-white p-4">
      <nav aria-label="Sidebar navigation">
        {/* Navigation items */}
      </nav>
    </aside>
  );
}
```

**The selector pattern** (`(state) => state.sidebarOpen`) ensures the component
only re-renders when `sidebarOpen` changes — not when `theme` changes.

### Why not Context API?

Context API has a fundamental limitation: any change to the context value re-renders
**every** consumer component. For a banking dashboard with 50+ components reading
from context, a single theme change re-renders everything.

Zustand solves this with selectors. Each component subscribes to exactly the state
it needs. Changes to unrelated state do not cause re-renders.

### Auth store (critical pattern)

> **Note:** This is a simplified auth store for learning state management patterns.
> The production auth store with MFA support, status state machine, and session
> management is built in B04.

```tsx
// src/stores/auth-store.ts
import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'teller' | 'manager' | 'admin';
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,

  setAuth: (user, accessToken) =>
    set({ user, accessToken, isAuthenticated: true }),

  clearAuth: () =>
    set({ user: null, accessToken: null, isAuthenticated: false }),
}));
```

> **BSP 982 Critical:** The access token is stored **in memory only** — in the
> Zustand store. It is NOT stored in localStorage, sessionStorage, or cookies.
> When the user closes the tab, the token is gone. The refresh token is handled
> via HttpOnly cookies by the backend. This prevents XSS attacks from stealing
> tokens.

### Checkpoint 2

Explain why the auth store does NOT use `persist` middleware to save the access
token to localStorage. What security vulnerability would that create?

Answer: XSS. If an attacker injects JavaScript (e.g., via a cross-site scripting
vulnerability), they can read localStorage and steal the access token. In-memory
storage is not accessible to injected scripts after a page reload.

---

## Phase 3 — Zustand Persistence and Middleware

### Persisting UI preferences

Some client state should survive page reloads — like theme preference:

```tsx
// src/stores/ui-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'system',
      sidebarOpen: false,
      setTheme: (theme) => set({ theme }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
    }),
    {
      name: 'ewb-ui-preferences',
      partialize: (state) => ({ theme: state.theme }),
      // Only persist theme, not sidebar state
    },
  ),
);
```

`partialize` controls which fields are persisted. Sidebar open/closed should reset
on page reload — only the theme preference persists.

### Devtools middleware

```tsx
import { devtools } from 'zustand/middleware';

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set) => ({ /* ... */ }),
      { name: 'ewb-ui-preferences' },
    ),
    { name: 'UIStore' },
  ),
);
```

Devtools middleware enables the Redux DevTools browser extension to inspect Zustand
state changes — useful for debugging.

### Checkpoint 3 — Transaction filter store

Create a transaction filter store for the accounts feature. This store lives inside
the feature directory because it manages state specific to transaction filtering, not
global app state:

```tsx
// src/features/accounts/stores/transaction-filter-store.ts
import { create } from 'zustand';

interface DateRange {
  start: string | null;
  end: string | null;
}

interface TransactionFilterState {
  transactionType: 'all' | 'credit' | 'debit';
  dateRange: DateRange;
  sortOrder: 'newest' | 'oldest' | 'amount-high' | 'amount-low';
  setTransactionType: (type: TransactionFilterState['transactionType']) => void;
  setDateRange: (range: DateRange) => void;
  setSortOrder: (order: TransactionFilterState['sortOrder']) => void;
  resetFilters: () => void;
  hasActiveFilters: () => boolean;
}

const DEFAULTS = {
  transactionType: 'all' as const,
  dateRange: { start: null, end: null } as DateRange,
  sortOrder: 'newest' as const,
};

export const useTransactionFilterStore = create<TransactionFilterState>((set, get) => ({
  ...DEFAULTS,
  setTransactionType: (transactionType) => set({ transactionType }),
  setDateRange: (dateRange) => set({ dateRange }),
  setSortOrder: (sortOrder) => set({ sortOrder }),
  resetFilters: () => set({ ...DEFAULTS }),
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

Notice the `hasActiveFilters` computed function uses `get()` — Zustand's way to
read current state inside an action. This is useful for derived state that depends
on multiple fields.

Should any of these filters be persisted to localStorage? Generally no — filter
preferences are ephemeral. A user navigating away and coming back expects a fresh
view. The exception would be if user research shows people consistently use the
same filters, in which case you would add the `persist` middleware.

---

## Phase 4 — TanStack Query 5 for Server State

### Setup

```tsx
// src/main.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Learning version — in B03, this moves to src/lib/query-client.ts
// as a shared singleton with the same defaults.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,    // 5 minutes
      gcTime: 10 * 60 * 1000,      // 10 minutes (garbage collection)
      retry: 2,                     // Retry failed requests twice
      refetchOnWindowFocus: true,   // Refresh when user returns to tab
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Your app */}
    </QueryClientProvider>
  );
}
```

### Fetching data

```tsx
// src/features/accounts/hooks/use-accounts.ts
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { z } from 'zod';
import { env } from '@/lib/env';
import { accountKeys } from './queries';

const accountSchema = z.object({
  id: z.string(),
  name: z.string(),
  number: z.string(),
  type: z.enum(['savings', 'checking', 'time-deposit']), // B03 adds 'current' in shared types
  balance: z.number().int().nonnegative(), // Centavos
  currency: z.string().default('PHP'),
  isActive: z.boolean(),
});

type Account = z.infer<typeof accountSchema>;

async function fetchAccounts(): Promise<Account[]> {
  const response = await axios.get(`${env.VITE_API_BASE_URL}/accounts`);
  // Validate API response with Zod (BSP 1122 — never trust external data)
  return z.array(accountSchema).parse(response.data);
}

export function useAccounts() {
  return useQuery({
    queryKey: accountKeys.lists(),
    queryFn: fetchAccounts,
  });
}
```

### Using in components

```tsx
// src/features/accounts/components/account-list.tsx
import { useAccounts } from '../hooks/use-accounts';
import { AccountCard } from './account-card';

export function AccountList() {
  const { data: accounts, isLoading, error } = useAccounts();

  if (isLoading) {
    return <div aria-busy="true">Loading accounts...</div>;
  }

  if (error != null) {
    return (
      <div role="alert" className="text-error">
        Failed to load accounts. Please try again.
      </div>
    );
  }

  if (accounts == null || accounts.length === 0) {
    return <p>No accounts found.</p>;
  }

  return (
    <div className="space-y-4">
      {accounts.map((account) => (
        <AccountCard
          key={account.id}
          accountName={account.name}
          accountNumber={account.number}
          accountType={account.type}
          balance={account.balance}
          currency={account.currency}
          isActive={account.isActive}
        />
      ))}
    </div>
  );
}
```

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

Structured query keys enable targeted cache invalidation:

```tsx
// Invalidate all account data
queryClient.invalidateQueries({ queryKey: accountKeys.all });

// Invalidate all transaction queries for one account (prefix match —
// this catches every (id, filters) combination for ACC-001)
queryClient.invalidateQueries({ queryKey: accountKeys.transactions('ACC-001') });
```

### Checkpoint 4

Explain the difference between `staleTime` and `gcTime`. What happens when a user
navigates away from the accounts page and comes back after 3 minutes? After 12 minutes?

---

## Phase 5 — Mutations and Optimistic Updates

### Mutations for write operations

```tsx
// src/features/transfers/hooks/use-create-transfer.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { env } from '@/lib/env';
import { accountKeys } from '@/features/accounts/queries';

interface TransferPayload {
  fromAccount: string;
  toAccount: string;
  amount: number;
  notes?: string;
}

export function useCreateTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: TransferPayload) => {
      const response = await axios.post(`${env.VITE_API_BASE_URL}/transfers`, payload);
      return response.data;
    },
    onSuccess: () => {
      // Refresh account balances after successful transfer
      queryClient.invalidateQueries({ queryKey: accountKeys.all });
    },
  });
}
```

### Optimistic updates

Optimistic updates improve perceived performance by updating the UI before the server responds. They work well for **non-financial** actions like toggling a favorite or renaming an account:

```tsx
// src/features/accounts/hooks/use-toggle-favorite.ts
export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (accountId: string) => {
      const response = await axios.post(`${env.VITE_API_BASE_URL}/accounts/${accountId}/favorite`);
      return response.data;
    },

    onMutate: async (accountId) => {
      // Cancel any outgoing account list queries
      await queryClient.cancelQueries({ queryKey: accountKeys.lists() });

      // Snapshot the previous value — must match the exact key the list data is stored under
      const previousAccounts = queryClient.getQueryData(accountKeys.lists());

      // Optimistically toggle the favorite flag
      queryClient.setQueryData(accountKeys.lists(), (old: Account[] | undefined) =>
        old?.map((account) =>
          account.id === accountId
            ? { ...account, isFavorite: !account.isFavorite }
            : account,
        ),
      );

      return { previousAccounts };
    },

    onError: (_err, _accountId, context) => {
      // Rollback on error
      if (context?.previousAccounts != null) {
        queryClient.setQueryData(accountKeys.lists(), context.previousAccounts);
      }
    },

    onSettled: () => {
      // Always refetch after mutation to ensure consistency
      queryClient.invalidateQueries({ queryKey: accountKeys.all });
    },
  });
}
```

**The optimistic update pattern:**
1. `onMutate` — Save the current state (snapshot), update optimistically
2. `onError` — Rollback to the snapshot if the mutation fails
3. `onSettled` — Refetch to ensure the UI matches the server (regardless of success/failure)

> **Banking constraint:** Optimistic updates must **never** be used for financial
> mutations (transfers, payments, balance changes). Showing a transfer as successful
> before the server confirms it is a compliance incident under BSP 1033. In B03, you
> will learn the server-confirmed mutation pattern used for all financial operations.

### Checkpoint 5

Why is `onSettled` necessary even when `onSuccess` already invalidates queries?
What would happen if the mutation succeeds but the optimistic update was slightly
wrong (e.g., due to server-side fees)?

---

## Phase 6 — Store Patterns

### Feature-scoped stores

Each feature gets its own store:

```
src/
├── stores/
│   └── auth-store.ts          ← App-wide (used by every feature)
└── features/
    ├── accounts/
    │   └── stores/account-filter-store.ts
    ├── transfers/
    │   └── stores/transfer-wizard-store.ts
    └── payments/
        └── stores/payment-store.ts
```

### Zustand with computed values

```tsx
// src/features/accounts/stores/account-filter-store.ts
import { create } from 'zustand';

interface AccountFilterState {
  accountType: 'all' | 'savings' | 'checking' | 'time-deposit';
  searchQuery: string;
  setAccountType: (type: AccountFilterState['accountType']) => void;
  setSearchQuery: (query: string) => void;
  reset: () => void;
  // Derived helper — recalculated on each call, not a cached selector.
  // For memoized derived state, use a selector: useStore((s) => s.x !== 'default')
  hasActiveFilters: () => boolean;
}

export const useAccountFilterStore = create<AccountFilterState>((set, get) => ({
  accountType: 'all',
  searchQuery: '',
  setAccountType: (accountType) => set({ accountType }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  reset: () => set({ accountType: 'all', searchQuery: '' }),
  hasActiveFilters: () => {
    const state = get();
    return state.accountType !== 'all' || state.searchQuery !== '';
  },
}));
```

---

## Key Takeaways

1. **Client state → Zustand. Server state → TanStack Query.** Never mix them.

2. **Access tokens live in memory only.** Never persist auth tokens to localStorage
   (BSP 982 — XSS prevention).

3. **Selectors prevent unnecessary re-renders.** Always select the specific state
   your component needs.

4. **Query key factories** enable targeted cache invalidation. Structure your keys
   hierarchically.

5. **Optimistic updates** make the UI feel instant but must always be reconciled
   with the server response.

6. **Validate API responses with Zod** (BSP 1122). Never trust external data.

---

## Exercises

### Exercise 1 — Notification Store

Build a `useNotificationStore` with Zustand that manages toast notifications:
- `addNotification(message, type)` — adds a notification
- `removeNotification(id)` — removes one
- `clearAll()` — removes all
- Auto-remove after 5 seconds

### Exercise 2 — Transaction Query with Filters

Build a `useTransactions` hook using TanStack Query that:
- Fetches transactions for a specific account
- Supports pagination (page, pageSize)
- Uses query key factory pattern
- Validates response with Zod

### Exercise 3 — Optimistic Favorite Toggle

Build an optimistic "favorite account" toggle that:
- Immediately updates the star icon
- Rolls back if the API call fails
- Shows an error toast on failure

---

## What Comes Next

**Next guide:** [B02 — Routing and Navigation](B02_routing-and-navigation.md) —
where you connect your pages with React Router 7, implement route guards, and
build navigation with breadcrumbs.

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
