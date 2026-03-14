# Level 2 — First App: Quiz

> **EastWest Bank — Digital Platforms & Innovations**
>
> Covers: A04 (Components and JSX), A05 (Your First Test), B01 (Project Setup)

---

## Instructions

Answer all 12 questions. For multiple choice, select the single best answer. For short answer, keep responses to 2-3 sentences.

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

### Question 3 (Short Answer)

Why must React list items have a `key` prop? Why should you use the record's ID instead of the array index as the key?

---

### Question 4 (Multiple Choice)

What is the correct naming convention for event handler props and functions in React?

A. Props use `handle` prefix, functions use `on` prefix
B. Props use `on` prefix (e.g., `onTransfer`), functions use `handle` prefix (e.g., `handleTransfer`)
C. Both use `on` prefix
D. Both use `handle` prefix

---

### Question 5 (Multiple Choice)

In React 19, how do you pass a `ref` to a custom component?

A. Wrap the component with `forwardRef`
B. Pass `ref` as a regular prop — no `forwardRef` needed
C. Use a special `useImperativeHandle` hook
D. Refs cannot be passed to custom components

---

### Question 6 (True/False)

When testing React components, you should test internal state values and CSS class names to ensure correctness.

---

### Question 7 (Multiple Choice)

Which React Testing Library query should you use first when looking for a button?

A. `getByTestId('submit-button')`
B. `getByText('Submit')`
C. `getByRole('button', { name: 'Submit' })`
D. `getByClassName('btn-submit')`

---

### Question 8 (Short Answer)

Explain the difference between `userEvent` and `fireEvent` in React Testing Library. Which should you prefer and why?

---

### Question 9 (Multiple Choice)

What does the `noValidate` attribute on a `<form>` element do, and why do we use it?

A. It disables all JavaScript validation
B. It disables browser-native validation so we can use Zod validation instead
C. It makes the form read-only
D. It prevents the form from being submitted

---

### Question 10 (Multiple Choice)

In the project setup (B01), what does `strict: true` in `tsconfig.json` do?

A. Makes the application run in a secure sandbox
B. Enables all strict type-checking options, catching more bugs at compile time
C. Restricts which npm packages can be installed
D. Enforces coding style rules like indentation

---

### Question 11 (True/False)

Pre-commit hooks configured with Husky are optional quality improvements that can be bypassed for urgent deployments.

---

### Question 12 (Short Answer)

The AccountCard component from A04 masks account numbers to show only the last 4 digits. Which regulation requires this, and why is it important for a banking application?

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
