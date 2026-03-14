# A02 — TypeScript for React

> **EastWest Bank — Digital Platforms & Innovations**
>
> Part A (Core) · Level 1 — Welcome · Est. 3 hours

---

## What You Will Learn

By the end of this guide, you will be able to:

1. Configure TypeScript in strict mode for a React project
2. Type component props using interfaces
3. Use generics to type hooks and utility functions
4. Create Zod schemas for runtime validation
5. Model complex state with discriminated unions
6. Apply utility types (Pick, Omit, Partial, Record) to real banking interfaces

---

## Prerequisites

| Requirement | Where |
|------------|-------|
| Completed A01 — What Is React | Level 1 |

---

## Phase 1: TypeScript Fundamentals for React Developers

### 1.1 What TypeScript Adds to JavaScript

TypeScript is JavaScript with **types**. Types describe the shape of your data — what properties an object has, what arguments a function accepts, what it returns.

Why does this matter for banking applications?

```typescript
// Without TypeScript — this bug ships to production
function transferFunds(from, to, amount) {
  // Someone passes amount as a string: "1000"
  // The math breaks silently: "1000" + 500 = "1000500"
  return api.transfer(from, to, amount + processingFee);
}

// With TypeScript — this bug is caught at compile time
function transferFunds(from: string, to: string, amount: number): Promise<TransferResult> {
  return api.transfer(from, to, amount + processingFee);
  // TypeScript ensures amount is always a number
}
```

In a banking application, a type error can mean a customer loses money. TypeScript catches these errors before the code ever runs.

### 1.2 Types vs Interfaces

TypeScript has two ways to define object shapes: `type` and `interface`. Both work, but we follow a simple convention:

- **Interfaces** for component props and objects that might be extended
- **Types** for unions, primitives, and everything else

```typescript
// Interface — for component props
interface AccountCardProps {
  accountName: string;
  accountNumber: string;
  balance: number;
  currency: string;
}

// Type — for unions
type TransactionStatus = 'pending' | 'completed' | 'failed' | 'reversed';

// Type — for computed types
type AccountSummary = Pick<AccountCardProps, 'accountName' | 'balance'>;
```

> **Convention:** Throughout these guides, we always use `interface` for component props. This makes it immediately clear what is a prop definition versus a general type.

### 1.3 Primitive Types

The types you will use most often:

```typescript
// Basic types
const accountName: string = 'Maria Santos';
const balance: number = 125430.50;
const isActive: boolean = true;
const createdAt: Date = new Date('2024-01-15');

// Arrays
const transactions: Transaction[] = [];
const accountIds: string[] = ['ACC001', 'ACC002'];

// Null and undefined
const middleName: string | null = null;      // Might not have one
const nickname: string | undefined = undefined; // Optional

// Literal types
const currency: 'PHP' | 'USD' = 'PHP';
const status: 'active' | 'closed' = 'active';
```

### 1.4 Functions

Type both parameters and return values:

```typescript
// Simple function
function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency,
  }).format(amount);
}

// Arrow function
const maskAccountNumber = (accountNumber: string): string => {
  return `****${accountNumber.slice(-4)}`;
};

// Function that returns nothing
function logAuditEvent(action: string, resource: string): void {
  console.log(`[AUDIT] ${action} on ${resource} at ${new Date().toISOString()}`);
}

// Async function
async function fetchAccount(id: string): Promise<Account> {
  const response = await axios.get(`/api/accounts/${id}`);
  return response.data;
}
```

### Checkpoint 1

> What is the difference between `string | null` and `string | undefined`? When would you use each in a banking application?

---

## Phase 2: Typing React Components

### 2.1 Component Props

Every React component's props should have an interface:

