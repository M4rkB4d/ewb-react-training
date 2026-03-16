# Level 1 Quiz — Welcome

> **EastWest Bank — Digital Platforms & Innovations**
>
> React Training Program · Level 1 Assessment

---

## Instructions

- Answer all 20 questions.
- For multiple choice, select the single best answer (A/B/C/D).
- For true/false, write True or False.

---

### Question 1 (Multiple Choice)

What problem does React solve compared to traditional DOM manipulation?

A. React makes websites load faster by reducing file sizes
B. React lets you describe what the UI should look like for any given data, and handles DOM updates automatically
C. React eliminates the need for JavaScript entirely
D. React replaces HTML with a new markup language

---

### Question 2 (True/False)

In React, component names must start with a capital letter (e.g., `AccountCard`, not `accountCard`).

---

### Question 3 (Multiple Choice)

What does the mental model `UI = f(state)` mean?

A. The UI must be built using only functional components and no classes
B. The user interface is a function of the application's state — given the same state, you always get the same UI
C. The UI framework requires a function called `f` to initialize state
D. State should never change once the UI has rendered

---

### Question 4 (Multiple Choice)

What is the difference between `useState` and `useRef`?

A. `useState` is for numbers, `useRef` is for strings
B. `useState` triggers re-renders when updated; `useRef` does not
C. `useRef` is newer and should always be used instead of `useState`
D. There is no difference; they are interchangeable

---

### Question 5 (True/False)

When you call `setCount(count + 1)` from `useState`, React re-renders the component with the new value.

---

### Question 6 (Multiple Choice)

What happens if you write `useEffect(() => { ... })` without a dependency array?

A. The effect runs only once when the component mounts
B. The effect never runs
C. The effect runs after every render, which is usually a bug
D. TypeScript prevents this from compiling

---

### Question 7 (Multiple Choice)

Why must effects that set up intervals or event listeners return a cleanup function?

A. React requires all effects to return a value
B. Without cleanup, the interval or listener keeps running after the component unmounts, causing a memory leak
C. The cleanup function improves performance by pausing the effect between renders
D. TypeScript will not compile without a return value

---

### Question 8 (True/False)

In React 19, you can pass `ref` as a regular prop to custom components without using `forwardRef`.

---

### Question 9 (Multiple Choice)

In TypeScript, what is the correct convention used in these guides for defining component props?

A. Use `type` for props and `interface` for unions
B. Use `interface` for props and `type` for unions
C. Always use `type` for everything
D. Always use `class` for type definitions

---

### Question 10 (Multiple Choice)

Why is `any` never used in these guides?

A. `any` is not a valid TypeScript type
B. `any` causes slower compilation times
C. `any` disables type checking, hiding potential bugs — `unknown` is the type-safe alternative
D. `any` was removed in TypeScript 5

---

### Question 11 (True/False)

TypeScript catches type errors at compile time, not at runtime.

---

### Question 12 (Multiple Choice)

What is the key insight about defining Zod schemas in these guides?

A. Define TypeScript types first, then write Zod schemas to match them
B. Define Zod schemas first, then extract TypeScript types with `z.infer` — keeping types and validation in sync
C. Zod schemas should only be used for form validation, not API responses
D. Zod replaces TypeScript entirely so types are not needed

---

### Question 13 (Multiple Choice)

What is the difference between `z.parse()` and `z.safeParse()` in Zod?

A. `parse()` is faster; `safeParse()` is more thorough
B. `parse()` throws a ZodError on invalid data; `safeParse()` returns a success/error result object without throwing
C. `safeParse()` only validates strings; `parse()` validates any type
D. There is no difference; they are aliases

---

### Question 14 (True/False)

Under the Data Privacy Act (RA 10173), an IP address is considered personal information.

---

### Question 15 (Multiple Choice)

What does BSP Circular 1213 (AFASA) require banks to implement by June 2026?

A. Full dark mode support in all banking applications
B. Migration from SMS OTP to phishing-resistant authentication such as passkeys
C. Mandatory use of React for all frontend applications
D. Paper-based audit trails for every transaction

---

### Question 16 (Multiple Choice)

Which three regulators govern EastWest Bank's digital applications?

A. SEC, FDA, and DOH
B. BSP, NPC, and AMLC
C. DOLE, NTC, and BSP
D. NPC, SEC, and DTI

---

### Question 17 (True/False)

Consent given for account opening automatically covers marketing communications under the Data Privacy Act.

---

### Question 18 (Multiple Choice)

A fund transfer confirmation screen displays a full recipient account number (1234567890) without masking. Which regulation does this violate?

A. BSP Circular 808 (IT Risk Management)
B. Data Privacy Act (RA 10173)
C. BSP Circular 1019 (Cyber-Risk Reporting)
D. PCI-DSS

---

### Question 19 (Multiple Choice)

Why should a banking application never accept raw credit card numbers in its own form fields?

A. Credit card numbers are too long for HTML input fields
B. Using payment processor iframes keeps card data out of the application, reducing PCI-DSS scope to SAQ A
C. JavaScript cannot validate card numbers correctly
D. BSP prohibits credit card payments entirely

---

### Question 20 (True/False)

Violations of the Philippine Data Privacy Act (RA 10173) can result in criminal penalties including imprisonment, not just fines.

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
