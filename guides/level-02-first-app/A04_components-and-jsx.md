# A04 — Components and JSX

> **EastWest Bank — Digital Platforms & Innovations**
>
> Part A (Core) · Level 2 — First App · Est. 2.5 hours

---

## What You Will Learn

By the end of this guide, you will:

- Understand JSX as a syntax extension for describing UI
- Build functional components with typed props
- Use children, composition, and conditional rendering
- Handle events with proper TypeScript types
- Pass refs as regular props (React 19)
- Build your first real banking components: AccountCard, TransactionRow, StatusBadge
- Understand component design principles for banking applications

---

## Prerequisites

| Requirement | Where |
|------------|-------|
| Completed A01 — What Is React | Level 1 |
| Completed A02 — TypeScript for React | Level 1 |
| Completed B01 — Project Setup | Level 2 |
| A running EWB project (`npm run dev` works) | B01 |

---

## Phase 1 — JSX Is Not HTML

### What is JSX?

JSX (JavaScript XML) is a syntax extension that lets you write HTML-like code inside
TypeScript. It looks like HTML but it is not HTML — it is a description of what the
UI should look like.

When you write:

```tsx
const element = <h1 className="text-xl">Account Summary</h1>;
```

The JSX transform compiles it into:

```typescript
import { jsx as _jsx } from 'react/jsx-runtime';
const element = _jsx('h1', { className: 'text-xl', children: 'Account Summary' });
```

You never write `_jsx()` calls by hand. JSX makes your components readable.
But understanding that JSX compiles to function calls helps you understand its rules.

### JSX Rules

**1. One root element per return**

```tsx
// This will not compile — two root elements
return (
  <h1>Account</h1>
  <p>Details here</p>
);

// Use a fragment to wrap multiple elements
return (
  <>
    <h1>Account</h1>
    <p>Details here</p>
  </>
);
```

A fragment (`<>...</>`) groups elements without adding a DOM node. Use it when you
need to return multiple elements but do not want a wrapper `<div>`.

**2. className, not class**

```tsx
// HTML:  <div class="card">
// JSX:   <div className="card">
```

`class` is a reserved word in JavaScript. JSX uses `className` instead.

**3. htmlFor, not for**

```tsx
// HTML:  <label for="email">
// JSX:   <label htmlFor="email">
```

`for` is also a reserved word (the `for` loop).

**4. Self-closing tags are required**

```tsx
// HTML:  <input type="text">     (self-closing optional)
// JSX:   <input type="text" />   (self-closing required)

// HTML:  <br>
// JSX:   <br />

// HTML:  <img src="logo.png">
// JSX:   <img src="logo.png" />
```

**5. JavaScript expressions use curly braces**

```tsx
const accountName = 'Savings Account';
const balance = 150000;

return (
  <div>
    <h2>{accountName}</h2>
    <p>{balance.toLocaleString('en-PH')}</p>
    <p>{balance > 100000 ? 'Premium' : 'Standard'}</p>
  </div>
);
```

Anything inside `{}` is a JavaScript expression. You can use variables, function
calls, ternary operators, and template literals — but not statements (no `if`, `for`,
`while` inside JSX).

### Checkpoint 1

Which of these are valid JSX?

```tsx
// A
return <div class="card"><input type="text"></div>

// B
return <div className="card"><input type="text" /></div>

// C
return (
  <h1>Title</h1>
  <p>Content</p>
)

// D
return (
  <>
    <h1>Title</h1>
    <p>Content</p>
  </>
)
```

Answer: B and D are valid. A uses `class` and unclosed `<input>`. C has two roots.

---

## Phase 2 — Functional Components

### Anatomy of a component

A React component is a function that returns JSX:

```tsx
// src/components/ui/greeting.tsx
interface GreetingProps {
  name: string;
}

export function Greeting({ name }: GreetingProps) {
  return <p className="text-gray-700">Welcome, {name}.</p>;
}
```

