# Level 1 — Welcome: Answer Key

> **EastWest Bank — Digital Platforms & Innovations**
>
> Quiz Answers + Exercise Solutions

---

## Quiz Answers

### Question 1: B

React lets you describe what the UI should look like for any given data, and handles DOM updates automatically. This is the core of declarative programming — you describe the result, React handles the how.

### Question 2: False

Component names must start with a capital letter. React uses the casing to distinguish between HTML elements (lowercase) and custom components (uppercase). `accountCard` would be interpreted as an HTML element, not a component.

### Question 3 (Short Answer)

`UI = f(state)` means the user interface is a function of the application's state. Given the same state, you always get the same UI. For a banking dashboard, the state includes account balances, user info, and loading flags. When the balance changes (state update), React re-runs the component function and updates the DOM automatically — you never manually change the balance text on screen.

### Question 4: B

`useState` triggers a re-render when updated via its setter function. `useRef` stores a value that persists across renders but does not cause a re-render when changed. Use `useState` for data the user should see (balance, form values). Use `useRef` for DOM references and values you need to track silently (timers, previous values).

### Question 5: B

The convention is: use `interface` for component props (makes prop definitions immediately recognizable) and `type` for unions, computed types, and primitives.

### Question 6: False

TypeScript catches type errors at compile time (when the code is being built), not at runtime. This is precisely its value for banking applications — bugs are caught before the code ever runs in production. For runtime validation, we use Zod.

### Question 7 (Short Answer)

`z.parse()` throws a `ZodError` if validation fails. `z.safeParse()` never throws — it returns `{ success: true, data }` or `{ success: false, error }`. In a banking application, use `safeParse()` for API responses where you want to handle invalid data gracefully (show an error message, log the issue). Use `parse()` for environment variable validation at startup where you want the application to crash immediately if configuration is invalid.

### Question 8: C

`Partial<Account>` makes all properties of `Account` optional. `Pick` selects specific properties, `Omit` excludes specific properties, and `Required` makes all properties required.

### Question 9: B

BSP Circular 1213 (AFASA) requires banks to migrate from SMS-based OTP to phishing-resistant authentication methods (passkeys/FIDO2/WebAuthn) by June 2026. SMS OTP is vulnerable to SIM swapping and social engineering attacks.

### Question 10: True

Under the Data Privacy Act (RA 10173), an IP address is considered personal information because it can directly or indirectly identify a person. This applies to any data that can be linked to an individual.

### Question 11 (Short Answer)

1. **Bangko Sentral ng Pilipinas (BSP)** — The central bank; issues circulars that govern banking operations, IT risk management, authentication, and digital channels.
2. **National Privacy Commission (NPC)** — Enforces the Data Privacy Act (RA 10173); governs collection, storage, and processing of personal information.
3. **Anti-Money Laundering Council (AMLC)** — Enforces AMLA (RA 9160); governs KYC requirements, transaction monitoring, and suspicious transaction reporting.

### Question 12: B

This violates the Data Privacy Act (RA 10173). Account numbers are personal information that must be masked when displayed. The standard pattern is to show only the last 4 digits (e.g., "••••7890") to prevent shoulder surfing and screenshot-based data theft.

---

## Exercise Solutions

### Exercise 1: Currency Formatter Utility

```typescript
// src/lib/currency.ts

type Currency = 'PHP' | 'USD' | 'EUR' | 'JPY' | 'CNY';

/**
 * Format a number as Philippine Peso.
 */
export function formatPHP(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a number in any supported currency.
 */
export function formatCurrency(amount: number, currency: Currency): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency,
    minimumFractionDigits: currency === 'JPY' ? 0 : 2,
    maximumFractionDigits: currency === 'JPY' ? 0 : 2,
  }).format(amount);
}

/**
 * Parse a currency string into a number.
 * Returns null for invalid input.
 */
export function parseCurrencyInput(input: string): number | null {
  // Remove currency symbols, commas, and whitespace
  const cleaned = input.replace(/[₱$€¥,\s]/g, '');

  if (cleaned === '') return null;

  const parsed = Number(cleaned);
  return Number.isNaN(parsed) ? null : parsed;
}
```

