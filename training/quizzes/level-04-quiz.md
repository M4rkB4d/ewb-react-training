# Level 4 Quiz — State and Routing

> **EastWest Bank — Digital Platforms & Innovations**
>
> React Training Program · Level 4 Assessment

---

## Instructions

- Answer all 12 questions.
- For multiple choice, select the single best answer (A/B/C/D).
- For short answer, keep responses to 2-3 sentences.
- Time estimate: 20 minutes.

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

### Question 3 (Short Answer)

Explain why the EWB auth store does NOT use Zustand's `persist` middleware to save the access token to localStorage. Reference the specific security vulnerability this prevents.

---

### Question 4 (Multiple Choice)

In TanStack Query 5, what is the difference between `staleTime` and `gcTime`?

A. `staleTime` controls how long data is kept in memory; `gcTime` controls when a refetch is triggered
B. `staleTime` controls how long cached data is considered fresh; `gcTime` controls how long inactive data stays in memory before garbage collection
C. They are aliases for the same configuration
D. `staleTime` applies to queries; `gcTime` applies to mutations

---

### Question 5 (Multiple Choice)

When implementing optimistic updates for a fund transfer, what is the purpose of the `onSettled` callback?

A. To display a success toast notification
B. To log the transaction for BSP compliance
C. To refetch data from the server regardless of mutation success or failure, ensuring the UI matches the actual server state
D. To roll back the optimistic update if validation fails

---

### Question 6 (True/False)

React Router 7's `lazy` property on route definitions enables route-level code splitting, meaning users only download the JavaScript for pages they actually visit.

---

### Question 7 (Short Answer)

A developer implements a `ProtectedRoute` component that redirects unauthenticated users to `/login`. They argue this is sufficient access control. What critical security principle are they missing, and what BSP circular addresses it?

---

### Question 8 (Multiple Choice)

Which approach correctly tests a custom hook that uses TanStack Query?

A. Import the hook function and call it directly in the test
B. Use `renderHook` with a wrapper that provides `QueryClientProvider`
C. Mock the entire TanStack Query module with `vi.mock`
D. Render a dummy component that uses the hook

---

### Question 9 (Multiple Choice)

In the route configuration below, what happens when a user with role `customer` navigates to `/admin`?

```tsx
<Route element={<RoleGuard allowedRoles={['admin', 'manager']} />}>
  <Route path="admin" lazy={() => import('@/pages/admin')} />
</Route>
```

A. The admin page loads but shows empty content
B. The user is redirected to the home page (`/`)
C. An error boundary catches the unauthorized access
D. The request is blocked by CORS

---

### Question 10 (Short Answer)

Explain why Zustand stores must be reset in `beforeEach` during tests. What problem occurs if you skip this step?

---

### Question 11 (Multiple Choice)

What does MSW (Mock Service Worker) mock in tests?

A. React component rendering
B. Zustand store operations
C. HTTP requests at the network level
D. Browser DOM events

---

### Question 12 (Short Answer)

The `useUnsavedChanges` hook uses both `useBlocker` and a `beforeunload` event listener. Why are both needed? What scenario does each one handle?

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
