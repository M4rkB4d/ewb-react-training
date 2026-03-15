# A06 — Design System Foundations

> **EastWest Bank — Digital Platforms & Innovations**
>
> Part A (Core) · Level 3 — Building UI

---

## What You Will Learn

By the end of this guide, you will:

- Build a complete component library with the EWB brand
- Create Button, Input, Card, and Badge variants using Tailwind CSS 4
- Use the `cn()` utility for conditional class merging
- Implement component variants with a consistent pattern
- Build a dark mode that works with Tailwind 4
- Understand design tokens and why they matter for banking UIs
- Create components that are accessible by default

---

## Prerequisites

| Requirement | Where |
|------------|-------|
| Completed B01 — Project Setup | Level 2 |
| Completed A04 — Components and JSX | Level 2 |
| EWB Tailwind theme configured | B01 Phase 4 |
| `cn()` utility created | B01 Phase 6 |

---

## Phase 1 — Design Tokens

### Why design tokens?

Design tokens are the single source of truth for visual decisions. Instead of
scattering hex codes and pixel values across components, you define them once in
your theme and reference them everywhere.

You already set up the EWB tokens in B01. Here is why each category matters:

**Color tokens** — Brand consistency. Every button, border, and background uses the
same EWB purple, navy, gold, lime, and magenta. No one guesses hex codes.

**Semantic tokens** — Intent over appearance. `bg-primary` means "primary action"
regardless of whether primary is purple today or navy tomorrow. Rebranding becomes
a config change, not a codebase-wide search and replace.

**Typography tokens** — Consistent text. Inter for body, JetBrains Mono for code.
Font sizes follow a scale. No one invents new sizes.

**Spacing and radius tokens** — Consistent rhythm. Cards use `rounded-xl`, inputs
use `rounded-lg`, badges use `rounded-full`. The radius communicates hierarchy.

### The EWB Token Hierarchy

```
Brand Tokens (fixed)              Semantic Tokens (contextual)
──────────────────                ──────────────────────────────
ewb-purple: #500778        →     primary
ewb-navy: #06357A          →     secondary, info
ewb-gold: #dba464           →     accent
ewb-lime: #d5e04d           →     success
ewb-magenta: #b1006f        →     (decorative accent)
red-600: #dc2626             →     error, destructive
amber-500: #f59e0b           →     warning
```

You use semantic tokens in components (`bg-primary`, `text-error`) and brand tokens
only in the theme definition. If EWB rebrands, you update the theme — every component
follows automatically.

### Checkpoint 1

Without looking at the code, name the five EWB brand colors and their roles.
Then open `src/index.css` and verify your answers against the theme definition.

---

## Phase 2 — The Button Component

The button is the most critical UI component. It is the primary way users take action
in a banking application. It must be visually clear, accessible, and consistent.

### Button variants

```tsx
// src/components/ui/button.tsx
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'error';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  ref?: React.Ref<HTMLButtonElement>;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-ewb-purple text-white hover:bg-ewb-purple-700 focus-visible:ring-ewb-purple',
  secondary:
    'bg-ewb-navy text-white hover:bg-ewb-navy-700 focus-visible:ring-ewb-navy',
  outline:
    'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus-visible:ring-ewb-purple',
  ghost:
    'text-gray-700 hover:bg-gray-100 focus-visible:ring-ewb-purple',
  error:
    'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  className,
  children,
  ref,
  ...props
}: ButtonProps) {
  return (
    <button
      ref={ref}
      disabled={disabled === true || isLoading}
      className={cn(
        // Base styles — always applied
        'inline-flex items-center justify-center rounded-lg font-medium',
        'transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        // Variant and size
        variantStyles[variant],
        sizeStyles[size],
        // Consumer overrides
        className,
      )}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg
            className="h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Processing...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
```

### The cn() utility explained

`cn()` uses `clsx` for conditional classes and `tailwind-merge` for deduplication:

```tsx
// clsx handles conditionals
cn('px-4', isLarge && 'px-6')
// → 'px-4 px-6' (clsx just concatenates)

// tailwind-merge resolves conflicts
cn('px-4', 'px-6')
// → 'px-6' (tailwind-merge keeps the last conflicting class)

// Combined: conditionally apply classes with proper conflict resolution
cn('bg-ewb-purple text-white', variant === 'outline' && 'bg-white text-gray-700')
```

