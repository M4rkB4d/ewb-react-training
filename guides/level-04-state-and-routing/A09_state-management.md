# A09 — State Management

> **EastWest Bank — Digital Platforms & Innovations**
>
> Part A (Core) · Level 4 — State and Routing · Est. 3 hours

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

### Checkpoint 3

Create a `useFilterStore` that tracks:
- Selected account type filter (`'all' | 'savings' | 'checking'`)
- Date range (start and end dates)
- Sort order (`'newest' | 'oldest' | 'amount-high' | 'amount-low'`)

Should any of these be persisted? Why or why not?

---

## Phase 4 — TanStack Query 5 for Server State

### Setup

```tsx
// src/main.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

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

const accountSchema = z.object({
  id: z.string(),
  name: z.string(),
  number: z.string(),
  type: z.enum(['savings', 'checking', 'time-deposit']),
  balance: z.number().int(), // Centavos
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
    queryKey: ['accounts'],
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
      <div role="alert" className="text-red-600">
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
        <AccountCard key={account.id} {...account} />
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
  detail: (id: string) => ['accounts', id] as const,
  transactions: (id: string) => ['accounts', id, 'transactions'] as const,
};
```

Structured query keys enable targeted cache invalidation:

```tsx
// Invalidate all account data
queryClient.invalidateQueries({ queryKey: accountKeys.all });

// Invalidate only one account's transactions
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
      const response = await axios.post('/api/transfers', payload);
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

For a better user experience, update the UI immediately before the server responds:

```tsx
// src/features/transfers/hooks/use-create-transfer.ts
import type { Account } from '@/features/accounts/types';

export function useCreateTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: TransferPayload) => {
      const response = await axios.post('/api/transfers', payload);
      return response.data;
    },

    onMutate: async (payload) => {
      // Cancel any outgoing account queries
      await queryClient.cancelQueries({ queryKey: accountKeys.all });

      // Snapshot the previous value
      const previousAccounts = queryClient.getQueryData(accountKeys.all);

      // Optimistically update the balance
      queryClient.setQueryData(accountKeys.all, (old: Account[] | undefined) =>
        old?.map((account) => {
          if (account.number === payload.fromAccount) {
            return { ...account, balance: account.balance - payload.amount };
          }
          if (account.number === payload.toAccount) {
            return { ...account, balance: account.balance + payload.amount };
          }
          return account;
        }),
      );

      return { previousAccounts };
    },

    onError: (_err, _payload, context) => {
      // Rollback on error
      if (context?.previousAccounts != null) {
        queryClient.setQueryData(accountKeys.all, context.previousAccounts);
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

> **BSP 1033 Note:** Optimistic updates must always be followed by server confirmation.
> The user sees the updated balance immediately, but the actual balance is confirmed
> by the `onSettled` refetch.

### Checkpoint 5

Why is `onSettled` necessary even when `onSuccess` already invalidates queries?
What would happen if the mutation succeeds but the optimistic update was slightly
wrong (e.g., due to server-side fees)?

---

## Phase 6 — Store Patterns

### Feature-scoped stores

Each feature gets its own store:

```
src/features/
├── accounts/
│   └── stores/account-filter-store.ts
├── auth/
│   └── stores/auth-store.ts
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
  // Computed: are any filters active?
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
