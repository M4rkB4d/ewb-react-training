# B09 — Integration Capstone

> **EastWest Bank — Digital Platforms & Innovations**
>
> Part B (Vite SPA) · Level 8 — Mastery

---

## What You Will Learn

By the end of this guide, you will:

- Build a complete Bill Payment feature from scratch
- Integrate all concepts from Levels 1–8
- Apply feature-slice architecture in practice
- Connect authentication, compliance, error handling, and testing
- Build a multi-step wizard with full validation
- Implement the complete test pyramid for one feature

---

## Prerequisites

| Requirement | Where |
|------------|-------|
| All Levels 1–7 completed | Levels 1–7 |
| A18 — Architecture Patterns | Level 8 |
| B08 — Internationalization (recommended) | Level 8 |

---

## The Feature: Bill Payment

You will build a Bill Payment feature that allows customers to pay bills
through EastWest Digital Banking. This single feature touches every major
concept in the curriculum:

| Concept | Guide | How It Applies |
|---------|-------|---------------|
| Components | A04 | BillerCard, PaymentWizard, PaymentReceipt |
| Forms + Validation | A07 | Multi-step form with Zod schemas |
| Accessibility | A08 | Keyboard navigation, ARIA, focus management |
| State management | A09 | Payment draft in Zustand |
| Routing | B02 | /payments, /payments/history, /payments/:id |
| API integration | B03 | Biller search, payment submission |
| Authentication | B04 | Protected routes, session check before payment |
| Error handling | A13 | Insufficient funds, biller errors, network failures |
| Performance | B05 | Virtualized biller list, lazy-loaded receipt PDF |
| Testing | A14 | Unit, integration, E2E tests |
| Compliance | A16 | Audit trail for every payment |
| Privacy | A17 | Masked account numbers in confirmation |
| Architecture | A18 | Feature-slice with public API |
| i18n | B08 | Filipino and Chinese translations |

---

## Phase 1 — Feature Structure

### File layout

```
src/features/payments/
├── api/
│   ├── payment-api.ts       # API functions
│   └── query-keys.ts        # TanStack Query key factory
├── components/
│   ├── biller-search.tsx     # Search and select biller
│   ├── payment-form.tsx      # Amount and details
│   ├── payment-review.tsx    # Confirmation step
│   ├── payment-receipt.tsx   # Success with receipt
│   └── payment-wizard.tsx    # Multi-step orchestrator
├── hooks/
│   └── use-payment.ts        # Payment submission hook
├── stores/
│   └── payment-draft-store.ts # Draft state between steps
├── types.ts                  # Domain types
└── index.ts                  # Public API (facade)
```

### Domain types

```tsx
// src/features/payments/types.ts
export interface Biller {
  id: string;
  name: string;
  category: BillerCategory;
  logoUrl: string;
  fields: BillerField[];
}

export type BillerCategory =
  | 'utilities'
  | 'telecommunications'
  | 'government'
  | 'insurance'
  | 'credit-card'
  | 'loans';

export interface BillerField {
  name: string;
  label: string;
  type: 'text' | 'number';
  required: boolean;
  placeholder: string;
  validation?: {
    pattern: string;
    message: string;
  };
}

export interface PaymentRequest {
  billerId: string;
  accountId: string;
  /** Amount in centavos (integer). The form collects pesos and converts before submission. */
  amount: number;
  fields: Record<string, string>;
  notes: string;
}

export interface PaymentReceipt {
  id: string;
  reference: string;
  billerId: string;
  billerName: string;
  accountId: string;
  /** All monetary fields are integer centavos. */
  amount: number;
  fee: number;
  total: number;
  status: 'completed' | 'pending' | 'failed';
  paidAt: string;
}
```

---

## Phase 2 — API Layer

### Query key factory

```tsx
// src/features/payments/api/query-keys.ts
export const paymentKeys = {
  all: ['payments'] as const,
  billers: () => [...paymentKeys.all, 'billers'] as const,
  billerSearch: (query: string) => [...paymentKeys.billers(), query] as const,
  history: (accountId: string) => [...paymentKeys.all, 'history', accountId] as const,
  receipt: (paymentId: string) => [...paymentKeys.all, 'receipt', paymentId] as const,
};
```