```tsx
// src/components/TransactionRow.tsx
interface TransactionRowProps {
  id: string;
  description: string;
  amount: number;
  currency: string;
  type: 'credit' | 'debit';
  date: Date;
  status: 'pending' | 'completed' | 'failed';
}

function TransactionRow({
  description,
  amount,
  currency,
  type,
  date,
  status,
}: TransactionRowProps) {
  const formattedAmount = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency,
  }).format(amount);

  return (
    <div className="flex items-center justify-between border-b py-3">
      <div>
        <p className="font-medium">{description}</p>
        <p className="text-sm text-muted-fg">
          {date.toLocaleDateString('en-PH')}
        </p>
      </div>
      <div className="text-right">
        <p className={type === 'credit' ? 'text-success' : 'text-destructive'}>
          {type === 'credit' ? '+' : '−'}{formattedAmount}
        </p>
        <p className="text-xs text-muted-fg capitalize">{status}</p>
      </div>
    </div>
  );
}
```

### 2.2 Optional Props and Default Values

Some props are not always required:

```tsx
// src/components/ui/Button.tsx
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
}

function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
}: ButtonProps) {
  return (
    <button
      className={`rounded-md font-medium ${getVariantClasses(variant)} ${getSizeClasses(size)}`}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? <Spinner /> : children}
    </button>
  );
}
```

The `?` marks a prop as optional. Default values (`variant = 'primary'`) handle the case when the prop is not provided.

### 2.3 Event Handlers

React provides TypeScript types for every DOM event:

```tsx
// src/components/SearchBar.tsx
function SearchBar() {
  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const query = event.target.value;
    // TypeScript knows event.target is an HTMLInputElement
    // So event.target.value is guaranteed to be a string
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // TypeScript knows this is a form event
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      // TypeScript knows event.key is a string
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Search transactions..."
      />
    </form>
  );
}
```

Common event types:

| Event | Type | When |
|-------|------|------|
| `onChange` | `React.ChangeEvent<HTMLInputElement>` | Input value changes |
| `onClick` | `React.MouseEvent<HTMLButtonElement>` | Element clicked |
| `onSubmit` | `React.FormEvent<HTMLFormElement>` | Form submitted |
| `onKeyDown` | `React.KeyboardEvent<HTMLInputElement>` | Key pressed |
| `onFocus` | `React.FocusEvent<HTMLInputElement>` | Element gains focus |
| `onBlur` | `React.FocusEvent<HTMLInputElement>` | Element loses focus |

### 2.4 Children Props

When a component wraps other content:

```tsx
// src/components/layout/PageSection.tsx
interface PageSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;  // Accepts any renderable content
}

function PageSection({ title, description, children }: PageSectionProps) {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold">{title}</h2>
      {description && (
        <p className="mt-1 text-muted-fg">{description}</p>
      )}
      <div className="mt-4">{children}</div>
    </section>
  );
}
```

`React.ReactNode` is the type for anything React can render: strings, numbers, elements, arrays, fragments, `null`, `undefined`, and booleans.

### 2.5 Extending HTML Element Props

When building custom components that wrap HTML elements, extend the built-in props:

```tsx
// src/components/ui/Input.tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <input
        className={`w-full rounded-md border px-3 py-2 ${
          error ? 'border-destructive' : 'border-input'
        } ${className ?? ''}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
    </div>
  );
}
```

By extending `React.InputHTMLAttributes`, your `Input` component automatically accepts every standard HTML input attribute (`type`, `placeholder`, `disabled`, `maxLength`, etc.) — plus your custom `label` and `error` props.

### Checkpoint 2

> Why do we use `React.ReactNode` instead of `string` for the `children` prop? Give an example where `string` would break.

---

## Phase 3: Generics in React

> **Pacing note:** Phases 3 and 4 introduce intermediate TypeScript patterns
> (generics, discriminated unions) that you will use heavily from Level 3
> onward. If these feel overwhelming on first read, that is normal — skim
> them now to recognize the syntax, then come back after Levels 2–3 when
> you have more React context. The critical takeaways for now are:
> **useState needs explicit types when the initial value is null or empty**
> (Section 3.2) and **interfaces define the shape of your data** (Section 4.1).

### 3.1 What Are Generics?

Generics let you write code that works with any type while still being type-safe:

```typescript
// Without generics — only works for strings
function firstElement(arr: string[]): string | undefined {
  return arr[0];
}

