# Level 1 — Welcome: Exercises

> **EastWest Bank — Digital Platforms & Innovations**
>
> Covers: A01 (What Is React), A02 (TypeScript for React), A03 (Thinking in Compliance)

---

## Exercise 1: Currency Formatter Utility

**Difficulty:** Starter

### Learning Objectives

- Write a typed TypeScript function with clear parameter and return types
- Use `Intl.NumberFormat` for Philippine Peso formatting
- Handle edge cases (zero, negative, very large amounts)

### Requirements

Create a file `src/lib/currency.ts` that exports the following functions:

1. `formatPHP(amount: number): string` — Formats a number as Philippine Peso (e.g., `150000` becomes `"₱150,000.00"`)
2. `formatCurrency(amount: number, currency: Currency): string` — Formats a number in any supported currency
3. `parseCurrencyInput(input: string): number | null` — Parses a string like `"₱1,500.00"` or `"1500"` into a number, returning `null` for invalid input

### Type Definitions

```typescript
type Currency = 'PHP' | 'USD' | 'EUR' | 'JPY' | 'CNY';
```

### Acceptance Criteria

- [ ] `formatPHP(150000)` returns `"₱150,000.00"`
- [ ] `formatPHP(0)` returns `"₱0.00"`
- [ ] `formatPHP(42500)` returns `"₱42,500.00"`
- [ ] `formatCurrency(1000, 'USD')` returns `"$1,000.00"`
- [ ] `parseCurrencyInput('₱1,500.00')` returns `1500`
- [ ] `parseCurrencyInput('abc')` returns `null`
- [ ] All functions have explicit return types — no `any`
- [ ] `npx tsc --noEmit` passes with zero errors

---

## Exercise 2: Banking Domain Type System

**Difficulty:** Intermediate

### Learning Objectives

- Define TypeScript interfaces for real banking domain objects
- Use discriminated unions to model transaction states
- Apply utility types (`Pick`, `Omit`, `Partial`) to create derived types
- Use Zod to validate data at runtime

### Requirements

Create the following files:

**`src/types/account.ts`** — Define interfaces for:
- `Account` with properties: `id`, `accountNumber`, `accountName`, `type` (savings/checking/time-deposit/current), `balance`, `availableBalance`, `currency`, `status` (active/dormant/frozen/closed), `openedDate`, `lastActivityDate`
- `AccountType`, `AccountStatus`, and `Currency` as union types
- `AccountPreview` using `Pick` (only `id`, `accountName`, `balance`)
- `AccountCreateInput` using `Omit` (exclude `id`, `status`, `openedDate`, `lastActivityDate`)

**`src/schemas/account.ts`** — Define a Zod schema for `Account` that:
- Validates `accountNumber` as exactly 10 digits
- Ensures `balance` is non-negative
- Restricts `currency` to the allowed values
- Uses `.refine()` to ensure `availableBalance <= balance`
- Exports the TypeScript type using `z.infer`

### Acceptance Criteria

- [ ] All types compile with `npx tsc --noEmit`
- [ ] Zod schema correctly validates a well-formed account object
- [ ] Zod schema rejects an account where `availableBalance > balance`
- [ ] Zod schema rejects a 9-digit account number
- [ ] No use of `any` anywhere

---

## Exercise 3: Compliance Checklist Builder

**Difficulty:** Challenge

### Learning Objectives

- Apply compliance knowledge from A03 to real feature requirements
- Practice mapping BSP circulars to frontend implementation concerns
- Use discriminated unions to model a multi-state compliance check

### Requirements

Create `src/types/compliance.ts` with the following:

1. A `ComplianceArea` type covering the areas from A03:
   ```typescript
   type ComplianceArea =
     | 'data-masking'
     | 'authentication'
     | 'accessibility'
     | 'error-monitoring'
     | 'test-coverage'
     | 'transaction-limits'
     | 'consent-management'
     | 'card-security';
   ```

2. A `ComplianceCheck` discriminated union:
   ```typescript
   type ComplianceCheck =
     | { status: 'not-started'; area: ComplianceArea }
     | { status: 'in-progress'; area: ComplianceArea; assignee: string }
     | { status: 'passed'; area: ComplianceArea; verifiedBy: string; verifiedAt: string }
     | { status: 'failed'; area: ComplianceArea; reason: string; regulation: string };
   ```

3. A function `getRegulationForArea(area: ComplianceArea): string` that returns the primary BSP circular or law for each compliance area.

4. A function `summarizeChecklist(checks: ComplianceCheck[]): { passed: number; failed: number; pending: number }` that counts the status of all checks.

### Acceptance Criteria

- [ ] TypeScript narrows types correctly in a `switch` statement on `ComplianceCheck.status`
- [ ] `getRegulationForArea('data-masking')` returns `"DPA (RA 10173)"`
- [ ] `getRegulationForArea('authentication')` returns `"BSP Circular 982 / 1213"`
- [ ] `summarizeChecklist` correctly counts statuses
- [ ] `npx tsc --noEmit` passes with zero errors

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
