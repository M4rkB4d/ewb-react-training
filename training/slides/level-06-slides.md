# Level 6 — Quality
## Slide Deck Outline

### Slide 1: Title Slide
- Level 6 — Quality
- EastWest Bank React Training
- Digital Platforms & Innovations

### Slide 2: Learning Objectives
- Classify errors by type and severity with a banking error taxonomy
- Implement React error boundaries at multiple levels
- Write end-to-end tests with Playwright for critical banking flows
- Optimize performance with React Compiler and code splitting
- Set up monitoring with Sentry and Azure Application Insights

### Slide 3: Error Taxonomy for Banking
- **Validation**: invalid amount, wrong format → show field error
- **Network**: timeout, no connection → show retry option
- **Auth**: token expired, unauthorized → redirect to login
- **Business logic**: insufficient funds, daily limit exceeded → show specific message
- **Server**: 500 error, service down → show fallback UI
- *Speaker notes: Not all errors are equal. The type determines the response. A network error gets a retry button; an auth error gets a redirect.*

### Slide 4: Custom Error Classes
- Extend `Error` with structured types: `AppError`, `ApiError`, `ValidationError`
- Each error carries: code, message, severity, user-facing message, metadata
- User-facing messages are helpful without leaking implementation details
- Never show raw error messages to customers — "Something went wrong" is not helpful either
- *Speaker notes: Show the error class hierarchy. A `TransferError` with code `INSUFFICIENT_FUNDS` renders differently than `DAILY_LIMIT_EXCEEDED`.*

### Slide 5: React Error Boundaries
- Error boundaries catch rendering errors — the React equivalent of try/catch
- Place boundaries at route level, feature level, and widget level
- Route-level: shows a full-page fallback with "Return to Dashboard" option
- Widget-level: isolates failure — one broken widget does not crash the entire page
- *Speaker notes: Demo an error boundary catching a crash in the transaction list. The account summary card still works — isolation in action.*

### Slide 6: Structured Error Logging
- Every error logged with: timestamp, error code, severity, user context, request ID
- BSP 1019 requires error monitoring and audit trails
- Log to Sentry (crash tracking) and Azure Application Insights (telemetry)
- Never log PII (account numbers, names) — log anonymized identifiers only
- *Speaker notes: Show a structured log entry. The request ID links frontend errors to backend logs for incident investigation.*

### Slide 7: The Testing Pyramid
- **Unit (60%)**: hooks, utilities, stores — fast, isolated, hundreds of them
- **Integration (30%)**: component + API + state — MSW mocks the network layer
- **E2E (10%)**: critical user flows — Playwright drives a real browser
- Banking focus: financial features get higher coverage than UI chrome
- *Speaker notes: The pyramid is a guideline, not a law. The key insight: most bugs are caught by unit and integration tests. E2E tests catch the gaps.*

### Slide 8: Playwright — End-to-End Testing
- Playwright runs tests in real browsers (Chromium, Firefox, WebKit)
- Test complete flows: login → navigate → transfer funds → verify receipt
- Reliable selectors: `page.getByRole('button', { name: 'Transfer' })`
- Screenshots on failure for debugging
- *Speaker notes: Demo a Playwright test for the login flow. Show how it fills the form, submits, and asserts the dashboard appears.*

### Slide 9: Test Data Factories
- Factories generate consistent test data: `createAccount()`, `createTransaction()`
- Override defaults for specific scenarios: `createAccount({ status: 'frozen' })`
- No hardcoded test data scattered across test files
- Factories use the same Zod schemas as production code — tests validate realistic data
- *Speaker notes: Show a factory that generates 50 transactions. Each test gets fresh, isolated data without manual setup.*

### Slide 10: CI-Friendly Test Pipeline
- Unit + integration: run on every commit (fast, < 2 minutes)
- E2E: run on pull requests and pre-deployment (slower, < 10 minutes)
- Coverage thresholds: 80% for financial features, 60% for UI components
- Azure Pipelines runs the full suite — broken tests block deployment
- *Speaker notes: Show the pipeline stages. Emphasize that tests are not optional — if they fail, the code does not ship.*

### Slide 11: React Compiler — Automatic Optimization
- React Compiler (separate opt-in tool) — automatic memoization when configured
- No more manual `React.memo`, `useMemo`, `useCallback` in most cases
- The compiler analyzes component dependencies and memoizes at build time
- Focus on writing correct code — the compiler handles performance
- *Speaker notes: Show a before/after — without React Compiler (manual memoization) vs. with React Compiler configured. Less code, same or better performance.*

### Slide 12: Code Splitting and Lazy Loading
- Route-level code splitting: each page loads only when visited
- `lazy(() => import('@/pages/transfers'))` — Vite handles the bundling
- Virtualized lists for transaction history (hundreds/thousands of rows)
- Preload on hover: `<Link onMouseEnter={preloadTransfers}>` for perceived speed
- *Speaker notes: Show the network tab — initial load is small. Navigating to transfers triggers a separate chunk download.*

### Slide 13: Web Vitals Monitoring
- **LCP** (Largest Contentful Paint): < 2.5s — how fast the main content appears
- **INP** (Interaction to Next Paint): < 200ms — how responsive interactions feel
- **CLS** (Cumulative Layout Shift): < 0.1 — visual stability during load
- Report metrics to Azure Application Insights for real-user monitoring
- *Speaker notes: Show the Web Vitals dashboard. Banking users expect fast, stable interfaces — especially on mobile.*

### Slide 14: Sentry and Application Insights
- Sentry: frontend crash tracking with source maps, breadcrumbs, and session replay
- Application Insights: telemetry, custom events, user session tracking
- Audit trail: financial operations logged with user, timestamp, amount, reference ID
- BSP 1019 compliance: monitoring is not optional — it is a regulatory requirement
- *Speaker notes: Show a Sentry error with the full stack trace and breadcrumbs. Show how request ID connects frontend and backend logs.*

### Slide 15: Key Takeaways
- Error taxonomy determines the response — not all errors are created equal
- Error boundaries isolate failures — one broken widget does not crash the app
- The testing pyramid focuses effort where it matters most
- Monitoring is a BSP requirement, not a nice-to-have
- Next: Level 7 — Production