**Key points:**
- `Intl.NumberFormat` handles locale-specific formatting automatically
- JPY has no decimal places — the conditional handles this
- `parseCurrencyInput` strips all currency symbols before parsing
- Return type is `number | null`, not `any`

### Exercise 2: Banking Domain Type System

```typescript
// src/types/account.ts

export type AccountType = 'savings' | 'checking' | 'time-deposit' | 'current';
export type AccountStatus = 'active' | 'dormant' | 'frozen' | 'closed';
export type Currency = 'PHP' | 'USD' | 'EUR' | 'JPY' | 'CNY';

export interface Account {
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

export type AccountPreview = Pick<Account, 'id' | 'accountName' | 'balance'>;

export type AccountCreateInput = Omit<
  Account,
  'id' | 'status' | 'openedDate' | 'lastActivityDate'
>;
```

```typescript
// src/schemas/account.ts
import { z } from 'zod';

export const accountSchema = z
  .object({
    id: z.string().min(1),
    accountNumber: z.string().regex(/^\d{10}$/, 'Account number must be 10 digits'),
    accountName: z.string().min(1).max(100),
    type: z.enum(['savings', 'checking', 'time-deposit', 'current']),
    balance: z.number().nonnegative('Balance cannot be negative'),
    availableBalance: z.number().nonnegative('Available balance cannot be negative'),
    currency: z.enum(['PHP', 'USD', 'EUR', 'JPY', 'CNY']),
    status: z.enum(['active', 'dormant', 'frozen', 'closed']),
    openedDate: z.string().datetime(),
    lastActivityDate: z.string().datetime(),
  })
  .refine((data) => data.availableBalance <= data.balance, {
    message: 'Available balance cannot exceed total balance',
    path: ['availableBalance'],
  });

export type Account = z.infer<typeof accountSchema>;
```

**Key points:**
- The Zod schema is defined first, TypeScript type extracted from it
- `refine()` enforces the cross-field constraint
- `path: ['availableBalance']` attaches the error to the correct field

### Exercise 3: Compliance Checklist Builder

```typescript
// src/types/compliance.ts

export type ComplianceArea =
  | 'data-masking'
  | 'authentication'
  | 'accessibility'
  | 'error-monitoring'
  | 'test-coverage'
  | 'transaction-limits'
  | 'consent-management'
  | 'card-security';

export type ComplianceCheck =
  | { status: 'not-started'; area: ComplianceArea }
  | { status: 'in-progress'; area: ComplianceArea; assignee: string }
  | { status: 'passed'; area: ComplianceArea; verifiedBy: string; verifiedAt: string }
  | { status: 'failed'; area: ComplianceArea; reason: string; regulation: string };

const regulationMap: Record<ComplianceArea, string> = {
  'data-masking': 'DPA (RA 10173)',
  authentication: 'BSP Circular 982 / 1213',
  accessibility: 'BSP Circular 1033',
  'error-monitoring': 'BSP Circular 1019',
  'test-coverage': 'BSP Circular 808',
  'transaction-limits': 'AMLA (RA 9160)',
  'consent-management': 'DPA (RA 10173) / BSP Circular 1122',
  'card-security': 'PCI-DSS',
};

export function getRegulationForArea(area: ComplianceArea): string {
  return regulationMap[area];
}

export function summarizeChecklist(
  checks: ComplianceCheck[],
): { passed: number; failed: number; pending: number } {
  let passed = 0;
  let failed = 0;
  let pending = 0;

  for (const check of checks) {
    switch (check.status) {
      case 'passed':
        passed++;
        break;
      case 'failed':
        failed++;
        break;
      case 'not-started':
      case 'in-progress':
        pending++;
        break;
    }
  }

  return { passed, failed, pending };
}
```

**Key points:**
- Discriminated union allows TypeScript to narrow types in the `switch` statement
- `Record<ComplianceArea, string>` ensures every area has a regulation mapped
- The `summarizeChecklist` function groups both `not-started` and `in-progress` as "pending"

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
