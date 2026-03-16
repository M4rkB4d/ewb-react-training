# Level 4 Quiz — State and Routing

> **EastWest Bank — Digital Platforms & Innovations**
>
> React Training Program · Level 4 Assessment

---

## Instructions

- Answer all 20 questions.
- For multiple choice, select the single best answer (A/B/C/D).
- For true/false, write True or False.

---

### Question 1 (Multiple Choice)

A component displays the user's current account balance fetched from `GET /accounts`. Which state management tool should hold this data?

A. `useState` inside the component
B. Zustand store with `persist` middleware
C. TanStack Query
D. React Context API

---

### Question 2 (True/False)

Zustand selectors (e.g., `useUIStore((state) => state.theme)`) prevent the component from re-rendering when unrelated state in the same store changes.

---

### Question 3 (Multiple Choice)

Why does the EWB auth store NOT use Zustand's `persist` middleware to save the access token to localStorage?

A. `persist` middleware does not work with TypeScript
B. localStorage has a 1KB size limit that tokens exceed
C. Persisting the token to localStorage creates an XSS vulnerability where injected scripts can steal it
D. The access token changes too frequently for localStorage to keep up

---

### Question 4 (Multiple Choice)

In TanStack Query 5, what is the difference between `staleTime` and `gcTime`?

A. `staleTime` controls how long data is kept in memory; `gcTime` controls when a refetch is triggered
B. `staleTime` controls how long cached data is considered fresh; `gcTime` controls how long inactive data stays in memory before garbage collection
C. They are aliases for the same configuration
D. `staleTime` applies to queries; `gcTime` applies to mutations

---

### Question 5 (Multiple Choice)

When implementing optimistic updates for a "favorite account" toggle, what is the purpose of the `onSettled` callback?

A. To display a success toast notification
B. To log the transaction for BSP compliance
C. To refetch data from the server regardless of mutation success or failure, ensuring the UI matches the actual server state
D. To roll back the optimistic update if validation fails

---

### Question 6 (True/False)

React Router 7's `lazy` property on route definitions enables route-level code splitting, meaning users only download the JavaScript for pages they actually visit.

---

### Question 7 (Multiple Choice)

In the EWB role hierarchy, which role has the LOWEST access level?

A. `teller`
B. `admin`
C. `customer`
D. `manager`

---

### Question 8 (Multiple Choice)

Which approach correctly tests a custom hook that uses TanStack Query?

A. Import the hook function and call it directly in the test
B. Use `renderHook` with a wrapper that provides `QueryClientProvider`
C. Mock the entire TanStack Query module with `vi.mock`
D. Use `vi.fn()` to replace the hook

---

### Question 9 (True/False)

Frontend route guards using `ProtectedRoute` are sufficient to prevent unauthorized API access, and no additional backend authorization checks are needed.

---

### Question 10 (Multiple Choice)

What does the `partialize` option in Zustand's `persist` middleware do?

A. It compresses the state before saving to localStorage
B. It controls which state fields are persisted and which are excluded
C. It enables partial updates to the store without overwriting other fields
D. It splits the store into multiple localStorage keys

---

### Question 11 (Multiple Choice)

What does MSW (Mock Service Worker) mock in tests?

A. React component rendering
B. Zustand store operations
C. HTTP requests at the network level
D. Browser DOM events

---

### Question 12 (True/False)

Zustand stores are singletons, so state can leak between tests if you do not reset the store in `beforeEach`.

---

### Question 13 (Multiple Choice)

The `useUnsavedChanges` hook uses both `useBlocker` and a `beforeunload` event listener. Why are both mechanisms needed?

A. `useBlocker` handles form validation; `beforeunload` handles navigation
B. `useBlocker` handles SPA navigation (clicking links); `beforeunload` handles browser-level exits (closing the tab, refreshing)
C. `useBlocker` works on mobile; `beforeunload` works on desktop
D. They are redundant — either one alone would be sufficient

---

### Question 14 (Multiple Choice)

According to BSP 982, how should the access token be stored in a banking SPA?

A. In localStorage for persistence across tabs
B. In a secure HttpOnly cookie
C. In-memory only (e.g., a JavaScript variable in a Zustand store)
D. In sessionStorage because it clears when the tab closes

---

### Question 15 (True/False)

The `end` prop on a `NavLink` component prevents the root route (`/`) from always appearing active when navigating to child routes like `/accounts`.

---

### Question 16 (Multiple Choice)

In the optimistic update pattern for TanStack Query, what does the `onMutate` callback do?

A. Sends the mutation request to the server
B. Saves a snapshot of the current cache and applies the optimistic update to the UI
C. Validates the mutation payload before sending
D. Logs the mutation for BSP audit compliance

---

### Question 17 (Multiple Choice)

Which React Router 7 hook provides breadcrumb data by exposing route handle metadata for all matched routes?

A. `useLocation`
B. `useParams`
C. `useMatches`
D. `useNavigate`

---

### Question 18 (True/False)

Optimistic updates should be used for financial mutations like fund transfers to improve perceived performance in banking applications.

---

### Question 19 (Multiple Choice)

When testing a component that uses `Link` or `useNavigate` from React Router, what must you wrap the component with in tests?

A. `QueryClientProvider`
B. `MemoryRouter` or `createMemoryRouter` with `RouterProvider`
C. `ErrorBoundary`
D. `Suspense`

---

### Question 20 (Multiple Choice)

In the query key factory pattern, what does `accountKeys.all` represent and why is it useful?

A. It fetches all accounts from the API in a single request
B. It is the top-level key that, when invalidated, cascades invalidation to all account-related queries (lists, details, transactions)
C. It stores all account data in the Zustand store
D. It is an alias for `queryClient.clear()` that removes all cached data

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
