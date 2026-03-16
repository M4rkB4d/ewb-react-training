# Level 8 Answer Key — Mastery

> **EastWest Bank — Digital Platforms & Innovations**
>
> React Training Program · Level 8 Instructor Reference

---

## Quiz Answers

### Question 1 — Answer: B

Features should only import from other features through their public API — the `index.ts` file (facade). This ensures loose coupling. If the accounts feature restructures its internal files, transfers is unaffected because the public API contract remains the same.

### Question 2 — Answer: False

Value objects are compared by value (their properties), not by identity. A `Money` object with `{ amount: 5000, currency: 'PHP' }` is equal to another `Money` with the same values. Entities (like Account with a unique ID) are compared by identity.

### Question 3 — Answer: B

An event bus provides loose coupling — the `transfers` feature emits `transfer:completed` without knowing that `accounts` subscribes to it. This makes features independently testable and deployable. The tradeoff is reduced traceability, which typed event catalogs mitigate.

### Question 4 — Answer: C

Transaction alerts flow one way (server to client). SSE is designed for this pattern, auto-reconnects on failure, and works through most corporate proxies. WebSocket is overkill since the client does not need to send data on this channel. Polling at 500ms wastes bandwidth when no transactions are occurring.

### Question 5 — Answer: B

The adaptive option increases the polling interval (up to 5x the base) when data has not changed between fetches. When data changes, the interval resets to the base value. This saves bandwidth during quiet periods while remaining responsive when activity resumes.

### Question 6 — Answer: False

Native `EventSource` does not support custom HTTP headers. The `useEventSource` hook authenticates using `withCredentials: true`, which sends HttpOnly cookies automatically. Putting tokens in query parameters would expose them in server logs, browser history, and Referer headers.

### Question 7 — Answer: B

Each locale file can be 20-50KB. Including all three locales (English, Filipino, Chinese) would add 60-150KB to the initial bundle that most users never need. Lazy loading via dynamic `import()` means only the active locale is downloaded, reducing initial bundle size.

### Question 8 — Answer: False

`Intl.NumberFormat` handles locale-specific formatting automatically: thousands separators, decimal separators, currency symbol positioning, negative number formatting, and proper rounding. Manual string concatenation breaks across locales and does not handle edge cases correctly.

### Question 9 — Answer: B

The `usePayment` hook emits a domain event via the event bus (`payment:completed`) and logs an audit event via `emitAuditEvent('PAYMENT_SUBMITTED', ...)`. It does not directly update the accounts store or call the accounts API. The accounts feature independently subscribes to the event and refreshes its own data.

### Question 10 — Answer: B

Invalidation triggers a proper fetch through the existing API layer, which includes Zod validation and error handling. Directly setting query data from WebSocket messages skips validation and can cause inconsistencies if the message format differs from the API response format.

### Question 11 — Answer: B

ICU MessageFormat syntax uses `{count, plural, one {# account} other {# accounts}}` for pluralization. The `#` symbol is replaced with the count value. Options A, C, and D use JavaScript syntax that does not work in message catalogs and cannot be translated by localizers.

### Question 12 — Answer: False

Shared code (`components`, `hooks`, `lib`) must never import from features. If a shared component needs feature data, it accepts props instead. The dependency rule is one-way: `app` imports from `features`, features import from shared code, but never the reverse.

### Question 13 — Answer: B

The payment draft store intentionally omits `persist` because it holds sensitive data (account IDs, amounts, biller details). Writing this to localStorage would mean payment data survives after the browser tab closes, the session ends, or the user logs out — creating a data exposure risk. The `reset()` method clears in-memory state when the wizard completes or is cancelled. This follows the same principle from Level 4 where the auth store avoids persisting access tokens to localStorage.

### Question 14 — Answer: C

The WebSocket reconnection uses exponential backoff with the formula `reconnectInterval * 2^attempts`, capped at 30 seconds. The delays are 3s, 6s, 12s, 24s, then 30s (max) for subsequent attempts, preventing server overload during outages while reconnecting quickly for brief issues.

### Question 15 — Answer: True

`useSyncExternalStore` is the React 18+ way to subscribe to external data sources like browser APIs. It ensures the component re-renders synchronously when the online/offline status changes, preventing stale reads (tearing) during concurrent rendering that `useState` + `useEffect` cannot guarantee.

### Question 16 — Answer: B

The EWB internationalization setup supports `en-US` (English, primary), `fil-PH` (Filipino), and `zh-Hans` (Simplified Chinese), matching the EWB customer base. These are defined in the locale store and message loader configuration.

### Question 17 — Answer: B

Floating-point arithmetic in JavaScript causes rounding errors (e.g., `0.1 + 0.2 = 0.30000000000000004`) that are unacceptable for financial calculations. Storing amounts as integer centavos eliminates these errors entirely. The `createMoney` function throws an error if a non-integer value is passed.

### Question 18 — Answer: False

PCI DSS requires that card data never touches your JavaScript. The correct approach is to use processor-hosted iframes where the payment processor collects card data directly, tokenizes it, and returns a token to your application. This eliminates the application from PCI scope for card data handling.

### Question 19 — Answer: B

Converting at input time would cause the form to display centavo values (e.g., 250000 instead of 2500.00) while the user expects to enter pesos. Keeping the form in user-facing units (pesos) and converting to API units (centavos) only at the submission boundary keeps the UX clear and the API contract correct.

### Question 20 — Answer: C

Features never import from other features' internal files — only from the public API (`index.ts`). This ensures loose coupling: if a feature restructures its internals, no external code breaks. The `app/` layer is the only layer that composes features together via route definitions.

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