### API functions

```tsx
// src/features/payments/api/payment-api.ts
import { z } from 'zod';
import { apiClient } from '@/lib/api-client';
import type { PaymentRequest } from '../types';

// BSP 1122 — Zod schemas for runtime validation of all API responses

const billerFieldSchema = z.object({
  name: z.string(),
  label: z.string(),
  type: z.enum(['text', 'number']),
  required: z.boolean(),
  placeholder: z.string(),
  validation: z.object({
    pattern: z.string(),
    message: z.string(),
  }).optional(),
});

const billerSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.enum([
    'utilities', 'telecommunications', 'government',
    'insurance', 'credit-card', 'loans',
  ]),
  logoUrl: z.string(),
  fields: z.array(billerFieldSchema),
});

const paymentReceiptSchema = z.object({
  id: z.string(),
  reference: z.string(),
  billerId: z.string(),
  billerName: z.string(),
  accountId: z.string(),
  amount: z.number().int().nonnegative(), // centavos
  fee: z.number().int().nonnegative(),    // centavos
  total: z.number().int().nonnegative(),  // centavos
  status: z.enum(['completed', 'pending', 'failed']),
  paidAt: z.string(),
});

export const paymentApi = {
  searchBillers: async (query: string) => {
    const response = await apiClient.get('/billers', { params: { q: query } });
    return z.array(billerSchema).parse(response.data);
  },

  getBiller: async (id: string) => {
    const response = await apiClient.get(`/billers/${id}`);
    return billerSchema.parse(response.data);
  },

  submitPayment: async (request: PaymentRequest) => {
    const response = await apiClient.post('/payments', request);
    return paymentReceiptSchema.parse(response.data);
  },

  getHistory: async (accountId: string) => {
    const response = await apiClient.get(`/payments/history/${accountId}`);
    return z.array(paymentReceiptSchema).parse(response.data);
  },

  getReceipt: async (paymentId: string) => {
    const response = await apiClient.get(`/payments/${paymentId}`);
    return paymentReceiptSchema.parse(response.data);
  },
};
```

---

## Phase 3 — Payment Draft Store

### Managing wizard state

```tsx
// src/features/payments/stores/payment-draft-store.ts
import { create } from 'zustand';
import type { Biller } from '../types';

type WizardStep = 'biller' | 'details' | 'review' | 'receipt';

interface PaymentDraft {
  step: WizardStep;
  biller: Biller | null;
  accountId: string;
  /** User input in pesos. Convert to centavos (* 100) before sending to API. */
  amount: number;
  fields: Record<string, string>;
  notes: string;
}

interface PaymentDraftState extends PaymentDraft {
  setStep: (step: WizardStep) => void;
  setBiller: (biller: Biller) => void;
  setAccountId: (id: string) => void;
  setAmount: (amount: number) => void;
  setField: (name: string, value: string) => void;
  setNotes: (notes: string) => void;
  reset: () => void;
}

const initialState: PaymentDraft = {
  step: 'biller',
  biller: null,
  accountId: '',
  amount: 0,
  fields: {},
  notes: '',
};

export const usePaymentDraftStore = create<PaymentDraftState>()((set) => ({
  ...initialState,
  setStep: (step) => set({ step }),
  setBiller: (biller) => set({ biller, step: 'details' }),
  setAccountId: (id) => set({ accountId: id }),
  setAmount: (amount) => set({ amount }),
  setField: (name, value) =>
    set((state) => ({ fields: { ...state.fields, [name]: value } })),
  setNotes: (notes) => set({ notes }),
  reset: () => set(initialState),
}));
```

---

## Phase 4 — Components

### Biller search