**Every component follows this pattern:**

1. Define an interface for the props
2. Export a named function that takes the props
3. Return JSX

### Props are read-only

Props flow down from parent to child. A child component never modifies its own props:

```tsx
// src/features/accounts/components/account-header.tsx
interface AccountHeaderProps {
  accountName: string;
  accountType: 'savings' | 'checking' | 'time-deposit';
}

export function AccountHeader({ accountName, accountType }: AccountHeaderProps) {
  // accountName = 'Something else'; ← TypeScript will not allow this (readonly)
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-semibold text-gray-900">{accountName}</h2>
      <span className="rounded-full bg-ewb-purple-100 px-3 py-1 text-sm text-ewb-purple-700">
        {accountType}
      </span>
    </div>
  );
}
```

### Default prop values

Use JavaScript default parameters:

```tsx
interface AlertProps {
  message: string;
  severity?: 'info' | 'warning' | 'error';
}

export function Alert({ message, severity = 'info' }: AlertProps) {
  const colors = {
    info: 'bg-ewb-navy-50 text-ewb-navy-700 border-ewb-navy-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    error: 'bg-red-50 text-red-700 border-red-200',
  };

  return (
    <div className={`rounded-lg border p-4 ${colors[severity]}`} role="alert">
      {message}
    </div>
  );
}
```

When `severity` is not provided, it defaults to `'info'`. The `?` in the interface
makes it optional. The `= 'info'` in the destructuring provides the default.

### Checkpoint 2

Create a `Badge` component that accepts `label` (required string) and `variant`
(optional: `'default' | 'success' | 'error'`, defaults to `'default'`). Each variant
should use a different background color from the EWB palette.

---

## Phase 3 — Children and Composition

### The children prop

Components can wrap other components using the `children` prop:

```tsx
// src/components/ui/card.tsx
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`rounded-xl border border-gray-200 bg-white p-6 shadow-sm ${className}`}>
      {children}
    </div>
  );
}
```

Usage:

```tsx
<Card>
  <h3>Savings Account</h3>
  <p>Balance: ₱150,000.00</p>
</Card>
```

Everything between `<Card>` and `</Card>` becomes the `children` prop. The `Card`
component decides where to render those children — in this case, inside a styled `div`.

### React.ReactNode vs React.ReactElement

| Type | Accepts |
|------|---------|
| `React.ReactNode` | Anything renderable: elements, strings, numbers, `null`, `undefined`, arrays, fragments |
| `React.ReactElement` | Only JSX elements (not strings or numbers) |

Use `React.ReactNode` for `children` in almost all cases. It is the most flexible type.

### Composition over configuration

Banking components often have complex layouts. Composition keeps them manageable:

```tsx
// src/components/ui/card.tsx
interface CardHeaderProps {
  children: React.ReactNode;
}

export function CardHeader({ children }: CardHeaderProps) {
  return (
    <div className="border-b border-gray-200 pb-4">
      {children}
    </div>
  );
}

interface CardBodyProps {
  children: React.ReactNode;
}

export function CardBody({ children }: CardBodyProps) {
  return <div className="py-4">{children}</div>;
}

interface CardFooterProps {
  children: React.ReactNode;
}

export function CardFooter({ children }: CardFooterProps) {
  return (
    <div className="border-t border-gray-200 pt-4">
      {children}
    </div>
  );
}
```

Usage:

```tsx
<Card>
  <CardHeader>
    <h3 className="font-semibold">Savings Account</h3>
    <p className="text-sm text-gray-500">••••7890</p>
  </CardHeader>
  <CardBody>
    <p className="text-2xl font-bold">₱150,000.00</p>
  </CardBody>
  <CardFooter>
    <button className="text-sm text-ewb-purple">View Transactions</button>
  </CardFooter>
</Card>
```

This is more flexible than a single `Card` component that takes `title`, `subtitle`,
`amount`, and `action` props. Composition lets the consumer decide the layout.

### Checkpoint 3

