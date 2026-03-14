# Level 8 — Mastery: Instructor Demo Outline

> **EastWest Bank — Digital Platforms & Innovations**
>
> Duration: 15-20 minutes

---

## Demo Overview

Demonstrate the mastery-level concepts: feature-slice architecture with the payments capstone, real-time data patterns, and internationalization. The goal is to show how all prior levels come together in a production feature.

---

## Part 1 — Feature-Slice Architecture (5 min)

### What to show

1. Open the `src/features/` directory in the editor — show the folder structure
2. Open `src/features/payments/index.ts` — the public API facade
3. Show what is exported (components, hooks, types) vs what stays internal (api/, stores/)
4. Open `src/features/accounts/index.ts` for comparison

### What to type live

Show a dependency violation and explain why it is wrong:

```tsx
// BAD — importing internal file from another feature
import { paymentApi } from '@/features/payments/api/payment-api';

// GOOD — importing from the public API
import { useSubmitPayment } from '@/features/payments';
```

### Talking points

- Features never import from other features' internals — only through `index.ts`
- The public API is a contract: internal restructuring does not break consumers
- This is what makes micro-frontend extraction possible later (if needed)
- For 50+ screen banking apps, this discipline prevents the codebase from becoming unmaintainable

---

## Part 2 — Event-Driven Communication (3 min)

### What to show

1. Open `src/lib/event-bus.ts` — show the `emit` and `on` functions
2. Open `src/features/payments/hooks/use-payment.ts` — show `emit('payment:completed', ...)` in `onSuccess`
3. Open `src/features/accounts/hooks/use-accounts.ts` — show the subscription to `payment:completed` that invalidates account queries

### What to emphasize

- The payments feature does NOT import anything from accounts
- It emits an event; accounts independently decides how to react
- This is loose coupling — if accounts changes its refresh logic, payments is unaffected
- The tradeoff: you cannot "Go to Definition" on an event string — document your events

---

## Part 3 — Real-Time Patterns (5 min)

### What to show

1. Open the decision table: polling vs SSE vs WebSocket
2. Open `src/hooks/use-polling.ts` — walk through the adaptive interval logic
3. Show the `useLiveBalance` hook using polling at 30-second intervals
4. Open `src/hooks/use-event-source.ts` — show SSE for transaction alerts
5. Show the WebSocket reconnection logic with exponential backoff

### What to type live

Demonstrate TanStack Query integration:

```tsx
// Real-time channel invalidates the query — does NOT set data directly
queryClient.invalidateQueries({
  queryKey: accountKeys.balance(accountId),
});
// This triggers a proper fetch through the API layer with Zod validation
```

### Talking points

- Start with polling — it is simple and sufficient for most banking features
- SSE for server-to-client streams (transaction alerts, rate updates)
- WebSocket only when you need bidirectional (chat, live trading)
- Always invalidate, never directly set query data from real-time channels — preserve the validation pipeline

---

## Part 4 — Internationalization (3 min)

### What to show

1. Open the locale switcher in the app header — switch from English to Filipino
2. Show the navigation labels changing: "Transfers" → "Paglipat ng Pondo"
3. Switch to Chinese (Simplified) — show "转账"
4. Open a transfer success message — show the currency formatting: ₱1,234,567.89

### What to type live

Show the ICU MessageFormat for pluralization:

```json
{
  "accounts.count": "You have {count, plural, one {# account} other {# accounts}}."
}
```

Switch locale and show how the message adapts.

### Talking points

- Locale bundles are lazy-loaded — only the active locale is downloaded
- `Intl.NumberFormat` handles all currency formatting — never concatenate strings
- The locale preference persists via Zustand with `persist` middleware
- Set `document.documentElement.lang` for screen reader accessibility

---

## Part 5 — Capstone Integration (4 min)

### What to show

1. Walk through the Bill Payment wizard end-to-end:
   - Step 1: Search for "Meralco" — show the TanStack Query debounced search
   - Step 2: Fill payment details — show Zod validation rejecting negative amounts
   - Step 3: Review — show masked account number, formatted currency
   - Step 4: Confirm — show the audit event in the console, the event bus emission
2. Open the E2E test file — show how the full flow is tested with Playwright

### What to emphasize

- This single feature touches every level: components, forms, state, routing, API, auth, compliance, i18n, testing
- The wizard state lives in Zustand (not URL state — payment amounts should not be in the address bar)
- Compliance is built into the hook (`usePayment`), not bolted on after the fact
- The test pyramid: store unit tests (fast), form integration tests (medium), one E2E test for the critical path

---

## Key Takeaways to Reinforce

1. Architecture is not optional at scale — feature-slice boundaries prevent cross-team conflicts
2. Events decouple features — no feature should directly depend on another's internals
3. Start with polling, upgrade to SSE/WebSocket only when justified
4. i18n must be planned from the start — retrofitting translations is painful
5. The capstone proves that compliance, testing, and architecture work together, not against each other

---

---

## If Things Go Wrong

### Pre-Demo Checklist

- [ ] Feature-slice structure exists in `src/features/` with `index.ts` barrel exports
- [ ] Event bus module exists and exports `emit`/`on` functions
- [ ] Locale files for English, Filipino, and Chinese loaded in the project
- [ ] Bill Payment wizard renders and steps are navigable on the dev server

### Common Issues

**Locale switch does not change UI text**
- Cause: i18n library not initialized, locale bundle failed to lazy-load, or components not using translation hooks
- Recovery: Show the locale JSON files side by side in the editor. Say "These are the translation bundles. The `t()` function swaps them at runtime. Let me show you the key structure." Walk through the English and Filipino keys.

**Event bus emission does not trigger the accounts query refresh**
- Cause: Subscription not registered, or event name string mismatch between emitter and listener
- Recovery: Add `console.log` to both the emit and subscribe calls to prove the wiring. Say "This is the tradeoff of event-driven patterns — you cannot 'Go to Definition' on event strings. A shared event catalog solves this."

**Bill Payment wizard loses state between steps**
- Cause: Zustand store reset on re-render, or wizard component unmounts between steps
- Recovery: Show the Zustand store in the console via `getState()`. If state is present but not rendering, the issue is in the step component. Switch to the companion repo's working version of the wizard and continue the walkthrough from there.

**Import from feature internals does not produce a lint error**
- Cause: ESLint boundary rule not configured, or `eslint-plugin-boundaries` not installed
- Recovery: Show the bad import and good import side by side in the editor. Say "Without the lint rule, this compiles fine — but it creates a hidden dependency. The rule catches it in CI. Let me show you what the pipeline would report."

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
