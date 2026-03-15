# A08 — Accessibility Essentials

> **EastWest Bank — Digital Platforms & Innovations**
>
> Part A (Core) · Level 3 — Building UI

---

## What You Will Learn

By the end of this guide, you will:

- Understand WCAG 2.1 AA requirements and why they are mandatory for banking
- Implement proper heading hierarchy and landmark regions
- Build keyboard-navigable interfaces
- Manage focus for modals, wizards, and dynamic content
- Use ARIA attributes correctly (and know when NOT to use them)
- Test accessibility with automated tools and manual checks
- Understand screen reader behavior for banking interfaces

---

## Prerequisites

| Requirement | Where |
|------------|-------|
| Completed A06 — Design System Foundations | Level 3 |
| Completed A07 — Forms and Validation | Level 3 |
| The EWB component library (Button, Input, Card) | A06 |

---

## Phase 1 — Why Accessibility Is Mandatory

### The regulatory requirement

BSP Circular 1033 requires that electronic payment services be accessible to all
customers. This is not a suggestion — it is a regulatory requirement for every banking
application.

Beyond regulation, accessibility is good engineering:
- Accessible forms work better for everyone, not just users with disabilities
- Keyboard navigation benefits power users who prefer not to use a mouse
- Proper heading structure improves SEO and content organization
- ARIA labels improve automated testing (our tests in A05 used `getByRole` and `getByLabelText`)

### WCAG 2.1 AA — The standard

The Web Content Accessibility Guidelines (WCAG) 2.1 Level AA is the standard for
banking applications. It covers four principles:

| Principle | What It Means |
|-----------|--------------|
| **Perceivable** | Users can see or hear the content (text alternatives, contrast, adaptable) |
| **Operable** | Users can navigate and interact (keyboard, timing, seizures, navigation) |
| **Understandable** | Users can comprehend the content (readable, predictable, input assistance) |
| **Robust** | Content works with assistive technologies (parsing, name/role/value) |

### Checkpoint 1

Name the four WCAG principles without looking. Which principle does color contrast
fall under? Which principle does keyboard navigation fall under?

Answers: Perceivable, Operable, Understandable, Robust. Contrast→Perceivable.
Keyboard→Operable.

---

## Phase 2 — Semantic HTML

### Use the right elements

The single most impactful accessibility improvement is using the correct HTML elements:

| Instead of | Use | Why |
|-----------|-----|-----|
| `<div onClick>` | `<button>` | Buttons are focusable, keyboard-accessible, announced by screen readers |
| `<div>` for navigation | `<nav>` | Screen readers announce navigation landmarks |
| `<div>` for main content | `<main>` | Screen readers can skip to main content |
| `<span>` for headings | `<h1>`-`<h6>` | Screen readers build a page outline |
| `<div>` for lists | `<ul>/<ol>` | Screen readers announce "list of N items" |
| `<div>` for forms | `<form>` | Screen readers announce form context |

### Landmark regions

Landmarks help screen reader users navigate the page structure:

```tsx
// src/components/layout/app-layout.tsx
interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-ewb-purple px-6 py-4">
        <nav aria-label="Main navigation">
          {/* Navigation links */}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {children}
      </main>

      <footer className="border-t border-gray-200 px-6 py-4">
        <p className="text-sm text-gray-500">
          EastWest Bank Digital Platforms
        </p>
      </footer>
    </div>
  );
}
```

Screen reader users can jump directly to `<main>`, `<nav>`, or `<footer>` without
scrolling through the entire page.

### Heading hierarchy

Headings must follow a logical order — `h1`, then `h2`, then `h3`. Never skip levels.

```tsx
// Correct heading hierarchy
<h1>My Accounts</h1>
  <h2>Savings Accounts</h2>
    <h3>Personal Savings — ••••7890</h3>
    <h3>Joint Savings — ••••4521</h3>
  <h2>Checking Accounts</h2>
    <h3>Payroll Checking — ••••1234</h3>

// Wrong — skips h2
<h1>My Accounts</h1>
  <h3>Personal Savings</h3>   {/* Should be h2 or h3 under an h2 */}
```

### Checkpoint 2

Audit the AccountCard component from A04:

