# A01 — What Is React

> **EastWest Bank — Digital Platforms & Innovations**
>
> Part A (Core) · Level 1 — Welcome · Est. 2 hours

---

## What You Will Learn

By the end of this guide, you will be able to:

1. Explain what React is and why EastWest Bank uses it
2. Build functional components that accept props and return JSX
3. Use `useState` to make components interactive
4. Use `useEffect` for side effects and cleanup
5. Use `useRef` for DOM access without re-renders
6. Describe the mental model: UI = f(state)

---

## Prerequisites

None — this is the starting guide. No prior React or TypeScript knowledge is assumed.

However, this guide uses modern JavaScript syntax. If any of the concepts below
are unfamiliar, spend 30 minutes reviewing them first. You do not need to master
them — just recognize the syntax so you are not lost when you see it in examples.

---

## Phase 0: JavaScript Essentials (Review)

If you are comfortable with all of these, skip to Phase 1.

### Arrow functions

```javascript
// Traditional function
function add(a, b) {
  return a + b;
}

// Arrow function — same thing, shorter syntax
const add = (a, b) => a + b;

// Arrow function with a body (when you need multiple lines)
const greet = (name) => {
  const message = `Hello, ${name}`;
  return message;
};
```

Arrow functions are used everywhere in React. The `=>` is not an operator — it
is how you define a function.

### Template literals

```javascript
const name = 'Maria';
const greeting = `Hello, ${name}!`; // "Hello, Maria!"
// Uses backticks (`) not quotes. ${} inserts a value.
```

### Destructuring

```javascript
// Object destructuring — extract values by name
const user = { name: 'Maria', age: 30, role: 'teller' };
const { name, role } = user; // name = 'Maria', role = 'teller'

// Array destructuring — extract values by position
const colors = ['red', 'green', 'blue'];
const [first, second] = colors; // first = 'red', second = 'green'
```

React uses destructuring constantly for props and state.

### Spread operator

```javascript
// Copy an object and change one property
const original = { name: 'Maria', role: 'teller' };
const updated = { ...original, role: 'manager' };
// updated = { name: 'Maria', role: 'manager' }

// Copy an array and add an item
const items = [1, 2, 3];
const moreItems = [...items, 4]; // [1, 2, 3, 4]
```

The `...` (three dots) spreads an object or array into a new one. React uses
this pattern to update state without mutating the original.

### Promises and async/await

```javascript
// Fetching data from an API
async function getAccounts() {
  const response = await fetch('/api/accounts');
  const data = await response.json();
  return data;
}
// `await` pauses until the operation completes.
// `async` marks a function that uses `await`.
```

### ES Modules (import/export)

```javascript
// math.ts — exporting
export function add(a, b) { return a + b; }
export default function multiply(a, b) { return a * b; }

// app.ts — importing
import multiply, { add } from './math';
```

Every React file uses `import` and `export` to share code between files.

### Checkpoint 0

If you can read this code and understand roughly what it does, you are ready
for Phase 1:

```javascript
const users = [
  { name: 'Maria', role: 'teller' },
  { name: 'Juan', role: 'manager' },
];

const managers = users.filter((u) => u.role === 'manager');
const names = users.map((u) => u.name);
const updated = { ...users[0], role: 'supervisor' };
```

If the `.filter()`, `.map()`, and `...` syntax is unfamiliar, search
"JavaScript array methods MDN" and "JavaScript spread operator MDN" before
continuing. 15 minutes of reading will save hours of confusion.

---

## Phase 1: Why React Exists

### 1.1 The Problem React Solves

Imagine you are building an account balance dashboard. The page shows:
- The customer's name
- Their account balance
- A list of recent transactions

Without React, you would write code like this:

```javascript
// The old way — imperative DOM manipulation
document.getElementById('balance').textContent = '₱125,430.50';
document.getElementById('name').textContent = 'Maria Santos';

