# Level 6 Quiz — Quality

> **EastWest Bank — Digital Platforms & Innovations**
>
> React Training Program · Level 6 Assessment

---

## Instructions

- Answer all 12 questions.
- For multiple choice, select the single best answer (A/B/C/D).
- For short answer, keep responses to 2-3 sentences.


---

### Question 1 (Multiple Choice)

A banking application encounters an "insufficient funds" error during a transfer. Which error category does this belong to?

A. Validation error
B. Network error
C. Business logic error
D. Security error

---

### Question 2 (Short Answer)

The `SecurityError` class uses a generic user message ("A security issue was detected. Please contact support.") instead of revealing the actual error. Explain why this is important from both a security and compliance perspective.

---

### Question 3 (Multiple Choice)

React error boundaries catch errors during which of the following?

A. Event handlers and async code
B. Rendering, lifecycle methods, and constructors of the component tree below them
C. Network requests and API calls
D. All JavaScript errors anywhere in the application

---

### Question 4 (True/False)

When the React Compiler is configured, new functional components no longer need manual `useMemo` or `useCallback` for memoization.

---

### Question 5 (Multiple Choice)

What is the recommended testing pyramid distribution for a banking application?

A. 10% unit, 30% integration, 60% E2E
B. 60% unit, 30% integration, 10% E2E
C. 33% unit, 33% integration, 33% E2E
D. 80% E2E, 10% integration, 10% unit

---

### Question 6 (Short Answer)

Explain the purpose of test data factories (e.g., `createUser()`, `createAccount()`). Why are they preferred over hardcoding test data directly in each test?

---

### Question 7 (Multiple Choice)

When virtualizing a transaction list with 10,000 rows using TanStack Virtual, approximately how many DOM nodes exist at any given time?

A. 10,000 (all rows are rendered)
B. ~20 (only visible rows plus a small overscan buffer)
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

### Question 9 (Short Answer)

The Sentry configuration includes a `beforeSend` hook that strips the user's email and IP address. What BSP regulation requires this, and what is the underlying principle?

---

### Question 10 (Multiple Choice)

Why does the structured logger use `navigator.sendBeacon()` instead of `fetch()` for sending error reports in production?

A. `sendBeacon` supports larger payloads than `fetch`
B. `sendBeacon` encrypts data automatically
C. `sendBeacon` is guaranteed to send data even if the page is unloading (user closing the tab)
D. `sendBeacon` bypasses CORS restrictions

---

### Question 11 (True/False)

The `VITE_APPINSIGHTS_CONNECTION_STRING` environment variable must be kept secret and should never be exposed in the browser bundle because it grants read access to all telemetry data.

---

### Question 12 (Short Answer)

A BSP compliance auditor asks about your financial operation audit trail. Describe what the `auditLog()` function records for a fund transfer, and explain why it logs `fromAccountId` (an internal ID) instead of the actual account number.

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
