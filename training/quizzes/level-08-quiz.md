# Level 8 Quiz — Mastery

> **EastWest Bank — Digital Platforms & Innovations**
>
> React Training Program · Level 8 Assessment

---

## Instructions

- Answer all 20 questions.
- For multiple choice, select the single best answer (A/B/C/D).
- For true/false, write True or False.

---

### Question 1 (Multiple Choice)

In feature-slice architecture, how should the `transfers` feature access account data from the `accounts` feature?

A. Import directly from `accounts/api/accounts-api.ts`
B. Import from `accounts/index.ts` (the public API facade)
C. Copy the account types into the `transfers` feature
D. Use a global state store shared between both features

---

### Question 2 (True/False)

In Domain-Driven Design for the frontend, a `Money` value object should be compared by identity (unique ID), not by its amount and currency values.

---

### Question 3 (Multiple Choice)

Why do features communicate through an event bus rather than direct function calls in the EWB architecture?

A. The event bus is faster than direct function calls
B. It provides loose coupling — features do not need to know about each other
C. Direct function calls are not supported between TypeScript modules
D. The event bus automatically persists events for audit compliance

---

### Question 4 (Multiple Choice)

Which real-time pattern is most appropriate for displaying transaction alerts in a banking application?

A. Polling every 500ms
B. WebSocket with bidirectional messaging
C. Server-Sent Events (SSE)
D. Long polling with 30-second timeout

---

### Question 5 (Multiple Choice)

In the `usePolling` hook, what does the "adaptive" option do?

A. Switches between polling and WebSocket based on network quality
B. Increases the polling interval when data has not changed, then resets when it does
C. Adjusts the polling interval based on server response time
D. Disables polling when the browser tab is not visible

---

### Question 6 (True/False)

Native `EventSource` (SSE) supports custom HTTP headers, so you can send a Bearer token in the Authorization header for authentication.

---

### Question 7 (Multiple Choice)

Why are react-intl message bundles loaded lazily instead of bundling all locales together?

A. Lazy loading improves server-side rendering performance
B. Each locale file adds 20-50KB to the initial bundle that most users never need
C. Browser APIs require locale data to be loaded asynchronously
D. Zustand cannot persist locale data without lazy loading

---

### Question 8 (True/False)

When formatting Philippine Peso amounts, you should manually prepend the peso sign (`"₱" + amount.toFixed(2)`) rather than using `Intl.NumberFormat` because all EWB users are in the Philippines.

---

### Question 9 (Multiple Choice)

In the Bill Payment capstone feature, when a payment is successfully submitted, which of the following does the `usePayment` hook do?

A. Directly updates the account balance in the accounts store
B. Emits a domain event (`payment:completed`) and logs an audit event
C. Redirects to the dashboard and shows a toast notification
D. Calls the accounts API directly to refresh balance data

---

### Question 10 (Multiple Choice)

What is the recommended approach for integrating real-time WebSocket data with TanStack Query?

A. Directly set query data from WebSocket messages using `queryClient.setQueryData`
B. Use WebSocket messages to invalidate queries, triggering a fresh fetch through the API layer
C. Replace TanStack Query entirely with WebSocket subscriptions for real-time data
D. Store WebSocket data in Zustand and sync it with TanStack Query on an interval

---

### Question 11 (Multiple Choice)

Which ICU MessageFormat syntax correctly handles pluralization in react-intl?

A. `"You have {count} account(s)."`
B. `"You have {count, plural, one {# account} other {# accounts}}."`
C. `"You have {count > 1 ? 'accounts' : 'account'}."`
D. `"You have {count} {count === 1 ? 'account' : 'accounts'}."`

---

### Question 12 (True/False)

In feature-slice architecture, shared code in `components/`, `hooks/`, and `lib/` can import from feature modules to access feature-specific data.

---

### Question 13 (Multiple Choice)

The payment draft store uses `create()` without Zustand's `persist` middleware, and includes a `reset()` method that restores `initialState`. Why?

A. `persist` middleware is incompatible with the `create()` function signature
B. Payment data (account IDs, amounts) is sensitive and should not be written to localStorage where it survives after the session ends
C. `persist` middleware cannot handle the `Record<string, string>` type used for dynamic biller fields
D. The `reset()` method automatically clears localStorage, making `persist` redundant

---

### Question 14 (Multiple Choice)

The WebSocket reconnection strategy uses exponential backoff. What is the maximum delay between reconnection attempts?

A. 10 seconds
B. 15 seconds
C. 30 seconds
D. 60 seconds

---

### Question 15 (True/False)

The `useOnlineStatus` hook uses `useSyncExternalStore` instead of `useState` + `useEffect` because `useSyncExternalStore` prevents tearing during concurrent rendering.

---

### Question 16 (Multiple Choice)

What are the three locales supported by the EWB internationalization setup?

A. `en-US`, `tl-PH`, `zh-TW`
B. `en-US`, `fil-PH`, `zh-Hans`
C. `en-GB`, `fil-PH`, `zh-CN`
D. `en-US`, `fil-PH`, `ja-JP`

---

### Question 17 (Multiple Choice)

In the `Money` value object, why is the amount stored as integer centavos rather than floating-point pesos?

A. Integers use less memory than floating-point numbers
B. Floating-point arithmetic causes rounding errors that are unacceptable for financial calculations
C. The database requires integer storage for monetary values
D. JavaScript does not support floating-point numbers natively

---

### Question 18 (True/False)

For PCI DSS compliance, card number data should be collected directly in your React form fields and then encrypted before sending to the payment processor.

---

### Question 19 (Multiple Choice)

In the capstone transfer wizard, why does the peso-to-centavo conversion happen only in the submit handler, not at input time?

A. The Zod schema cannot validate centavo values
B. Converting at input time would cause the displayed value to differ from what the user entered
C. React Hook Form does not support value transformation on change events
D. The backend only accepts peso values, not centavos

---

### Question 20 (Multiple Choice)

Which dependency rule is enforced in feature-slice architecture?

A. Features can import from any other feature's internal files for maximum code reuse
B. The `app/` layer imports from `lib/` but never from `features/`
C. Features never import from other features' internals — only from the public API (`index.ts`)
D. Shared code in `lib/` can import from features to provide cross-feature utilities

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
