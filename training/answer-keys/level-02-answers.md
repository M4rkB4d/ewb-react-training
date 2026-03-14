# Level 2 — First App: Answer Key

> **EastWest Bank — Digital Platforms & Innovations**
>
> Quiz Answers + Exercise Solutions

---

## Quiz Answers

### Question 1: B

`<div className="card"><input type="text" /></div>` is valid JSX. Option A uses `class` instead of `className` and has an unclosed `<input>` tag. Option C has two root elements without a fragment. Option D uses `for` instead of `htmlFor`.

### Question 2: False

You cannot use `if` statements directly inside JSX curly braces. JSX curly braces accept expressions, not statements. Use the ternary operator (`condition ? a : b`), logical AND (`condition && element`), or early returns before the JSX.

### Question 3 (Short Answer)

React uses the `key` prop to track which list items changed, were added, or were removed between renders. Keys must be stable and unique within the list. Using array indices as keys causes bugs when items are reordered, inserted, or deleted — React would re-render the wrong items because the indices shift. Record IDs (like `transaction.id`) are stable regardless of list order.

### Question 4: B

Props that accept handler functions use the `on` prefix (e.g., `onTransfer`, `onClick`, `onSubmit`). The functions that implement the handling logic use the `handle` prefix (e.g., `handleTransfer`, `handleClick`). This convention makes it clear what is a callback interface vs. what is an implementation.

### Question 5: B

React 19 accepts `ref` as a regular prop on custom components. The `forwardRef` wrapper is no longer needed. You simply add `ref?: React.Ref<HTMLElement>` to your props interface and pass it through to the underlying DOM element.

### Question 6: False

You should test user-visible behavior, not implementation details. Testing internal state values and CSS class names makes tests brittle — they break when you refactor the component's internals even if the behavior is unchanged. Instead, test what users see (text, elements) and what users do (click, type).

### Question 7: C

`getByRole('button', { name: 'Submit' })` is the highest-priority query for buttons. It matches how users and screen readers find elements — by their role and accessible name. `getByTestId` is a last resort.

### Question 8 (Short Answer)

`userEvent` simulates real user behavior — clicking a button fires the full sequence of pointer, mouse, focus, and click events, just like a real click. `fireEvent` fires a single DOM event directly without intermediate events. Always prefer `userEvent` because it catches bugs that `fireEvent` misses (e.g., a button that handles `onMouseDown` instead of `onClick`). Use `fireEvent` only for low-level edge cases.

### Question 9: B

`noValidate` disables the browser's built-in form validation (the tooltip bubbles and default validation behavior). We use it because we handle all validation through Zod schemas, which give us consistent, styled error messages. Browser-native validation varies across browsers and cannot be styled to match the EWB design system.

### Question 10: B

`strict: true` enables all strict type-checking options in TypeScript. This includes `strictNullChecks`, `strictFunctionTypes`, `strictPropertyInitialization`, and more. It catches the widest range of bugs at compile time with zero runtime cost — critical for banking code where type errors can cause financial damage.

### Question 11: False

Pre-commit hooks are a change management control required by BSP Circular 808 and SOX. They prevent code that fails linting or breaks tests from entering the repository. Bypassing them for "urgent" deployments is precisely the scenario they are designed to prevent — urgency is when mistakes are most likely.

### Question 12 (Short Answer)

The Data Privacy Act (RA 10173) requires masking of personal information. Account numbers are personal data that can identify a customer's financial relationship. Displaying full account numbers risks exposure through shoulder surfing, screenshots, or screen recording. Masking to show only the last 4 digits (e.g., "••••7890") lets the user identify the account without exposing the full number to observers.

---

## Exercise Solutions

### Exercise 1: Transaction History Component

