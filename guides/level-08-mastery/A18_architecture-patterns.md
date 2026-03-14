# A18 — Architecture Patterns

> **EastWest Bank — Digital Platforms & Innovations**
>
> Part A (Core) · Level 8 — Mastery · Est. 3.5 hours

---

## What You Will Learn

By the end of this guide, you will:

- Understand feature-slice architecture in depth
- Apply Domain-Driven Design (DDD) principles to frontend code
- Design clear module boundaries and dependency rules
- Build an event-driven communication layer
- Plan for micro-frontend readiness without over-engineering
- Implement the Facade pattern for complex feature APIs

---

## Prerequisites

| Requirement | Where |
|------------|-------|
| Completed all Level 1–7 guides | Levels 1–7 |
| Working knowledge of Zustand and TanStack Query | A09, B03 |

---

## Phase 1 — Feature-Slice Architecture

### Why architecture matters

Small projects work fine with flat file structures. Banking applications do not
stay small. A 50-screen application with 20 developers needs clear boundaries
or it becomes unmaintainable within months.

### The feature-slice structure

```
src/
├── app/                    # Application shell
│   ├── app.tsx             # Root component
│   ├── router.tsx          # Route definitions
│   └── providers.tsx       # Provider composition
├── features/               # Business capabilities
│   ├── accounts/
│   │   ├── api/            # API functions + query keys
│   │   ├── components/     # UI components
│   │   ├── hooks/          # Feature-specific hooks
│   │   ├── stores/         # Zustand stores (if needed)
│   │   ├── types.ts        # Domain types
│   │   └── index.ts        # Public API (facade)
│   ├── auth/
│   ├── payments/
│   ├── transfers/
│   └── compliance/
├── components/             # Shared UI components
│   └── ui/                 # Design system primitives
├── hooks/                  # Shared hooks
├── lib/                    # Utilities (masking, formatting)
├── types/                  # Shared types
└── test/                   # Test utilities, factories, mocks
```

### Dependency rules

The architecture enforces a one-way dependency graph:

```
app → features → components, hooks, lib, types
```

Rules:

1. **Features never import from other features directly.** If `transfers`
   needs account data, it imports from `accounts/index.ts` (the public API),
   not from internal files.

2. **Shared code (`components`, `hooks`, `lib`) never imports from features.**
   If a shared component needs feature data, it accepts props.

3. **`app/` is the only layer that composes features together.** Route
   definitions wire features to URLs.

### The public API pattern

Each feature exposes a controlled surface through `index.ts`:

```tsx
// src/features/accounts/index.ts
// Public API — only these exports can be imported by other features

// Components
export { AccountCard } from './components/account-card';
export { AccountList } from './components/account-list';
export { AccountSelector } from './components/account-selector';

// Hooks
export { useAccounts } from './hooks/use-accounts';
export { useAccountBalance } from './hooks/use-account-balance';

// Types
export type { Account, AccountType, Transaction } from './types';
```

Internal files like `./api/accounts-api.ts` or `./stores/account-store.ts`
are NOT exported — they are implementation details that can change without
affecting consumers.

### Checkpoint 1

Your team is building a Bill Payment feature. It needs to display the user's
accounts (from the `accounts` feature) and validate transactions (from the
`compliance` feature). How should these dependencies be structured?

Answer: Bill Payment imports from `accounts/index.ts` and
`compliance/index.ts` only. It never reaches into their internal files.
If the accounts feature changes its internal API structure, Bill Payment
is unaffected because the public API remains stable.

---

## Phase 2 — Domain-Driven Design for Frontend

### Bounded contexts

In DDD, a bounded context is a boundary within which a particular domain
model applies. In frontend terms, each feature IS a bounded context:

| Feature | Domain Concepts | Ubiquitous Language |
|---------|----------------|-------------------|
| `accounts` | Account, Transaction, Balance | "account balance", "transaction history" |
| `transfers` | Transfer, Beneficiary, TransferStatus | "fund transfer", "beneficiary management" |
| `payments` | Biller, PaymentSchedule, PaymentReceipt | "bill payment", "payment schedule" |
| `auth` | Session, Credential, PasskeyRegistration | "sign in", "session timeout" |
| `compliance` | AuditEvent, ConsentRecord, KYCData | "audit trail", "consent management" |

