# A07 — Forms and Validation

> **EastWest Bank — Digital Platforms & Innovations**
>
> Part A (Core) · Level 3 — Building UI

---

## What You Will Learn

By the end of this guide, you will:

- Build forms with React Hook Form (controlled and performant)
- Validate form data with Zod schemas
- Connect Zod schemas to React Hook Form with @hookform/resolvers
- Implement banking-specific validation (account numbers, amounts, Philippine phone numbers)
- Build a currency formatting utility and debounce hook for search inputs
- Build a beneficiary registration form with Zod-only validation
- Build a multi-step fund transfer wizard
- Mask sensitive data in form fields (DPA compliance)
- Handle form submission states (idle, submitting, success, error)
- Prevent double-submission of financial transactions

---

## Prerequisites

| Requirement | Where |
|------------|-------|
| Completed A02 — TypeScript for React | Level 1 |
| Completed A06 — Design System Foundations | Level 3 |
| React Hook Form + Zod + @hookform/resolvers installed | B01 |

---

## Phase 1 — Why React Hook Form?

### The problem with native forms in React

A controlled form in React re-renders on every keystroke:

```tsx
// Every character typed re-renders the entire component
const [name, setName] = useState('');
const [email, setEmail] = useState('');
const [amount, setAmount] = useState('');

// 3 state variables = potential re-renders on every input
```

For a simple form, this is fine. For a banking form with 15 fields, real-time
validation, and conditional logic — it becomes a performance problem.

### React Hook Form's approach

React Hook Form uses uncontrolled inputs with refs. The form state lives inside
the library, not in your component's state. Re-renders happen only when necessary
(on submission, on validation error changes).

```tsx
import { useForm } from 'react-hook-form';

const { register, handleSubmit, formState: { errors } } = useForm();
```

- `register` — connects an input to the form (via ref)
- `handleSubmit` — wraps your submit handler with validation
- `errors` — contains validation errors per field
- No `useState` for every field

### The Zod connection

Zod validates form data at runtime. The `@hookform/resolvers` package connects
Zod schemas to React Hook Form — define your schema once, get both TypeScript types
and runtime validation.

```tsx
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  accountNumber: z.string().length(10, 'Account number must be 10 digits'),
  amount: z.number().positive('Amount must be positive'),
});

type FormData = z.infer<typeof schema>;

const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
  resolver: zodResolver(schema),
});
```

### Checkpoint 1

Explain why React Hook Form is preferred over managing form state with `useState`
for banking forms with many fields.

---

## Phase 2 — Your First Form

### Simple login form

```tsx
// src/features/auth/components/login-form.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const loginSchema = z.object({
  username: z
    .string()
    .min(1, 'Username is required')
    .max(50, 'Username is too long'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>;
}

export function LoginForm({ onSubmit }: LoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
      noValidate
    >
      <Input
        label="Username"
        {...register('username')}
        error={errors.username?.message}
        autoComplete="username"
      />

      <Input
        label="Password"
        type="password"
        {...register('password')}
        error={errors.password?.message}
        autoComplete="current-password"
      />

      <Button type="submit" isLoading={isSubmitting} className="w-full">
        Sign In
      </Button>
    </form>
  );
}
```

**Key points:**

| Feature | Implementation | Why |
|---------|---------------|-----|
| `noValidate` on form | Disables browser validation | We use Zod, not browser defaults |
| `autoComplete` attributes | `username`, `current-password` | Password managers work correctly |
| `isSubmitting` state | From `formState` | Prevents double-submission |
| Error messages from Zod | `errors.username?.message` | Single source of truth |

### The register function

`register` returns props that connect an input to the form:

```tsx
const { onChange, onBlur, name, ref } = register('username');
// Spreading: <input {...register('username')} />
```

This is why the Input component accepts `ref` as a prop (React 19 pattern from A04).

### Checkpoint 2

Build the login form and verify:
1. Submitting with empty fields shows validation errors
2. The password field requires at least 8 characters
3. The button shows a loading state during submission
4. The button is disabled while submitting

---

## Phase 3 — Banking Validation Patterns

### Philippine phone number

```tsx
const phoneSchema = z
  .string()
  .regex(
    /^(\+63|0)(9\d{9})$/,
    'Enter a valid Philippine mobile number (e.g., +639171234567 or 09171234567)',
  );
```