Without `tailwind-merge`, you would get `bg-ewb-purple bg-white` — both applied,
unpredictable results. `tailwind-merge` knows that `bg-white` should override
`bg-ewb-purple` because they target the same CSS property.

### Usage examples

```tsx
<Button>Transfer Funds</Button>
<Button variant="secondary">View Details</Button>
<Button variant="outline">Cancel</Button>
<Button variant="error">Delete Account</Button>
<Button variant="ghost" size="sm">Edit</Button>
<Button isLoading>Processing...</Button>
<Button disabled>Unavailable</Button>
```

### Checkpoint 2

Create all seven button variants in your App.tsx and verify they render correctly
with `npm run dev`. Check that:
- Each variant has a distinct visual appearance
- Hover states work
- The disabled state dims the button
- The loading state shows a spinner

---

## Phase 3 — The Input Component

### Text inputs for banking forms

```tsx
// src/components/ui/input.tsx
import { useId } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  ref?: React.Ref<HTMLInputElement>;
}

export function Input({
  label,
  error,
  hint,
  id,
  className,
  ref,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = error != null ? `${inputId}-error` : undefined;
  const hintId = hint != null ? `${inputId}-hint` : undefined;

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
      </label>

      <input
        ref={ref}
        id={inputId}
        aria-invalid={error != null}
        aria-describedby={
          [errorId, hintId].filter(Boolean).join(' ') || undefined
        }
        className={cn(
          'block w-full rounded-lg border px-4 py-2 text-gray-900',
          'placeholder:text-gray-400',
          'focus:outline-none focus:ring-2 focus:ring-offset-1',
          'disabled:bg-gray-50 disabled:text-gray-500',
          error != null
            ? 'border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:ring-ewb-purple',
          className,
        )}
        {...props}
      />

      {error != null && (
        <p id={errorId} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {hint != null && error == null && (
        <p id={hintId} className="text-sm text-gray-500">
          {hint}
        </p>
      )}
    </div>
  );
}
```

**Accessibility features built in:**

| Feature | Implementation | BSP 1033 |
|---------|---------------|----------|
| Label association | `htmlFor` + `id` | Screen readers announce the label |
| Error announcement | `role="alert"` + `aria-invalid` | Screen readers announce errors |
| Description linking | `aria-describedby` | Screen readers read hints |
| Error styling | Red border + red text | Visual error indication |
| Focus ring | EWB purple ring | Keyboard navigation visible |

### Usage

```tsx
<Input
  label="Account Number"
  placeholder="Enter 10-digit account number"
  hint="Your account number is on your passbook"
/>

<Input
  label="Transfer Amount"
  type="number"
  error="Amount exceeds your available balance"
/>

<Input
  label="Recipient Name"
  disabled
  value="Juan Santos"
/>
```

### Checkpoint 3

Create an Input with an error message and verify that:
1. The border turns red
2. The error message appears below the input
3. The input has `aria-invalid="true"`
4. The error has `role="alert"`

Use browser dev tools to inspect the accessibility tree.

---

## Phase 4 — The Card Component

### Composable cards for banking dashboards

```tsx
// src/components/ui/card.tsx
import { cn } from '@/lib/utils';

// ── Card Container ──────────────────────────────────
interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function Card({ children, className, padding = 'md' }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-gray-200 bg-white shadow-sm',
        paddingStyles[padding],
        className,
      )}
    >
      {children}
    </div>
  );
}

// ── Card Header ─────────────────────────────────────
interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={cn('border-b border-gray-200 pb-4', className)}>
      {children}
    </div>
  );
}

// ── Card Title ──────────────────────────────────────
interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
  as?: 'h2' | 'h3' | 'h4';
}

export function CardTitle({ children, className, as: Tag = 'h3' }: CardTitleProps) {
  return (
    <Tag className={cn('text-lg font-semibold text-gray-900', className)}>
      {children}
    </Tag>
  );
}

// ── Card Description ────────────────────────────────
interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export function CardDescription({ children, className }: CardDescriptionProps) {
  return (
    <p className={cn('mt-1 text-sm text-gray-500', className)}>
      {children}
    </p>
  );
}

// ── Card Body ───────────────────────────────────────
interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function CardBody({ children, className }: CardBodyProps) {
  return <div className={cn('py-4', className)}>{children}</div>;
}

// ── Card Footer ─────────────────────────────────────
interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div className={cn('border-t border-gray-200 pt-4', className)}>
      {children}
    </div>
  );
}
```

