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

### Question 3 — Answer: C

Storing the access token in localStorage creates an XSS vulnerability. If an attacker injects JavaScript, they can call `localStorage.getItem('accessToken')` and exfiltrate the token. In-memory storage (Zustand without persist) is not accessible to injected scripts after a page reload. BSP 982 Section 5.4 requires protection of session tokens from unauthorized access.

### Question 4 — Answer: B

`staleTime` determines how long cached data is considered fresh (no automatic refetch during this window). `gcTime` (garbage collection time) determines how long inactive query data stays in memory after a component unmounts. With 5-minute staleTime and 10-minute gcTime: returning after 3 minutes shows cached data without refetch; returning after 12 minutes triggers a fresh fetch because the cached data was garbage collected.

### Question 5 — Answer: C

`onSettled` fires after both success and failure, ensuring the cache is refreshed regardless of outcome. The optimistic update is an approximation — the server might apply changes the client did not predict. Even if `onSuccess` runs, the optimistic state might differ from the actual server state. `onSettled` guarantees reconciliation.

### Question 6 — Answer: True

The `lazy` property on route definitions uses dynamic `import()` to split each page into a separate JavaScript chunk. The browser only downloads a page's code when the user navigates to it, reducing the initial bundle size.

### Question 7 — Answer: C

The EWB role hierarchy is `customer < teller < manager < admin`. Customer has the lowest access level (value 0), with each subsequent role inheriting all permissions of the lower roles plus additional ones.

### Question 8 — Answer: B

TanStack Query hooks require a `QueryClientProvider` context. `renderHook` with a wrapper function that provides this context is the correct approach. Calling the hook directly (A) violates the Rules of Hooks. Mocking the entire module (C) tests nothing meaningful.

### Question 9 — Answer: False

Frontend route guards are a UX convenience, not a security mechanism. A user can bypass any frontend check using browser DevTools or by calling the API directly. BSP 982 requires the backend to independently verify authentication and authorization on every request.

### Question 10 — Answer: B

`partialize` controls which state fields are persisted to localStorage. For example, in the UI store, `partialize: (state) => ({ theme: state.theme })` persists only the theme preference while excluding transient state like `sidebarOpen`, which should reset on page reload.

### Question 11 — Answer: C

MSW intercepts HTTP requests at the network level using request interception in Node.js (for tests). This is superior to module mocking because it tests the actual HTTP client code (Axios config, interceptors, error handling) — only the network layer is faked.

### Question 12 — Answer: True

Zustand stores are singletons that persist across tests. Without resetting in `beforeEach`, a test that calls `setAuth()` leaves the store in an authenticated state that leaks into subsequent tests, causing test pollution and non-deterministic failures.

### Question 13 — Answer: B

`useBlocker` intercepts client-side navigation (clicking React Router links, calling `navigate()`). `beforeunload` intercepts browser-level exits (refreshing, closing the tab, typing a new URL). Both are needed because `useBlocker` cannot prevent browser-level actions, and `beforeunload` cannot intercept client-side routing.

### Question 14 — Answer: C

BSP 982 Section 5.4 requires tokens to be protected from XSS. In-memory storage (a JavaScript variable in a Zustand store) is the safest frontend option. localStorage (A) and sessionStorage (D) are readable by any script on the page. HttpOnly cookies (B) are for the refresh token, managed by the backend.

### Question 15 — Answer: True

The `end` prop on `NavLink` for the root route (`/`) ensures it only shows as active when the URL is exactly `/`. Without `end`, the root NavLink would match all routes (since every route starts with `/`), making it always appear active.

### Question 16 — Answer: B

`onMutate` runs before the mutation request is sent. It saves a snapshot of the current cache data (for rollback) and immediately applies the optimistic change to the cache so the UI updates instantly, before the server responds.

### Question 17 — Answer: C

`useMatches` returns all matched route objects for the current URL, including their `handle` property. Breadcrumbs are built by attaching a `breadcrumb` field to route handles and iterating over the matched routes.

### Question 18 — Answer: False

Optimistic updates must never be used for financial mutations (transfers, payments, balance changes). Showing a transfer as successful before the server confirms it is a compliance incident under BSP 1033. Financial operations must use the server-confirmed mutation pattern.

### Question 19 — Answer: B

Components using React Router hooks (`Link`, `useNavigate`, `NavLink`) require a router context. `MemoryRouter` provides this in tests without a real browser. For apps using `createBrowserRouter`, use `createMemoryRouter` with `RouterProvider` to support data router hooks.

### Question 20 — Answer: B

`accountKeys.all` is `['accounts']` — the root of the hierarchical key structure. When you call `queryClient.invalidateQueries({ queryKey: accountKeys.all })`, TanStack Query invalidates all queries whose keys start with `['accounts']`, including lists, details, and transactions. This enables cascading cache invalidation.

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
