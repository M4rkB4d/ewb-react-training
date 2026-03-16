# Level 6 Answer Key — Quality

> **EastWest Bank — Digital Platforms & Innovations**
>
> React Training Program · Level 6 Instructor Reference

---

## Quiz Answers

### Question 1 — Answer: C

"Insufficient funds" is a business logic error. The request was valid (correct format, authenticated user, proper accounts), but a business rule prevents the transfer. Business errors require specific user messaging and are distinct from validation errors (wrong format), network errors (connectivity), or security errors (tampered data).

### Question 2 — Answer: B

Error boundaries catch errors during rendering, lifecycle methods, and constructors of the component tree below them. They do NOT catch errors in event handlers (use try/catch), async code (use .catch() or try/catch in async functions), or server-side rendering.

### Question 3 — Answer: True

Detailed security error messages reveal attack surface information. If the error said "CSRF token mismatch" or "CSP blocked inline script," an attacker would learn what defenses exist and could refine their approach. A generic message prevents information leakage while the actual details are logged server-side for security team review.

### Question 4 — Answer: C

React Compiler is a separate build-time tool that automatically memoizes components, values, and callbacks. For new code, do not add manual `useMemo` or `useCallback` — the compiler handles this. Existing manual memoization can remain; the compiler will process it without conflict.

### Question 5 — Answer: B

The testing pyramid for banking applications: ~60% unit tests (fast, reliable, testing hooks/stores/utils), ~30% integration tests (components with API and state), ~10% E2E tests (critical user flows in real browsers). More unit tests because they run in milliseconds and catch regressions quickly. Fewer E2E tests because they are slow but essential for high-risk flows.

### Question 6 — Answer: True

`getDerivedStateFromError` and `componentDidCatch` are class component lifecycle methods with no hook equivalents. This is the one case where class components are still required in React. Libraries like `react-error-boundary` wrap this boilerplate into a declarative API.

### Question 7 — Answer: B

TanStack Virtual renders only the items visible in the viewport plus a configurable overscan buffer (typically 5-10 items above and below). For a 600px container with 72px rows, approximately 8 visible rows plus overscan items totals around 20-30 DOM nodes, regardless of the total list size.

### Question 8 — Answer: C

INP (Interaction to Next Paint) measures the latency between a user interaction (click, tap, keypress) and the next visual update. The target is under 200ms. LCP (A) measures when the largest visible element renders. CLS (B) measures unexpected layout shifts. FCP (D) measures when any content first appears.

### Question 9 — Answer: True

Full session replay in a banking app would record user interactions including account balances, transaction details, and personal information on Sentry's external platform. Setting `replaysSessionSampleRate: 0` disables general recording, while `replaysOnErrorSampleRate: 1.0` only captures replays when errors occur — providing debugging value with controlled privacy exposure.

### Question 10 — Answer: C

`navigator.sendBeacon()` is designed for analytics and diagnostics. Unlike `fetch()`, it is guaranteed to complete even during page unload events (user closing the tab, navigating away). This is critical for error reporting: if a crash occurs and the user closes the tab, the error report still reaches the monitoring endpoint.

### Question 11 — Answer: B

BSP 982 Section 5.4 requires that PII not be transmitted to external systems without proper controls. Sentry is an external monitoring service. The `beforeSend` hook strips email and IP address before the event leaves the browser, ensuring PII stays within EWB-controlled systems. The principle is data minimization: external tools only receive what they need (user ID for correlation).

### Question 12 — Answer: False

The Application Insights connection string is a write-only ingestion key. It allows the browser to send telemetry data to Azure but does not grant read access to existing data. Azure explicitly designs these connection strings for client-side use. Read access requires separate Azure RBAC permissions.

### Question 13 — Answer: B

Test data factories provide consistent, typed default objects with a simple override mechanism (e.g., `createUser({ role: 'admin' })`). They reduce duplication across test files, ensure changes to data shapes only need updating in one place, and produce valid objects by default so tests focus on what they are testing.

### Question 14 — Answer: D

`SecurityError` is always classified as `critical` severity because security issues (tampered data, CSP violations) represent potential attacks that require immediate attention. `ValidationError` is `low`, `NetworkError` is `medium`, and `BusinessError` is `medium` severity.

### Question 15 — Answer: True

`forbidOnly: !!process.env.CI` ensures that tests using `.only` (which skip all other tests) fail in CI environments. This prevents a developer from accidentally pushing a focused test that would silently skip the rest of the test suite in the deployment pipeline.

### Question 16 — Answer: B

Account numbers are sensitive financial data. If logs are compromised, intercepted by external monitoring, or accessed by unauthorized personnel, internal IDs reveal nothing useful. BSP 1019 requires complete audit trails, but BSP 982 and RA 10173 (Data Privacy Act) require sensitive data to be protected. Internal IDs can be cross-referenced by authorized personnel with database access when needed.

### Question 17 — Answer: B

Vendor libraries like React and React DOM change infrequently compared to application code. Separating them into their own chunk allows the browser to cache them independently. When you deploy an application update, users only download the changed application chunks — the cached vendor chunk is reused.

### Question 18 — Answer: True

The `onUnhandledRequest: 'error'` option in `server.listen()` makes MSW throw an error if any HTTP request does not match a defined handler. This catches tests that accidentally make real API calls, ensuring all network requests are properly mocked and test isolation is maintained.

### Question 19 — Answer: B

`trace: 'on-first-retry'` configures Playwright to capture a full trace (screenshots, DOM snapshots, network requests, console logs) only when a test fails on its first attempt and is retried. This provides detailed debugging information for flaky or failing tests without the storage overhead of tracing every test run.

### Question 20 — Answer: C

Auth service down or payment failures exceeding 5% are classified as "Critical" severity, triggering an immediate on-call page. These represent direct impact on users' ability to log in or complete financial transactions. New error types (A) and high CLS (B) are "Medium" severity for daily review. High LCP (D) is "High" severity, alerting within 15 minutes.

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
