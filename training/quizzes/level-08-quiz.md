# Level 8 — Mastery: Quiz

> **EastWest Bank — Digital Platforms & Innovations**
>
> Architecture Patterns, Real-Time Patterns, Internationalization, Integration Capstone

---

## Instructions

Answer all 12 questions. For multiple choice, select the single best answer. For short answer, keep responses to 2-3 sentences.

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

### Question 3 (Short Answer)

Explain why features communicate through an event bus rather than direct function calls. What is the main tradeoff?

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

### Question 6 (Short Answer)

SSE does not support custom HTTP headers. How does the `useEventSource` hook in the curriculum solve authentication? What is the security implication of this approach?

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

### Question 10 (Short Answer)

The capstone project uses a Zustand store (`usePaymentDraftStore`) to manage wizard state. Why is Zustand appropriate here instead of React Hook Form or URL state?

---

### Question 11 (Multiple Choice)

What is the recommended approach for integrating real-time WebSocket data with TanStack Query?

A. Directly set query data from WebSocket messages using `queryClient.setQueryData`
B. Use WebSocket messages to invalidate queries, triggering a fresh fetch through the API layer
C. Replace TanStack Query entirely with WebSocket subscriptions for real-time data
D. Store WebSocket data in Zustand and sync it with TanStack Query on an interval

---

### Question 12 (Multiple Choice)

Which ICU MessageFormat syntax correctly handles pluralization in react-intl?

A. `"You have {count} account(s)."`
B. `"You have {count, plural, one {# account} other {# accounts}}."`
C. `"You have {count > 1 ? 'accounts' : 'account'}."`
D. `"You have {count} {count === 1 ? 'account' : 'accounts'}."`

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
