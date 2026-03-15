# Level 6 Answer Key — Quality

> **EastWest Bank — Digital Platforms & Innovations**
>
> React Training Program · Level 6 Instructor Reference

---

## Quiz Answers

### Question 1 — Answer: C

"Insufficient funds" is a business logic error. The request was valid (correct format, authenticated user, proper accounts), but the business rule prevents the transfer. Business errors require specific user messaging (showing the current balance vs. requested amount) and are distinct from validation errors (wrong format), network errors (connectivity), or security errors (tampered data).

### Question 2 — Answer

Detailed security error messages reveal attack surface information. If the error said "CSRF token mismatch on /api/transfers" or "Content Security Policy blocked inline script," an attacker learns what defenses exist and can refine their approach. A generic message prevents information leakage while still alerting the user that something was detected. BSP 982 requires that error messages not disclose internal system details. The actual details are logged server-side for security team review.

### Question 3 — Answer: B

Error boundaries catch errors during rendering, lifecycle methods, and constructors of the component tree below them. They do NOT catch errors in event handlers (use try/catch), async code (use .catch() or try/catch in async functions), server-side rendering, or errors thrown in the error boundary itself.

### Question 4 — Answer: False

React Compiler is a **separate build-time tool** (not bundled with React 19) that automatically memoizes functional components, values, and callbacks at build time. The claim that "the compiler only handles class components" is incorrect — it specifically targets **functional components and hooks**. The claim that "developers should still manually add `useMemo` and `useCallback`" is also incorrect — for new code, do not add manual memoization; the compiler handles this automatically. Existing manual memoization can remain (the compiler skips already-optimized code). Both premises in the question are false.

### Question 5 — Answer: B

The testing pyramid for banking applications: ~60% unit tests (fast, reliable, testing hooks/stores/utils), ~30% integration tests (components with API and state), ~10% E2E tests (critical user flows in real browsers). More unit tests because they run in milliseconds and catch regressions quickly. Fewer E2E tests because they are slow and brittle, but essential for high-risk flows like login and fund transfers.

### Question 6 — Answer

Test data factories (like `createUser()`, `createAccount()`) provide consistent, typed default objects with a simple override mechanism. They are preferred over hardcoded data because: (1) they reduce duplication across dozens of test files, (2) changes to the data shape only need updating in one place, (3) they produce valid objects by default so tests focus on what they are testing rather than boilerplate setup, and (4) auto-incrementing IDs prevent collision between tests.

### Question 7 — Answer: B

TanStack Virtual renders only the items visible in the viewport plus a configurable overscan buffer (typically 5-10 items above and below). For a 600px container with 72px rows, that is roughly 8 visible rows plus 20 overscan items, totaling about 28 DOM nodes. The total list size is irrelevant to the DOM node count — 1,000 rows or 100,000 rows produce the same number of DOM nodes.

### Question 8 — Answer: C

INP (Interaction to Next Paint) measures the latency between a user interaction (click, tap, keypress) and the next visual update. It captures how responsive the application feels. LCP (A) measures when the largest visible element renders. CLS (B) measures unexpected layout shifts. FCP (D) measures when any content first appears.

### Question 9 — Answer

BSP 982 Section 5.4 requires that personally identifiable information not be transmitted to external systems without proper controls. Sentry is an external monitoring service. The `beforeSend` hook strips email and IP address before the event leaves the browser, ensuring PII stays within EWB-controlled systems. The underlying principle is data minimization: external tools only receive what they need (user ID for error correlation), not what they do not need (email, name, IP).

### Question 10 — Answer: C

`navigator.sendBeacon()` is designed for analytics and diagnostics. Unlike `fetch()`, it is guaranteed to complete even during page unload events (user closing the tab, navigating away, or refreshing). This is critical for error reporting: if a crash occurs and the user closes the tab, the error report still reaches the monitoring endpoint. `fetch` requests during unload are often cancelled by the browser.

### Question 11 — Answer: False

The Application Insights connection string is a write-only ingestion key. It allows the browser to send telemetry data to Azure but does not grant read access to existing telemetry data. Azure explicitly designs these connection strings for client-side use. It is safe to include in the browser bundle. Read access requires Azure RBAC permissions configured separately.

### Question 12 — Answer