### Account number

```tsx
const accountNumberSchema = z
  .string()
  .regex(/^\d{10}$/, 'Account number must be exactly 10 digits');
```

### Transfer amount

HTML `<input type="number">` still delivers its value as a **string** to JavaScript (via `e.target.value`). Using `z.number()` alone would reject `"1000"` because it is a string. `z.coerce.number()` converts the string to a number first, _then_ validates.

```tsx
const transferAmountSchema = z.coerce
  .number() // z.coerce converts the input string → number before validation
  .positive('Amount must be greater than zero')
  .max(1_000_000, 'Maximum transfer amount is ₱1,000,000');
// NOTE: This accepts pesos from user input for simplicity.
// In B03, you will learn that money is stored as integer centavos
// to avoid IEEE 754 floating-point errors (e.g., 0.1 + 0.2 !== 0.3).
// The input component accepts pesos; the form's onSubmit converts
// to centavos before sending to the API.
```

> **AMLA Note:** Transaction amount limits must be enforced on both frontend and
> backend. The frontend limit provides user feedback; the backend limit is the
> actual control. Never rely solely on frontend validation for financial limits.

### Cross-field validation with refine

```tsx
const transferSchema = z.object({
  fromAccount: accountNumberSchema,
  toAccount: accountNumberSchema,
  amount: transferAmountSchema,
}).refine(
  (data) => data.fromAccount !== data.toAccount,
  {
    message: 'Source and destination accounts must be different',
    path: ['toAccount'],
  },
);
```

The `refine` method adds validation that depends on multiple fields. The `path`
option tells React Hook Form which field to attach the error to.

### Date validation

```tsx
const dateSchema = z.coerce
  .date()
  .refine((d) => d > new Date(), { message: 'Date must be in the future' })
  .refine(
    (d) => d < new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    { message: 'Date must be within one year' },
  );
// IMPORTANT: Do NOT use `.min(new Date())` — it evaluates `new Date()` once
// at module load time. If the app runs for hours (common in banking ops
// centers), the "now" reference becomes stale. `.refine()` evaluates
// `new Date()` at validation time, so it is always current.
```

### Currency formatting utility

Before building forms that display monetary values, create a formatting utility.
All amounts in this application are stored as **integer centavos** to avoid
floating-point errors. This function handles the conversion and formatting:

```tsx
// src/lib/format.ts
// Input is centavos (integer). ₱100.50 = 10050.
export function formatPHP(centavos: number, locale: string = 'en-PH'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(centavos / 100);
}
```

Using native `Intl.NumberFormat` instead of string concatenation means the function
automatically handles thousand separators (`₱150,000.00`) and locale differences.
You will use `formatPHP()` in form summaries, transaction lists, and receipt screens
throughout the curriculum.

### Debounce hook

Search inputs and filter fields fire on every keystroke. Sending an API request for
every character is wasteful and slow. The `useDebounce` hook delays updates until the
user stops typing:

```tsx
// src/hooks/use-debounce.ts
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
```

Usage in a search form:

```tsx
const [query, setQuery] = useState('');
const debouncedQuery = useDebounce(query, 300); // Wait 300ms after last keystroke

// Only fires API call when debouncedQuery changes, not on every keystroke
useEffect(() => {
  if (debouncedQuery.length >= 2) searchBillers(debouncedQuery);
}, [debouncedQuery]);
```

### Checkpoint 3

Create a Zod schema for a "New Beneficiary" form with:
- Full name (required, 2-100 characters)
- Account number (10 digits)
- Bank name (required)
- Philippine mobile number
- Email (optional, but valid if provided)

File: `src/schemas/beneficiary.ts`

Then build the full `BeneficiaryForm` component that uses this schema. The form
should validate on submit, show field-level errors, and call an `onSubmit` callback
with the validated data:

