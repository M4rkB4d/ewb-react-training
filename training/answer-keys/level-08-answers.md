# Level 8 — Mastery: Answer Key

> **EastWest Bank — Digital Platforms & Innovations**
>
> Quiz Answers + Exercise Solutions

---

## Quiz Answers

### Question 1 — B

Features should only import from other features through their public API — the `index.ts` file (facade). This ensures loose coupling. If the accounts feature restructures its internal files, transfers is unaffected because the public API contract remains the same. Importing from internal files like `accounts/api/accounts-api.ts` violates the dependency rules.

### Question 2 — False

Value objects are compared by value (their properties), not by identity. A `Money` object with `{ amount: 5000, currency: 'PHP' }` is equal to another `Money` object with the same amount and currency. Entities (like an Account with `id: 'acc-123'`) are compared by identity.

### Question 3

An event bus provides loose coupling — features do not need to know about each other. The `transfers` feature emits `transfer:completed` without knowing that `accounts` subscribes to it. This makes features independently deployable and testable. The tradeoff is reduced traceability: you cannot "Go to Definition" on an event string to find all consumers. Typed event catalogs and documentation mitigate this.

### Question 4 — C

Transaction alerts flow one way — from the server to the client. SSE is designed for this pattern, auto-reconnects on failure, and works through most corporate proxies. WebSocket is overkill because the client does not need to send data on this channel. Polling at 500ms would waste bandwidth when no transactions are occurring.

### Question 5 — B

The adaptive option increases the polling interval (up to 5x the base) when data has not changed between fetches. When data does change, the interval resets to the base value. This saves bandwidth during quiet periods (e.g., no transactions happening) while remaining responsive when activity resumes.

### Question 6

The hook passes the auth token as a URL query parameter: `${url}?token=${encodeURIComponent(token)}`. The security implication is that the token appears in server access logs, browser history, and potentially in referrer headers. Mitigations include using short-lived tokens specific to the SSE connection, ensuring the SSE endpoint returns only non-sensitive notification data, and rotating the token on reconnection.

### Question 7 — B

Each locale file can be 20-50KB. Including all three locales (English, Filipino, Chinese) would add 60-150KB to the initial bundle that most users never need — the majority of EWB users operate in English. Lazy loading via dynamic `import()` means only the active locale is downloaded, reducing initial bundle size.

### Question 8 — False

`Intl.NumberFormat` handles locale-specific formatting automatically: thousands separators, decimal separators, currency symbol positioning, negative number formatting, and proper rounding. Manual string concatenation (`"₱" + amount.toFixed(2)`) will break across locales and does not handle edge cases like large numbers or negative values correctly.

### Question 9 — B

The `usePayment` hook emits a domain event via the event bus (`payment:completed`) and logs an audit event via `emitAuditEvent('PAYMENT_SUBMITTED', ...)`. It does NOT directly update the accounts store or call the accounts API. The accounts feature independently subscribes to the `payment:completed` event and refreshes its own data. This follows the loose coupling principle from A18.

### Question 10

The payment wizard spans multiple steps, and the draft data (selected biller, amount, account, fields) must persist across step transitions. React Hook Form manages individual form step validation but does not persist across unmounted components (each wizard step unmounts when you move to the next). URL state would expose sensitive payment details in the browser address bar. Zustand keeps the draft in memory across steps without persisting to the URL or storage.

### Question 11 — B

Invalidation triggers a proper fetch through the existing API layer, which includes Zod validation and error handling. Directly setting query data from WebSocket messages (`setQueryData`) skips validation and can introduce inconsistencies if the WebSocket message format differs from the API response format. Invalidation ensures data consistency by always going through the established fetch-and-validate pipeline.

### Question 12 — B

ICU MessageFormat syntax uses `{count, plural, one {# account} other {# accounts}}` for pluralization. The `#` symbol is replaced with the count value. Options A, C, and D use JavaScript string interpolation or ternary operators, which do not work in message catalogs and cannot be translated by localizers.

---

## Exercise Solutions

### Exercise 1 — Typed Event Catalog

