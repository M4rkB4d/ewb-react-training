# X01 — EWB Design System Reference

> **EastWest Bank — Digital Platforms & Innovations**
>
> Appendix · Reference

---

## Brand Colors

### Primary Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `ewb-purple` | `#500778` | Primary brand, buttons, headers |
| `ewb-magenta` | `#b1006f` | Secondary accent, hover states |
| `ewb-gold` | `#dba464` | Accent, highlights, badges |
| `ewb-lime` | `#d5e04d` | Success states, positive indicators |
| `ewb-navy` | `#06357A` | Info states, links, secondary text |

### Purple Scale

| Token | Hex | Usage |
|-------|-----|-------|
| `ewb-purple-50` | `#f5f0f7` | Lightest background |
| `ewb-purple-100` | `#e8dced` | Light background, hover |
| `ewb-purple-200` | `#d1b9db` | Border light |
| `ewb-purple-300` | `#b08fbf` | Disabled text |
| `ewb-purple-400` | `#8a5fa0` | Placeholder |
| `ewb-purple-500` | `#6a3585` | Medium emphasis |
| `ewb-purple-600` | `#500778` | Primary (base) |
| `ewb-purple-700` | `#430664` | Hover state |
| `ewb-purple-800` | `#360550` | Active/pressed |
| `ewb-purple-900` | `#22033a` | Darkest, high contrast text |

### WCAG AA Contrast Ratios

