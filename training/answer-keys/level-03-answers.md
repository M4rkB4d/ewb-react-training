# Level 3 Answer Key — Building UI

> **EastWest Bank — Digital Platforms & Innovations**
>
> React Training Program · Level 3 Instructor Reference

---

## Quiz Answers

### Question 1 — Answer: B

`cn()` merges Tailwind CSS classes using `clsx` (for conditional class application) and `tailwind-merge` (for resolving conflicting classes). For example, `cn('bg-purple', 'bg-white')` resolves to `'bg-white'` because `tailwind-merge` knows both target `background-color` and keeps the last one.

### Question 2 — Answer: B

Brand tokens (`ewb-purple`, `ewb-navy`) are fixed color values tied to the EWB visual identity. Semantic tokens (`primary`, `error`, `success`) represent intent — what the color means, not what it looks like. If the brand is updated, only the theme definition changes and every component using semantic tokens updates automatically.

### Question 3 — Answer: True

The `CurrencyDisplay` component receives amounts in integer centavos and divides by 100 before formatting with `Intl.NumberFormat`. This avoids IEEE 754 floating-point errors (e.g., `0.1 + 0.2 !== 0.3`) that would cause rounding problems across millions of banking transactions.

### Question 4 — Answer: B

The Input component uses `role="alert"` on error messages so screen readers announce them immediately, `aria-invalid` on the input to indicate an error state, and `aria-describedby` to link the input to its error message. Option A provides only a visual indicator that screen readers cannot detect.

### Question 5 — Answer: B

React Hook Form keeps form state inside the library using refs rather than component state. This avoids re-rendering the entire component on every keystroke. For banking forms with 15+ fields and real-time validation, this performance difference is significant.

### Question 6 — Answer: False

Frontend validation provides user feedback but is never sufficient on its own. A determined user can bypass any frontend validation using browser dev tools or direct API calls. For AMLA compliance, transaction limits must be enforced server-side. Frontend validation is UX; backend validation is security.

### Question 7 — Answer: B

`refine()` adds custom validation logic that can access multiple fields simultaneously. For example, validating that source and destination accounts are different requires seeing both values. The `path` option tells React Hook Form which field to display the error on.

### Question 8 — Answer: C

`trigger()` validates specific fields without submitting the form. In a multi-step wizard, you validate the current step's fields before allowing the user to advance, but the form is not submitted until the final step's confirm button calls `handleSubmit()`.

### Question 9 — Answer: True

`noValidate` disables the browser's built-in form validation (tooltip bubbles and default validation). The application uses Zod schemas instead, which provide consistent, styled error messages that can be controlled and tested. Browser-native validation varies across browsers and cannot be styled to match the design system.

### Question 10 — Answer: B

HTML `<input type="number">` delivers its value as a string to JavaScript. `z.number()` alone would reject the string `"1000"`. `z.coerce.number()` converts the string to a number first, then applies validation rules like `.positive()` or `.max()`.

### Question 11 — Answer: B

The four WCAG 2.1 principles are Perceivable, Operable, Understandable, and Robust (POUR). Perceivable means content can be seen or heard. Operable means it can be navigated and used. Understandable means it can be comprehended. Robust means it works with assistive technologies.

### Question 12 — Answer: False

The correct approach is to use a native `<button>` element. Adding `role="button"` to a `<div>` is an anti-pattern because you must also manually add keyboard handling, focus management, and other button behaviors that `<button>` provides natively. The first rule of ARIA: no ARIA is better than bad ARIA.

### Question 13 — Answer: C

WCAG 2.1 AA requires a minimum contrast ratio of 4.5:1 for normal text (under 18px or under 14px bold). Large text (18px+ or 14px+ bold) requires 3:1. UI components and graphical objects also require 3:1.

### Question 14 — Answer: B

Approximately 8% of men and 0.5% of women are color-blind and cannot reliably distinguish red from green. Using color as the only status indicator means these users cannot determine whether a transaction succeeded or failed. Always pair color with text labels, icons, or patterns.

### Question 15 — Answer: True

The native `<dialog>` element with `showModal()` provides automatic focus trapping (Tab stays inside), Escape key to close, backdrop click handling, and focus restoration when closed. Building these behaviors manually with a `<div>` is error-prone and frequently misses edge cases.

### Question 16 — Answer: B

The first rule of ARIA is: no ARIA is better than bad ARIA. Semantic HTML elements (`<button>`, `<nav>`, `<main>`) already provide the correct roles and behaviors. ARIA should only be added when native HTML cannot express the needed semantics, such as for live regions or custom widget patterns.

### Question 17 — Answer: C

BSP Circular 1033 (Electronic Payment Services) requires that electronic payment services be accessible to all customers. This maps directly to WCAG 2.1 AA compliance for web applications. Accessibility is not optional for banking interfaces.

### Question 18 — Answer: False

Automated tools like axe-core catch approximately 30-40% of accessibility issues. Manual testing is required for logical reading order, meaningful link text, appropriate focus management, screen reader announcement quality, and keyboard navigation flow. Automated testing prevents regressions but does not replace human judgment.

### Question 19 — Answer: B

The `useDebounce` hook delays updating a value until the user stops typing for a specified duration (e.g., 300ms). This prevents sending an API request for every keystroke in search or filter inputs, reducing server load and improving responsiveness.

### Question 20 — Answer: B

The `isSubmitting` state from React Hook Form's `formState` automatically disables the submit button while the form is being processed. For critical financial operations, the guide also recommends an additional `hasSubmitted` guard to protect against race conditions, allowing retry only on error.

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