### Value objects

Value objects are immutable and compared by value, not identity:

```tsx
// src/features/transfers/types.ts

/**
 * Money is a value object — always paired with currency.
 * Amount is in centavos (integer). ₱100.50 = 10050.
 * Never pass raw floating-point numbers for financial amounts.
 */
export interface Money {
  readonly amount: number; // Centavos (integer)
  readonly currency: 'PHP' | 'USD';
}

export function createMoney(amount: number, currency: 'PHP' | 'USD' = 'PHP'): Money {
  if (!Number.isInteger(amount)) {
    throw new Error('Money amount must be in centavos (integer)');
  }
  return Object.freeze({ amount, currency });
}

export function addMoney(a: Money, b: Money): Money {
  if (a.currency !== b.currency) {
    throw new Error(`Cannot add ${a.currency} and ${b.currency}`);
  }
  return createMoney(a.amount + b.amount, a.currency);
}

export function formatMoney(money: Money): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: money.currency,
  }).format(money.amount / 100); // Convert centavos to pesos for display
}
```

### Entities vs value objects

| Concept | Identity | Example |
|---------|----------|---------|
| **Entity** | Has unique ID, identity matters | Account (id: "acc-123") |
| **Value object** | No ID, compared by value | Money ({ amount: 5000, currency: 'PHP' }) |

### Domain events

Features communicate through events rather than direct imports:

```tsx
// src/lib/event-bus.ts
type EventHandler<T = unknown> = (payload: T) => void;

const handlers = new Map<string, Set<EventHandler>>();

export function on<T>(event: string, handler: EventHandler<T>): () => void {
  if (!handlers.has(event)) {
    handlers.set(event, new Set());
  }
  handlers.get(event)!.add(handler as EventHandler);

  // Return unsubscribe function
  return () => {
    handlers.get(event)?.delete(handler as EventHandler);
  };
}

export function emit<T>(event: string, payload: T): void {
  handlers.get(event)?.forEach((handler) => handler(payload));
}
```

```tsx
// src/features/transfers/hooks/use-transfer.ts
import { emit } from '@/lib/event-bus';

// After a successful transfer:
emit('transfer:completed', {
  fromAccount: transfer.fromAccountId,
  toAccount: transfer.toAccountId,
  amount: transfer.amount,
});
```

```tsx
// src/features/accounts/hooks/use-accounts.ts
import { on } from '@/lib/event-bus';
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export function useAccountRefreshOnTransfer(): void {
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = on('transfer:completed', () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    });
    return unsubscribe;
  }, [queryClient]);
}
```

This way, `transfers` does not import from `accounts` at all — it just
emits an event. The `accounts` feature decides how to react.

### Checkpoint 2

Why is an event bus preferable to direct function calls between features?
What are the tradeoffs?

Answer: Event bus provides loose coupling — features do not need to know
about each other. The tradeoff is that the flow is harder to trace (you
cannot "Go to Definition" on an event). For banking apps, the loose coupling
benefit outweighs the traceability cost, and structured event types help
with discoverability.

---

## Phase 3 — The Facade Pattern

### Simplifying complex feature APIs

When a feature has many internal modules, the facade provides a clean API:

```tsx
// src/features/payments/index.ts (facade)
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentApi } from './api/payment-api';
import { paymentKeys } from './api/query-keys';
import type { PaymentRequest, Biller, PaymentReceipt } from './types';

// -- Hooks facade --

export function useBillers() {
  return useQuery({
    queryKey: paymentKeys.billers(),
    queryFn: paymentApi.getBillers,
  });
}

export function usePaymentHistory(accountId: string) {
  return useQuery({
    queryKey: paymentKeys.history(accountId),
    queryFn: () => paymentApi.getHistory(accountId),
  });
}

export function useSubmitPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: PaymentRequest) => paymentApi.submit(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.all });
    },
  });
}

// -- Component facade --
export { PaymentWizard } from './components/payment-wizard';
export { PaymentReceipt } from './components/payment-receipt';
export { BillerSearch } from './components/biller-search';

// -- Type facade --
export type { PaymentRequest, Biller, PaymentReceiptData } from './types';
```