```tsx
// src/features/payments/components/biller-search.tsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { paymentApi } from '../api/payment-api';
import { paymentKeys } from '../api/query-keys';
import { usePaymentDraftStore } from '../stores/payment-draft-store';
import type { Biller } from '../types';

export function BillerSearch() {
  const [query, setQuery] = useState('');
  const setBiller = usePaymentDraftStore((s) => s.setBiller);

  const { data: billers, isLoading } = useQuery({
    queryKey: paymentKeys.billerSearch(query),
    queryFn: () => paymentApi.searchBillers(query),
    enabled: query.length >= 2,
  });

  const handleSelect = (biller: Biller) => {
    setBiller(biller);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Select Biller</h2>
      <input
        type="search"
        placeholder="Search billers (e.g., Meralco, PLDT, Globe)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full rounded border px-3 py-2"
        aria-label="Search billers"
      />

      {isLoading && <p className="text-sm text-gray-500">Searching...</p>}

      {billers != null && billers.length > 0 && (
        <ul className="space-y-2" role="listbox" aria-label="Search results">
          {billers.map((biller) => (
            <li key={biller.id}>
              <button
                type="button"
                onClick={() => handleSelect(biller)}
                className="flex w-full items-center gap-3 rounded border p-3 text-left hover:bg-gray-50"
                role="option"
                aria-selected={false}
              >
                <span className="font-medium">{biller.name}</span>
                <span className="text-sm text-gray-500">{biller.category}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {billers != null && billers.length === 0 && query.length >= 2 && (
        <p className="text-sm text-gray-500">No billers found.</p>
      )}
    </div>
  );
}
```

### Payment form

```tsx
// src/features/payments/components/payment-form.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usePaymentDraftStore } from '../stores/payment-draft-store';
import { useAccounts } from '@/features/accounts';
import { maskAccountNumber } from '@/lib/masking';
import { formatPHP } from '@/lib/format'; // B08 upgraded formatPeso → formatPHP with locale support
import { Button } from '@/components/ui/button';

// User enters pesos; converted to centavos (* 100) before API call
const paymentSchema = z.object({
  accountId: z.string().min(1, 'Please select an account'),
  amount: z.coerce
    .number()
    .positive('Amount must be greater than 0')
    .max(500000, 'Maximum payment amount is ₱500,000'),
  notes: z.string().max(100, 'Notes must be 100 characters or less').optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

export function PaymentForm() {
  const draft = usePaymentDraftStore();
  const { data: accounts } = useAccounts();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      accountId: draft.accountId,
      amount: draft.amount || undefined,
      notes: draft.notes,
    },
  });

  const onSubmit = (data: PaymentFormData) => {
    draft.setAccountId(data.accountId);
    draft.setAmount(data.amount);
    draft.setNotes(data.notes ?? '');
    draft.setStep('review');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h2 className="text-lg font-semibold">Payment Details</h2>
      <p className="text-sm text-gray-600">
        Paying: <strong>{draft.biller?.name}</strong>
      </p>

      {/* Biller-specific fields */}
      {draft.biller?.fields.map((field) => (
        <div key={field.name}>
          <label className="block text-sm font-medium">{field.label}</label>
          <input
            type={field.type}
            placeholder={field.placeholder}
            value={draft.fields[field.name] ?? ''}
            onChange={(e) => draft.setField(field.name, e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
            required={field.required}
          />
        </div>
      ))}

      {/* From account */}
      <div>
        <label htmlFor="accountId" className="block text-sm font-medium">
          Pay from Account
        </label>
        <select
          id="accountId"
          {...register('accountId')}
          className="mt-1 w-full rounded border px-3 py-2"
        >
          <option value="">Select account</option>
          {accounts?.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name} ({maskAccountNumber(account.number)}) —{' '}
              {formatPHP(account.balance)}
            </option>
          ))}
        </select>
        {errors.accountId != null && (
          <p className="mt-1 text-sm text-red-600">{errors.accountId.message}</p>
        )}
      </div>

      {/* Amount */}
      <div>
        <label htmlFor="amount" className="block text-sm font-medium">
          Amount (PHP)
        </label>
        <input
          id="amount"
          type="number"
          step="0.01"
          {...register('amount')}
          className="mt-1 w-full rounded border px-3 py-2"
          inputMode="decimal"
        />
        {errors.amount != null && (
          <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
        )}
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium">
          Notes (optional)
        </label>
        <input
          id="notes"
          type="text"
          {...register('notes')}
          className="mt-1 w-full rounded border px-3 py-2"
        />
      </div>

      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={() => draft.setStep('biller')}>
          Back
        </Button>
        <Button type="submit">Review Payment</Button>
      </div>
    </form>
  );
}
```