// With generics — works for any type
function firstElement<T>(arr: T[]): T | undefined {
  return arr[0];
}

// Usage
const firstAccount = firstElement(['ACC001', 'ACC002']); // type: string
const firstBalance = firstElement([1000, 2000, 3000]);    // type: number
```

`<T>` is a type parameter — a placeholder that gets filled in when the function is called. TypeScript infers `T` from the argument.

### 3.2 Typing useState with Generics

`useState` is a generic function. TypeScript usually infers the type from the initial value:

```tsx
// TypeScript infers these types
const [count, setCount] = useState(0);              // number
const [name, setName] = useState('');                // string
const [isOpen, setIsOpen] = useState(false);         // boolean
const [accounts, setAccounts] = useState<Account[]>([]); // Account[] (explicit needed for empty array)
```

When the initial value does not fully describe the type, specify it explicitly:

```tsx
// Type must be specified — null initial value
const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

// Type must be specified — the initial value is empty
const [error, setError] = useState<string | null>(null);

// Type must be specified — union type
const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
```

### 3.3 Typing useRef

`useRef` is also generic:

```tsx
// DOM element reference — null initial value
const inputRef = useRef<HTMLInputElement>(null);
const formRef = useRef<HTMLFormElement>(null);
const divRef = useRef<HTMLDivElement>(null);

// Mutable value reference
const timerRef = useRef<number>(0);
const previousBalanceRef = useRef<number | undefined>(undefined);
```

### 3.4 Generic Components

Components can also accept type parameters:

```tsx
// src/components/DataList.tsx
interface DataListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
}

function DataList<T>({
  items,
  renderItem,
  keyExtractor,
  emptyMessage = 'No items found',
}: DataListProps<T>) {
  if (items.length === 0) {
    return <p className="text-center text-muted-fg">{emptyMessage}</p>;
  }

  return (
    <ul className="divide-y">
      {items.map((item, index) => (
        <li key={keyExtractor(item)}>{renderItem(item, index)}</li>
      ))}
    </ul>
  );
}
```

```tsx
// Usage — TypeScript infers T as Account
<DataList
  items={accounts}
  keyExtractor={(account) => account.id}
  renderItem={(account) => (
    <div className="py-2">
      <span>{account.name}</span>
      <span>{formatCurrency(account.balance)}</span>
    </div>
  )}
  emptyMessage="No accounts found"
/>
```

### Checkpoint 3

> When you write `useState<Account | null>(null)`, why can you not just write `useState(null)` and let TypeScript infer the type?

---

## Phase 4: Modeling Banking Data with Types

### 4.1 Interfaces for Domain Objects

Define clear interfaces for your banking domain:

```typescript
// src/types/account.ts
interface Account {
  id: string;
  accountNumber: string;
  accountName: string;
  type: AccountType;
  balance: number;
  availableBalance: number;
  currency: Currency;
  status: AccountStatus;
  openedDate: string;
  lastActivityDate: string;
}

type AccountType = 'savings' | 'checking' | 'time-deposit' | 'current';
type AccountStatus = 'active' | 'dormant' | 'frozen' | 'closed';
type Currency = 'PHP' | 'USD' | 'EUR' | 'JPY' | 'CNY';
```

```typescript
// src/types/transaction.ts
interface Transaction {
  id: string;
  accountId: string;
  type: TransactionType;
  amount: number;
  currency: Currency;
  description: string;
  referenceNumber: string;
  status: TransactionStatus;
  createdAt: string;
  processedAt: string | null;
  metadata: TransactionMetadata;
}

type TransactionType = 'credit' | 'debit' | 'transfer' | 'payment' | 'fee';

type TransactionStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'reversed'
  | 'cancelled';

interface TransactionMetadata {
  channel: 'web' | 'mobile' | 'atm' | 'branch';
  ipAddress?: string;
  deviceId?: string;
}
```

### 4.2 Discriminated Unions for State Machines

Banking transactions move through defined states. Discriminated unions model this perfectly:

```typescript
// src/types/transfer.ts
type TransferState =
  | { status: 'idle' }
  | { status: 'validating'; fromAccount: string; toAccount: string; amount: number }
  | { status: 'confirming'; summary: TransferSummary }
  | { status: 'processing'; transactionId: string }
  | { status: 'completed'; transactionId: string; completedAt: string }
  | { status: 'failed'; error: TransferError };