1. Does every interactive element use a semantic element (`<button>`, `<a>`) or have an ARIA role?
2. The `<h3>` inside AccountCard — is that heading level correct if the card appears under an `<h2>` section heading?
3. A page showing 10 account cards — what landmark (`<section>`, `<main>`, `<nav>`) should wrap them, and should the landmark have an accessible label?

---

## Phase 3 — Keyboard Navigation

### Focus management

Every interactive element must be reachable by keyboard (Tab key) and activatable
(Enter or Space key):

```tsx
// Already keyboard-accessible (native elements):
<button>Transfer</button>        {/* Tab to focus, Enter/Space to activate */}
<a href="/accounts">Accounts</a> {/* Tab to focus, Enter to follow */}
<input type="text" />            {/* Tab to focus, type to input */}
<select>...</select>             {/* Tab to focus, arrow keys to select */}

// NOT keyboard-accessible (requires manual work):
<div onClick={handleClick}>Transfer</div>  {/* Cannot Tab, cannot Enter */}
```

If you use `<button>` and `<a>` instead of `<div>` with click handlers, keyboard
navigation works automatically.

### Focus visible styles

Users who navigate by keyboard need to see which element is focused. Your EWB theme
already includes this (from B01):

```css
:focus-visible {
  outline: 2px solid var(--color-ewb-purple);
  outline-offset: 2px;
}
```

The `:focus-visible` pseudo-class only shows the focus ring for keyboard users, not
for mouse clicks. This gives keyboard users visual feedback without cluttering the
interface for mouse users.

### Tab order

Elements are tabbed in DOM order. If your visual layout does not match the DOM order,
keyboard users will experience confusing tab sequences.

**Rule: DOM order should match visual reading order.**

```tsx
// Good — DOM order matches visual order (left to right, top to bottom)
<div className="flex gap-2">
  <Button variant="outline">Cancel</Button>
  <Button>Confirm</Button>
</div>

// Bad — visually right-to-left but DOM is left-to-right
<div className="flex flex-row-reverse gap-2">
  <Button variant="outline">Cancel</Button>  {/* Tab hits Cancel first */}
  <Button>Confirm</Button>                    {/* But visually it's second */}
</div>
```

### Skip links

Allow keyboard users to skip repetitive navigation:

```tsx
// src/components/layout/skip-link.tsx
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-ewb-purple focus:px-4 focus:py-2 focus:text-white"
    >
      Skip to main content
    </a>
  );
}

// In the layout:
<SkipLink />
<header>...</header>
<main id="main-content">...</main>
```

The skip link is visually hidden (`sr-only`) until focused, then appears at the top
of the screen. This is the first element a keyboard user reaches.

### Checkpoint 3

Open your application, unplug your mouse (or avoid using it), and navigate
entirely with keyboard:
1. Can you reach every button and link with Tab?
2. Can you activate buttons with Enter or Space?
3. Can you see which element is focused?
4. Does the tab order make logical sense?

---

## Phase 4 — ARIA Attributes

### The first rule of ARIA

**No ARIA is better than bad ARIA.**

ARIA (Accessible Rich Internet Applications) adds accessibility information to
elements. But using ARIA incorrectly makes things worse, not better.

```tsx
// Wrong — redundant ARIA (button already has these semantics)
<button role="button" aria-label="Submit">Submit</button>

// Right — no ARIA needed
<button>Submit</button>

// Wrong — ARIA on a div instead of using a button
<div role="button" tabIndex={0} aria-label="Submit" onClick={handleClick}>
  Submit
</div>

// Right — just use a button
<button onClick={handleClick}>Submit</button>
```

### When ARIA is necessary

Use ARIA when semantic HTML is not enough:

```tsx
// Dynamic content that updates
<div aria-live="polite" aria-atomic="true">
  Transfer complete. Reference number: TXN-2026-001234
</div>

// Status indicator that needs a text alternative
<span
  className="inline-block h-2 w-2 rounded-full bg-ewb-lime-500"
  aria-label="Active"
/>

// Custom component that has no native semantic
<div
  role="alert"
  className="rounded-lg border border-error/20 bg-error/10 p-4"
>
  Transaction failed. Please try again.
</div>

// Form error linked to its input
<input
  aria-invalid={true}
  aria-describedby="amount-error"
/>
<p id="amount-error" role="alert">
  Amount exceeds your available balance
</p>
```