### Payment review

```tsx
// src/features/payments/components/payment-review.tsx
import { usePaymentDraftStore } from '../stores/payment-draft-store';
import { usePayment } from '../hooks/use-payment';
import { maskAccountNumber } from '@/lib/masking';
import { formatPHP } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { ErrorAlert } from '@/components/error/error-alert';

export function PaymentReview() {
  const draft = usePaymentDraftStore();
  const { submitPayment, isPending, error } = usePayment();

  const fee = 1_500; // ₱15 processing fee in centavos
  // draft.amount is raw user input in pesos — multiply by 100 to convert to centavos
  const amountCentavos = Math.round(draft.amount * 100);
  const total = amountCentavos + fee;

  const handleConfirm = () => {
    if (draft.biller == null) return;
    submitPayment({
      billerId: draft.biller.id,
      accountId: draft.accountId,
      amount: amountCentavos, // Converted from pesos input
      fields: draft.fields,
      notes: draft.notes,
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Review Payment</h2>

      <div className="rounded border p-4 space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600">Biller</span>
          <span className="font-medium">{draft.biller?.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Account</span>
          <span>••••{draft.accountId.slice(-4)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Amount</span>
          <span>{formatPHP(amountCentavos)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Processing Fee</span>
          <span>{formatPHP(fee)}</span>
        </div>
        <div className="flex justify-between border-t pt-2 font-bold">
          <span>Total</span>
          <span>{formatPHP(total)}</span>
        </div>
      </div>

      {error != null && <ErrorAlert error={error} />}

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => draft.setStep('details')}
          disabled={isPending}
        >
          Back
        </Button>
        <Button onClick={handleConfirm} disabled={isPending}>
          {isPending ? 'Processing...' : 'Confirm Payment'}
        </Button>
      </div>
    </div>
  );
}
```

### Payment receipt

```tsx
// src/features/payments/components/payment-receipt.tsx
import { usePaymentDraftStore } from '../stores/payment-draft-store';
import { formatPHP } from '@/lib/format';
import { Button } from '@/components/ui/button';
import type { PaymentReceipt as PaymentReceiptType } from '../types';

interface PaymentReceiptProps {
  receipt?: PaymentReceiptType;
}

export function PaymentReceipt({ receipt }: PaymentReceiptProps) {
  const reset = usePaymentDraftStore((s) => s.reset);

  if (receipt == null) {
    return <p className="text-gray-500">No receipt available.</p>;
  }

  return (
    <div className="space-y-4 rounded border p-6">
      <h2 className="text-lg font-semibold text-green-700">Payment Successful</h2>

      <dl className="grid grid-cols-2 gap-y-2 text-sm">
        <dt className="text-gray-500">Reference</dt>
        <dd className="font-mono">{receipt.reference}</dd>

        <dt className="text-gray-500">Biller</dt>
        <dd>{receipt.billerName}</dd>

        <dt className="text-gray-500">Amount</dt>
        <dd>{formatPHP(receipt.amount)}</dd>

        <dt className="text-gray-500">Fee</dt>
        <dd>{formatPHP(receipt.fee)}</dd>

        <dt className="text-gray-500">Total</dt>
        <dd className="font-semibold">{formatPHP(receipt.total)}</dd>

        <dt className="text-gray-500">Status</dt>
        <dd className="capitalize">{receipt.status}</dd>

        <dt className="text-gray-500">Date</dt>
        <dd>{new Date(receipt.paidAt).toLocaleString()}</dd>
      </dl>

      <Button onClick={reset}>Make Another Payment</Button>
    </div>
  );
}
```

### Payment wizard