```tsx
// src/features/beneficiaries/components/beneficiary-form.tsx
import { useState } from 'react';
import { BeneficiarySchema, type Beneficiary } from '@/schemas/beneficiary';
import type { ZodIssue } from 'zod';

interface BeneficiaryFormProps {
  onSubmit: (data: Beneficiary) => void;
}

export function BeneficiaryForm({ onSubmit }: BeneficiaryFormProps) {
  const [errors, setErrors] = useState<ZodIssue[]>([]);
  const [form, setForm] = useState({
    fullName: '',
    accountNumber: '',
    bankName: '',
    mobileNumber: '',
    email: '',
    relationship: 'family' as const,
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    const result = BeneficiarySchema.safeParse(form);
    if (result.success) {
      onSubmit(result.data);
    } else {
      setErrors(result.error.issues);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="space-y-4">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium">
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            value={form.fullName}
            onChange={(e) => handleChange('fullName', e.target.value)}
            className="mt-1 block w-full rounded border px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="accountNumber" className="block text-sm font-medium">
            Account Number
          </label>
          <input
            id="accountNumber"
            type="text"
            value={form.accountNumber}
            onChange={(e) => handleChange('accountNumber', e.target.value)}
            className="mt-1 block w-full rounded border px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="bankName" className="block text-sm font-medium">
            Bank Name
          </label>
          <input
            id="bankName"
            type="text"
            value={form.bankName}
            onChange={(e) => handleChange('bankName', e.target.value)}
            className="mt-1 block w-full rounded border px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="mobileNumber" className="block text-sm font-medium">
            Mobile Number
          </label>
          <input
            id="mobileNumber"
            type="tel"
            value={form.mobileNumber}
            onChange={(e) => handleChange('mobileNumber', e.target.value)}
            className="mt-1 block w-full rounded border px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            Email (optional)
          </label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className="mt-1 block w-full rounded border px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="relationship" className="block text-sm font-medium">
            Relationship
          </label>
          <select
            id="relationship"
            value={form.relationship}
            onChange={(e) => handleChange('relationship', e.target.value)}
            className="mt-1 block w-full rounded border px-3 py-2"
          >
            <option value="family">Family</option>
            <option value="friend">Friend</option>
            <option value="business">Business</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="mt-4 space-y-1">
          {errors.map((err, i) => (
            <p key={i} role="alert" className="text-sm text-red-600">
              {err.message}
            </p>
          ))}
        </div>
      )}

      <button
        type="submit"
        className="mt-6 rounded bg-ewb-purple px-4 py-2 text-white hover:bg-ewb-purple-700"
      >
        Register Beneficiary
      </button>
    </form>
  );
}
```

This form demonstrates **Zod validation without React Hook Form**. You use
`safeParse()` directly in the submit handler and manage errors in state. In Phase 4,
you will see how React Hook Form eliminates this boilerplate with `zodResolver`.

---

## Phase 4 — The Fund Transfer Form

### Building up to the wizard

Before looking at the full wizard, let's understand each concept it uses.
If you try to read 220 lines of code that combines 8 patterns at once, you
will struggle. Instead, we will introduce each piece and *then* show how
they fit together.

**Concept 1 — Multi-step state.** A wizard is just a component that renders
different content based on a `step` state variable:

```tsx
type Step = 'details' | 'amount' | 'review';
const [step, setStep] = useState<Step>('details');

// Render different UI based on step
if (step === 'details') return <DetailsStep />;
if (step === 'amount') return <AmountStep />;
return <ReviewStep />;
```

**Concept 2 — Per-step validation.** Before advancing, validate only the
fields relevant to the current step using React Hook Form's `trigger()`:

```tsx
const { trigger } = useForm<TransferData>({ resolver: zodResolver(schema) });

const goToNextStep = async () => {
  const fieldsToValidate: (keyof TransferData)[] =
    step === 'details' ? ['fromAccount', 'toAccount', 'recipientName'] : ['amount'];
  const isValid = await trigger(fieldsToValidate);
  if (isValid) setStep(nextStep);
};
```

**Concept 3 — `watch()` for the review step.** React Hook Form's `watch()`
gives you live access to form values without triggering re-renders for every
keystroke (only the watched fields cause re-renders):

```tsx
const formValues = watch(); // Read all form values
// Use in review: formValues.recipientName, formValues.amount, etc.
```

**Concept 4 — Compliance patterns.** Banking forms mask account numbers in
review screens, enforce transfer limits via Zod, and disable the submit
button while submitting to prevent double-charges.

With these four concepts clear, the full wizard below should be readable.
Each section is marked with comments showing which concept applies.

### Multi-step wizard

