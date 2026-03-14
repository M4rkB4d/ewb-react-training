# Level 8 — Mastery: Exercises

> **EastWest Bank — Digital Platforms & Innovations**
>
> Architecture Patterns, Real-Time Patterns, Internationalization, Integration Capstone

---

## Exercise 1 — Typed Event Catalog

**Difficulty:** Starter

### Learning Objectives

- Apply Domain-Driven Design event patterns to a banking frontend
- Create a type-safe event bus with compile-time checking
- Document inter-feature communication contracts

### Requirements

The current event bus from A18 uses string event names and `unknown` payloads. Refactor it to be fully typed so that:

1. Every domain event has a defined name and typed payload
2. The `emit()` and `on()` functions enforce correct payloads at compile time
3. The catalog documents which feature emits each event and which features subscribe

### Starter Code

```tsx
// src/lib/event-catalog.ts

// Define all domain events and their payloads
export interface EventCatalog {
  'transfer:completed': {
    fromAccount: string;
    toAccount: string;
    amount: number;
    currency: 'PHP' | 'USD';
    referenceNumber: string;
  };
  'payment:completed': {
    accountId: string;
    billerId: string;
    amount: number;
    referenceNumber: string;
  };
  // TODO: Add at least 5 more domain events relevant to banking
  // Consider: login, logout, session timeout, consent changes,
  // balance alerts, KYC status changes
}

// TODO: Refactor emit() and on() to use EventCatalog for type safety
// Hint: Use keyof EventCatalog and mapped types
```

### Acceptance Criteria

- [ ] At least 8 domain events defined with typed payloads
- [ ] `emit('transfer:completed', { wrong: 'payload' })` produces a TypeScript error
- [ ] `on('transfer:completed', (data) => ...)` correctly infers the payload type
- [ ] Each event is documented with emitting feature and subscribing features
- [ ] Existing event bus consumers are migrated to the typed version
- [ ] A unit test verifies event subscription and emission

---

## Exercise 2 — Live Transfer Status Tracker

**Difficulty:** Intermediate

### Learning Objectives

- Implement adaptive polling based on resource state
- Integrate real-time updates with TanStack Query
- Build a status visualization component

### Requirements

Build a `TransferStatusTracker` component that displays the real-time status of a fund transfer. The polling behavior adapts based on the transfer's current state:

| Transfer Status | Polling Interval | Behavior |
|----------------|-----------------|----------|
| `pending` | 5 seconds | Active polling — status changes expected |
| `processing` | 15 seconds | Slower polling — intermediate state |
| `completed` | Stop polling | Final state — display receipt |
| `failed` | Stop polling | Final state — display error details |

The component should also show:
- Visual status indicator (progress steps)
- Estimated completion time (if available from API)
- A connection status indicator
- Auto-stop polling when the browser tab is hidden

### Acceptance Criteria

- [ ] Polling interval changes based on the transfer status
- [ ] Polling stops entirely when the transfer reaches a final state (`completed` or `failed`)
- [ ] Polling pauses when the browser tab is hidden (`document.hidden`)
- [ ] The component shows a progress stepper (Initiated → Processing → Completed)
- [ ] TanStack Query manages the data fetching and caching
- [ ] A Vitest test verifies the polling interval logic
- [ ] Audit event is emitted when the transfer reaches a final state

---

## Exercise 3 — Multi-Locale Currency Input

**Difficulty:** Challenge

### Learning Objectives

- Handle locale-specific number formatting in form inputs
- Parse user-typed amounts across different locale conventions
- Integrate with react-intl and Zod validation

### Requirements

Build a `CurrencyInput` component that accepts Philippine Peso amounts in the user's current locale format:

- In `en-US`: User types `1,234.56` → parsed as `1234.56`
- In `fil-PH`: Same format as en-US (Philippines uses US formatting)
- In `zh-Hans`: User types `1,234.56` → parsed as `1234.56`
- Edge cases: User types `1234` (no decimals), `1,234` (no cents), `.50` (cents only)

The component must:

1. Format the displayed value according to the active locale
2. Parse the input back to a numeric value regardless of formatting
3. Validate the amount with Zod (positive, max ₱500,000 i.e. 50,000,000 centavos, store as integer centavos)
4. Show the formatted amount in real-time as the user types
5. Work correctly with react-hook-form via `register` or `Controller`

### Starter Code

```tsx
// src/components/ui/currency-input.tsx
'use client';

import { useIntl } from 'react-intl';
import { useState, type Ref } from 'react';

interface CurrencyInputProps {
  name: string;
  label: string;
  value?: number;
  onChange?: (value: number) => void;
  error?: string;
  currency?: string;
  max?: number;
  ref?: Ref<HTMLInputElement>;
}

export function CurrencyInput({ name, label, value, onChange, error, currency = 'PHP', max = 500_000, ref }: CurrencyInputProps) {
    const intl = useIntl();
    const [displayValue, setDisplayValue] = useState(
      value != null ? intl.formatNumber(value, { style: 'currency', currency }) : ''
    );

    // TODO: Implement locale-aware parsing and formatting
    // Hint: Use Intl.NumberFormat to determine decimal/grouping separators
    // for the active locale, then strip non-numeric characters for parsing

    return (
      <div>
        <label htmlFor={name} className="block text-sm font-medium">
          {label}
        </label>
        {/* TODO: Build the input with locale-aware formatting */}
        {error != null && (
          <p className="mt-1 text-sm text-red-600" role="alert">{error}</p>
        )}
      </div>
    );
}
```

### Acceptance Criteria

- [ ] Correctly formats displayed amount per active locale
- [ ] Parses typed input back to a numeric value regardless of locale formatting
- [ ] Validates with Zod: positive number, max ₱500,000 (50,000,000 centavos), stored as integer centavos
- [ ] Handles edge cases: no decimals, cents only, empty input
- [ ] Integrates with react-hook-form (usable via `Controller`)
- [ ] Works across all three EWB locales: `en-US`, `fil-PH`, `zh-Hans`
- [ ] Includes unit tests that verify parsing across locales

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