```tsx
// src/features/payments/components/payment-wizard.tsx
import { usePaymentDraftStore } from '../stores/payment-draft-store';
import { usePayment } from '../hooks/use-payment';
import { BillerSearch } from './biller-search';
import { PaymentForm } from './payment-form';
import { PaymentReview } from './payment-review';
import { PaymentReceipt } from './payment-receipt';

const steps = [
  { key: 'biller', label: '1. Select Biller' },
  { key: 'details', label: '2. Payment Details' },
  { key: 'review', label: '3. Review' },
  { key: 'receipt', label: '4. Receipt' },
] as const;

export function PaymentWizard() {
  const step = usePaymentDraftStore((s) => s.step);
  const { receipt } = usePayment();

  return (
    <div className="mx-auto max-w-2xl">
      {/* Step indicator */}
      <nav aria-label="Payment progress" className="mb-6">
        <ol className="flex gap-2">
          {steps.map((s) => (
            <li
              key={s.key}
              className={`flex-1 rounded px-3 py-2 text-center text-sm ${
                s.key === step
                  ? 'bg-ewb-purple text-white'
                  : 'bg-gray-100 text-gray-500'
              }`}
              aria-current={s.key === step ? 'step' : undefined}
            >
              {s.label}
            </li>
          ))}
        </ol>
      </nav>

      {/* Step content */}
      {step === 'biller' && <BillerSearch />}
      {step === 'details' && <PaymentForm />}
      {step === 'review' && <PaymentReview />}
      {step === 'receipt' && <PaymentReceipt receipt={receipt} />}
    </div>
  );
}
```

---

## Phase 5 — Payment Hook with Compliance

### Submission with audit trail

```tsx
// src/features/payments/hooks/use-payment.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentApi } from '../api/payment-api';
import { paymentKeys } from '../api/query-keys';
import { usePaymentDraftStore } from '../stores/payment-draft-store';
import { emitAuditEvent } from '@/compliance/audit-service';
import { emit } from '@/lib/event-bus';
import type { PaymentRequest, PaymentReceipt } from '../types';

export function usePayment() {
  const queryClient = useQueryClient();
  const setStep = usePaymentDraftStore((s) => s.setStep);

  const mutation = useMutation({
    mutationFn: (request: PaymentRequest) => paymentApi.submitPayment(request),
    onSuccess: (receipt: PaymentReceipt) => {
      // 1. Move wizard to receipt step
      setStep('receipt');

      // 2. Invalidate related queries
      queryClient.invalidateQueries({ queryKey: paymentKeys.all });

      // 3. BSP compliance — audit trail
      emitAuditEvent('PAYMENT_SUBMITTED', {
        paymentId: receipt.id,
        billerId: receipt.billerId,
        amount: receipt.amount,
        reference: receipt.reference,
      });

      // 4. Notify other features (accounts should refresh balance)
      emit('payment:completed', {
        accountId: receipt.accountId,
        amount: receipt.total,
      });
    },
    onError: (error) => {
      emitAuditEvent('PAYMENT_FAILED', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    },
  });

  return {
    submitPayment: mutation.mutate,
    isPending: mutation.isPending,
    error: mutation.error,
    receipt: mutation.data,
  };
}
```

---

## Phase 6 — Testing the Feature

### Unit test — payment draft store

```tsx
// src/features/payments/stores/payment-draft-store.test.ts
import { usePaymentDraftStore } from './payment-draft-store';
import { beforeEach, describe, expect, it } from 'vitest';

describe('PaymentDraftStore', () => {
  beforeEach(() => {
    usePaymentDraftStore.getState().reset();
  });

  it('starts at biller step', () => {
    expect(usePaymentDraftStore.getState().step).toBe('biller');
  });

  it('advances to details when biller is selected', () => {
    const biller = { id: 'meralco', name: 'Meralco', category: 'utilities' as const, logoUrl: '', fields: [] };
    usePaymentDraftStore.getState().setBiller(biller);

    expect(usePaymentDraftStore.getState().step).toBe('details');
    expect(usePaymentDraftStore.getState().biller?.name).toBe('Meralco');
  });

  it('resets to initial state', () => {
    usePaymentDraftStore.getState().setAmount(5000);
    usePaymentDraftStore.getState().setNotes('Test');
    usePaymentDraftStore.getState().reset();

    expect(usePaymentDraftStore.getState().amount).toBe(0);
    expect(usePaymentDraftStore.getState().notes).toBe('');
    expect(usePaymentDraftStore.getState().step).toBe('biller');
  });
});
```

### Integration test — payment form

