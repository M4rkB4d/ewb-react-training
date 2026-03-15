# Level 3 — Building UI: Instructor Demo

> **EastWest Bank — Digital Platforms & Innovations**
>
> Duration: 18-20 minutes
>
> Covers: A06 (Design System Foundations), A07 (Forms and Validation), A08 (Accessibility Essentials)

---

## Setup Before the Demo

- EWB project running with `npm run dev`
- Design system components (Button, Input, Card, Badge) already created from A06
- Terminal split: dev server + test runner
- A screen reader installed (NVDA on Windows or VoiceOver on macOS) — optional but impactful
- Browser DevTools accessibility inspector ready

---

## Part 1: Design System in Action (5 minutes)

### Show: Button Variants

Open `src/App.tsx` and build a quick showcase:

```tsx
import { Button } from '@/components/ui/button';

export default function App() {
  return (
    <div className="space-y-4 p-8">
      <div className="flex flex-wrap gap-3">
        <Button variant="primary">Transfer</Button>
        <Button variant="secondary">View Details</Button>
        <Button variant="outline">Cancel</Button>
        <Button variant="error">Delete</Button>
        <Button variant="ghost">Edit</Button>
        <Button isLoading>Processing...</Button>
        <Button disabled>Unavailable</Button>
      </div>
    </div>
  );
}
```

**Show in browser.** Point out the EWB purple, the loading spinner, the disabled state.

**Talking point:** "Seven variants, one component. Every button in the portal looks consistent because they all come from the same source."

### Show: The cn() Utility

Open the Button source. Highlight the `cn()` call:

```tsx
className={cn(
  'inline-flex items-center justify-center rounded-lg font-medium',
  variantStyles[variant],
  sizeStyles[size],
  className,  // ← consumer can override
)}
```

**Talking point:** "`cn()` does two things. `clsx` handles conditional classes. `tailwind-merge` resolves conflicts. If a consumer passes `bg-red-500`, it correctly overrides our default background instead of creating a conflict."

### Show: Design Tokens

Open `src/index.css` and point to the theme:

```css
--color-ewb-purple: #500778;
--color-primary: var(--color-ewb-purple);
```

**Talking point:** "We use `bg-primary` in components, never `bg-[#500778]`. If the brand updates tomorrow, we change one line and every component follows. Design tokens are the single source of truth."

---

## Part 2: Build a Transfer Form Live (8 minutes)

### Step 1: Define the Zod schema

Create or open `src/schemas/transfer.ts`:

```typescript
import { z } from 'zod';

export const transferSchema = z.object({
  fromAccount: z.string().min(1, 'Select a source account'),
  toAccount: z.string().regex(/^\d{10}$/, 'Enter a valid 10-digit account number'),
  amount: z.coerce
    .number()
    .positive('Amount must be greater than zero')
    .max(1_000_000, 'Maximum transfer is ₱1,000,000'),
}).refine(
  (data) => data.fromAccount !== data.toAccount,
  { message: 'Cannot transfer to the same account', path: ['toAccount'] },
);

export type TransferData = z.infer<typeof transferSchema>;
```

**Talking point:** "Schema first, component second. This schema is both the TypeScript type AND the runtime validator. One definition, two uses. The `refine` at the end is cross-field validation — you can't transfer to yourself."

### Step 2: Build the form component