Create a `Section` component with `SectionHeader` and `SectionBody` sub-components.
Use them to create an "Account Overview" section with a title and placeholder content.

---

## Phase 4 — Conditional Rendering

### Ternary operator (inline if-else)

```tsx
interface AccountStatusProps {
  isActive: boolean;
}

export function AccountStatus({ isActive }: AccountStatusProps) {
  return (
    <span className={isActive ? 'text-green-600' : 'text-red-600'}>
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
}
```

### Logical AND (show or hide)

```tsx
interface BalanceDisplayProps {
  balance: number;
  showCentavos: boolean;
}

export function BalanceDisplay({ balance, showCentavos }: BalanceDisplayProps) {
  const formatted = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: showCentavos ? 2 : 0,
  }).format(balance);

  return (
    <div>
      <p className="text-2xl font-bold">{formatted}</p>
      {balance < 5000 && (
        <p className="text-sm text-amber-600">
          Low balance warning
        </p>
      )}
    </div>
  );
}
```

The `&&` pattern renders the right side only when the left side is truthy. Be careful
with numbers — `{count && <span>...</span>}` will render `0` if `count` is 0. Use
`{count > 0 && <span>...</span>}` instead.

### Early return (guard pattern)

```tsx
interface TransactionDetailProps {
  transaction: {
    id: string;
    amount: number;
    description: string;
  } | null;
}

export function TransactionDetail({ transaction }: TransactionDetailProps) {
  if (transaction === null) {
    return (
      <p className="text-gray-500">
        Select a transaction to view details.
      </p>
    );
  }

  return (
    <div>
      <h3>{transaction.description}</h3>
      <p>₱{transaction.amount.toLocaleString('en-PH')}</p>
    </div>
  );
}
```

Early returns simplify complex conditional logic. Handle edge cases first, then render
the main content without nesting.

### Rendering lists

```tsx
interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
}

interface TransactionListProps {
  transactions: Transaction[];
}

export function TransactionList({ transactions }: TransactionListProps) {
  if (transactions.length === 0) {
    return <p className="text-gray-500">No transactions found.</p>;
  }

  return (
    <ul className="divide-y divide-gray-200">
      {transactions.map((tx) => (
        <li key={tx.id} className="flex justify-between py-3">
          <div>
            <p className="font-medium">{tx.description}</p>
            <p className="text-sm text-gray-500">{tx.date}</p>
          </div>
          <p className={tx.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
            {tx.amount >= 0 ? '+' : ''}
            ₱{Math.abs(tx.amount).toLocaleString('en-PH')}
          </p>
        </li>
      ))}
    </ul>
  );
}
```

**The `key` prop is critical.** React uses keys to track which items changed, were
added, or were removed. Keys must be stable and unique within the list. Use the
record's ID, never the array index.

### Checkpoint 4

Build a `NotificationList` component that:
1. Shows "No notifications" when the list is empty
2. Renders each notification with a colored indicator (green for info, amber for warning, red for error)
3. Uses proper `key` props

---

## Phase 5 — Event Handling

### Click events

```tsx
// src/features/accounts/components/account-actions.tsx
interface AccountActionsProps {
  accountId: string;
  onTransfer: (accountId: string) => void;
  onViewHistory: (accountId: string) => void;
}

export function AccountActions({
  accountId,
  onTransfer,
  onViewHistory,
}: AccountActionsProps) {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => onTransfer(accountId)}
        className="rounded-lg bg-ewb-purple px-4 py-2 text-sm text-white hover:bg-ewb-purple-700"
      >
        Transfer
      </button>
      <button
        type="button"
        onClick={() => onViewHistory(accountId)}
        className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
      >
        History
      </button>
    </div>
  );
}
```

**Always pass `type="button"` on buttons** that are not submitting a form. Without
it, buttons inside a `<form>` default to `type="submit"` and will submit the form
on click.

### Event handler naming convention

