# Level 3 — Building UI: Answer Key

> **EastWest Bank — Digital Platforms & Innovations**
>
> Quiz Answers + Exercise Solutions

---

## Quiz Answers

### Question 1: B

`cn()` merges Tailwind CSS classes using `clsx` (for conditional class application) and `tailwind-merge` (for resolving conflicting classes). For example, `cn('bg-purple', 'bg-white')` resolves to `'bg-white'` because `tailwind-merge` knows both target `background-color` and keeps the last one.

### Question 2 (Short Answer)

Brand tokens (`ewb-purple`, `ewb-navy`) are fixed color values tied to the EWB visual identity. Semantic tokens (`primary`, `error`, `success`) represent intent — what the color means, not what it looks like. Components use semantic tokens so that if the brand is updated (e.g., primary changes from purple to navy), every component updates automatically by changing one theme line. You never hunt through the codebase replacing hex codes.

### Question 3: B

React Hook Form uses uncontrolled inputs with refs, keeping form state inside the library rather than in component state. This avoids re-rendering the entire component on every keystroke. For banking forms with 15+ fields, real-time validation, and conditional logic, this performance difference is significant.

### Question 4: False

Frontend validation provides user feedback but is never sufficient on its own. Backend validation is the actual security control. A determined user can bypass any frontend validation (browser dev tools, direct API calls). For AMLA compliance, transaction limits must be enforced server-side. Frontend validation is UX; backend validation is security.

### Question 5: B

`refine()` adds custom validation logic that can depend on multiple fields. For example, validating that `fromAccount !== toAccount` requires seeing both field values simultaneously. The `path` option tells React Hook Form which field to attach the error message to.

### Question 6 (Short Answer)

`trigger()` validates specific fields without submitting the form. In a multi-step wizard, you need to validate the current step's fields before allowing the user to advance, but you do not want to submit the form until the final step. `handleSubmit()` is only used on the last step when the user confirms the transfer.

### Question 7: B

The four WCAG 2.1 principles are Perceivable, Operable, Understandable, and Robust (often abbreviated POUR). Perceivable means users can see or hear content. Operable means users can navigate and interact. Understandable means users can comprehend the content. Robust means content works with assistive technologies.

### Question 8: False

The correct approach is to use a `<button>` element instead. Adding `role="button"` to a `<div>` is an anti-pattern because you also need to manually add keyboard handling (Enter/Space), focus management, and other button behaviors that `<button>` provides natively. The first rule of ARIA: no ARIA is better than bad ARIA. Use semantic HTML first.

### Question 9: C

WCAG 2.1 AA requires a minimum contrast ratio of 4.5:1 for normal text (under 18px or under 14px bold). Large text (18px+ or 14px+ bold) requires 3:1. UI components and graphical objects also require 3:1.

### Question 10: B

The native `<dialog>` element with `showModal()` provides automatic focus trapping (Tab stays inside), Escape key to close, backdrop click handling, and focus restoration when closed. Building these behaviors manually with `<div>` is error-prone and frequently misses edge cases. Always prefer native HTML elements for standard interaction patterns.

### Question 11 (Short Answer)

Color-blind users (approximately 8% of men, 0.5% of women) cannot reliably distinguish red from green. Using color as the only status indicator means these users cannot determine whether a transaction succeeded or failed. Always pair color with text labels, icons, or patterns. For example: a green badge with "Active" text, or a red badge with "Failed" text and an error icon.

### Question 12: C

BSP Circular 1033 (Electronic Payment Services) requires that electronic payment services be accessible to all customers. This maps directly to WCAG 2.1 AA compliance for web applications. Accessibility is not optional for banking interfaces.

---

## Exercise Solutions

### Exercise 1: Beneficiary Registration Form

```typescript
// src/schemas/beneficiary.ts
import { z } from 'zod';

export const beneficiarySchema = z.object({
  fullName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters'),
  accountNumber: z
    .string()
    .regex(/^\d{10}$/, 'Account number must be exactly 10 digits'),
  bankName: z.enum(
    [
      'EastWest Bank',
      'BDO Unibank',
      'BPI',
      'Metrobank',
      'UnionBank',
      'China Banking Corporation',
      'Security Bank',
      'RCBC',
    ],
    { errorMap: () => ({ message: 'Select a bank' }) },
  ),
  mobileNumber: z
    .string()
    .regex(
      /^(\+63|0)(9\d{9})$/,
      'Enter a valid Philippine mobile number (e.g., +639171234567)',
    ),
  email: z
    .string()
    .email('Enter a valid email address')
    .optional()
    .or(z.literal('')),
  relationship: z.enum(['family', 'business', 'personal'], {
    errorMap: () => ({ message: 'Select a relationship type' }),
  }),
});

export type BeneficiaryFormData = z.infer<typeof beneficiarySchema>;
```