Banking forms often collect data in steps. A fund transfer needs:
1. Select source account
2. Enter recipient details
3. Enter amount and notes
4. Review and confirm

```tsx
// src/features/transfers/components/transfer-wizard.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardBody, CardFooter } from '@/components/ui/card';

// ── Schema ──────────────────────────────────────────
const transferSchema = z.object({
  fromAccount: z.string().regex(/^\d{10}$/, 'Select a source account'),
  toAccount: z.string().regex(/^\d{10}$/, 'Enter a valid account number'),
  recipientName: z.string().min(2, 'Recipient name is required'),
  amount: z.coerce
    .number()
    .positive('Amount must be greater than zero')
    .max(1_000_000, 'Maximum transfer is ₱1,000,000'), // Pesos from user input; converted to centavos in onSubmit
  notes: z.string().max(100, 'Notes cannot exceed 100 characters').optional(),
}).refine(
  (data) => data.fromAccount !== data.toAccount,
  { message: 'Cannot transfer to the same account', path: ['toAccount'] },
);

type TransferData = z.infer<typeof transferSchema>;

// ── Component ───────────────────────────────────────
type Step = 'details' | 'amount' | 'review';

interface TransferWizardProps {
  accounts: Array<{ number: string; name: string; balance: number }>;
  onSubmit: (data: TransferData) => Promise<void>;
}

export function TransferWizard({ accounts, onSubmit }: TransferWizardProps) {
  const [step, setStep] = useState<Step>('details');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    trigger,
  } = useForm<TransferData>({
    resolver: zodResolver(transferSchema),
    mode: 'onBlur',
  });

  const formValues = watch();

  // Validate current step before advancing
  const goToNextStep = async () => {
    let fieldsToValidate: (keyof TransferData)[] = [];

    if (step === 'details') {
      fieldsToValidate = ['fromAccount', 'toAccount', 'recipientName'];
    } else if (step === 'amount') {
      fieldsToValidate = ['amount'];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      if (step === 'details') setStep('amount');
      else if (step === 'amount') setStep('review');
    }
  };

  const goToPreviousStep = () => {
    if (step === 'amount') setStep('details');
    else if (step === 'review') setStep('amount');
  };

  // ── Step: Details ─────────────────────────────────
  if (step === 'details') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Step 1: Transfer Details</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="fromAccount" className="block text-sm font-medium text-gray-700">
                From Account
              </label>
              <select
                id="fromAccount"
                {...register('fromAccount')}
                className="block w-full rounded-lg border border-gray-300 px-4 py-2"
              >
                <option value="">Select an account</option>
                {accounts.map((acc) => (
                  <option key={acc.number} value={acc.number}>
                    {acc.name} (••••{acc.number.slice(-4)}) — ₱{acc.balance.toLocaleString('en-PH')}
                  </option>
                ))}
              </select>
              {errors.fromAccount != null && (
                <p className="text-sm text-error">{errors.fromAccount.message}</p>
              )}
            </div>

            <Input
              label="Recipient Account Number"
              {...register('toAccount')}
              error={errors.toAccount?.message}
              placeholder="Enter 10-digit account number"
              inputMode="numeric"
            />

            <Input
              label="Recipient Name"
              {...register('recipientName')}
              error={errors.recipientName?.message}
            />
          </div>
        </CardBody>
        <CardFooter>
          <Button type="button" onClick={goToNextStep}>
            Continue
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // ── Step: Amount ──────────────────────────────────
  if (step === 'amount') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Step 2: Amount</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <Input
              label="Transfer Amount (₱)"
              type="number"
              {...register('amount')}
              error={errors.amount?.message}
              placeholder="0.00"
              step="0.01"
              min="0"
            />

            <Input
              label="Notes (optional)"
              {...register('notes')}
              error={errors.notes?.message}
              placeholder="Payment for..."
            />
          </div>
        </CardBody>
        <CardFooter>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={goToPreviousStep}>
              Back
            </Button>
            <Button type="button" onClick={goToNextStep}>
              Review
            </Button>
          </div>
        </CardFooter>
      </Card>
    );
  }

  // ── Step: Review ──────────────────────────────────
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>Step 3: Review Transfer</CardTitle>
        </CardHeader>
        <CardBody>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">From</dt>
              <dd className="text-sm font-medium">
                ••••{formValues.fromAccount?.slice(-4)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">To</dt>
              <dd className="text-sm font-medium">
                {formValues.recipientName} (••••{formValues.toAccount?.slice(-4)})
              </dd>
            </div>
            <div className="flex justify-between border-t pt-3">
              <dt className="text-sm text-gray-500">Amount</dt>
              <dd className="text-lg font-bold">
                ₱{formValues.amount?.toLocaleString('en-PH', {
                  minimumFractionDigits: 2,
                })}
              </dd>
            </div>
            {formValues.notes != null && formValues.notes !== '' && (
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Notes</dt>
                <dd className="text-sm">{formValues.notes}</dd>
              </div>
            )}
          </dl>
        </CardBody>
        <CardFooter>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={goToPreviousStep}>
              Back
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Confirm Transfer
            </Button>
          </div>
        </CardFooter>
      </Card>
    </form>
  );
}
```