// When the balance changes...
function updateBalance(newBalance) {
  document.getElementById('balance').textContent = formatCurrency(newBalance);
  document.getElementById('balance').classList.add('updated');
  setTimeout(() => {
    document.getElementById('balance').classList.remove('updated');
  }, 1000);
}
```

This works for small pages. But as your application grows — multiple accounts, transaction filters, real-time updates, user preferences — imperative DOM manipulation becomes impossible to maintain. You spend more time tracking which elements need updating than building features.

React solves this with a simple idea: **describe what the UI should look like for any given data, and let React figure out the DOM updates.**

```tsx
// The React way — declarative UI
function AccountBalance({ balance, name }: AccountBalanceProps) {
  return (
    <div>
      <h2>{name}</h2>
      <p className="text-2xl font-bold">{formatCurrency(balance)}</p>
    </div>
  );
}
```

You describe the result. React handles the how. When `balance` changes, React automatically updates only the parts of the DOM that need to change. This is called **declarative programming**.

### 1.2 Why EastWest Bank Uses React

React is the most widely used JavaScript library for building user interfaces:

- **Industry standard:** Used by banks, fintech companies, and enterprises worldwide
- **Hiring:** The largest talent pool of any frontend framework
- **Ecosystem:** Thousands of production-tested libraries for forms, state management, data fetching, and more
- **Performance:** React 19's compiler automatically optimizes rendering — no manual tuning needed
- **TypeScript support:** First-class TypeScript integration catches errors before they reach production
- **Testing:** Mature testing ecosystem (Vitest, React Testing Library, Playwright) ensures reliability

For banking applications, React provides the stability, security, and developer experience that production systems demand.

### Checkpoint 1

> Can you explain, in one sentence, the difference between imperative and declarative UI programming?

---

## Phase 2: Components — The Building Blocks

### 2.1 What Is a Component?

A component is a JavaScript function that returns UI. That is the entire definition.

```tsx
// src/components/Greeting.tsx
function Greeting() {
  return <h1>Welcome to EastWest Bank</h1>;
}
```

This function returns **JSX** — a syntax that looks like HTML but is actually JavaScript. When React renders this component, it creates the corresponding DOM elements.

Key rules:
1. Component names start with a capital letter (`Greeting`, not `greeting`)
2. Components return JSX (one root element)
3. Components are functions (we never use class components)

### 2.2 Props: Passing Data to Components

Components accept data through **props** (short for properties). Props flow in one direction: from parent to child.

```tsx
// src/components/AccountCard.tsx
interface AccountCardProps {
  accountName: string;
  accountNumber: string;
  balance: number;
  currency: string;
}

function AccountCard({ accountName, accountNumber, balance, currency }: AccountCardProps) {
  return (
    <div className="rounded-lg border p-4">
      <h3 className="text-lg font-semibold">{accountName}</h3>
      <p className="text-sm text-muted-fg">
        ****{accountNumber.slice(-4)}
      </p>
      <p className="text-2xl font-bold">
        {new Intl.NumberFormat('en-PH', {
          style: 'currency',
          currency,
        }).format(balance)}
      </p>
    </div>
  );
}
```

Notice:
- **TypeScript interface** defines the exact shape of props
- **Destructuring** extracts individual props from the object
- **Data masking**: We only show the last 4 digits of the account number — a compliance requirement you will learn more about in A03

### 2.3 Using Components Together

Components compose. A parent component renders child components, passing data down through props.

```tsx
// src/pages/DashboardPage.tsx
function DashboardPage() {
  return (
    <div className="space-y-4 p-6">
      <h1 className="text-2xl font-bold">My Accounts</h1>
      <AccountCard
        accountName="Savings Account"
        accountNumber="1234567890"
        balance={125430.5}
        currency="PHP"
      />
      <AccountCard
        accountName="Checking Account"
        accountNumber="0987654321"
        balance={45200.0}
        currency="PHP"
      />
    </div>
  );
}
```

Two `AccountCard` components with different data. React renders each independently. This is the power of composition: small, reusable pieces combine to build complex UIs.

### 2.4 Children: Components Inside Components

Some components wrap other content. React provides a special `children` prop for this:

```tsx
// src/components/ui/Card.tsx
interface CardProps {
  title: string;
  children: React.ReactNode;
}

function Card({ title, children }: CardProps) {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-card-fg">{title}</h3>
      {children}
    </div>
  );
}
```

```tsx
// Usage
<Card title="Recent Transactions">
  <TransactionList transactions={recentTransactions} />