The convention is:
- Props that accept handlers: prefix with `on` → `onClick`, `onTransfer`, `onSubmit`
- Functions that handle events: prefix with `handle` → `handleClick`, `handleTransfer`

```tsx
export function AccountPage() {
  const handleTransfer = (accountId: string) => {
    // Navigate to transfer page
  };

  const handleViewHistory = (accountId: string) => {
    // Navigate to history page
  };

  return (
    <AccountActions
      accountId="ACC-001"
      onTransfer={handleTransfer}
      onViewHistory={handleViewHistory}
    />
  );
}
```

### Form events

```tsx
import { useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      onSearch(trimmed);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search transactions..."
        className="flex-1 rounded-lg border border-gray-300 px-4 py-2"
      />
      <button
        type="submit"
        className="rounded-lg bg-ewb-purple px-4 py-2 text-white"
      >
        Search
      </button>
    </form>
  );
}
```

`event.preventDefault()` stops the form from doing a full page reload. In a single-page
application, you always prevent the default form submission.

### Common event types

| Event | Type | Used For |
|-------|------|----------|
| Click | `React.MouseEvent<HTMLButtonElement>` | Buttons, links |
| Change | `React.ChangeEvent<HTMLInputElement>` | Text inputs |
| Submit | `React.FormEvent<HTMLFormElement>` | Form submissions |
| Focus | `React.FocusEvent<HTMLInputElement>` | Focus/blur tracking |
| Keyboard | `React.KeyboardEvent<HTMLInputElement>` | Key press detection |

### Checkpoint 5

Create a `CurrencyInput` component that:
1. Accepts an `onChange` prop that receives the numeric value
2. Displays the value formatted as Philippine Peso (₱)
3. Only allows numeric input (reject non-numeric characters)

---

## Phase 6 — Refs in React 19

### What changed in React 19

In React 18 and earlier, passing a `ref` to a custom component required `forwardRef`:

```tsx
// React 18 — verbose, confusing for beginners
const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  return <input ref={ref} {...props} />;
});
```

In React 19, `ref` is a regular prop. No `forwardRef` needed:

```tsx
// React 19 — clean, just a prop
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  ref?: React.Ref<HTMLInputElement>;
}

export function Input({ ref, className, ...props }: InputProps) {
  return (
    <input
      ref={ref}
      className={`rounded-lg border border-gray-300 px-4 py-2 ${className ?? ''}`}
      {...props}
    />
  );
}
```

### When to use refs

Refs are for DOM access — focusing an input, scrolling to an element, measuring
dimensions. Do not use refs to store state that should trigger re-renders.

```tsx
// src/features/auth/components/pin-input.tsx
import { useRef } from 'react';

export function PinInput() {
  // These 6 refs are always created — never conditional. For variable-length
  // inputs, use a single useRef<(HTMLInputElement | null)[]>([]) instead.
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const handleChange = (index: number, value: string) => {
    if (value.length === 1 && index < 5) {
      inputRefs[index + 1]?.current?.focus();
    }
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent) => {
    if (event.key === 'Backspace' && index > 0) {
      inputRefs[index - 1]?.current?.focus();
    }
  };

  return (
    <div className="flex gap-2">
      {inputRefs.map((ref, index) => (
        {/* Fixed list — index keys are acceptable here */}
        <input
          key={index}
          ref={ref}
          type="text"
          inputMode="numeric"
          maxLength={1}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          className="h-12 w-12 rounded-lg border border-gray-300 text-center text-xl"
          aria-label={`PIN digit ${index + 1}`}
        />
      ))}
    </div>
  );
}
```

This PIN input auto-focuses the next field as you type — a common banking pattern
for OTP and PIN entry.

> **BSP 1033 Note:** The `aria-label` on each input is required for accessibility.
> Screen readers must be able to identify which digit the user is entering.

### Checkpoint 6