### Common ARIA patterns for banking

| Pattern | ARIA | Use Case |
|---------|------|----------|
| Error messages | `role="alert"`, `aria-invalid`, `aria-describedby` | Form validation errors |
| Loading states | `aria-busy="true"`, `aria-live="polite"` | Data fetching, form submission |
| Status badges | `aria-label` on visual indicators | Account status dots |
| Modals | `role="dialog"`, `aria-modal`, `aria-labelledby` | Confirmation dialogs |
| Navigation | `aria-label` on `<nav>` | Distinguish multiple nav regions |
| Current page | `aria-current="page"` | Active navigation link |
| Expandable sections | `aria-expanded`, `aria-controls` | Collapsible account details |

### Live regions for dynamic content

When content changes dynamically (e.g., a transfer succeeds), screen readers need
to be told:

```tsx
// Polite — waits until the user is idle to announce
<div aria-live="polite">
  {status === 'success' && 'Transfer completed successfully.'}
</div>

// Assertive — interrupts the user immediately (use sparingly)
<div aria-live="assertive">
  {status === 'error' && 'Transfer failed. Your account was not debited.'}
</div>
```

Use `polite` for success messages and `assertive` only for critical errors that
require immediate attention.

### Checkpoint 4

Review the Input component from A06. Identify all ARIA attributes and explain what
each one does for screen reader users.

---

## Phase 5 — Focus Management

### Modal focus trap

When a modal opens, focus must be trapped inside it. Tab should cycle through modal
elements, not escape to the page behind it.

```tsx
// src/components/ui/confirmation-dialog.tsx
import { useEffect, useRef } from 'react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmationDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog == null) return;

    if (isOpen) {
      dialog.showModal(); // Native focus trap
    } else {
      dialog.close();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      className="rounded-xl border border-gray-200 bg-white p-0 shadow-xl backdrop:bg-black/50"
      onClose={onCancel}
      aria-labelledby="confirm-dialog-title"
    >
      <div className="p-6">
        <h2 id="confirm-dialog-title" className="text-lg font-semibold text-gray-900">{title}</h2>
        <p className="mt-2 text-sm text-gray-600">{message}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg bg-ewb-purple px-4 py-2 text-sm text-white"
          >
            Confirm
          </button>
        </div>
      </div>
    </dialog>
  );
}
```

The native `<dialog>` element with `showModal()` provides:
- Automatic focus trap (Tab stays inside the dialog)
- Focus returns to the trigger element when closed
- Escape key closes the dialog
- Backdrop click handling

**Always use `<dialog>` for modals.** Building custom focus traps with `div` is
error-prone and often misses edge cases.