```tsx
// src/lib/event-catalog.ts

export interface EventCatalog {
  'transfer:completed': {
    fromAccount: string;
    toAccount: string;
    amount: number;
    currency: 'PHP' | 'USD';
    referenceNumber: string;
  };
  'transfer:failed': {
    fromAccount: string;
    toAccount: string;
    amount: number;
    error: string;
  };
  'payment:completed': {
    accountId: string;
    billerId: string;
    amount: number;
    referenceNumber: string;
  };
  'payment:failed': {
    billerId: string;
    error: string;
  };
  'auth:login': {
    userId: string;
    method: 'password' | 'passkey';
  };
  'auth:logout': {
    userId: string;
    reason: 'user' | 'timeout' | 'forced';
  };
  'auth:session-timeout': {
    userId: string;
    sessionDuration: number;
  };
  'consent:changed': {
    purpose: string;
    granted: boolean;
  };
}

// Type-safe event bus
type EventHandler<T> = (payload: T) => void;

const handlers = new Map<string, Set<EventHandler<unknown>>>();

export function on<K extends keyof EventCatalog>(
  event: K,
  handler: EventHandler<EventCatalog[K]>,
): () => void {
  if (!handlers.has(event)) {
    handlers.set(event, new Set());
  }
  handlers.get(event)!.add(handler as EventHandler<unknown>);

  return () => {
    handlers.get(event)?.delete(handler as EventHandler<unknown>);
  };
}

export function emit<K extends keyof EventCatalog>(
  event: K,
  payload: EventCatalog[K],
): void {
  handlers.get(event)?.forEach((handler) => handler(payload));
}
```

Test:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { emit, on } from './event-catalog';

describe('Typed Event Bus', () => {
  it('delivers typed payloads to subscribers', () => {
    const handler = vi.fn();
    const unsubscribe = on('transfer:completed', handler);

    emit('transfer:completed', {
      fromAccount: 'acc-1',
      toAccount: 'acc-2',
      amount: 5000,
      currency: 'PHP',
      referenceNumber: 'EWB-001',
    });

    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 5000, currency: 'PHP' }),
    );

    unsubscribe();
  });

  it('unsubscribes correctly', () => {
    const handler = vi.fn();
    const unsubscribe = on('auth:logout', handler);
    unsubscribe();

    emit('auth:logout', { userId: 'user-1', reason: 'user' });
    expect(handler).not.toHaveBeenCalled();
  });
});
```

### Exercise 2 — Live Transfer Status Tracker

```tsx
// src/features/transfers/components/transfer-status-tracker.tsx
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { emitAuditEvent } from '@/compliance/audit-service';

type TransferStatus = 'pending' | 'processing' | 'completed' | 'failed';

interface Transfer {
  id: string;
  status: TransferStatus;
  estimatedCompletion: string | null;
  referenceNumber: string;
}

const INTERVALS: Record<TransferStatus, number | false> = {
  pending: 5_000,
  processing: 15_000,
  completed: false,
  failed: false,
};

const STEPS = ['Initiated', 'Processing', 'Completed'] as const;

function getActiveStep(status: TransferStatus): number {
  switch (status) {
    case 'pending': return 0;
    case 'processing': return 1;
    case 'completed': return 2;
    case 'failed': return 1; // Failed during processing
  }
}