The `auditLog()` function records: the action type (`INITIATE_TRANSFER`, `CONFIRM_TRANSFER`), user ID from the auth store, source and destination account IDs, amount, currency, and a timestamp. It logs `fromAccountId` (an opaque internal identifier) instead of the actual account number because account numbers are sensitive financial data. If logs are compromised or sent to external monitoring, internal IDs reveal nothing useful to an attacker. BSP 1019 requires complete audit trails, but BSP 982 (data protection) and RA 10173 (Data Privacy Act) require that sensitive data be protected even in internal systems. Internal IDs can be cross-referenced when needed by authorized personnel with database access.

---

## Exercise Solutions

### Exercise 1 — Error Boundary with Banking Context

```tsx
// src/components/error/error-boundary.tsx
import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode | ((error: Error) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[ErrorBoundary]', error, errorInfo.componentStack);
    this.props.onError?.(error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError && this.state.error != null) {
      if (typeof this.props.fallback === 'function') {
        return this.props.fallback(this.state.error);
      }
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// src/components/error/error-alert.tsx
import { AppError } from '@/lib/errors';
import { Button } from '@/components/ui/button';

interface ErrorAlertProps {
  error: unknown;
  onRetry?: () => void;
}

export function ErrorAlert({ error, onRetry }: ErrorAlertProps) {
  const message =
    error instanceof AppError
      ? error.userMessage
      : 'An unexpected error occurred. Please try again.';

  const requestId =
    error instanceof AppError ? error.context?.requestId : undefined;

  return (
    <div role="alert" className="rounded border border-red-200 bg-red-50 p-4">
      <p className="text-sm text-red-700">{message}</p>
      {requestId != null && (
        <p className="mt-1 text-xs text-red-500">
          Reference: {String(requestId)}
        </p>
      )}
      {onRetry != null && (
        <Button variant="outline" size="sm" className="mt-2" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
}

// src/lib/error-logger.ts
import { AppError } from './errors';
import { env } from '@/lib/env';

export function logError(
  error: unknown,
  extra?: { componentStack?: string },
): void {
  const entry = {
    timestamp: new Date().toISOString(),
    code: error instanceof AppError ? error.code : 'UNKNOWN',
    message: error instanceof Error ? error.message : String(error),
    severity: error instanceof AppError ? error.severity : 'high',
    context: error instanceof AppError ? error.context : undefined,
    componentStack: extra?.componentStack,
    url: window.location.href,
  };

  if (import.meta.env.DEV) {
    console.error('[ErrorLog]', entry);
  } else {
    navigator.sendBeacon(`${env.VITE_API_BASE_URL}/errors`, JSON.stringify(entry));
  }
}

// Usage — feature-level boundary
<ErrorBoundary
  fallback={
    <div className="p-4 text-red-600">
      Failed to load transaction history. Please refresh the page.
    </div>
  }
  onError={(error, info) => logError(error, { componentStack: info.componentStack })}
>
  <TransactionList accountId={id} />
</ErrorBoundary>
```

### Exercise 2 — Performance-Optimized Transaction List

```tsx
// src/features/accounts/components/transaction-list.tsx
import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { Transaction } from '../types';

interface TransactionListProps {
  transactions: Transaction[];
}

export function TransactionList({ transactions }: TransactionListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: transactions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 72,
    overscan: 10,
  });

  return (
    <div
      ref={parentRef}
      className="h-[600px] overflow-auto rounded border"
      role="list"
      aria-label="Transaction history"
    >
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const txn = transactions[virtualRow.index];
          if (txn == null) return null;

          return (
            <div
              key={txn.id}
              role="listitem"
              className="flex items-center justify-between border-b px-4"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <div>
                <p className="font-medium">{txn.description}</p>
                <p className="text-xs text-gray-500">
                  {new Date(txn.date).toLocaleDateString('en-PH')}
                </p>
              </div>
              <div className="text-right">
                <p
                  className={
                    txn.type === 'credit' ? 'font-semibold text-green-700' : 'text-gray-900'
                  }
                >
                  {txn.type === 'credit' ? '+' : ''}
                  {(txn.amount / 100).toLocaleString('en-PH', {
                    style: 'currency',
                    currency: 'PHP',
                  })}
                </p>
                <p className="text-xs text-gray-500">
                  Bal: {(txn.balance / 100).toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// src/lib/web-vitals.ts
import { env } from '@/lib/env';
import { onCLS, onINP, onLCP } from 'web-vitals';

export function initWebVitals(): void {
  const report = (metric: { name: string; value: number; rating: string }) => {
    if (import.meta.env.DEV) {
      const color =
        metric.rating === 'good' ? 'green' : metric.rating === 'poor' ? 'red' : 'orange';
      console.log(
        `%c[WebVital] ${metric.name}: ${metric.value.toFixed(1)} (${metric.rating})`,
        `color: ${color}`,
      );
    } else {
      navigator.sendBeacon(
        `${env.VITE_API_BASE_URL}/vitals`,
        JSON.stringify({
          name: metric.name,
          value: metric.value,
          rating: metric.rating,
          url: window.location.pathname,
          timestamp: new Date().toISOString(),
        }),
      );
    }
  };

  onCLS(report);
  onINP(report);
  onLCP(report);
}
```