interface TransferSummary {
  fromAccount: string;
  toAccount: string;
  amount: number;
  currency: Currency;
  fee: number;
  total: number;
}

interface TransferError {
  code: string;
  message: string;
  retryable: boolean;
}
```

The power of discriminated unions: TypeScript narrows the type based on the `status` field:

```tsx
// src/components/TransferStatus.tsx
function TransferStatus({ state }: { state: TransferState }) {
  switch (state.status) {
    case 'idle':
      return <p>Ready to transfer</p>;

    case 'validating':
      // TypeScript knows state has fromAccount, toAccount, amount
      return <p>Validating transfer of {formatCurrency(state.amount)}...</p>;

    case 'confirming':
      // TypeScript knows state has summary
      return (
        <div>
          <p>Total: {formatCurrency(state.summary.total)}</p>
          <p>Fee: {formatCurrency(state.summary.fee)}</p>
        </div>
      );

    case 'processing':
      // TypeScript knows state has transactionId
      return <p>Processing... Ref: {state.transactionId}</p>;

    case 'completed':
      // TypeScript knows state has transactionId and completedAt
      return <p>Completed at {state.completedAt}</p>;

    case 'failed':
      // TypeScript knows state has error
      return (
        <div className="text-destructive">
          <p>{state.error.message}</p>
          {state.error.retryable && <button>Retry</button>}
        </div>
      );

    default: {
      const _exhaustive: never = state;
      return _exhaustive;
    }
  }
}
```

If you add a new status later (like `'cancelled'`), the `default` case will trigger a compile error — `never` cannot be assigned to the new variant. This is called **exhaustive checking** — it prevents bugs when your state machine evolves. Note that TypeScript does not warn about missing `switch` cases on its own; you need the `default: never` pattern (or enable the ESLint `switch-exhaustiveness-check` rule) to enforce it.

### 4.3 Utility Types

TypeScript's built-in utility types save you from redefining the same shapes:

```typescript
// Pick — select specific properties
type AccountPreview = Pick<Account, 'id' | 'accountName' | 'balance'>;
// Result: { id: string; accountName: string; balance: number }

// Omit — exclude specific properties
type AccountCreateInput = Omit<Account, 'id' | 'status' | 'openedDate' | 'lastActivityDate'>;
// Result: everything except the omitted fields

// Partial — make all properties optional
type AccountUpdate = Partial<Account>;
// Result: { id?: string; accountName?: string; balance?: number; ... }

// Required — make all properties required
type RequiredAccount = Required<AccountUpdate>;

// Record — define an object with known keys
type CurrencyRates = Record<Currency, number>;
// Result: { PHP: number; USD: number; EUR: number; JPY: number; CNY: number }

