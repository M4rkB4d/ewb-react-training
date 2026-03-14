# Level 6 Demo — Quality

> **EastWest Bank — Digital Platforms & Innovations**
>
> React Training Program · Instructor Demo Outline · 20 minutes

---

## Setup

- Portal project open in VS Code
- Dev server running
- Chrome DevTools open (Performance tab ready)
- Playwright UI mode ready: `npx playwright test --ui`
- Sentry dashboard open (or a screenshot of one)

---

## Part 1 — Error Handling and Boundaries (5 min)

### Show

1. Open `src/lib/errors.ts` — walk through the error taxonomy
2. Show `AppError`, `ValidationError`, `NetworkError`, `BusinessError`, `SecurityError`
3. Open `src/components/error/error-boundary.tsx` — the class component
4. Open `src/components/error/error-alert.tsx` — the user-facing component

### Demo Live

1. In the running app, temporarily break a component (e.g., access `undefined.id`)
2. Show the error boundary catch it — the fallback UI appears
3. Show the console: structured error log with timestamp, code, severity, URL
4. "The user sees 'Something went wrong.' The console has the full details for debugging."

### Type Live

Show the difference between good and bad error messages:

```
Bad:  "TypeError: Cannot read properties of null (reading 'balance')"
Good: "Unable to load your account balance. Please try again."

Bad:  "SQL error: table accounts column balance"
Good: "A system error occurred. Reference: REQ-abc123"
```

### Emphasize

- "Error boundaries are the one case where class components are still required"
- "User messages must never leak technical details — especially in banking"
- "SecurityError uses a generic message deliberately. Detailed security errors help attackers."
- Show `navigator.sendBeacon` — "Sends the error report even if the user closes the tab"

---

## Part 2 — Performance: React Compiler and Virtualization (5 min)

### Show

1. Open a simple component — "In React 19, the compiler handles memoization automatically"
2. "No more `useMemo`, `useCallback`, or `React.memo` in new code. Just write clean functions."
3. Open `src/features/accounts/components/transaction-list.tsx` — the virtualized list

### Demo Live

1. Navigate to an account with many transactions
2. Open DevTools → Elements tab → show that only ~20 DOM nodes exist in the list
3. Scroll rapidly — show that the DOM node count stays constant
4. "10,000 transactions, 20 DOM nodes. That is virtualization."

### Talk Through

Code splitting with the router:

1. Open Network tab, clear it
2. Navigate to a new page — show the chunk loading (e.g., `transfers-page-abc123.js`)
3. "Each page is a separate file. The user only downloads what they visit."
4. Show the Vite config: `manualChunks` for vendor splitting
5. "React, React Router, and TanStack Query are cached separately from your code."

### Emphasize

- "Measure before optimizing. Do not guess — use Web Vitals."
- Show the Web Vitals console output: LCP, INP, CLS with color-coded ratings
- "LCP under 2.5 seconds. INP under 200ms. CLS under 0.1. These are the targets."

---

## Part 3 — Advanced Testing with Playwright (5 min)

### Show

1. Open `e2e/auth/login.spec.ts` — the login E2E test
2. Open `e2e/transfers/transfer.spec.ts` — the full transfer flow test
3. Open `src/test/factories/user-factory.ts` — the factory pattern

### Demo Live

1. Run Playwright in UI mode: `npx playwright test --ui`
2. Show the test runner — click on the login test
3. Watch the test execute: browser opens, fields fill, button clicks, assertions pass
4. Show a failing test — the screenshot and trace on failure
5. "Playwright captures screenshots on failure and traces on retry. No more 'it works on my machine.'"

### Talk Through

The testing pyramid:
- "60% unit tests — fast, cheap, run in milliseconds"
- "30% integration tests — component + API + state with MSW"
- "10% E2E tests — critical flows only: login, transfers, session timeout"
- "Do not chase 100% coverage. Test what matters: financial calculations, auth flows, error states."