**Compliance features in this form:**

| Feature | Regulation |
|---------|-----------|
| Account numbers masked in review | DPA |
| Amount limit enforced | AMLA |
| Cannot transfer to same account | Business logic |
| Step validation before advancing | BSP 1033 — clear user flow |
| Double-submission prevented | `isSubmitting` disables button |
| Review step before confirmation | BSP 1033 — transaction confirmation |

### Checkpoint 4

Build the TransferWizard and test the complete flow:
1. Select source account
2. Enter recipient details
3. Enter amount
4. Review masked account numbers
5. Confirm transfer

Verify that you cannot advance without filling required fields.

---

## Phase 5 — Data Masking in Forms

### Input masking utility

```tsx
// src/lib/masking.ts

/** Mask all but last N characters */
export function maskValue(value: string, visibleChars = 4): string {
  if (value.length <= visibleChars) return value;
  const masked = '•'.repeat(value.length - visibleChars);
  return masked + value.slice(-visibleChars);
}

/** Mask account number: ••••7890 */
export function maskAccountNumber(accountNumber: string): string {
  return maskValue(accountNumber, 4);
}

/** Mask email: j••••s@email.com */
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (local == null || domain == null) return email;
  if (local.length <= 2) return `${local[0]}•@${domain}`;
  return `${local[0]}${'•'.repeat(local.length - 2)}${local.slice(-1)}@${domain}`;
}

/** Mask phone: +63 917 ••• 4567 */
export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 7) return phone;
  const visible = digits.slice(-4);
  const countryCode = digits.slice(0, 2); // 63
  const networkCode = digits.slice(2, 5); // 917
  return `+${countryCode} ${networkCode} ${'•'.repeat(3)} ${visible}`;
}

/** Format and mask card number: •••• •••• •••• 9012 */
export function maskCardNumber(cardNumber: string): string {
  const digits = cardNumber.replace(/\D/g, '');
  const last4 = digits.slice(-4);
  return `•••• •••• •••• ${last4}`;
}
```

> **DPA (RA 10173) Note:** Data masking is a legal requirement for displaying personal
> information. The full value should only be revealed when the user explicitly requests
> it (e.g., clicking a "Show" button) and only for the duration needed.

### Toggle visibility pattern

```tsx
// src/components/ui/masked-value.tsx
import { useState } from 'react';

interface MaskedValueProps {
  value: string;
  maskedValue: string;
  label: string;
}

export function MaskedValue({ value, maskedValue, label }: MaskedValueProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <span className="font-mono">
        {isVisible ? value : maskedValue}
      </span>
      <button
        type="button"
        onClick={() => setIsVisible((prev) => !prev)}
        className="text-sm text-ewb-purple hover:underline"
        aria-label={isVisible ? `Hide ${label}` : `Show ${label}`}
      >
        {isVisible ? 'Hide' : 'Show'}
      </button>
    </div>
  );
}
```

### Checkpoint 5

Create a "Beneficiary Details" display that shows:
- Name (full)
- Account number (masked, with show/hide toggle)
- Email (masked)
- Phone (masked)

Verify that clicking "Show" reveals the full value and "Hide" masks it again.

---

## Phase 6 — Form Error Handling

### Submission error states