</Card>
```

Everything between `<Card>` and `</Card>` becomes the `children` prop.

### Checkpoint 2

> Create a component called `StatusBadge` that accepts a `status` prop (string) and a `label` prop (string). It should render a colored badge — green for "active", red for "closed", yellow for "pending".

---

## Phase 3: Making Things Interactive with useState

### 3.1 State: Data That Changes

Props are read-only — a component cannot modify its own props. But components need to track data that changes over time: form inputs, toggle states, counters, loading indicators.

React provides `useState` for this:

```tsx
// src/components/Counter.tsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

`useState(0)` returns two things:
1. `count` — the current value (starts at `0`)
2. `setCount` — a function to update the value

When you call `setCount(count + 1)`, React re-renders the component with the new value. The entire function runs again, but `useState` remembers the latest value.

### 3.2 State with TypeScript

Always type your state. TypeScript catches bugs before they reach production.

```tsx
// src/components/TransactionFilter.tsx
import { useState } from 'react';

type TransactionType = 'all' | 'credit' | 'debit';

function TransactionFilter() {
  const [filter, setFilter] = useState<TransactionType>('all');

  return (
    <div className="flex gap-2">
      <button
        className={filter === 'all' ? 'bg-primary text-primary-fg' : 'bg-muted'}
        onClick={() => setFilter('all')}
      >
        All
      </button>
      <button
        className={filter === 'credit' ? 'bg-success text-success-fg' : 'bg-muted'}
        onClick={() => setFilter('credit')}
      >
        Credits
      </button>
      <button
        className={filter === 'debit' ? 'bg-destructive text-destructive-fg' : 'bg-muted'}
        onClick={() => setFilter('debit')}
      >
        Debits
      </button>
    </div>
  );
}
```

The type `TransactionType` ensures `filter` can only be `'all'`, `'credit'`, or `'debit'`. If you accidentally pass `'debits'` (with an extra 's'), TypeScript catches it immediately.

### 3.3 State for Objects

When state is an object, always create a new object when updating — never mutate the existing one:

```tsx
// src/components/TransferForm.tsx
import { useState } from 'react';

interface TransferFormData {
  fromAccount: string;
  toAccount: string;
  amount: string;
  note: string;
}

function TransferForm() {
  const [form, setForm] = useState<TransferFormData>({
    fromAccount: '',
    toAccount: '',
    amount: '',
    note: '',
  });

  function handleChange(field: keyof TransferFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <form className="space-y-4">
      <input
        value={form.fromAccount}
        onChange={(e) => handleChange('fromAccount', e.target.value)}
        placeholder="From Account"
      />
      <input
        value={form.toAccount}
        onChange={(e) => handleChange('toAccount', e.target.value)}
        placeholder="To Account"
      />
      <input
        value={form.amount}
        onChange={(e) => handleChange('amount', e.target.value)}
        placeholder="Amount (PHP)"
        type="number"
      />
      <input
        value={form.note}
        onChange={(e) => handleChange('note', e.target.value)}
        placeholder="Note (optional)"
      />
    </form>
  );
}
```

`{ ...prev, [field]: value }` creates a new object with all previous values, replacing only the changed field. This is called **spreading** — a pattern you will use constantly.

### 3.4 Conditional Rendering

Show different UI based on state:

```tsx
// src/components/AccountVisibility.tsx
import { useState } from 'react';

function AccountBalance({ balance }: { balance: number }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <span className="text-2xl font-bold">
        {isVisible
          ? new Intl.NumberFormat('en-PH', {
              style: 'currency',
              currency: 'PHP',
            }).format(balance)
          : '****'}
      </span>
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="text-sm text-primary underline"
      >
        {isVisible ? 'Hide' : 'Show'}
      </button>
    </div>
  );
}
```

The ternary operator `condition ? trueResult : falseResult` is the standard pattern for conditional rendering in JSX. For banking applications, toggling sensitive data visibility is a common pattern you will implement repeatedly.

### Checkpoint 3

> Why does React require you to use `setCount` instead of directly modifying `count`? What would happen if you wrote `count = count + 1` instead?

---

## Phase 4: Side Effects with useEffect

### 4.1 What Are Side Effects?

