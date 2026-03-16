# Level 6 Quiz — Quality

> **EastWest Bank — Digital Platforms & Innovations**
>
> React Training Program · Level 6 Assessment

---

## Instructions

- Answer all 20 questions.
- For multiple choice, select the single best answer (A/B/C/D).
- For true/false, write True or False.

---

### Question 1 (Multiple Choice)

A banking application encounters an "insufficient funds" error during a transfer. Which error category does this belong to?

A. Validation error
B. Network error
C. Business logic error
D. Security error

---

### Question 2 (Multiple Choice)

React error boundaries catch errors during which of the following?

A. Event handlers and async code
B. Rendering, lifecycle methods, and constructors of the component tree below them
C. Network requests and API calls
D. All JavaScript errors anywhere in the application

---

### Question 3 (True/False)

The `SecurityError` class uses a generic user message ("A security issue was detected. Please contact support.") because revealing the actual security error details could help an attacker refine their approach.

---

### Question 4 (Multiple Choice)

When the React Compiler is configured with React 19, what is the recommended approach for memoization in new functional components?

A. Always add `useMemo` and `useCallback` manually for every value and callback
B. Wrap all components with `React.memo()` as a best practice
C. Do not add manual `useMemo` or `useCallback` — let the compiler handle automatic memoization
D. Use `shouldComponentUpdate` to control re-renders

---

### Question 5 (Multiple Choice)

What is the recommended testing pyramid distribution for a banking application?

A. 10% unit, 30% integration, 60% E2E
B. 60% unit, 30% integration, 10% E2E
C. 33% unit, 33% integration, 33% E2E
D. 80% E2E, 10% integration, 10% unit

---

### Question 6 (True/False)

Error boundaries are the one case where class components are still required in React, because `getDerivedStateFromError` and `componentDidCatch` have no hook equivalents.

---

### Question 7 (Multiple Choice)

When virtualizing a transaction list with 10,000 rows using TanStack Virtual, approximately how many DOM nodes exist at any given time?

A. 10,000 (all rows are rendered)
B. ~20-30 (only visible rows plus a small overscan buffer)
C. 1,000 (rows are batched in groups of 1,000)
D. 0 (virtualization uses canvas rendering, not DOM)

---

### Question 8 (Multiple Choice)

Which Core Web Vital measures how responsive the application feels when the user clicks a button or types in an input?

A. LCP (Largest Contentful Paint)
B. CLS (Cumulative Layout Shift)
C. INP (Interaction to Next Paint)
D. FCP (First Contentful Paint)

---

### Question 9 (True/False)

The Sentry configuration sets `replaysSessionSampleRate: 0` (no general session replay) because recording all banking sessions would capture sensitive financial data on an external platform.

---

### Question 10 (Multiple Choice)

Why does the structured logger use `navigator.sendBeacon()` instead of `fetch()` for sending error reports in production?

A. `sendBeacon` supports larger payloads than `fetch`
B. `sendBeacon` encrypts data automatically
C. `sendBeacon` is guaranteed to send data even if the page is unloading (user closing the tab)
D. `sendBeacon` bypasses CORS restrictions

---

### Question 11 (Multiple Choice)

The Sentry `beforeSend` hook strips the user's email and IP address before sending events. What BSP regulation requires this?

A. BSP 808 — access control requirements
B. BSP 982 — PII must not be transmitted to external systems without proper controls
C. BSP 1033 — financial transaction integrity
D. BSP 1122 — Open Finance API requirements

---

### Question 12 (True/False)

The `VITE_APPINSIGHTS_CONNECTION_STRING` environment variable must be kept secret and never exposed in the browser bundle because it grants read access to all telemetry data.

---

### Question 13 (Multiple Choice)

What is the purpose of test data factories like `createUser()` and `createAccount()`?

A. They generate random test data on every run for fuzz testing
B. They provide consistent, typed default objects with an override mechanism, reducing duplication across test files
C. They connect to the real database to create test records
D. They are only useful for E2E tests, not unit tests

---

### Question 14 (Multiple Choice)

In the custom error taxonomy, the `AppError` class includes a `severity` field with values `'low' | 'medium' | 'high' | 'critical'`. Which error type is always classified as `critical` severity?

A. `ValidationError`
B. `NetworkError`
C. `BusinessError`
D. `SecurityError`

---

### Question 15 (True/False)

In Playwright E2E tests, the `forbidOnly` configuration option prevents accidentally committing tests with `.only` that would skip all other tests in CI.

---

### Question 16 (Multiple Choice)

The audit logging function `auditLog()` records `fromAccountId` (an internal ID) instead of the actual account number. Why?

A. Internal IDs are shorter and use less storage space
B. Account numbers are sensitive financial data that should not appear in logs in case logs are compromised or sent to external monitoring
C. The frontend does not have access to account numbers
D. Internal IDs sort more efficiently in log queries

---

### Question 17 (Multiple Choice)

In Vite's `manualChunks` configuration, React and React DOM are separated into a `react-vendor` chunk. What is the primary benefit?

A. It makes React load faster by splitting it into smaller pieces
B. Vendor chunks change less frequently than application code, so the browser can cache them independently across app updates
C. It prevents React from being tree-shaken out of the bundle
D. It is required for React Compiler to work correctly

---

### Question 18 (True/False)

The `onUnhandledRequest: 'error'` option in MSW's test setup catches any API call that does not have a matching handler, preventing tests from accidentally hitting real APIs.

---

### Question 19 (Multiple Choice)

Which Playwright configuration option records a trace of browser actions, but only when a test fails on its first attempt and is retried?

A. `screenshot: 'only-on-failure'`
B. `trace: 'on-first-retry'`
C. `retries: 2`
D. `fullyParallel: true`

---

### Question 20 (Multiple Choice)

According to the alerting strategy, which scenario triggers an immediate on-call page?

A. A new error type is detected in production
B. CLS exceeds 0.25 on the dashboard page
C. Auth service is down or payment failures exceed 5%
D. LCP exceeds 4 seconds on mobile devices

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