### Exercise 3 — E2E Test for Fund Transfer with Monitoring

```tsx
// src/test/factories/user-factory.ts
import type { User } from '@/types/auth';

let idCounter = 0;

export function createUser(overrides: Partial<User> = {}): User {
  idCounter += 1;
  return {
    id: `user-${idCounter}`,
    name: 'Juan Santos',
    email: 'juan.santos@ewb.com',
    role: 'customer',
    ...overrides,
  };
}

// src/test/factories/account-factory.ts
import type { Account } from '@/features/accounts/types';

let accountCounter = 0;

export function createAccount(overrides: Partial<Account> = {}): Account {
  accountCounter += 1;
  return {
    id: `acc-${accountCounter}`,
    accountName: 'Personal Savings',
    accountNumber: `${1000000000 + accountCounter}`,
    type: 'savings',
    balance: 15_000_000, // centavos (₱150,000.00)
    currency: 'PHP',
    isActive: true,
    ...overrides,
  };
}

// e2e/transfers/transfer.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Fund Transfer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Username').fill('juan.santos');
    await page.getByLabel('Password').fill('SecureP@ss123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL('/dashboard');
  });

  test('completes a fund transfer successfully', async ({ page }) => {
    await page.goto('/transfers');

    // Select accounts
    await page.getByLabel('From Account').selectOption('acc-1');
    await page.getByLabel('To Account').selectOption('acc-2');
    await page.getByRole('button', { name: 'Next' }).click();

    // Enter amount
    await page.getByLabel('Amount').fill('5000');
    await page.getByLabel('Notes').fill('Monthly rent');
    await page.getByRole('button', { name: 'Next' }).click();

    // Review and confirm
    await expect(page.getByText('5,000.00')).toBeVisible();
    await expect(page.getByText('Monthly rent')).toBeVisible();
    await page.getByRole('button', { name: 'Confirm Transfer' }).click();

    // Verify success
    await expect(page.getByText('Transfer completed')).toBeVisible();
    await expect(page.getByText(/REF-/)).toBeVisible();
  });

  test('shows error for daily limit exceeded', async ({ page }) => {
    await page.goto('/transfers');

    await page.getByLabel('From Account').selectOption('acc-1');
    await page.getByLabel('To Account').selectOption('acc-2');
    await page.getByRole('button', { name: 'Next' }).click();

    await page.getByLabel('Amount').fill('1000000');
    await page.getByRole('button', { name: 'Next' }).click();

    await page.getByRole('button', { name: 'Confirm Transfer' }).click();

    await expect(page.getByRole('alert')).toContainText('daily transfer limit');
  });
});

// src/lib/audit.ts
import { logger } from './logger';
import { useAuthStore } from '@/stores/auth-store';

type AuditAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'INITIATE_TRANSFER'
  | 'CONFIRM_TRANSFER'
  | 'CANCEL_TRANSFER';

export function auditLog(action: AuditAction, details?: Record<string, unknown>): void {
  const userId = useAuthStore.getState().user?.id;

  // BSP 1019 — All financial actions must be logged
  // Use internal IDs only — never raw account numbers (BSP 982, RA 10173)
  logger.info(`AUDIT: ${action}`, {
    action,
    userId: userId ?? 'anonymous',
    ...details,
  });
}
```

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