### Emphasize

- Test data factories over hardcoded data — "Change the type once, all tests update"
- `onUnhandledRequest: 'error'` in MSW — "Catches accidental real API calls in tests"
- Auth fixture pattern — "Pre-authenticate once, reuse across all transfer tests"

---

## Part 4 — Monitoring and Observability (5 min)

### Show

1. Open `src/lib/monitoring.ts` — Sentry configuration
2. Point out `beforeSend` — "Strips email and IP before sending. BSP 982."
3. Open `src/lib/audit.ts` — the audit logging function
4. Open `src/lib/azure-insights.ts` — Application Insights setup

### Talk Through

The monitoring stack:

```
Sentry             — Developer error tracking (stack traces, replay)
App Insights       — Operations monitoring (dashboards, Azure correlation)
Structured Logger  — BSP 1019 audit trail (financial operations)
Web Vitals         — Performance metrics (LCP, INP, CLS)
```

### Demo Live

1. Trigger an error in the running app
2. Show the Sentry event (or a screenshot): error grouped, stack trace, user ID (no email)
3. Show the audit log output in console: `AUDIT: INITIATE_TRANSFER { userId, fromAccountId, amount }`
4. "Notice: `fromAccountId` is an internal ID, not the account number. Account numbers are PII."

### Emphasize

- "Sentry gets user ID only — no email, no name, no account numbers"
- "`replaysOnErrorSampleRate: 1.0` — replay every error, but `replaysSessionSampleRate: 0` — never replay general sessions. Banking screens show balances."
- "Application Insights connection strings are write-only — safe for the browser bundle"
- Show the alerting tiers: Critical (auth down) → High (error rate spike) → Medium (new error type) → Low (deprecation warnings)

---

## Wrap-Up

- Errors are classified, logged, and shown to users appropriately
- React Compiler removes the need for manual memoization
- Virtualize long lists — banking transaction history can be huge
- E2E tests cover critical flows; unit tests cover everything else
- Monitor with Sentry (developers) and Application Insights (operations)
- Audit every financial operation with internal IDs only

**Transition:** "Levels 4-6 are complete. You now have state management, routing, authentication, API integration, error handling, performance, testing, and monitoring. Level 7 takes this to production — deployment pipelines, security hardening, and compliance certification."

---

---

## If Things Go Wrong

### Pre-Demo Checklist

- [ ] Playwright installed: `npx playwright --version` returns a version
- [ ] Playwright browsers installed: `npx playwright install` completed previously
- [ ] Dev server running (Playwright tests need a running app unless configured otherwise)
- [ ] Sentry dashboard accessible or screenshots prepared as fallback
- [ ] Performance tab in DevTools opens without crashing (close other heavy tabs)

### Common Issues

**Playwright UI mode fails to launch or shows a blank window**
- Cause: Playwright browsers not installed, or display server issue on the machine
- Recovery: Run tests in headless mode: `npx playwright test --reporter=list`. Show the terminal output — pass/fail with timing. Say "UI mode is convenient but the CLI output tells you everything you need."

**Error boundary does not catch the deliberately broken component**
- Cause: React's development mode shows the error overlay on top of the boundary fallback
- Recovery: Click the "X" on the React error overlay to dismiss it — the error boundary fallback is underneath. Explain that production builds do not show this overlay.

**Performance tab recording shows no useful data**
- Cause: Recording too short, or page was idle during the capture
- Recovery: Focus on the Web Vitals console output instead. Show LCP, INP, and CLS values. Say "Web Vitals give you the three numbers that matter. The Performance tab is for deep dives."

**Virtualized list does not show reduced DOM nodes**
- Cause: Virtualization library not installed, or the list has too few items to trigger virtualization
- Recovery: Open Elements tab, manually count the rendered rows, and compare to the data array length. If they match, say "With only 20 items, virtualization is unnecessary. The benefit appears at 500+ rows — the DOM node count stays constant regardless of data size."

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