A side effect is anything that happens outside the component's rendering. Examples:
- Fetching data from an API
- Setting up a timer or interval
- Subscribing to real-time updates
- Updating the document title
- Logging analytics events

`useEffect` tells React: "Run this code after rendering."

```tsx
// src/components/PageTitle.tsx
import { useEffect } from 'react';

function PageTitle({ title }: { title: string }) {
  useEffect(() => {
    document.title = `${title} | EastWest Bank`;
  }, [title]);

  return <h1>{title}</h1>;
}
```

The second argument `[title]` is the **dependency array**. React only re-runs the effect when `title` changes. If you pass an empty array `[]`, the effect runs once — on mount.

### 4.2 Cleanup: Preventing Memory Leaks

Effects that set up subscriptions, timers, or event listeners must clean up after themselves. Return a cleanup function from the effect:

```tsx
// src/components/SessionTimer.tsx
import { useState, useEffect } from 'react';

function SessionTimer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    // Cleanup: clear the interval when the component unmounts
    return () => clearInterval(interval);
  }, []);

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return (
    <p className="text-sm text-muted-fg">
      Session: {minutes}:{remainingSeconds.toString().padStart(2, '0')}
    </p>
  );
}
```

Without the cleanup (`return () => clearInterval(interval)`), the interval would keep running after the component is removed from the page — a memory leak. In banking applications, session timers are critical for security compliance (BSP Circular 982 requires session management).

### 4.3 Fetching Data with useEffect

A common pattern: fetch data when a component mounts.

```tsx
// src/components/AccountList.tsx
import { useState, useEffect } from 'react';

interface Account {
  id: string;
  name: string;
  balance: number;
  currency: string;
}

function AccountList() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAccounts() {
      try {
        const response = await fetch('/api/accounts');
        if (!response.ok) throw new Error('Failed to fetch accounts');
        const data = await response.json();
        setAccounts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    }

    fetchAccounts();
  }, []);

  if (isLoading) return <p>Loading accounts...</p>;
  if (error) return <p className="text-destructive">Error: {error}</p>;

  return (
    <ul className="space-y-2">
      {accounts.map((account) => (
        <li key={account.id} className="rounded border p-3">
          <span className="font-medium">{account.name}</span>
          <span className="ml-auto">
            {new Intl.NumberFormat('en-PH', {
              style: 'currency',
              currency: account.currency,
            }).format(account.balance)}
          </span>
        </li>
      ))}
    </ul>
  );
}
```

> **Important:** This manual data fetching pattern works, but is verbose and error-prone. In Level 4, you will learn TanStack Query — a library that handles loading states, caching, error handling, and background refetching automatically. For now, understand the underlying mechanics.

### Checkpoint 4

> What happens if you forget the dependency array entirely — writing `useEffect(() => { ... })` without `[]`? Why is this usually a bug?

---

## Phase 5: Accessing the DOM with useRef

### 5.1 When You Need Direct DOM Access

Most of the time, React manages the DOM for you. But sometimes you need direct access:
- Focusing an input field
- Measuring element dimensions
- Integrating with non-React libraries
- Managing scroll position

`useRef` gives you a reference to a DOM element:

```tsx
// src/components/SearchInput.tsx
import { useRef, useEffect } from 'react';

function SearchInput() {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-focus the search input when the component mounts
    inputRef.current?.focus();
  }, []);

  return (
    <input
      ref={inputRef}
      type="search"
      placeholder="Search transactions..."
      className="w-full rounded-md border px-3 py-2"
    />
  );
}
```

In React 19, you pass the ref directly as a prop — no `forwardRef` wrapper needed:

```tsx
// src/components/ui/Input.tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  ref?: React.Ref<HTMLInputElement>;
}

function Input({ label, ref, ...props }: InputProps) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <input ref={ref} className="w-full rounded-md border px-3 py-2" {...props} />
    </div>
  );
}
```

### 5.2 useRef for Values That Do Not Trigger Re-renders

`useRef` can also store values that persist between renders without causing re-renders. This is useful for tracking previous values, timers, or counters:

```tsx
// src/hooks/usePrevious.ts
import { useRef, useEffect } from 'react';

function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}
```