// Readonly — prevent mutation
type FrozenAccount = Readonly<Account>;
// Attempting to modify any property causes a TypeScript error
```

Real-world usage — API response types:

```typescript
// src/types/api.ts
interface ApiResponse<T> {
  data: T;
  meta: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

// Usage
type AccountListResponse = ApiResponse<Account[]>;
type TransactionResponse = ApiResponse<Transaction>;
```

### Checkpoint 4

> You have an `Account` interface with 10 properties. You need a type for updating an account where all fields are optional except `id` (which is required). How would you define this using utility types?

---

## Phase 5: Runtime Validation with Zod

### 5.1 Why TypeScript Is Not Enough

TypeScript checks types at **compile time**. But data from APIs, forms, and URL parameters arrives at **runtime** — TypeScript cannot validate it:

```typescript
// TypeScript trusts this completely — but what if the API returns garbage?
const account: Account = await response.json();
// If the API returns { id: 123 } instead of { id: "ACC001" }, TypeScript does not catch it
```

**Zod** validates data at runtime. If the data does not match the schema, Zod throws a clear error instead of letting corrupt data flow through your application.

### 5.2 Defining Schemas

```typescript
// src/schemas/account.ts
import { z } from 'zod';

export const accountSchema = z.object({
  id: z.string().min(1),
  accountNumber: z.string().regex(/^\d{10}$/, 'Account number must be 10 digits'),
  accountName: z.string().min(1).max(100),
  type: z.enum(['savings', 'checking', 'time-deposit', 'current']),
  balance: z.number().nonnegative(),
  availableBalance: z.number().nonnegative(),
  currency: z.enum(['PHP', 'USD', 'EUR', 'JPY', 'CNY']),
  status: z.enum(['active', 'dormant', 'frozen', 'closed']),
  openedDate: z.string().datetime(),
  lastActivityDate: z.string().datetime(),
});

// Extract the TypeScript type FROM the Zod schema
export type Account = z.infer<typeof accountSchema>;
```

The key insight: **define the Zod schema first, then extract the TypeScript type from it.** This way, your runtime validation and compile-time types are always in sync.

### 5.3 Validating API Responses

```typescript
// src/services/accountService.ts
import axios from 'axios';
import { z } from 'zod';
import { accountSchema } from '../schemas/account';

const accountListSchema = z.array(accountSchema);

export async function fetchAccounts(): Promise<Account[]> {
  const response = await axios.get('/api/accounts');

  // Validate the response data at runtime
  const result = accountListSchema.safeParse(response.data);

  if (!result.success) {
    // Log the validation error for debugging (never log PII)
    console.error('API response validation failed:', result.error.issues);
    throw new Error('Invalid account data received from server');
  }

  return result.data; // Fully validated and typed
}
```

`safeParse` returns either `{ success: true, data: T }` or `{ success: false, error: ZodError }`. It never throws — you decide how to handle invalid data.

### 5.4 Form Validation Schemas

Zod schemas work directly with React Hook Form (you will learn this in A07):

```typescript
// src/schemas/transferForm.ts
import { z } from 'zod';

export const transferFormSchema = z.object({
  fromAccount: z.string().min(1, 'Select a source account'),
  toAccount: z.string().min(1, 'Select a destination account'),
  amount: z
    .number({ invalid_type_error: 'Amount must be a number' })
    .positive('Amount must be greater than zero')
    .max(1_000_000, 'Maximum transfer amount is ₱1,000,000'),
  note: z.string().max(200, 'Note must be 200 characters or less').optional(),
}).refine(
  (data) => data.fromAccount !== data.toAccount,
  {
    message: 'Source and destination accounts must be different',
    path: ['toAccount'],
  }
);

export type TransferFormData = z.infer<typeof transferFormSchema>;
```

The `.refine()` method adds custom validation logic — in this case, ensuring you cannot transfer to the same account.

### 5.5 Environment Variable Validation

Never trust environment variables. Validate them at application startup:

```typescript
// src/lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  VITE_API_BASE_URL: z.string().url(),
  VITE_APP_NAME: z.string().default('EastWest Bank'),
  VITE_SENTRY_DSN: z.string().url().optional(),
  VITE_ENABLE_MOCKS: z.stringbool().default('false'),
  VITE_SESSION_TIMEOUT_MS: z.coerce.number().default(900_000), // 15 minutes
});

export const env = envSchema.parse(import.meta.env);
```

If a required environment variable is missing, the application fails immediately at startup with a clear error — instead of crashing at runtime when the missing value is first used.

### Checkpoint 5

> What is the difference between `z.parse()` and `z.safeParse()`? When would you use each in a banking application?

---

## Phase 6: Strict Mode Configuration

### 6.1 The tsconfig.json

Every project in these guides uses TypeScript strict mode. Here is the configuration:

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

Key strict mode flags:

| Flag | What It Does | Why It Matters |
|------|-------------|----------------|
| `strict: true` | Enables all strict type checks | Catches the most bugs |
| `noUncheckedIndexedAccess` | Array access returns `T \| undefined` | Prevents out-of-bounds crashes |
| `noUnusedLocals` | Error on unused variables | Keeps code clean |
| `noUnusedParameters` | Error on unused function parameters | Prevents dead code |
| `noFallthroughCasesInSwitch` | Error on switch fallthrough | Prevents logic bugs |

### 6.2 The `any` Ban

`any` disables TypeScript. In these guides, `any` is **never used**:

```typescript
// NEVER do this
function processData(data: any) { ... }