```tsx
// src/features/payments/components/payment-form.test.tsx
import { render, screen } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { PaymentForm } from './payment-form';
import { usePaymentDraftStore } from '../stores/payment-draft-store';
import { createAccount } from '@/test/factories/account-factory';
import { describe, expect, it, beforeEach } from 'vitest';

describe('PaymentForm', () => {
  beforeEach(() => {
    usePaymentDraftStore.getState().reset();
    usePaymentDraftStore.getState().setBiller({
      id: 'meralco',
      name: 'Meralco',
      category: 'utilities',
      logoUrl: '',
      fields: [
        { name: 'accountNumber', label: 'Meralco Account Number', type: 'text', required: true, placeholder: '1234-5678-9012' },
      ],
    });
  });

  it('shows biller name', () => {
    render(<PaymentForm />);
    expect(screen.getByText('Meralco')).toBeInTheDocument();
  });

  it('shows biller-specific fields', () => {
    render(<PaymentForm />);
    expect(screen.getByLabelText('Meralco Account Number')).toBeInTheDocument();
  });

  it('validates amount is positive', async () => {
    render(<PaymentForm />);
    const amountInput = screen.getByLabelText(/amount/i);
    await userEvent.clear(amountInput);
    await userEvent.type(amountInput, '-100');
    await userEvent.click(screen.getByText('Review Payment'));

    expect(await screen.findByText(/must be greater than 0/i)).toBeInTheDocument();
  });
});
```

### E2E test — complete payment flow

```tsx
// e2e/payments/bill-payment.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Bill Payment', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Username').fill('juan.santos');
    await page.getByLabel('Password').fill('SecureP@ss123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL('/dashboard');
  });

  test('completes a bill payment', async ({ page }) => {
    await page.goto('/payments');

    // Step 1 — Search and select biller
    await page.getByLabel('Search billers').fill('Meralco');
    await page.getByRole('option', { name: /Meralco/ }).click();

    // Step 2 — Fill payment details
    await page.getByLabel('Meralco Account Number').fill('1234-5678-9012');
    await page.getByLabel(/Pay from Account/).selectOption({ index: 1 });
    await page.getByLabel(/Amount/).fill('2500');
    await page.getByRole('button', { name: 'Review Payment' }).click();

    // Step 3 — Review and confirm
    await expect(page.getByText('₱2,500.00')).toBeVisible();
    await expect(page.getByText('Meralco')).toBeVisible();
    await page.getByRole('button', { name: 'Confirm Payment' }).click();

    // Step 4 — Verify receipt
    await expect(page.getByText(/Payment Successful/i)).toBeVisible();
    await expect(page.getByText(/REF-/)).toBeVisible();
  });
});
```

---

## Key Takeaways

1. **Feature-slice architecture works.** The payments feature is self-contained
   with its own API, components, hooks, stores, and types.

2. **The wizard pattern** uses Zustand for draft state between steps. Each step
   is a separate component with its own validation.

3. **Compliance is built in** — the audit trail fires on both success and failure.
   This is not an afterthought; it is part of the `usePayment` hook.

4. **Event bus for cross-feature communication** — when a payment completes,
   accounts refresh via event subscription, not direct import.

5. **The test pyramid in practice**: store unit tests (fast, many), form
   integration tests (medium), and one E2E test for the critical path.

---

## Exercises

### Exercise 1 — Payment History
Build a payment history page at `/payments/history` that shows all past
payments with filtering by date range and biller. Use TanStack Virtual for
the list and TanStack Query for pagination.

### Exercise 2 — Scheduled Payments
Add a "Schedule for Later" option to the payment wizard. The user can set
a future date and the payment is saved as pending. Build the scheduler UI
and the recurring payment configuration.

### Exercise 3 — Payment Receipt PDF
Add a "Download Receipt" button to the payment receipt page. Use a lazy-loaded
PDF library to generate a formatted receipt with the EWB logo, payment details,
and reference number.

---

## What Comes Next

**Next guide:** [A19 — Real-Time Patterns](A19_real-time-patterns.md) —
where you implement WebSocket connections, Server-Sent Events, and smart
polling for real-time account balance updates.

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
