# Level 3 Quiz — Building UI

> **EastWest Bank — Digital Platforms & Innovations**
>
> React Training Program · Level 3 Assessment

---

## Instructions

- Answer all 20 questions.
- For multiple choice, select the single best answer (A/B/C/D).
- For true/false, write True or False.

---

### Question 1 (Multiple Choice)

What is the purpose of the `cn()` utility function used throughout the design system?

A. It creates new React components dynamically
B. It merges Tailwind CSS classes with proper conflict resolution using `clsx` and `tailwind-merge`
C. It converts CSS class names to inline styles
D. It validates that CSS class names follow EWB naming conventions

---

### Question 2 (Multiple Choice)

What is the difference between brand tokens (e.g., `ewb-purple`) and semantic tokens (e.g., `primary`) in the design system?

A. Brand tokens are for dark mode; semantic tokens are for light mode
B. Brand tokens are fixed color values tied to the EWB identity; semantic tokens represent intent so rebranding requires changing only the theme, not every component
C. Brand tokens are used in CSS; semantic tokens are used in TypeScript
D. There is no difference; they are interchangeable names for the same colors

---

### Question 3 (True/False)

The `CurrencyDisplay` component expects monetary amounts in centavos (integer) and divides by 100 for display to avoid IEEE 754 floating-point errors.

---

### Question 4 (Multiple Choice)

What accessibility feature does the EWB `Input` component use to announce validation errors to screen readers?

A. A `<div>` with red text color only
B. `role="alert"` on the error message and `aria-invalid` on the input, linked via `aria-describedby`
C. A `console.error()` call that screen readers detect
D. A separate popup window displaying the error

---

### Question 5 (Multiple Choice)

Why does React Hook Form use uncontrolled inputs with refs instead of `useState` for each field?

A. Uncontrolled inputs look better in the browser
B. It avoids re-rendering the entire form on every keystroke, improving performance for complex banking forms
C. TypeScript only works with uncontrolled inputs
D. Controlled inputs are deprecated in React 19

---

### Question 6 (True/False)

In a banking application, frontend validation of transfer amount limits is sufficient. Backend validation is optional since the frontend already prevents invalid amounts.

---

### Question 7 (Multiple Choice)

What does the `refine()` method in a Zod schema do?

A. It removes invalid characters from a string
B. It adds custom validation logic that can depend on multiple fields
C. It converts one data type to another
D. It makes a field optional

---

### Question 8 (Multiple Choice)

In the multi-step transfer wizard, what is the purpose of React Hook Form's `trigger()` function?

A. It submits the form to the server
B. It resets all form fields to their default values
C. It validates specific fields without submitting the form, used to validate the current step before advancing
D. It triggers a page navigation to the next step

---

### Question 9 (True/False)

The `noValidate` attribute on a `<form>` element disables browser-native validation so the application can use Zod validation with consistent, styled error messages instead.

---

### Question 10 (Multiple Choice)

What does `z.coerce.number()` do differently from `z.number()` when validating form input?

A. It rounds the number to the nearest integer
B. It converts the input string to a number first, then validates — necessary because HTML inputs deliver values as strings
C. It forces the number to be positive
D. It adds thousand separators to the number

---

### Question 11 (Multiple Choice)

What are the four WCAG 2.1 principles?

A. Visual, Auditory, Motor, Cognitive
B. Perceivable, Operable, Understandable, Robust
C. Accessible, Responsive, Testable, Secure
D. Readable, Navigable, Compatible, Performant

---

### Question 12 (True/False)

Adding `role="button"` to a `<div>` with an `onClick` handler is the recommended approach for creating accessible clickable elements.

---

### Question 13 (Multiple Choice)

What is the minimum color contrast ratio required by WCAG 2.1 AA for normal text (under 18px)?

A. 2:1
B. 3:1
C. 4.5:1
D. 7:1

---

### Question 14 (Multiple Choice)

Why should you never rely on color alone to communicate status (e.g., red for error, green for success)?

A. Colors render differently on mobile devices
B. Color-blind users cannot distinguish certain color combinations, so you must always pair color with text labels or icons
C. Screen readers can detect colors and announce them automatically
D. WCAG prohibits the use of color in web applications

---

### Question 15 (True/False)

The native HTML `<dialog>` element with `showModal()` provides automatic focus trapping, Escape key handling, and backdrop — making it the recommended choice for confirmation dialogs in banking applications.

---

### Question 16 (Multiple Choice)

What is the first rule of ARIA according to the accessibility guide?

A. Every element must have at least one ARIA attribute
B. No ARIA is better than bad ARIA — use semantic HTML first, and add ARIA only when HTML is insufficient
C. ARIA attributes must be added to all interactive elements
D. ARIA is required for WCAG compliance on every element

---

### Question 17 (Multiple Choice)

Which BSP circular specifically requires that electronic payment services be accessible to all customers?

A. BSP Circular 808
B. BSP Circular 982
C. BSP Circular 1033
D. BSP Circular 1213

---

### Question 18 (True/False)

Automated accessibility testing tools like axe-core catch approximately 100% of accessibility issues, making manual testing unnecessary.

---

### Question 19 (Multiple Choice)

What is the purpose of the `useDebounce` hook introduced in the forms guide?

A. It prevents form submission for a set delay period
B. It delays value updates until the user stops typing, reducing unnecessary API calls for search inputs
C. It validates form data after a timeout
D. It cancels pending network requests when the component unmounts

---

### Question 20 (Multiple Choice)

In the fund transfer wizard, what compliance feature prevents a user from being charged twice for the same transfer?

A. The backend automatically rejects duplicate requests
B. The `isSubmitting` state disables the submit button during processing, preventing double-submission
C. A cooldown timer prevents the form from being submitted more than once per minute
D. The browser's same-origin policy blocks duplicate requests

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