Build an `OtpInput` component that:
1. Has 6 input fields for a one-time password
2. Auto-focuses the next field when a digit is entered
3. Auto-focuses the previous field on backspace
4. Has proper ARIA labels for accessibility

---

## Phase 7 — Building the AccountCard

### Putting it all together

Let us build a real banking component — the `AccountCard` that displays an account
summary.

```tsx
// src/features/accounts/components/account-card.tsx

interface AccountCardProps {
  accountName: string;
  accountNumber: string;
  accountType: 'savings' | 'checking' | 'time-deposit';
  balance: number;
  currency?: string;
  isActive: boolean;
  onTransfer?: (accountNumber: string) => void;
  onViewDetails?: (accountNumber: string) => void;
}

export function AccountCard({
  accountName,
  accountNumber,
  accountType,
  balance,
  currency = 'PHP',
  isActive,
  onTransfer,
  onViewDetails,
}: AccountCardProps) {
  // DPA compliance: mask account number (show last 4 only)
  const maskedNumber = `••••${accountNumber.slice(-4)}`;

  // Format currency
  const formattedBalance = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(balance);

  // Account type display
  const typeLabels: Record<AccountCardProps['accountType'], string> = {
    savings: 'Savings',
    checking: 'Checking',
    'time-deposit': 'Time Deposit',
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {accountName}
          </h3>
          <p className="text-sm text-gray-500">{maskedNumber}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-ewb-purple-100 px-3 py-1 text-xs font-medium text-ewb-purple-700">
            {typeLabels[accountType]}
          </span>
          <span
            className={`inline-block h-2 w-2 rounded-full ${
              isActive ? 'bg-green-500' : 'bg-red-500'
            }`}
            aria-label={isActive ? 'Active account' : 'Inactive account'}
          />
        </div>
      </div>

      {/* Balance */}
      <div className="mt-4">
        <p className="text-sm text-gray-500">Available Balance</p>
        <p className="text-2xl font-bold text-gray-900">
          {formattedBalance}
        </p>
      </div>

      {/* Actions */}
      {isActive && (onTransfer != null || onViewDetails != null) && (
        <div className="mt-4 flex gap-2 border-t border-gray-100 pt-4">
          {onTransfer != null && (
            <button
              type="button"
              onClick={() => onTransfer(accountNumber)}
              className="rounded-lg bg-ewb-purple px-4 py-2 text-sm text-white hover:bg-ewb-purple-700"
            >
              Transfer
            </button>
          )}
          {onViewDetails != null && (
            <button
              type="button"
              onClick={() => onViewDetails(accountNumber)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              View Details
            </button>
          )}
        </div>
      )}
    </div>
  );
}
```

> **Note:** This example uses pesos as a plain number for simplicity. Starting in B03 (API Integration), all monetary values use integer centavos with `formatPeso()`. See B01 Phase 6 for why.

**What this component demonstrates:**

| Concept | Where |
|---------|-------|
| Typed props with interface | `AccountCardProps` |
| Default prop values | `currency = 'PHP'` |
| Data masking (DPA compliance) | `maskedNumber` |
| Currency formatting | `Intl.NumberFormat` with PHP |
| Conditional rendering (ternary) | Active/inactive indicator |
| Conditional rendering (&&) | Actions section |
| Event handlers | `onTransfer`, `onViewDetails` |
| Composition ready | Can be used inside a list or grid |
| Accessibility | `aria-label` on status indicator |

### Using the AccountCard