```tsx
// src/features/beneficiaries/components/beneficiary-form.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';
import { beneficiarySchema, type BeneficiaryFormData } from '@/schemas/beneficiary';

interface BeneficiaryFormProps {
  onSubmit: (data: BeneficiaryFormData) => Promise<void>;
}

export function BeneficiaryForm({ onSubmit }: BeneficiaryFormProps) {
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<BeneficiaryFormData>({
    resolver: zodResolver(beneficiarySchema),
  });

  const handleFormSubmit = async (data: BeneficiaryFormData) => {
    try {
      setSubmitStatus('idle');
      setSubmitError(null);
      await onSubmit(data);
      setSubmitStatus('success');
      reset();
    } catch (err) {
      setSubmitStatus('error');
      setSubmitError(
        err instanceof Error ? err.message : 'Registration failed. Please try again.',
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-6"
      noValidate
    >
      {submitStatus === 'success' && (
        <Alert variant="success" title="Success">
          Beneficiary registered successfully.
        </Alert>
      )}

      {submitStatus === 'error' && submitError != null && (
        <Alert variant="error" title="Registration Failed">
          {submitError}
        </Alert>
      )}

      <Input
        label="Full Name"
        {...register('fullName')}
        error={errors.fullName?.message}
        placeholder="Juan Santos"
      />

      <Input
        label="Account Number"
        {...register('accountNumber')}
        error={errors.accountNumber?.message}
        placeholder="Enter 10-digit account number"
        inputMode="numeric"
        maxLength={10}
      />

      <div className="space-y-1.5">
        <label htmlFor="bankName" className="block text-sm font-medium text-gray-700">
          Bank Name
        </label>
        <select
          id="bankName"
          {...register('bankName')}
          className="block w-full rounded-lg border border-gray-300 px-4 py-2"
        >
          <option value="">Select a bank</option>
          <option value="EastWest Bank">EastWest Bank</option>
          <option value="BDO Unibank">BDO Unibank</option>
          <option value="BPI">BPI</option>
          <option value="Metrobank">Metrobank</option>
          <option value="UnionBank">UnionBank</option>
          <option value="China Banking Corporation">China Banking Corporation</option>
          <option value="Security Bank">Security Bank</option>
          <option value="RCBC">RCBC</option>
        </select>
        {errors.bankName != null && (
          <p className="text-sm text-red-600" role="alert">
            {errors.bankName.message}
          </p>
        )}
      </div>

      <Input
        label="Mobile Number"
        {...register('mobileNumber')}
        error={errors.mobileNumber?.message}
        placeholder="+639171234567"
        type="tel"
      />

      <Input
        label="Email (optional)"
        {...register('email')}
        error={errors.email?.message}
        placeholder="juan@email.com"
        type="email"
      />

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-gray-700">Relationship</legend>
        <div className="flex gap-4">
          {(['family', 'business', 'personal'] as const).map((rel) => (
            <label key={rel} className="flex items-center gap-2">
              <input
                type="radio"
                value={rel}
                {...register('relationship')}
                className="text-ewb-purple focus:ring-ewb-purple"
              />
              <span className="text-sm capitalize">{rel}</span>
            </label>
          ))}
        </div>
        {errors.relationship != null && (
          <p className="text-sm text-red-600" role="alert">
            {errors.relationship.message}
          </p>
        )}
      </fieldset>

      <Button type="submit" isLoading={isSubmitting} className="w-full">
        Register Beneficiary
      </Button>
    </form>
  );
}
```

**Key points:**
- `noValidate` disables browser validation — Zod handles everything
- Radio buttons use `<fieldset>` and `<legend>` for proper accessibility
- Form resets on success using `reset()` from React Hook Form
- Error and success states managed with local state, displayed via `Alert`

### Exercise 2: Masked Data Display Component