Type the form incrementally:

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { transferSchema, type TransferData } from '@/schemas/transfer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function TransferForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TransferData>({
    resolver: zodResolver(transferSchema),
  });

  const onSubmit = async (data: TransferData) => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    alert(`Transferred ₱${data.amount} to ${data.toAccount}`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <Input
        label="To Account"
        {...register('toAccount')}
        error={errors.toAccount?.message}
        placeholder="Enter 10-digit account number"
        inputMode="numeric"
      />

      <Input
        label="Amount (₱)"
        type="number"
        {...register('amount')}
        error={errors.amount?.message}
        placeholder="0.00"
      />

      <Button type="submit" isLoading={isSubmitting} className="w-full">
        Transfer Funds
      </Button>
    </form>
  );
}
```

### Step 3: Demonstrate validation

**Show in browser:**

1. Click "Transfer Funds" with empty fields. Show error messages appear under each field.
2. Type "12345" in the account field, tab out. Show "Enter a valid 10-digit account number."
3. Type "0" in amount. Show "Amount must be greater than zero."
4. Type "2000000" in amount. Show "Maximum transfer is ₱1,000,000."
5. Fill in valid data and submit. Show the loading state on the button.

**Talking point:** "Notice the button disables during submission — `isSubmitting` from React Hook Form handles this. For financial transactions, preventing double submission is critical. One click, one transfer."

### Step 4: Show the noValidate attribute

Remove `noValidate` temporarily. Submit the empty form. Show the browser's native tooltip.

**Talking point:** "See these browser tooltips? They look different in Chrome vs. Firefox vs. Safari. We can't style them to match EWB branding. `noValidate` turns them off so Zod handles everything consistently."

Add `noValidate` back.

---

## Part 3: Accessibility Walkthrough (5 minutes)

### Show: Keyboard Navigation

**Put the mouse aside.** Navigate the form entirely with keyboard:

1. **Tab** to the first input. Show the purple focus ring.
2. **Tab** to the amount input. Type a value.
3. **Tab** to the submit button. **Space** to activate.

**Talking point:** "Every interactive element is reachable by Tab, activatable by Enter or Space. This works because we used `<input>`, `<button>`, and `<form>` — real HTML elements with built-in keyboard support."

### Show: ARIA Attributes in DevTools

Open browser DevTools, go to the Accessibility tab. Inspect the Input component:

- Show `aria-invalid="true"` when there's an error
- Show `aria-describedby` linking to the error message
- Show `role="alert"` on the error text

**Talking point:** "These ARIA attributes are invisible to sighted users but essential for screen reader users. Our Input component adds them automatically. You don't have to remember — the design system handles it."

### Show: Screen Reader (if available)

If NVDA or VoiceOver is available, briefly demonstrate:

1. Focus the "To Account" input — screen reader announces the label
2. Submit with an error — screen reader announces the error message via `role="alert"`
3. Focus the submit button — screen reader announces "Transfer Funds, button"

**Talking point:** "BSP 1033 requires accessible electronic payment services. That means a customer using a screen reader must be able to complete a fund transfer. Our components make this possible by default."

### Show: Color Contrast

Open the EWB purple header in a contrast checker:

- White text (#FFFFFF) on EWB purple (#500778) = 10.2:1 ratio
- WCAG AA requires 4.5:1 for normal text

**Talking point:** "The EWB palette was designed to pass WCAG AA. You don't have to check — as long as you use the design system tokens, contrast is guaranteed."

### Show: Color-Only Indicators

Show the AccountCard status dot:

```tsx
// Bad — color only
<span className="bg-ewb-lime-500 h-2 w-2 rounded-full" />

// Good — color + aria-label
<span
  className="bg-ewb-lime-500 h-2 w-2 rounded-full"
  aria-label="Active account"
/>
```

**Talking point:** "8% of men are color-blind. A green dot means nothing to them. Text labels or ARIA labels are mandatory alongside color. Never rely on color alone."

---

## Wrap-Up (2 minutes)

### Key Messages

1. Design tokens ensure brand consistency — change once, update everywhere
2. `cn()` resolves Tailwind class conflicts intelligently
3. React Hook Form + Zod: define the schema once, get types and validation
4. `isSubmitting` prevents double submission — critical for financial forms
5. Accessibility is built into the design system, not added afterwards
6. Keyboard navigation and screen reader support are regulatory requirements

### Transition to Level 4

"Level 3 gave you the visual layer — design system, forms, accessibility. Level 4 connects it all with state management and routing. You'll learn Zustand for client state, TanStack Query for server state, and React Router for navigation."

---

---

## If Things Go Wrong

### Pre-Demo Checklist

- [ ] Dev server running and Button component renders all variants without errors
- [ ] React Hook Form and `@hookform/resolvers` installed (`npm ls react-hook-form`)
- [ ] Transfer schema file compiles: `npx tsc --noEmit src/schemas/transfer.ts`
- [ ] Browser DevTools Accessibility tab accessible (Chrome or Firefox)
- [ ] Screen reader installed and tested if planning the ARIA demo

### Common Issues

**Button variants render unstyled or with broken Tailwind classes**
- Cause: Tailwind not processing the component's file, or `cn()` utility missing
- Recovery: Show the raw component with inline styles instead. The point is the variant pattern, not the visual polish. Say "Tailwind config needs a content path update — the pattern is what matters."

**Form validation errors do not appear after submit**
- Cause: Missing `zodResolver` import, or `noValidate` omitted so browser validation fires first
- Recovery: Add `console.log(errors)` inside the component to show the Zod errors object. Walk through them in the console — this teaches debugging form state.

**Screen reader does not announce error messages**
- Cause: `role="alert"` missing on error elements, or screen reader not configured
- Recovery: Skip the live screen reader demo. Open the Accessibility tab in DevTools instead and inspect the ARIA tree. Show `aria-invalid` and `aria-describedby` attributes directly in the DOM.

**Keyboard focus ring not visible**
- Cause: Browser or OS overrides focus styles, or Tailwind's `focus-visible` ring not applied
- Recovery: Open DevTools, force `:focus-visible` state on the element. Show the CSS rule that should apply. Say "Some browsers suppress focus rings for mouse users — `focus-visible` only shows for keyboard."

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