> **BSP 1033 Note:** Confirmation dialogs for financial transactions (e.g., "Confirm
> transfer of ₱50,000?") must be keyboard-accessible with clear "Confirm" and
> "Cancel" actions.

### Focus on step change

In the multi-step transfer wizard (A07), focus should move to the new step's heading
when the user advances:

```tsx
const stepHeadingRef = useRef<HTMLHeadingElement>(null);

useEffect(() => {
  stepHeadingRef.current?.focus();
}, [step]);

// In the step JSX:
<h2 ref={stepHeadingRef} tabIndex={-1}>
  Step 2: Amount
</h2>
```

`tabIndex={-1}` makes the element focusable programmatically but not via Tab key.
Screen readers announce the heading when focus moves to it, orienting the user.

### Checkpoint 5

Build a confirmation dialog for a fund transfer. Verify:
1. Focus moves into the dialog when it opens
2. Tab cycles between Cancel and Confirm only
3. Escape closes the dialog
4. Focus returns to the Transfer button when the dialog closes

---

## Phase 6 — Color and Contrast

### WCAG contrast requirements

| Level | Text Size | Required Ratio |
|-------|----------|---------------|
| AA | Normal text (< 18px) | 4.5:1 |
| AA | Large text (≥ 18px bold or ≥ 24px) | 3:1 |
| AA | UI components and graphics | 3:1 |

### EWB palette contrast verification

The EWB palette was designed to meet AA requirements:

| Combination | Ratio | Passes AA |
|------------|-------|-----------|
| White on EWB Purple (#500778) | 10.2:1 | Yes |
| White on EWB Navy (#06357A) | 8.4:1 | Yes |
| White on EWB Magenta (#b1006f) | 5.1:1 | Yes |
| Dark text on EWB Gold (#dba464) | 5.8:1 | Yes |
| Dark text on EWB Lime (#d5e04d) | 8.2:1 | Yes |

### Do not rely on color alone

Color-blind users cannot distinguish red from green. Never use color as the only
way to communicate status:

```tsx
// Bad — color is the only indicator
<span className={isActive ? 'text-green-600' : 'text-red-600'}>
  ●
</span>

// Good — color + text + ARIA
<span
  className={isActive ? 'text-ewb-lime-700' : 'text-error'}
  aria-label={isActive ? 'Active' : 'Inactive'}
>
  {isActive ? '● Active' : '● Inactive'}
</span>
```

### Checkpoint 6

Check three color combinations in your application using a contrast checker tool.
Do they all meet WCAG AA requirements?

---

## Phase 7 — Automated Accessibility Testing

### axe-core with Vitest

Install the testing utility:

```bash
npm install -D @chialab/vitest-axe
```

> **Note:** The original `vitest-axe` package is unmaintained (last release 2023).
> `@chialab/vitest-axe` is an actively maintained fork with the same API.

Create accessibility tests:

```tsx
// src/components/ui/button.a11y.test.tsx
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { axe } from '@chialab/vitest-axe';
import { Button } from './button';

describe('Button accessibility', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<Button>Transfer</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no violations when disabled', async () => {
    const { container } = render(<Button disabled>Transfer</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no violations when loading', async () => {
    const { container } = render(<Button isLoading>Transfer</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### What axe catches

axe-core detects common accessibility issues:
- Missing alt text on images
- Insufficient color contrast
- Missing form labels
- Invalid ARIA attributes
- Incorrect heading hierarchy
- Missing landmark regions

### What axe does NOT catch

Automated tools catch about 30-40% of accessibility issues. Manual testing is required for:
- Logical reading order
- Meaningful link text
- Appropriate focus management
- Screen reader announcement quality
- Keyboard navigation flow

> **BSP 808 Note:** Automated accessibility tests are a risk management control.
> They prevent accessibility regressions — changes that break previously accessible
> features.

---

## Key Takeaways

1. **Accessibility is required** by BSP 1033 for electronic payment services.
   WCAG 2.1 AA is the standard.

2. **Semantic HTML first.** Use `<button>`, `<nav>`, `<main>`, `<h1>`-`<h6>`.
   Most accessibility comes from using the right elements.

3. **No ARIA is better than bad ARIA.** Only add ARIA when semantic HTML is
   insufficient. Redundant ARIA causes problems.

4. **Keyboard navigation must work.** Every interactive element reachable by Tab,
   activatable by Enter/Space. Always test without a mouse.

5. **Focus management** for modals and multi-step flows. Use `<dialog>` for modals.
   Move focus to headings on step changes.

6. **Color is not enough.** Always pair color with text or icons for status indication.

7. **Automated testing catches regressions** but not all issues. Manual testing with
   keyboard and screen reader is necessary.

---

## Exercises

### Exercise 1 — Accessibility Audit

Run an axe accessibility audit on every component in your UI library (Button, Input,
Card, Badge, Alert). Fix any violations found.

### Exercise 2 — Keyboard-Only Navigation

Navigate your entire application using only the keyboard. Document every place where:
- An element is not reachable by Tab
- Focus order does not match visual order
- Focus disappears (invisible focus)
- There is no focus indicator

Fix each issue.

### Exercise 3 — Screen Reader Testing

Install a screen reader (NVDA on Windows, VoiceOver on macOS) and navigate your
application. Verify that:
- Every button announces its purpose
- Every form field announces its label
- Error messages are announced when they appear
- The account balance is readable
- Masked account numbers make sense when read aloud

Document your findings.

---

## What Comes Next

Level 3 is complete. You have a design system, validated forms, and accessible
interfaces. Level 4 introduces state management and routing — the patterns that
connect your components into a complete application.

**Next guide:** [A09 — State Management](../level-04-state-and-routing/A09_state-management.md)
— where you learn Zustand for client state and TanStack Query for server state.

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