```tsx
// src/features/accounts/components/transaction-history.tsx
import { Badge } from '@/components/ui/badge';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

interface TransactionHistoryProps {
  transactions: Transaction[];
  title?: string;
}

export function TransactionHistory({
  transactions,
  title = 'Recent Transactions',
}: TransactionHistoryProps) {
  if (transactions.length === 0) {
    return (
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">{title}</h2>
        <p className="text-gray-500">No transactions found for this period.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-gray-900">{title}</h2>
      <ul className="divide-y divide-gray-200">
        {transactions.map((tx) => (
          <li key={tx.id} className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-gray-900">{tx.description}</p>
              <p className="text-sm text-gray-500">
                {new Date(tx.date).toLocaleDateString('en-PH', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {tx.status === 'pending' && (
                <Badge variant="warning">Pending</Badge>
              )}
              {tx.status === 'failed' && (
                <Badge variant="error">Failed</Badge>
              )}
              <p
                className={
                  tx.type === 'credit' ? 'text-green-600' : 'text-red-600'
                }
              >
                {tx.type === 'credit' ? '+' : '-'}
                {new Intl.NumberFormat('en-PH', {
                  style: 'currency',
                  currency: 'PHP',
                }).format(Math.abs(tx.amount))}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

**Key points:**
- Early return for empty state keeps the main render clean
- `key={tx.id}` uses the transaction's unique ID
- `Intl.NumberFormat` handles currency formatting consistently
- Status badges use the design system `Badge` component
- `Math.abs()` ensures the amount is always positive (the sign is handled by the prefix)

### Exercise 2: Account Summary Dashboard

```tsx
// src/features/accounts/components/account-dashboard.tsx
import { Card, CardHeader, CardTitle, CardBody, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface AccountSummary {
  id: string;
  accountName: string;
  accountNumber: string;
  type: 'savings' | 'checking' | 'time-deposit';
  balance: number;
  currency: string;
  isActive: boolean;
}

interface AccountDashboardProps {
  accounts: AccountSummary[];
  totalBalance: number;
  isLoading: boolean;
  onTransfer: (accountId: string) => void;
  onViewDetails: (accountId: string) => void;
}

const typeLabels: Record<AccountSummary['type'], string> = {
  savings: 'Savings',
  checking: 'Checking',
  'time-deposit': 'Time Deposit',
};

function formatPHP(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(amount);
}

function maskAccountNumber(accountNumber: string): string {
  return `••••${accountNumber.slice(-4)}`;
}

export function AccountDashboard({
  accounts,
  totalBalance,
  isLoading,
  onTransfer,
  onViewDetails,
}: AccountDashboardProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-24 animate-pulse rounded-xl bg-gray-200" />
        <div className="h-40 animate-pulse rounded-xl bg-gray-200" />
        <div className="h-40 animate-pulse rounded-xl bg-gray-200" />
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <Card>
        <CardBody>
          <p className="text-center text-gray-500">
            No accounts found. Contact your branch to get started.
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Total Balance */}
      <Card className="bg-ewb-purple text-white">
        <CardBody>
          <p className="text-sm opacity-80">Total Balance</p>
          <p className="text-3xl font-bold">{formatPHP(totalBalance)}</p>
        </CardBody>
      </Card>

      {/* Account Cards */}
      <div className="space-y-4">
        {accounts.map((account) => (
          <Card key={account.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{account.accountName}</CardTitle>
                  <p className="text-sm text-gray-500">
                    {maskAccountNumber(account.accountNumber)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="info">{typeLabels[account.type]}</Badge>
                  <span
                    className={`inline-block h-2 w-2 rounded-full ${
                      account.isActive ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    aria-label={account.isActive ? 'Active' : 'Inactive'}
                  />
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <p className="text-2xl font-bold">{formatPHP(account.balance)}</p>
            </CardBody>
            {account.isActive && (
              <CardFooter>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => onTransfer(account.id)}
                  >
                    Transfer
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onViewDetails(account.id)}
                  >
                    Details
                  </Button>
                </div>
              </CardFooter>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
```

### Exercise 3: Testing the Transaction History

```tsx
// src/features/accounts/components/transaction-history.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TransactionHistory } from './transaction-history';

const sampleTransactions = [
  {
    id: 'txn-001',
    description: 'Salary Deposit',
    amount: 50000,
    type: 'credit' as const,
    date: '2026-03-12T00:00:00Z',
    status: 'completed' as const,
  },
  {
    id: 'txn-002',
    description: 'Electric Bill',
    amount: 3500,
    type: 'debit' as const,
    date: '2026-03-11T00:00:00Z',
    status: 'pending' as const,
  },
  {
    id: 'txn-003',
    description: 'Fund Transfer',
    amount: 10000,
    type: 'debit' as const,
    date: '2026-03-10T00:00:00Z',
    status: 'failed' as const,
  },
];

describe('TransactionHistory', () => {
  describe('rendering', () => {
    it('displays the default title', () => {
      render(<TransactionHistory transactions={sampleTransactions} />);
      expect(screen.getByText('Recent Transactions')).toBeInTheDocument();
    });

    it('displays a custom title when provided', () => {
      render(
        <TransactionHistory
          transactions={sampleTransactions}
          title="March 2026"
        />,
      );
      expect(screen.getByText('March 2026')).toBeInTheDocument();
    });

    it('formats credit amounts with PHP currency', () => {
      render(<TransactionHistory transactions={sampleTransactions} />);
      expect(screen.getByText(/\+.*₱50,000\.00/)).toBeInTheDocument();
    });

    it('formats debit amounts with PHP currency', () => {
      render(<TransactionHistory transactions={sampleTransactions} />);
      expect(screen.getByText(/-.*₱3,500\.00/)).toBeInTheDocument();
    });

    it('displays transaction descriptions', () => {
      render(<TransactionHistory transactions={sampleTransactions} />);
      expect(screen.getByText('Salary Deposit')).toBeInTheDocument();
      expect(screen.getByText('Electric Bill')).toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('shows empty message when array is empty', () => {
      render(<TransactionHistory transactions={[]} />);
      expect(
        screen.getByText('No transactions found for this period.'),
      ).toBeInTheDocument();
    });

    it('does not show empty message when transactions exist', () => {
      render(<TransactionHistory transactions={sampleTransactions} />);
      expect(
        screen.queryByText('No transactions found for this period.'),
      ).not.toBeInTheDocument();
    });
  });

  describe('status badges', () => {
    it('shows Pending badge for pending transactions', () => {
      render(<TransactionHistory transactions={sampleTransactions} />);
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });

    it('shows Failed badge for failed transactions', () => {
      render(<TransactionHistory transactions={sampleTransactions} />);
      expect(screen.getByText('Failed')).toBeInTheDocument();
    });

    it('does not show a badge for completed transactions', () => {
      const completedOnly = [sampleTransactions[0]!];
      render(<TransactionHistory transactions={completedOnly} />);
      expect(screen.queryByText('Pending')).not.toBeInTheDocument();
      expect(screen.queryByText('Failed')).not.toBeInTheDocument();
    });
  });
});
```

**Key points:**
- `sampleTransactions` defined once, reused across tests
- Regex patterns (`/\+.*₱50,000\.00/`) handle flexible whitespace in currency formatting
- `queryByText` used for negative assertions (element should NOT exist)
- Tests focus on user-visible behavior, not CSS classes or state

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
