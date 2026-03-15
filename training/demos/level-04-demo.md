# Level 4 Demo — State and Routing

> **EastWest Bank — Digital Platforms & Innovations**
>
> React Training Program · Instructor Demo Outline · 20 minutes

---

## Setup

- Open the Portal project in VS Code
- Have the dev server running (`npm run dev`)
- Have React DevTools and Redux DevTools (for Zustand — requires `devtools` middleware on the store) installed in Chrome
- Browser tabs ready: portal at `localhost:5173`, devtools open

---

## Part 1 — Client State vs Server State (5 min)

### Show

1. Open `src/stores/ui-store.ts` — point out the Zustand `create` call
2. Open `src/features/accounts/hooks/use-accounts.ts` — point out the TanStack Query `useQuery`

### Talk Through

- "Two kinds of state, two tools. Client state in Zustand, server state in TanStack Query. The single most common mistake is putting API data in Zustand."
- Toggle the sidebar in the portal. Open Redux DevTools and show the Zustand state change live.
- Navigate to the accounts page. Open the React Query DevTools tab. Show the `['accounts']` query entry — status, data, stale time.

### Type Live

Create a simple filter store to demonstrate selectors:

```tsx
const useFilterStore = create<{ type: string; setType: (t: string) => void }>((set) => ({
  type: 'all',
  setType: (type) => set({ type }),
}));
```

- Show that using a selector `(s) => s.type` prevents re-renders when other state changes.
- Contrast with Context API: "Context re-renders every consumer. Zustand re-renders only subscribers."

### Emphasize

- Access tokens in memory only — never localStorage (BSP 982)
- Show the auth store: no `persist` middleware on the token

---

## Part 2 — TanStack Query in Action (5 min)

### Show

1. Open the accounts page in the browser
2. Open Network tab — show the `GET /accounts` request
3. Navigate away and back — show the cached response (no new request within staleTime)
4. Wait 5+ minutes (or change staleTime to 5s for demo) — show the refetch

### Type Live

Build a simple mutation with optimistic update:

```tsx
const mutation = useMutation({
  mutationFn: (payload) => apiClient.post('/transfers', payload),
  onMutate: async (payload) => {
    await queryClient.cancelQueries({ queryKey: ['accounts'] });
    const previous = queryClient.getQueryData(['accounts']);
    // Update optimistically...
    return { previous };
  },
  onError: (_err, _payload, context) => {
    queryClient.setQueryData(['accounts'], context?.previous);
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['accounts'] });
  },
});
```

### Emphasize

- "The pattern: snapshot, update optimistically, rollback on error, always reconcile with the server."
- Show the query key factory: `accountKeys.all`, `accountKeys.detail('ACC-001')`
- Demonstrate how invalidating `accountKeys.all` cascades to all related queries

---

## Part 3 — Routing and Guards (5 min)

### Show

1. Open `src/router.tsx` — walk through the route tree
2. Point out `lazy: () => import(...)` — explain code splitting
3. Open Network tab, navigate to a new page — show the chunk loading
4. Open `src/components/auth/protected-route.tsx`

### Demo Live

1. Open the portal while logged out — show the redirect to `/login`
2. Show the `state: { from: location.pathname }` being passed
3. Log in — show the redirect back to the original page
4. Try to navigate to `/admin` as a customer — show the role guard redirect

### Emphasize

- "Route guards are UX, not security. The backend must also check. BSP 808."
- Show the `useBlocker` for unsaved changes — dirty a form, click a nav link, show the confirmation dialog

---

## Part 4 — Testing (5 min)

### Show

1. Open a Zustand store test — show `getState()`, `setState()`, `beforeEach` reset
2. Open a TanStack Query hook test — show the `createWrapper()` pattern
3. Run the tests: `npm run test` — show the output

### Type Live

Quick test for the filter store:

```tsx
describe('useFilterStore', () => {
  beforeEach(() => {
    useFilterStore.setState({ type: 'all' });
  });

  it('updates the filter type', () => {
    useFilterStore.getState().setType('savings');
    expect(useFilterStore.getState().type).toBe('savings');
  });
});
```

### Emphasize

- "Zustand stores are singletons — always reset in beforeEach"
- "MSW mocks at the network level, not the module level — your real Axios interceptors run"
- Show how `server.use()` overrides a handler for a single test (e.g., simulating a 500 error)

---

## Wrap-Up

- Zustand for client state (UI, auth tokens), TanStack Query for server state (API data)
- Selectors prevent unnecessary re-renders
- Route guards protect pages but backend is the real gatekeeper
- Test everything: stores with getState, queries with MSW, routes with MemoryRouter

**Transition:** "Next level — API integration and authentication. We will build the Axios client, implement JWT handling, and wire up MFA."

---

---

## If Things Go Wrong

### Pre-Demo Checklist

- [ ] React DevTools and Redux DevTools extensions installed in Chrome
- [ ] Dev server running with accounts page accessible
- [ ] TanStack Query DevTools visible (floating icon in bottom-right)
- [ ] MSW enabled and intercepting API requests (check console for `[MSW] Mocking enabled`)

### Common Issues

**Redux DevTools does not show Zustand state**
- Cause: Zustand `devtools` middleware not applied to the store
- Recovery: Use `useFilterStore.getState()` in the browser console instead. Say "Zustand exposes `getState()` on every store — you can inspect state without DevTools."

**TanStack Query DevTools panel does not appear**
- Cause: `ReactQueryDevtools` component not mounted, or production mode hiding it
- Recovery: Open the Network tab and show the cached vs fresh requests directly. The caching behavior is visible in the response timing — stale requests show `(from cache)` or instant response times.

**Route guard does not redirect — protected page loads without auth**
- Cause: Auth store initialized with a default authenticated state, or ProtectedRoute not wrapping the route
- Recovery: Show the ProtectedRoute source code and walk through the logic on the whiteboard. Say "The redirect is conditional on auth state. Let me show you the code path."

**MSW mock returns unexpected data or 404**
- Cause: Handler path mismatch, or MSW service worker not registered
- Recovery: Check the browser console for MSW warnings. If MSW is not running, show the Network tab requests and explain the expected flow conceptually. Switch to the companion repo branch that has working mocks.

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