Consumers import only from the facade:

```tsx
import { useBillers, useSubmitPayment, PaymentWizard } from '@/features/payments';
```

They never see the internal `api/`, `components/`, or `hooks/` directories.

---

## Phase 4 — Dependency Injection for Testing

### The problem

Hard-coded dependencies make testing difficult:

```tsx
// Hard to test — directly imports real API client
import { apiClient } from '@/lib/api-client';

export async function getAccounts() {
  const response = await apiClient.get('/accounts');
  return response.data;
}
```

### The solution — inject dependencies

```tsx
// src/features/accounts/api/accounts-api.ts
import type { AxiosInstance } from 'axios';
import { apiClient as defaultClient } from '@/lib/api-client';

export function createAccountsApi(client: AxiosInstance = defaultClient) {
  return {
    getAll: async () => {
      const response = await client.get('/accounts');
      return response.data;
    },
    getById: async (id: string) => {
      const response = await client.get(`/accounts/${id}`);
      return response.data;
    },
  };
}

// Default instance for production
export const accountsApi = createAccountsApi();
```

In tests, inject a mock client:

```tsx
import axios from 'axios';
import { createAccountsApi } from './accounts-api';

it('fetches accounts', async () => {
  const mockClient = axios.create();
  vi.spyOn(mockClient, 'get').mockResolvedValue({
    data: [{ id: 'acc-1', name: 'Savings' }],
  });

  const api = createAccountsApi(mockClient);
  const accounts = await api.getAll();

  expect(accounts).toEqual([{ id: 'acc-1', name: 'Savings' }]);
});
```

---

## Phase 5 — Micro-Frontend Readiness

### When to consider micro-frontends

| Signal | Example |
|--------|---------|
| Multiple teams own different features | Team A: accounts, Team B: payments |
| Different release cadences | Payments deploys daily, accounts weekly |
| Feature isolation required | A crash in payments must not affect accounts |
| Technology migration | Migrating one feature at a time |

### Preparing without committing

You do NOT need to build micro-frontends today. But structuring your code
with feature-slice architecture means you CAN split later with minimal effort:

```
Current (monolith SPA):
src/features/accounts/  →  Single Vite build  →  One bundle
src/features/payments/

Future (if needed):
packages/accounts/  →  Separate Vite build  →  Module Federation
packages/payments/  →  Separate Vite build  →  Module Federation
packages/shell/     →  Host application
```

The key enablers are:

1. **No cross-feature imports** (already enforced by dependency rules)
2. **Event bus for communication** (works across module boundaries)
3. **Shared design system as a package** (already isolated in `components/ui/`)

### What NOT to do

Do not adopt Module Federation, single-spa, or any micro-frontend framework
until you have clear evidence that a monolith SPA is insufficient. For most
banking teams (under 50 developers), a well-structured monolith is simpler
and faster.

---

## Key Takeaways

1. **Feature-slice architecture** organizes code by business capability.
   Each feature has its own API, components, hooks, stores, and types.

2. **Dependency rules are non-negotiable**: features never import from other
   features' internals. Use the public API (`index.ts`).

3. **Domain events** decouple features. Transfers emit events; accounts
   react to them. Neither imports the other.

4. **The Facade pattern** gives each feature a clean public API. Internal
   complexity stays hidden.

5. **Prepare for micro-frontends** by following the architecture rules today.
   Do not adopt the tooling until you need it.

---

## Exercises

### Exercise 1 — Dependency Audit
Audit the existing codebase for cross-feature imports that violate the
dependency rules. Create an ESLint rule (using `eslint-plugin-boundaries`)
that prevents features from importing each other's internal files.

### Exercise 2 — Event Catalog
Create a typed event catalog that documents every domain event in the
application. Include event name, payload type, emitting feature, and
subscribing features.

### Exercise 3 — Feature Extraction
Take the compliance code currently in `src/compliance/` and restructure it
as a proper feature slice with public API, internal modules, and tests.
Verify that no external code imports internal compliance files.

---

## What Comes Next

**Next guide:** [B08 — Internationalization](B08_internationalization.md) —
where you add Filipino and Chinese language support, format Philippine Peso
currency, and handle locale-aware date formatting.

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
