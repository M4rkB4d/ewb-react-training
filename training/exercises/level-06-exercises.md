# Level 6 Exercises — Quality

> **EastWest Bank — Digital Platforms & Innovations**
>
> React Training Program · Level 6 Hands-On Exercises

---

## Exercise 1 — Error Boundary with Banking Context

**Difficulty:** Intermediate
**Estimated Time:** 45 minutes

### Learning Objectives

- Implement error boundaries at route and feature levels
- Build user-facing error messages that are helpful without leaking details
- Integrate structured error logging for BSP audit compliance

### Scenario

The account detail page occasionally crashes when the API returns malformed transaction data. The team needs error boundaries that catch these crashes gracefully, display user-friendly messages, provide a recovery action, and log the error for monitoring.

### Requirements

1. Create an `ErrorBoundary` class component with:
   - `getDerivedStateFromError` to capture the error
   - `componentDidCatch` to log the error (with component stack)
   - Support for a `fallback` prop (either a ReactNode or a function receiving the error)
   - An `onError` callback prop for external monitoring integration
2. Create an `ErrorAlert` component that:
   - Shows a user-friendly message from `AppError.userMessage` when available
   - Falls back to a generic message for unknown errors
   - Displays a reference ID (request ID) for support follow-up
   - Includes a "Try Again" button that calls an `onRetry` callback
3. Wrap the transaction list in a feature-level error boundary:
   - Fallback shows "Failed to load transaction history" with retry
   - The error is logged with severity, error code, and URL
4. Wrap the entire app in a route-level error boundary:
   - Fallback shows a full-page error with "Refresh Page" button
5. Implement the `logError` function that:
   - In development: logs to console with structured format
   - In production: sends via `navigator.sendBeacon('/api/errors', ...)`

### Acceptance Criteria

- [ ] Feature-level crash does not take down the entire page
- [ ] User never sees raw error messages, stack traces, or technical details
- [ ] Every error is logged with timestamp, code, severity, URL, and component stack
- [ ] Reference IDs are displayed for support escalation
- [ ] The retry button re-mounts the failed component
- [ ] Error boundaries use class component syntax (required by React)

---

## Exercise 2 — Performance-Optimized Transaction List

**Difficulty:** Challenge
**Estimated Time:** 60 minutes

### Learning Objectives

- Virtualize a long list using TanStack Virtual
- Measure and report Core Web Vitals
- Apply route-level code splitting with lazy loading

### Scenario

The transaction history page must handle accounts with up to 10,000 transactions without jank. The page itself should be lazy-loaded to keep the initial bundle small. Web Vitals must be tracked to ensure performance stays within acceptable ranges.

### Requirements

1. Build a `TransactionList` component using `useVirtualizer` from `@tanstack/react-virtual`:
   - Fixed container height of 600px with overflow scroll
   - Estimated row height of 72px
   - Overscan of 10 items
   - Proper ARIA attributes (`role="list"`, `role="listitem"`)
2. Each `TransactionRow` displays: date, description, amount (color-coded for credit/debit), and running balance
3. Lazy-load the transactions page using React Router's `lazy` property:
   ```tsx
   { path: 'transactions', lazy: () => import('./pages/transactions-page') }
   ```
4. Add a `Suspense` fallback with an appropriately-sized skeleton placeholder
5. Implement Web Vitals tracking:
   - Measure LCP, INP, and CLS using the `web-vitals` library
   - In development: log to console with color-coded ratings
   - In production: send to `/api/vitals` via `navigator.sendBeacon`
6. Verify performance targets: LCP < 2.5s, INP < 200ms, CLS < 0.1

### Acceptance Criteria

- [ ] Scrolling through 5,000+ transactions is smooth (no jank)
- [ ] Only ~20-30 DOM nodes exist at any time regardless of list size
- [ ] The transactions page is code-split into its own chunk
- [ ] Suspense fallback matches the approximate dimensions of the loaded content
- [ ] Web Vitals are measured and reported for every page view
- [ ] Credit amounts are visually distinct from debit amounts

---

## Exercise 3 — E2E Test for Fund Transfer with Monitoring

**Difficulty:** Challenge
**Estimated Time:** 60 minutes

### Learning Objectives

- Write Playwright E2E tests for a critical banking flow
- Build test data factories for consistent, readable tests
- Integrate audit logging for BSP 1019 compliance

### Scenario

The fund transfer flow (login, select accounts, enter amount, review, confirm) is the highest-risk user journey in the portal. It needs E2E test coverage and proper audit logging at each step.

### Requirements

1. Create test data factories:
   - `createUser(overrides?)` — returns a `User` with sensible defaults
   - `createAccount(overrides?)` — returns an `Account` with auto-incrementing IDs
   - `createTransaction(overrides?)` — returns a `Transaction`
2. Write a Playwright E2E test (`e2e/transfers/transfer.spec.ts`) that:
   - Logs in with valid credentials
   - Navigates to the transfers page
   - Selects source and destination accounts
   - Enters an amount and optional notes
   - Reviews the transfer summary
   - Confirms the transfer
   - Verifies the success message and reference number are displayed
3. Write a second test for the error case:
   - Attempt a transfer that exceeds the daily limit
   - Verify the appropriate business error message is shown
4. Implement audit logging in the transfer confirmation handler:
   - Log `INITIATE_TRANSFER` with account IDs, amount, and currency
   - Log `CONFIRM_TRANSFER` with the reference number on success
   - Use internal IDs only (never raw account numbers in logs)
5. Create a Playwright auth fixture that pre-authenticates for transfer tests

### Acceptance Criteria

- [ ] E2E test covers the complete happy path: login through transfer confirmation
- [ ] Error case test verifies user-friendly business error messaging
- [ ] Test data factories produce valid, typed objects with auto-incrementing IDs
- [ ] Auth fixture eliminates duplicate login steps across tests
- [ ] Audit log entries include action, userId, account IDs, amount, and timestamp
- [ ] No PII or raw account numbers appear in audit logs

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