```tsx
// src/components/ui/sensitive-field.tsx
import { useState } from 'react';

interface SensitiveFieldProps {
  label: string;
  value: string;
  maskType: 'account' | 'email' | 'phone' | 'card';
}

function maskAccount(value: string): string {
  if (value.length <= 4) return value;
  return '•'.repeat(value.length - 4) + value.slice(-4);
}

function maskEmail(value: string): string {
  const [local, domain] = value.split('@');
  if (local == null || domain == null) return value;
  if (local.length <= 2) return `${local[0]}•@${domain}`;
  return `${local[0]}${'•'.repeat(local.length - 2)}${local.slice(-1)}@${domain}`;
}

function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length < 7) return value;
  const countryCode = digits.slice(0, 2);
  const networkCode = digits.slice(2, 5);
  const lastFour = digits.slice(-4);
  return `+${countryCode} ${networkCode} ••• ${lastFour}`;
}

function maskCard(value: string): string {
  const digits = value.replace(/\D/g, '');
  return `•••• •••• •••• ${digits.slice(-4)}`;
}

const maskFunctions = {
  account: maskAccount,
  email: maskEmail,
  phone: maskPhone,
  card: maskCard,
};

export function SensitiveField({ label, value, maskType }: SensitiveFieldProps) {
  const [isVisible, setIsVisible] = useState(false);

  const maskedValue = maskFunctions[maskType](value);

  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <div className="flex items-center gap-2">
        <span className="font-mono text-sm">
          {isVisible ? value : maskedValue}
        </span>
        <button
          type="button"
          onClick={() => setIsVisible((prev) => !prev)}
          className="text-xs text-ewb-purple hover:underline"
          aria-label={
            isVisible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`
          }
        >
          {isVisible ? 'Hide' : 'Show'}
        </button>
      </div>
    </div>
  );
}
```

### Exercise 3: Accessible Account Selector

```tsx
// src/features/transfers/components/account-selector.tsx
import { useRef, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';

interface Account {
  id: string;
  accountName: string;
  accountNumber: string;
  balance: number;
  type: 'savings' | 'checking' | 'time-deposit';
}

interface AccountSelectorProps {
  accounts: Account[];
  selectedId: string | null;
  onSelect: (accountId: string) => void;
  label: string;
  error?: string;
}

const typeLabels: Record<Account['type'], string> = {
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

export function AccountSelector({
  accounts,
  selectedId,
  onSelect,
  label,
  error,
}: AccountSelectorProps) {
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const errorId = error != null ? 'account-selector-error' : undefined;

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, index: number) => {
      let nextIndex: number | null = null;

      switch (event.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          event.preventDefault();
          nextIndex = (index + 1) % accounts.length;
          break;
        case 'ArrowUp':
        case 'ArrowLeft':
          event.preventDefault();
          nextIndex = (index - 1 + accounts.length) % accounts.length;
          break;
        case ' ':
        case 'Enter':
          event.preventDefault();
          onSelect(accounts[index]!.id);
          return;
      }

      if (nextIndex != null) {
        itemRefs.current[nextIndex]?.focus();
      }
    },
    [accounts, onSelect],
  );

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-gray-700" id="selector-label">
        {label}
      </p>
      <div
        role="radiogroup"
        aria-labelledby="selector-label"
        aria-describedby={errorId}
        className="space-y-2"
      >
        {accounts.map((account, index) => {
          const isSelected = account.id === selectedId;
          return (
            <div
              key={account.id}
              ref={(el) => { itemRefs.current[index] = el; }}
              role="radio"
              aria-checked={isSelected}
              tabIndex={isSelected || (selectedId == null && index === 0) ? 0 : -1}
              onClick={() => onSelect(account.id)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={`cursor-pointer rounded-lg border-2 p-4 transition-colors focus:outline-none focus:ring-2 focus:ring-ewb-purple focus:ring-offset-2 ${
                isSelected
                  ? 'border-ewb-purple bg-ewb-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{account.accountName}</p>
                  <p className="text-sm text-gray-500">
                    ••••{account.accountNumber.slice(-4)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="info">{typeLabels[account.type]}</Badge>
                  <p className="font-semibold">{formatPHP(account.balance)}</p>
                  {isSelected && (
                    <svg
                      className="h-5 w-5 text-ewb-purple"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {error != null && (
        <p id={errorId} className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
```

**Key points:**
- `role="radiogroup"` with `role="radio"` follows the WAI-ARIA radio group pattern
- Arrow keys navigate between options (wrapping at boundaries)
- `tabIndex` logic: selected item (or first if none selected) gets `tabIndex={0}`, others get `-1`
- Focus ring uses EWB purple for visual consistency
- Account numbers are masked in the display
- Error message uses `role="alert"` and is linked via `aria-describedby`
- Checkmark icon has `aria-hidden="true"` since the `aria-checked` attribute conveys selection state

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