| Foreground | Background | Ratio | Pass |
|-----------|------------|-------|------|
| White (#fff) | Purple (#500778) | 10.2:1 | AA + AAA |
| White (#fff) | Magenta (#b1006f) | 5.1:1 | AA |
| Dark (#1a1a1a) | Gold (#dba464) | 5.8:1 | AA |
| White (#fff) | Navy (#06357A) | 8.4:1 | AA + AAA |
| Dark (#1a1a1a) | Lime (#d5e04d) | 8.2:1 | AA + AAA |

### Semantic Tokens

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `primary` | `ewb-purple` | `ewb-purple-400` | Primary actions |
| `secondary` | `ewb-navy` | `ewb-navy-300` | Secondary actions |
| `accent` | `ewb-gold` | `ewb-gold-300` | Highlights |
| `success` | `ewb-lime-700` | `ewb-lime-400` | Success states |
| `error` | `red-600` | `red-400` | Error states |
| `warning` | `amber-600` | `amber-400` | Warning states |
| `surface` | `white` | `gray-900` | Card backgrounds |
| `background` | `gray-50` | `gray-950` | Page background |
| `foreground` | `gray-900` | `gray-50` | Primary text |
| `muted` | `gray-500` | `gray-400` | Secondary text |

---

## Tailwind 4 Theme Configuration

```css
/* src/styles/index.css */
@import 'tailwindcss';

@theme {
  /* Brand Colors */
  --color-ewb-purple-50: #f5f0f7;
  --color-ewb-purple-100: #e8dced;
  --color-ewb-purple-200: #d1b9db;
  --color-ewb-purple-300: #b08fbf;
  --color-ewb-purple-400: #8a5fa0;
  --color-ewb-purple-500: #6a3585;
  --color-ewb-purple: #500778;
  --color-ewb-purple-700: #430664;
  --color-ewb-purple-800: #360550;
  --color-ewb-purple-900: #22033a;

  --color-ewb-magenta: #b1006f;
  --color-ewb-gold: #dba464;
  --color-ewb-lime: #d5e04d;
  --color-ewb-navy: #06357A;

  /* Semantic Mapping */
  --color-primary: var(--color-ewb-purple);
  --color-primary-hover: var(--color-ewb-purple-700);
  --color-primary-active: var(--color-ewb-purple-800);

  /* Typography */
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;

  /* Border Radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
}
```

---

## Component Reference

### Button

```tsx
// src/components/ui/button.tsx
import { type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-ewb-purple text-white hover:bg-ewb-purple-700 active:bg-ewb-purple-800',
  secondary: 'bg-ewb-navy text-white hover:bg-ewb-navy/90',
  outline: 'border border-ewb-purple text-ewb-purple hover:bg-ewb-purple-50',
  ghost: 'text-ewb-purple hover:bg-ewb-purple-50',
  destructive: 'bg-red-600 text-white hover:bg-red-700',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ewb-purple focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      disabled={disabled}
      {...props}
    />
  );
}
```

### Input

```tsx
// src/components/ui/input.tsx
import { type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  ref?: React.Ref<HTMLInputElement>;
}

export function Input({ className, error, ref, ...props }: InputProps) {
  return (
    <input
      ref={ref}
      className={cn(
        'flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm',
        'placeholder:text-gray-400',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ewb-purple focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        error ? 'border-red-500' : 'border-gray-300',
        className,
      )}
      {...props}
    />
  );
}
```

### Card

```tsx
// src/components/ui/card.tsx
import { cn } from '@/lib/utils';
import type { HTMLAttributes } from 'react';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-lg border bg-white p-6 shadow-sm', className)}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mb-4', className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-lg font-semibold', className)} {...props} />;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('text-sm text-gray-600', className)} {...props} />;
}
```

### Alert

```tsx
// src/components/ui/alert.tsx
import { cn } from '@/lib/utils';
import type { HTMLAttributes } from 'react';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
}

const alertStyles: Record<AlertVariant, string> = {
  info: 'border-ewb-navy-200 bg-ewb-navy-50 text-ewb-navy-700',
  success: 'border-ewb-lime-200 bg-ewb-lime-50 text-ewb-lime-700',
  warning: 'bg-amber-50 border-amber-600 text-amber-900',
  error: 'bg-red-50 border-red-600 text-red-900',
};

export function Alert({ variant = 'info', className, ...props }: AlertProps) {
  return (
    <div
      role="alert"
      className={cn('rounded-md border-l-4 p-4', alertStyles[variant], className)}
      {...props}
    />
  );
}
```

---

## Utility: cn()

```tsx
// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

---

## Typography Scale

| Class | Size | Weight | Usage |
|-------|------|--------|-------|
| `text-xs` | 12px | Normal | Captions, helper text |
| `text-sm` | 14px | Normal | Body text, form labels |
| `text-base` | 16px | Normal | Primary body text |
| `text-lg` | 18px | Semibold | Card titles, section headers |
| `text-xl` | 20px | Bold | Page section titles |
| `text-2xl` | 24px | Bold | Page titles |
| `text-3xl` | 30px | Bold | Hero headings |
| `text-4xl` | 36px | Bold | Dashboard metrics |

---

## Spacing System

Tailwind's default spacing scale is used throughout. Key consistent values:

| Context | Spacing | Class |
|---------|---------|-------|
| Component padding | 16px | `p-4` |
| Card padding | 24px | `p-6` |
| Section gap | 24px | `space-y-6` |
| Form field gap | 16px | `space-y-4` |
| Inline element gap | 8px | `gap-2` |
| Page padding (mobile) | 16px | `px-4` |
| Page padding (desktop) | 32px | `px-8` |
| Page max width | 1280px | `max-w-7xl` |

---

## Icon Usage

Icons use Lucide React (tree-shakeable):

```tsx
import { ArrowRight, Check, X, AlertTriangle } from 'lucide-react';

// Standard size: 16px (size="16" or className="h-4 w-4")
// Large: 24px (size="24" or className="h-6 w-6")
```

---

## Dark Mode

Dark mode uses Tailwind's `dark:` variant with the `class` strategy:

```tsx
// Toggle stored in localStorage via Zustand
<html className="dark">
```

All semantic tokens have dark mode equivalents defined in the theme.
Components use semantic tokens (`bg-surface`, `text-foreground`) rather
than hard-coded colors to automatically support both modes.

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