```tsx
// Usage: detect when a balance changes
function AccountBalance({ balance }: { balance: number }) {
  const previousBalance = usePrevious(balance);

  const hasIncreased =
    previousBalance !== undefined && balance > previousBalance;

  return (
    <p className={hasIncreased ? 'text-success' : ''}>
      {formatCurrency(balance)}
    </p>
  );
}
```

### Checkpoint 5

> What is the key difference between `useState` and `useRef`? When would you choose one over the other?

---

## Phase 6: The Mental Model

### 6.1 UI = f(state)

Everything in React follows one equation:

```
UI = f(state)
```

- **State** is the data your application tracks (accounts, user info, form inputs, loading flags)
- **f** is your component tree — the functions that transform state into UI
- **UI** is what the user sees

When state changes, React re-runs your components and updates the DOM. You never manually update the DOM. You update state, and React handles the rest.

This is the single most important concept in React. Every guide that follows builds on this foundation.

### 6.2 React 19 Features

React 19 introduces several features you will encounter throughout these guides:

| Feature | What It Does | Where You'll Learn It |
|---------|-------------|----------------------|
| React Compiler | Automatically memoizes components — no more manual `useMemo`/`useCallback` | B05 (Performance) |
| `ref` as prop | Pass refs directly — no `forwardRef` wrapper | This guide (Phase 5) |
| `useActionState` | Manage form submission state | A07 (Forms) |
| `use` API | Read resources (promises, context) during render | A09 (State Management) |
| Server Components | Components that run on the server (Next.js only) | Part C (deferred) |

### 6.3 What You Will Not Need

React's ecosystem has many tools you will NOT need:

| Tool | Why Not |
|------|---------|
| `useMemo` / `useCallback` | React 19's Compiler handles this automatically |
| `forwardRef` | React 19 accepts `ref` as a regular prop |
| Class components | Legacy pattern — all new code uses functions |
| Redux | Too complex for most use cases — Zustand is simpler (A09) |
| Context API for state management | Causes unnecessary re-renders — Zustand solves this (A09) |
| `fetch` for data fetching | We standardize on Axios throughout these guides (B03) |

---

## Exercises

> **Note:** These exercises require a project to be set up. If you have not completed **B01 — Project Setup** yet, return to these exercises after that guide. You will need a working Vite + React + TypeScript project before writing code.

### Exercise 1: Build a Counter Component

**Objective:** Build a counter that starts at 0, has increment and decrement buttons, and displays the current count.

**File:** `src/components/Counter.tsx`

**Requirements:**
- The count must not go below 0
- Display the count in a `<p>` tag
- Two buttons: "+" and "−"
- Use TypeScript — no `any` types

**Verification:**
```bash
npx tsc --noEmit
```

### Exercise 2: Build a Toggle Component

**Objective:** Build a password visibility toggle for a login form.

**File:** `src/components/PasswordInput.tsx`

**Requirements:**
- An input field that toggles between `type="password"` and `type="text"`
- A button labeled "Show" or "Hide" based on current state
- Auto-focus the input on mount using `useRef`

**Verification:**
```bash
npx tsc --noEmit
```

### Exercise 3: Build a Session Timer with Cleanup

**Objective:** Build a timer that displays how long the user has been on the page, in MM:SS format.

**File:** `src/components/SessionTimer.tsx`

**Requirements:**
- Starts at 00:00 and increments every second
- Uses `useEffect` with proper cleanup
- Formats as "MM:SS" with zero-padding

**Verification:**
```bash
npx tsc --noEmit
```

---

## Key Takeaways

1. **React is declarative** — you describe what the UI should look like, not how to update the DOM
2. **Components are functions** that accept props and return JSX
3. **useState** tracks data that changes over time and triggers re-renders
4. **useEffect** runs side effects (data fetching, timers, subscriptions) with cleanup
5. **useRef** accesses DOM elements or stores values without triggering re-renders
6. **UI = f(state)** — this mental model underpins everything in React

---

## What's Next

**[A02 — TypeScript for React →](../level-01-welcome/A02_typescript-for-react.md)**

Now that you understand React's core concepts, the next guide teaches you TypeScript — the type system that catches bugs before they reach production. You will learn to type props, state, events, and hooks with confidence.
