# Level 3 — Building UI: Quiz

> **EastWest Bank — Digital Platforms & Innovations**
>
> Covers: A06 (Design System Foundations), A07 (Forms and Validation), A08 (Accessibility Essentials)

---

## Instructions

Answer all 12 questions. For multiple choice, select the single best answer. For short answer, keep responses to 2-3 sentences.

---

### Question 1 (Multiple Choice)

What is the purpose of the `cn()` utility function used throughout the design system?

A. It creates new React components dynamically
B. It merges Tailwind CSS classes with proper conflict resolution using `clsx` and `tailwind-merge`
C. It converts CSS class names to inline styles
D. It validates that CSS class names follow EWB naming conventions

---

### Question 2 (Short Answer)

Explain the difference between brand tokens (e.g., `ewb-purple`) and semantic tokens (e.g., `primary`). Why does the design system use semantic tokens in components instead of brand tokens directly?

---

### Question 3 (Multiple Choice)

Why does React Hook Form use uncontrolled inputs with refs instead of `useState` for each field?

A. Uncontrolled inputs look better in the browser
B. It avoids re-rendering the entire form on every keystroke, improving performance for complex banking forms
C. TypeScript only works with uncontrolled inputs
D. Controlled inputs are deprecated in React 19

---

### Question 4 (True/False)

In a banking application, frontend validation of transfer amount limits is sufficient. Backend validation is optional since the frontend already prevents invalid amounts.

---

### Question 5 (Multiple Choice)

What does the `refine()` method in Zod do?

A. It removes invalid characters from a string
B. It adds custom validation logic that can depend on multiple fields
C. It converts one data type to another
D. It makes a field optional

---

### Question 6 (Short Answer)

In the multi-step transfer wizard, what is the purpose of the `trigger()` function from React Hook Form? Why is it used instead of `handleSubmit()` between steps?

---

### Question 7 (Multiple Choice)

What are the four WCAG 2.1 principles?

A. Visual, Auditory, Motor, Cognitive
B. Perceivable, Operable, Understandable, Robust
C. Accessible, Responsive, Testable, Secure
D. Readable, Navigable, Compatible, Performant

---

### Question 8 (True/False)

Adding `role="button"` and `aria-label="Submit"` to a `<div>` with an `onClick` handler is the correct approach for making it accessible.

---

### Question 9 (Multiple Choice)

What is the minimum color contrast ratio required by WCAG 2.1 AA for normal text (under 18px)?

A. 2:1
B. 3:1
C. 4.5:1
D. 7:1

---

### Question 10 (Multiple Choice)

Which HTML element should be used for confirmation dialogs in banking applications, and why?

A. `<div>` with custom JavaScript focus management
B. `<dialog>` with `showModal()` because it provides automatic focus trapping, Escape key handling, and backdrop
C. `<section>` with `role="dialog"`
D. `<aside>` with `aria-modal="true"`

---

### Question 11 (Short Answer)

Why should you never rely on color alone to communicate status (e.g., red for error, green for success)? What should you use in addition to color?

---

### Question 12 (Multiple Choice)

Which BSP circular specifically requires that electronic payment services be accessible to all customers?

A. BSP Circular 808
B. BSP Circular 982
C. BSP Circular 1033
D. BSP Circular 1213

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