### Usage — Account summary card

```tsx
<Card>
  <CardHeader>
    <CardTitle>Personal Savings</CardTitle>
    <CardDescription>••••7890 · Active</CardDescription>
  </CardHeader>
  <CardBody>
    <p className="text-3xl font-bold text-gray-900">₱150,000.00</p>
    <p className="mt-1 text-sm text-gray-500">Available Balance</p>
  </CardBody>
  <CardFooter>
    <div className="flex gap-2">
      <Button size="sm">Transfer</Button>
      <Button variant="outline" size="sm">History</Button>
    </div>
  </CardFooter>
</Card>
```

### Checkpoint 4

Build an "Account Overview" card that shows:
- Account name and masked number in the header
- Balance in the body (formatted as PHP)
- Two action buttons in the footer

---

## Phase 5 — Badge and Alert Components

### Badge

```tsx
// src/components/ui/badge.tsx
import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const badgeStyles: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-700',
  success: 'bg-ewb-lime-100 text-ewb-lime-700',
  warning: 'bg-amber-100 text-amber-700',
  error: 'bg-red-100 text-red-700',
  info: 'bg-ewb-navy-100 text-ewb-navy-700',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        badgeStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
```

### Alert

```tsx
// src/components/ui/alert.tsx
import { cn } from '@/lib/utils';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertProps {
  children: React.ReactNode;
  variant?: AlertVariant;
  title?: string;
  className?: string;
}

const alertStyles: Record<AlertVariant, string> = {
  info: 'border-ewb-navy-200 bg-ewb-navy-50 text-ewb-navy-700',
  success: 'border-ewb-lime-200 bg-ewb-lime-50 text-ewb-lime-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-700',
  error: 'border-red-200 bg-red-50 text-red-700',
};

export function Alert({
  children,
  variant = 'info',
  title,
  className,
}: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        'rounded-lg border p-4',
        alertStyles[variant],
        className,
      )}
    >
      {title != null && (
        <p className="mb-1 font-semibold">{title}</p>
      )}
      <div className="text-sm">{children}</div>
    </div>
  );
}
```

### Usage

```tsx
<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="error">Failed</Badge>

<Alert variant="warning" title="Low Balance">
  Your account balance is below ₱5,000. Consider transferring funds to avoid fees.
</Alert>

<Alert variant="error" title="Transaction Failed">
  The transfer could not be completed. Please try again or contact support.
</Alert>
```

### Checkpoint 5

Create a transaction status display using Badge for the status and Alert for any
warnings or errors related to the transaction.

---

## Phase 6 — Dark Mode

### Why dark mode for banking?

Banking operations run 24/7. Night-shift staff in operations centers work in dimly
lit rooms. Dark mode reduces eye strain during extended sessions and is a practical
requirement for financial applications.

### Tailwind 4 dark mode with CSS

Add dark mode styles to your theme in `src/index.css`:

```css
/* Add to src/index.css, after the @theme block */

/* Dark mode overrides */
@media (prefers-color-scheme: dark) {
  :root {
    color-scheme: dark;
  }
}

.dark {
  color-scheme: dark;
}

/* Dark mode component adjustments */
.dark body {
  background-color: #0f172a;
  color: #e2e8f0;
}
```

### Dark mode toggle hook

```tsx
// src/hooks/use-theme.ts
import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'system';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'system';
    const stored = localStorage.getItem('ewb-theme');
    return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
  });

  useEffect(() => {
    const root = document.documentElement;

    if (theme === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', systemDark);
    } else {
      root.classList.toggle('dark', theme === 'dark');
    }

    localStorage.setItem('ewb-theme', theme);
  }, [theme]);

  return { theme, setTheme };
}
```

### Using dark mode in components

Tailwind 4 supports the `dark:` variant:

```tsx
<div className="bg-white dark:bg-gray-900">
  <h2 className="text-gray-900 dark:text-white">Account Summary</h2>
  <p className="text-gray-500 dark:text-gray-400">Available balance</p>
</div>
```

Update the Card component to support dark mode:

```tsx
// Updated Card base styles
'rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800'
```

