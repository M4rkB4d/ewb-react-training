# Level 4 — State & Routing
## Slide Deck Outline

### Slide 1: Title Slide
- Level 4 — State & Routing
- EastWest Bank React Training
- Digital Platforms & Innovations

### Slide 2: Learning Objectives
- Distinguish client state from server state and use the right tool for each
- Build global stores with Zustand 5
- Manage server data with TanStack Query 5
- Configure routing with React Router 7 including protected routes
- Test components that use stores, queries, and routing

### Slide 3: Two Kinds of State
- **Client state**: owned by the browser (theme, sidebar, wizard step, selected filters)
- **Server state**: owned by the backend (account list, balances, transaction history)
- The most common React mistake: putting server data in client state
- Client state → Zustand 5. Server state → TanStack Query 5.
- *Speaker notes: Draw the line clearly. If it comes from an API and other users can change it, it is server state. If it lives only in this browser, it is client state.*

### Slide 4: Zustand 5 — Client State
- Minimal, unopinionated store with TypeScript-first design
- No providers, no context — call `useStore()` from any component
- Slice pattern: split large stores into focused concerns (auth, ui, preferences)
- Why not Context API? Re-renders every consumer on any state change — performance problem
- *Speaker notes: Build an auth store live — user, token, login(), logout(). Show how multiple components consume it without provider wrappers.*

### Slide 5: Zustand Patterns for Banking
- Auth store: user profile, roles, session state
- UI store: sidebar collapsed, active modal, toast queue
- Preferences store: theme, locale, notification settings
- Never store API data in Zustand — that belongs in TanStack Query
- *Speaker notes: Show the slice pattern — each slice is a separate file with its own types. The main store composes them.*

### Slide 6: TanStack Query 5 — Server State
- Automatic caching, refetching, and stale-time management
- No manual loading/error state tracking — Query handles it
- `useQuery` for reads, `useMutation` for writes
- Stale-while-revalidate: show cached data instantly, refresh in background
- *Speaker notes: Show a before/after — manual useEffect + useState for API calls vs. one useQuery call. The difference is dramatic.*

### Slide 7: TanStack Query for Banking
- Account list: `staleTime: 30_000` (30s) — balances change, but not every second
- Transaction history: `staleTime: 60_000` — changes infrequently
- Optimistic updates: show transfer success immediately, roll back on API failure
- Query invalidation: after a transfer, invalidate account balances
- *Speaker notes: Demo an optimistic update for a fund transfer — the balance updates instantly, then confirms or rolls back.*

### Slide 8: React Router 7 — SPA Routing
- File-based route configuration with `createBrowserRouter`
- Nested layouts: shared header/sidebar with child route content
- Lazy loading: `lazy: () => import('@/pages/accounts')` for code splitting
- Breadcrumb navigation from route metadata
- *Speaker notes: Show the router config. Emphasize lazy loading — each page loads only when visited, reducing initial bundle size.*

### Slide 9: Protected Routes
- Route guards check authentication before rendering
- Unauthenticated users redirect to `/login`
- Role-based guards: teller routes vs. manager routes vs. admin routes
- Pattern: `<ProtectedRoute roles={['manager', 'admin']}>` wrapper
- *Speaker notes: Demo navigating to /admin as a teller — redirect to unauthorized page. This is BSP 982 access control.*

### Slide 10: Navigation Guards
- Unsaved form data: warn before navigating away from a half-completed transfer
- `useBlocker` hook intercepts navigation attempts
- Show confirmation dialog: "You have unsaved changes. Discard?"
- Banking-critical: prevent accidental data loss during financial operations
- *Speaker notes: Demo filling out a transfer form, then clicking a nav link. The blocker should catch it and ask for confirmation.*

### Slide 11: Testing Stores
- Test Zustand stores in isolation — call actions, assert state changes
- Reset store between tests for isolation (`store.setState(initialState)`)
- Test selectors: verify derived data computes correctly
- *Speaker notes: Show a store test — login sets user and token, logout clears them. Simple, fast, no rendering needed.*

### Slide 12: Testing TanStack Query Hooks
- Mock API calls with MSW (Mock Service Worker)
- Wrap test components in `QueryClientProvider` with fresh client per test
- Test loading, success, and error states
- Test mutation side effects (cache invalidation after transfer)
- *Speaker notes: Show MSW intercepting an API call and returning mock data. The component renders as if the real API responded.*

### Slide 13: Testing Routed Components
- Use `MemoryRouter` to simulate navigation in tests
- Test that protected routes redirect unauthenticated users
- Test that URL parameters are read correctly
- Test breadcrumb rendering at different route depths
- *Speaker notes: Demo testing a protected route — render without auth, assert redirect. Render with auth, assert content.*

### Slide 14: Key Takeaways
- Client state (Zustand) and server state (TanStack Query) are different tools for different jobs
- Never store API data in Zustand — let TanStack Query manage caching and freshness
- Protected routes enforce BSP 982 access control at the frontend layer
- MSW makes API testing deterministic and fast — no real network calls
- Next: Level 5 — Data & Auth