```tsx
// src/App.tsx
import { AccountCard } from '@/features/accounts/components/account-card';

export default function App() {
  const handleTransfer = (accountNumber: string) => {
    // Will implement routing in B02
    alert(`Transfer from ${accountNumber}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-ewb-purple px-6 py-4">
        <h1 className="text-xl font-semibold text-white">EastWest Bank</h1>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-8">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">My Accounts</h2>
        <div className="space-y-4">
          <AccountCard
            accountName="Personal Savings"
            accountNumber="1234567890"
            accountType="savings"
            balance={150000}
            isActive={true}
            onTransfer={handleTransfer}
            onViewDetails={() => {}}
          />
          <AccountCard
            accountName="Payroll Checking"
            accountNumber="0987654321"
            accountType="checking"
            balance={42500.50}
            isActive={true}
            onTransfer={handleTransfer}
          />
          <AccountCard
            accountName="Time Deposit"
            accountNumber="5555666677"
            accountType="time-deposit"
            balance={500000}
            isActive={false}
          />
        </div>
      </main>
    </div>
  );
}
```

### Checkpoint 7

Run `npm run dev` and verify you can see three AccountCards rendered with:
- Masked account numbers (only last 4 digits visible)
- Philippine Peso formatting with ₱ symbol
- Active/inactive indicators
- Transfer buttons on active accounts only

---

## Phase 8 — Component Design Principles

### 1. Single responsibility

Each component does one thing. The `AccountCard` displays an account. It does not
fetch account data, navigate to pages, or manage state. Those are responsibilities
of other components.

### 2. Props down, events up

Data flows down through props. User actions flow up through event handlers. The
`AccountCard` does not know what happens when the user clicks "Transfer" — it just
calls `onTransfer` and lets the parent decide.

### 3. Type everything

Every prop has a type. Every event handler has a type. TypeScript catches prop
mismatches before they become runtime bugs.

### 4. Mask by default

Any component that displays personal information must mask it by default. Full
account numbers, full names, email addresses — mask first, reveal only when the
user explicitly requests it.

### 5. Accessible by default

Every interactive element needs proper labels. Every status indicator needs
`aria-label`. Every button needs `type="button"`. Accessibility is not an
afterthought — it is a baseline requirement (BSP 1033).

---

## Key Takeaways

1. **JSX is not HTML** — it compiles to function calls. Know the differences:
   `className`, `htmlFor`, self-closing tags, curly braces for expressions.

2. **Components are functions** that return JSX. Props are typed with interfaces.
   Children enable composition.

3. **Conditional rendering** uses ternary (`? :`), logical AND (`&&`), or early
   returns. Avoid `&&` with numbers — use explicit comparisons.

4. **Keys must be stable and unique.** Use record IDs, never array indices.

5. **React 19 passes `ref` as a regular prop.** No more `forwardRef`.

6. **Mask sensitive data by default.** Account numbers show last 4 digits only.
   This is DPA compliance built into your components.

7. **Props down, events up.** Components receive data through props and report
   actions through callbacks. They do not own the decisions.

---

## Exercises

### Exercise 1 — TransactionRow Component

Create a `TransactionRow` component at `src/features/accounts/components/transaction-row.tsx`
that displays:
- Transaction description
- Date (formatted as "Mar 12, 2026")
- Amount (green for credits, red for debits, formatted as PHP)
- Transaction type badge (transfer, payment, deposit, withdrawal)

Props: `description`, `date`, `amount`, `type`.

Verify with `npm run dev` by rendering a list of sample transactions.

### Exercise 2 — StatusBadge Component

Create a `StatusBadge` component at `src/components/ui/status-badge.tsx` with variants:
- `success` — green background (lime), white text
- `warning` — amber background, dark text
- `error` — red background, white text
- `info` — navy background, white text
- `pending` — gray background, dark text

Props: `status`, `label`. Use the EWB color palette.

### Exercise 3 — AccountList with Empty State

Create an `AccountList` component that:
1. Accepts an array of accounts
2. Renders `AccountCard` for each account
3. Shows a friendly empty state when the array is empty ("No accounts found. Contact your branch to get started.")
4. Shows a loading skeleton when an `isLoading` prop is true

This combines conditional rendering, list rendering, and composition.

---

## What Comes Next

You can now build typed, composable components with proper event handling and
data masking. But how do you know they work correctly?

**Next guide:** [A05 — Your First Test](A05_your-first-test.md) — where you write
automated tests for the AccountCard and verify that your components behave as expected.

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