### Checkpoint 6

Add the theme toggle to your app header and verify:
1. Light mode uses EWB purple on white
2. Dark mode uses appropriate dark backgrounds
3. System mode follows OS preferences
4. The preference persists across page reloads

---

## Phase 7 — Component Barrel Exports

### Organize your component library

Create barrel exports so consumers import from a single path:

```tsx
// src/components/ui/index.ts
export { Button } from './button';
export { Input } from './input';
export { Card, CardHeader, CardTitle, CardDescription, CardBody, CardFooter } from './card';
export { Badge } from './badge';
export { Alert } from './alert';
```

Now any component can import from one place:

```tsx
import { Button, Input, Card, CardHeader, CardBody, Badge } from '@/components/ui';
```

### Design system documentation

Create a simple showcase page to document your component library:

```tsx
// src/pages/design-system.tsx
import {
  Button, Input, Card, CardHeader, CardTitle, CardBody, Badge, Alert,
} from '@/components/ui';

export function DesignSystemPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-12 p-8">
      <h1 className="text-3xl font-bold">EWB Design System</h1>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="error">Error</Button>
          <Button isLoading>Loading</Button>
          <Button disabled>Disabled</Button>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Inputs</h2>
        <div className="max-w-sm space-y-4">
          <Input label="Account Name" placeholder="Enter name" />
          <Input label="Amount" type="number" hint="Minimum ₱100" />
          <Input label="Email" error="Invalid email address" />
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Badges</h2>
        <div className="flex gap-2">
          <Badge>Default</Badge>
          <Badge variant="success">Active</Badge>
          <Badge variant="warning">Pending</Badge>
          <Badge variant="error">Failed</Badge>
          <Badge variant="info">Processing</Badge>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Alerts</h2>
        <div className="space-y-4">
          <Alert variant="info" title="Information">Your statement is ready for download.</Alert>
          <Alert variant="success" title="Success">Transfer completed successfully.</Alert>
          <Alert variant="warning" title="Warning">Low balance detected.</Alert>
          <Alert variant="error" title="Error">Transaction failed. Please try again.</Alert>
        </div>
      </section>
    </div>
  );
}
```

This page serves as living documentation — run `npm run dev`, navigate to the design
system page, and see every component variant rendered.

---

## Key Takeaways

1. **Design tokens are the source of truth.** Brand colors defined once in the theme,
   referenced everywhere via semantic names (`bg-primary`, not `bg-[#500778]`).

2. **The `cn()` utility** merges Tailwind classes with proper conflict resolution.
   Every component uses it for conditional styling.

3. **Components follow a consistent pattern:** variant + size + state props, with
   `cn()` composing the final className.

4. **Accessibility is built in**, not added on. Labels, ARIA attributes, focus rings,
   and error announcements are part of every component.

5. **Dark mode** is a practical requirement for banking operations. Tailwind 4's
   `dark:` variant makes it straightforward.

6. **Barrel exports** give consumers a clean import path. One import line for all
   UI components.

7. **Living documentation** (the design system page) keeps components visible and
   testable. If you can see it, you can verify it.

---

## Exercises

### Exercise 1 — Select Component

Build a `Select` component at `src/components/ui/select.tsx` that:
- Has the same label/error/hint pattern as Input
- Accepts `options` as an array of `{ value: string; label: string }`
- Uses EWB styling consistent with the Input component
- Supports a `placeholder` option (disabled, selected by default)

### Exercise 2 — Loading Skeleton

Build a `Skeleton` component that renders animated placeholder blocks (the "shimmer"
effect). Create variants for:
- Text line (narrow, full width)
- Circle (avatar placeholder)
- Card (full card skeleton)

Use `animate-pulse` from Tailwind for the animation.

### Exercise 3 — Component Tests

Write tests for the Button component:
- Renders with correct variant styles
- Shows loading state with spinner
- Disables the button during loading
- Calls onClick when clicked
- Does NOT call onClick when disabled

File: `src/components/ui/button.test.tsx`

---

## What Comes Next

You now have a complete component library with the EWB brand. The next step is
building forms — the most critical UI pattern in banking applications.

**Next guide:** [A07 — Forms and Validation](A07_forms-and-validation.md) — where
you build multi-step forms with React Hook Form, Zod validation, and banking-specific
patterns like amount formatting and data masking.

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
