# Level 3 — Building UI: Exercises

> **EastWest Bank — Digital Platforms & Innovations**
>
> Covers: A06 (Design System Foundations), A07 (Forms and Validation), A08 (Accessibility Essentials)

---

## Exercise 1: Beneficiary Registration Form

**Difficulty:** Intermediate

### Learning Objectives

- Build a validated form with React Hook Form and Zod
- Implement banking-specific validation (Philippine phone numbers, account numbers)
- Use the EWB design system components (Input, Button, Alert)
- Handle form submission states (idle, submitting, success, error)

### Requirements

Create the following files:

**`src/schemas/beneficiary.ts`** — Zod schema for the form:

```typescript
// The schema should validate:
// - fullName: required, 2-100 characters
// - accountNumber: exactly 10 digits
// - bankName: required, from a predefined list
// - mobileNumber: valid Philippine mobile (+639XXXXXXXXX or 09XXXXXXXXX)
// - email: optional, but must be valid if provided
// - relationship: required (family / business / personal)
```

**`src/features/beneficiaries/components/beneficiary-form.tsx`** — The form component:

### Visual Requirements

- Use the EWB Input component for all fields
- Show validation errors below each field
- "Bank Name" is a `<select>` with at least 5 Philippine bank options
- "Relationship" uses radio buttons
- Submit button shows loading state during submission
- Success state shows a green Alert: "Beneficiary registered successfully."
- Error state shows a red Alert with the error message

### Acceptance Criteria

- [ ] Empty form submission shows all required field errors
- [ ] Invalid phone number format shows the correct error message
- [ ] Invalid account number (non-10-digit) shows error
- [ ] Optional email field accepts empty but rejects invalid format
- [ ] Submit button is disabled during submission
- [ ] Success and error states display correctly
- [ ] `npx tsc --noEmit` passes
- [ ] Form uses `noValidate` to disable browser-native validation

---

## Exercise 2: Masked Data Display Component

**Difficulty:** Starter

### Learning Objectives

- Implement data masking patterns required by the Data Privacy Act
- Build a toggle component for show/hide functionality
- Add proper ARIA labels for accessibility

### Requirements

Create `src/components/ui/sensitive-field.tsx`:

A reusable `SensitiveField` component that displays masked data with a show/hide toggle.

### Props Interface

```typescript
interface SensitiveFieldProps {
  label: string;
  value: string;
  maskType: 'account' | 'email' | 'phone' | 'card';
}
```

### Masking Rules

| Type | Full Value | Masked Display |
|------|-----------|----------------|
| account | 1234567890 | ••••••7890 |
| email | juan.santos@email.com | j•••••••••s@email.com |
| phone | +639171234567 | +63 917 ••• 4567 |
| card | 4532123456789012 | •••• •••• •••• 9012 |

### Visual Requirements

- Display the label in small, muted text above the value
- Masked value displayed in monospace font
- "Show" / "Hide" toggle button next to the value
- Toggle button has proper `aria-label` (e.g., "Show account number" / "Hide account number")

### Acceptance Criteria

- [ ] Each mask type displays correctly when hidden
- [ ] Clicking "Show" reveals the full value
- [ ] Clicking "Hide" masks the value again
- [ ] Default state is masked (never show full value by default)
- [ ] ARIA labels are present and descriptive
- [ ] Component works for all four mask types
- [ ] `npx tsc --noEmit` passes

---

## Exercise 3: Accessible Account Selector

**Difficulty:** Challenge

### Learning Objectives

- Build a keyboard-navigable custom component
- Implement proper ARIA roles and attributes
- Manage focus programmatically
- Meet WCAG 2.1 AA requirements for custom widgets

### Requirements

Create `src/features/transfers/components/account-selector.tsx`:

An `AccountSelector` component that lets users pick a source account for a fund transfer. This replaces a basic `<select>` with a richer UI that shows account details.

### Props Interface

```typescript
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
```

### Visual Requirements

- Renders as a group of selectable cards (one per account)
- Selected account has a purple border and checkmark icon
- Each card shows: account name, masked number, balance in PHP, account type badge
- The currently selected account is visually distinct

### Accessibility Requirements

- The component uses `role="radiogroup"` with `aria-label` matching the `label` prop
- Each account option uses `role="radio"` with `aria-checked`
- Arrow keys navigate between options
- Space or Enter selects the focused option
- Focus is visible with the EWB purple ring
- Error message is linked via `aria-describedby` and uses `role="alert"`

### Acceptance Criteria

- [ ] Clicking an account selects it and calls `onSelect`
- [ ] Arrow keys move focus between accounts
- [ ] Space/Enter selects the focused account
- [ ] Screen reader announces: label, account name, balance, selected state
- [ ] Error message is announced by screen readers
- [ ] Tab moves focus into and out of the group correctly
- [ ] Account numbers are masked in the display
- [ ] `npx tsc --noEmit` passes
- [ ] No axe accessibility violations when tested with `@chialab/vitest-axe`

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