```tsx
// src/features/transfers/hooks/use-transfer.ts
import { useState } from 'react';

interface TransferError {
  code: string;
  message: string;
  field?: string;
}

type TransferStatus = 'idle' | 'submitting' | 'success' | 'error';

export function useTransfer() {
  const [status, setStatus] = useState<TransferStatus>('idle');
  const [error, setError] = useState<TransferError | null>(null);

  const submitTransfer = async (data: {
    fromAccount: string;
    toAccount: string;
    amount: number;
  }) => {
    setStatus('submitting');
    setError(null);

    try {
      // API call will be implemented in B03
      // For now, simulate a network request
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setStatus('success');
    } catch (err) {
      setStatus('error');
      setError({
        code: 'TRANSFER_FAILED',
        message: 'The transfer could not be completed. Please try again.',
      });
    }
  };

  const reset = () => {
    setStatus('idle');
    setError(null);
  };

  return { status, error, submitTransfer, reset };
}
```

### Displaying form-level errors

```tsx
import { Alert } from '@/components/ui/alert';

// Inside the form component:
{error != null && (
  <Alert variant="error" title="Transfer Failed">
    {error.message}
  </Alert>
)}
```

> **BSP 1019 Note:** Form errors must be logged for incident detection. While the
> user sees a friendly message, the actual error details should be captured by your
> monitoring system. Never show stack traces or internal error codes to users.

### Preventing double submission

The `isSubmitting` state from React Hook Form automatically handles this. But for
critical financial operations, add an additional safeguard:

```tsx
const [hasSubmitted, setHasSubmitted] = useState(false);

const handleConfirm = async (data: TransferData) => {
  if (hasSubmitted) return; // Guard against race conditions
  setHasSubmitted(true);

  try {
    await onSubmit(data);
  } catch {
    setHasSubmitted(false); // Allow retry on error
  }
};
```

---

## Key Takeaways

1. **React Hook Form + Zod** is the standard pattern for EWB forms. Define the schema
   once — get TypeScript types and runtime validation.

2. **Multi-step forms** validate per step using `trigger()`. Users cannot advance
   without passing validation.

3. **Data masking is mandatory** for any field displaying personal information.
   Account numbers, emails, phone numbers — mask first, reveal on demand.

4. **Prevent double submission** on financial forms. Use `isSubmitting` and an
   additional guard for critical operations.

5. **Cross-field validation** uses Zod's `refine()`. Source and destination accounts
   must be different.

6. **Amount validation** enforces limits on the frontend for UX, but the backend
   is the actual control (AMLA compliance).

7. **noValidate on forms** — always disable browser validation when using Zod.
   Browser validation varies across browsers and cannot be styled consistently.

---

## Exercises

### Exercise 1 — Bill Payment Form

Build a bill payment form with fields:
- Biller (select from a list)
- Account/Reference number
- Amount (with min/max based on selected biller)
- Payment date (future dates only)

Use Zod schema with `refine` for biller-specific validation rules.

### Exercise 2 — Profile Update Form

Build a profile update form with:
- Full name, email, phone number
- All fields pre-populated with existing values
- Philippine phone number validation
- Confirmation dialog before submission

Use `defaultValues` in React Hook Form to pre-populate fields.

### Exercise 3 — Amount Formatter

Build a custom `CurrencyInput` component that:
- Accepts numeric input only
- Formats the display as ₱XX,XXX.XX while typing
- Stores the raw numeric value in the form state
- Shows validation errors from the Zod schema

This requires `Controller` from React Hook Form for custom input components.
Unlike `register` (which works with native `<input>` elements), `Controller`
wraps custom components that manage their own value:

```tsx
import { Controller, useForm } from 'react-hook-form';

<Controller
  name="amount"
  control={control}
  render={({ field, fieldState }) => (
    <CurrencyInput
      value={field.value}
      onChange={field.onChange}
      onBlur={field.onBlur}
      error={fieldState.error?.message}
    />
  )}
/>
```

See the [React Hook Form Controller docs](https://react-hook-form.com/docs/usecontroller)
for the full API.

---

## What Comes Next

You can now build validated, multi-step forms with data masking. The next guide
covers accessibility — making these forms usable for everyone.

**Next guide:** [A08 — Accessibility Essentials](A08_accessibility-essentials.md)
— where you learn WCAG 2.1 AA compliance, keyboard navigation, focus management,
and screen reader support for banking interfaces.

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