export function TransferStatusTracker({ transferId }: { transferId: string }) {
  const previousStatus = useRef<TransferStatus | null>(null);

  const { data: transfer, isLoading } = useQuery<Transfer>({
    queryKey: ['transfers', transferId, 'status'],
    queryFn: async () => {
      const res = await fetch(`/api/transfers/${transferId}/status`);
      return res.json();
    },
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (!status) return 5_000;
      return INTERVALS[status];
    },
    refetchIntervalInBackground: false,
  });

  // Emit audit event when reaching a final state
  useEffect(() => {
    if (!transfer) return;
    if (
      previousStatus.current !== transfer.status &&
      (transfer.status === 'completed' || transfer.status === 'failed')
    ) {
      emitAuditEvent(
        transfer.status === 'completed' ? 'TRANSFER_CONFIRM' : 'TRANSFER_FAILURE',
        { transferId, status: transfer.status, reference: transfer.referenceNumber },
      );
    }
    previousStatus.current = transfer.status;
  }, [transfer?.status]);

  if (isLoading) return <p>Loading transfer status...</p>;
  if (!transfer) return <p>Transfer not found.</p>;

  const activeStep = getActiveStep(transfer.status);

  return (
    <div className="space-y-6">
      {/* Progress stepper */}
      <nav aria-label="Transfer progress">
        <ol className="flex gap-4">
          {STEPS.map((step, index) => (
            <li
              key={step}
              className={`flex-1 rounded px-3 py-2 text-center text-sm ${
                index <= activeStep
                  ? transfer.status === 'failed' && index === activeStep
                    ? 'bg-red-100 text-red-700'
                    : 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-500'
              }`}
              aria-current={index === activeStep ? 'step' : undefined}
            >
              {step}
            </li>
          ))}
        </ol>
      </nav>

      {/* Status details */}
      <div className="rounded border p-4">
        <p className="text-sm text-gray-600">
          Reference: <span className="font-mono">{transfer.referenceNumber}</span>
        </p>
        <p className="mt-1 text-sm">
          Status: <span className="font-medium">{transfer.status}</span>
        </p>
        {transfer.estimatedCompletion && transfer.status !== 'completed' && (
          <p className="mt-1 text-xs text-gray-500">
            Estimated completion: {new Date(transfer.estimatedCompletion).toLocaleString('en-PH')}
          </p>
        )}
      </div>

      {/* Connection indicator */}
      <div className="flex items-center gap-1 text-xs text-gray-500">
        <span className={`h-2 w-2 rounded-full ${
          INTERVALS[transfer.status] !== false ? 'bg-green-500' : 'bg-gray-300'
        }`} />
        {INTERVALS[transfer.status] !== false ? 'Tracking live' : 'Final status'}
      </div>
    </div>
  );
}
```

### Exercise 3 — Multi-Locale Currency Input

```tsx
// src/components/ui/currency-input.tsx
'use client';

import { useIntl } from 'react-intl';
import { useState, useCallback, type Ref } from 'react';

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

function parseLocaleNumber(value: string, locale: string): number {
  // Get the locale's decimal separator
  const formatter = new Intl.NumberFormat(locale);
  const parts = formatter.formatToParts(1234.5);
  const decimalSeparator = parts.find((p) => p.type === 'decimal')?.value ?? '.';
  const groupSeparator = parts.find((p) => p.type === 'group')?.value ?? ',';

  // Strip grouping separators, replace locale decimal with standard decimal
  const normalized = value
    .replace(new RegExp(`\\${groupSeparator}`, 'g'), '')
    .replace(new RegExp(`\\${decimalSeparator}`), '.');

  // Remove currency symbol and whitespace
  const cleaned = normalized.replace(/[^0-9.\-]/g, '');

  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : Math.round(parsed * 100) / 100;
}

export function CurrencyInput({ name, label, value, onChange, error, currency = 'PHP', max = 500_000, ref }: CurrencyInputProps) {
    const intl = useIntl();
    const [displayValue, setDisplayValue] = useState(
      value != null && value > 0
        ? intl.formatNumber(value, { style: 'currency', currency })
        : '',
    );
    const [isFocused, setIsFocused] = useState(false);

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        setDisplayValue(raw);

        const parsed = parseLocaleNumber(raw, intl.locale);
        if (parsed >= 0 && parsed <= max) {
          onChange?.(parsed);
        }
      },
      [intl.locale, max, onChange],
    );

    const handleBlur = useCallback(() => {
      setIsFocused(false);
      const parsed = parseLocaleNumber(displayValue, intl.locale);
      if (parsed > 0) {
        setDisplayValue(intl.formatNumber(parsed, { style: 'currency', currency }));
      }
    }, [displayValue, intl, currency]);

    const handleFocus = useCallback(() => {
      setIsFocused(true);
      // Show raw number when focused for easier editing
      const parsed = parseLocaleNumber(displayValue, intl.locale);
      if (parsed > 0) {
        setDisplayValue(parsed.toString());
      }
    }, [displayValue, intl.locale]);

    return (
      <div>
        <label htmlFor={name} className="block text-sm font-medium">
          {label}
        </label>
        <input
          ref={ref}
          id={name}
          type="text"
          inputMode="decimal"
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          className="mt-1 block w-full rounded-lg border px-3 py-2"
          aria-describedby={error != null ? `${name}-error` : undefined}
          aria-invalid={error != null}
        />
        {error != null && (
          <p id={`${name}-error`} className="mt-1 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
}
```

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