// Instead, type it properly
function processData(data: unknown) {
  // You must narrow the type before using it
  if (typeof data === 'string') {
    // TypeScript knows data is a string here
  }
}

// Or use Zod for runtime validation
function processData(data: unknown) {
  const result = accountSchema.safeParse(data);
  if (result.success) {
    // TypeScript knows result.data is Account
  }
}
```

`unknown` is the type-safe alternative to `any`. It forces you to validate the data before using it.

---

## Exercises

> **Note:** These exercises require a project to be set up. If you have not completed **B01 — Project Setup** yet, return to these exercises after that guide. You will need a working Vite + React + TypeScript project before writing code.

### Exercise 1: Type a Banking Transaction

**Objective:** Define TypeScript interfaces for a complete banking transaction system.

**File:** `src/types/transaction.ts`

**Requirements:**
- `Transaction` interface with: id, accountId, type, amount, currency, description, referenceNumber, status, createdAt, processedAt, metadata
- `TransactionType` union type: 'credit' | 'debit' | 'transfer' | 'payment' | 'fee'
- `TransactionStatus` union type with at least 5 states
- `TransactionMetadata` interface with channel and optional device info
- Use `Pick` to create a `TransactionPreview` type with only id, description, amount, and status

**Verification:**
```bash
npx tsc --noEmit
```

### Exercise 2: Create a Zod Schema for Account Data

**Objective:** Write a Zod schema that validates account data from an API response.

**File:** `src/schemas/account.ts`

**Requirements:**
- Validate all fields of the Account interface
- Account number must be exactly 10 digits
- Balance must be non-negative
- Currency must be one of: PHP, USD, EUR
- Extract the TypeScript type using `z.infer`
- Include a `.refine()` that ensures availableBalance is less than or equal to balance

**Verification:**
```bash
npx tsc --noEmit
```

### Exercise 3: Type a Custom Hook

**Objective:** Create a typed custom hook called `useToggle`.

**File:** `src/hooks/useToggle.ts`

**Requirements:**
- Accepts an optional `initialValue: boolean` parameter (defaults to `false`)
- Returns `[value: boolean, toggle: () => void, setValue: (value: boolean) => void]`
- All types must be explicit (no type inference for the return type)

**Verification:**
```bash
npx tsc --noEmit
```

---

## BSP Compliance Notes

This guide does not directly implement compliance features, but TypeScript and Zod are foundational to every compliance pattern you will build:

- **BSP Circular 982 (Information Security):** Zod validates all data at system boundaries — preventing injection attacks and data corruption
- **Philippine DPA (RA 10173):** TypeScript interfaces for personal data ensure PII fields are tracked and handled consistently
- **BSP Circular 808 (IT Risk Management):** Strict TypeScript configuration reduces the risk of runtime errors in production

---

## Key Takeaways

1. **Always use strict mode** — it catches the most bugs with zero runtime cost
2. **Interface for props, type for unions** — simple convention that keeps code readable
3. **Generics make code reusable** without sacrificing type safety
4. **Discriminated unions model state machines** — TypeScript narrows types automatically in switch/if blocks
5. **Zod validates at runtime** — TypeScript alone cannot protect against invalid API data
6. **Define Zod schemas first**, extract TypeScript types with `z.infer` — keeps types and validation in sync
7. **Never use `any`** — use `unknown` and narrow the type, or validate with Zod

---

## What's Next

**[A03 — Thinking in Compliance →](./A03_thinking-in-compliance.md)**

You now have React fundamentals (A01) and TypeScript foundations (A02). Before building your first application, the next guide introduces the compliance landscape — why it matters for Philippine banking and how every subsequent guide connects to BSP requirements.
