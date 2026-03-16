# Level 2 Quiz — First App

> **EastWest Bank — Digital Platforms & Innovations**
>
> React Training Program · Level 2 Assessment

---

## Instructions

- Answer all 20 questions.
- For multiple choice, select the single best answer (A/B/C/D).
- For true/false, write True or False.

---

### Question 1 (Multiple Choice)

Which of the following is valid JSX?

A. `<div class="card"><input type="text"></div>`
B. `<div className="card"><input type="text" /></div>`
C. `return (<h1>Title</h1><p>Content</p>)`
D. `<div for="name">Label</div>`

---

### Question 2 (True/False)

In JSX, you can use `if` statements directly inside curly braces `{}` to conditionally render content.

---

### Question 3 (Multiple Choice)

What is the purpose of a fragment (`<>...</>`) in JSX?

A. It creates a hidden `<div>` element in the DOM
B. It groups multiple elements without adding an extra DOM node
C. It is a shortcut for the `<section>` element
D. It prevents the component from re-rendering

---

### Question 4 (Multiple Choice)

Why must React list items have a `key` prop, and what should you use as the key?

A. Keys are optional but improve performance; use any random string
B. Keys help React track which items changed; use the array index
C. Keys help React track which items changed, were added, or removed; use the record's unique ID
D. Keys are required by TypeScript but ignored by React; use any value

---

### Question 5 (True/False)

Props flow in one direction in React: from parent component to child component. A child component should never modify its own props.

---

### Question 6 (Multiple Choice)

What is the correct naming convention for event handler props and functions in React?

A. Props use `handle` prefix, functions use `on` prefix
B. Props use `on` prefix (e.g., `onTransfer`), functions use `handle` prefix (e.g., `handleTransfer`)
C. Both use `on` prefix
D. Both use `handle` prefix

---

### Question 7 (Multiple Choice)

In React 19, how do you pass a `ref` to a custom component?

A. Wrap the component with `forwardRef`
B. Pass `ref` as a regular prop — no `forwardRef` needed
C. Use a special `useImperativeHandle` hook
D. Refs cannot be passed to custom components

---

### Question 8 (Multiple Choice)

Why should you always add `type="button"` to buttons that are not submitting a form?

A. It is required by TypeScript for type checking
B. Without it, buttons inside a `<form>` default to `type="submit"` and will submit the form on click
C. It enables keyboard navigation for the button
D. It is an accessibility requirement from WCAG

---

### Question 9 (True/False)

When testing React components, you should test internal state values and CSS class names to ensure correctness.

---

### Question 10 (Multiple Choice)

Which React Testing Library query should you use first when looking for a button?

A. `getByTestId('submit-button')`
B. `getByText('Submit')`
C. `getByRole('button', { name: 'Submit' })`
D. `getByClassName('btn-submit')`

---

### Question 11 (Multiple Choice)

What is the difference between `userEvent` and `fireEvent` in React Testing Library?

A. `fireEvent` is more accurate; `userEvent` is a shortcut
B. `userEvent` simulates real user behavior (focus, pointer, keyboard events); `fireEvent` fires a single DOM event directly
C. `userEvent` is synchronous; `fireEvent` is asynchronous
D. They are identical; `userEvent` is just a newer name for `fireEvent`

---

### Question 12 (Multiple Choice)

What does `vi.fn()` do in Vitest?

A. Creates a new Vite configuration function
B. Creates a mock function that records how it was called, allowing you to verify calls and arguments
C. Generates random test data for form fields
D. Creates a virtual DOM element for testing

---

### Question 13 (True/False)

Test files should be co-located with the component they test (e.g., `account-card.tsx` and `account-card.test.tsx` in the same directory).

---

### Question 14 (Multiple Choice)

What does `strict: true` in `tsconfig.json` do?

A. Makes the application run in a secure sandbox
B. Enables all strict type-checking options, catching more bugs at compile time
C. Restricts which npm packages can be installed
D. Enforces coding style rules like indentation

---

### Question 15 (Multiple Choice)

What is the purpose of the feature-slice folder structure used in EWB projects?

A. It groups all files by type (all components together, all hooks together) for easy browsing
B. It keeps related files together by feature (each feature has its own components, hooks, and types in one directory)
C. It separates frontend and backend code into different directories
D. It organizes files alphabetically for faster lookup

---

### Question 16 (True/False)

Pre-commit hooks configured with Husky are optional quality improvements that can be bypassed for urgent deployments.

---

### Question 17 (Multiple Choice)

What does the Zod-based environment variable validation in `src/lib/env.ts` accomplish?

A. It encrypts environment variables for security
B. It validates environment variables at application startup and crashes immediately if required variables are missing or invalid
C. It syncs environment variables with the production server
D. It generates TypeScript types for environment variables but does not validate them

---

### Question 18 (Multiple Choice)

Which BSP circular makes automated testing a regulatory requirement for banking applications?

A. BSP Circular 982
B. BSP Circular 808
C. BSP Circular 1033
D. BSP Circular 1213

---

### Question 19 (True/False)

The `noUncheckedIndexedAccess` TypeScript flag makes array access return `T | undefined`, preventing out-of-bounds crashes.

---

### Question 20 (Multiple Choice)

The AccountCard component from A04 masks account numbers to show only the last 4 digits. Which regulation requires this?

A. BSP Circular 808 (IT Risk Management)
B. PCI-DSS
C. Data Privacy Act (RA 10173)
D. BSP Circular 1019 (Cyber-Risk Reporting)

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
