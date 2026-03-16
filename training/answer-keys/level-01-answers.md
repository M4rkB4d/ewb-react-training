# Level 1 Answer Key — Welcome

> **EastWest Bank — Digital Platforms & Innovations**
>
> React Training Program · Level 1 Instructor Reference

---

## Quiz Answers

### Question 1 — Answer: B

React lets you describe what the UI should look like for any given data and handles DOM updates automatically. This is declarative programming — you describe the result, React handles the how. Options A, C, and D mischaracterize what React does.

### Question 2 — Answer: True

Component names must start with a capital letter. React uses casing to distinguish between HTML elements (lowercase) and custom components (uppercase) — `accountCard` would be interpreted as an HTML element, not a component.

### Question 3 — Answer: B

`UI = f(state)` means the user interface is a function of the application's state. When state changes, React re-runs the component functions and updates the DOM. Options A, C, and D all misinterpret the equation.

### Question 4 — Answer: B

`useState` triggers a re-render when updated via its setter function. `useRef` stores a value that persists across renders without causing re-renders. Use `useState` for data the user should see, and `useRef` for DOM references or values you need to track silently.

### Question 5 — Answer: True

Calling `setCount` tells React the value changed and triggers a re-render. Direct assignment (`count = count + 1`) would mutate a local variable that React never sees, so the UI would not update.

### Question 6 — Answer: C

Without a dependency array, the effect runs after every single render. This is almost always a bug because it can cause infinite loops (if the effect updates state, which triggers another render, which runs the effect again). An empty array `[]` runs the effect only once on mount.

### Question 7 — Answer: B

Without cleanup, intervals and event listeners keep running after the component is removed from the page, causing memory leaks. The cleanup function (returned from the effect) clears these when the component unmounts or before the effect re-runs.

### Question 8 — Answer: True

React 19 accepts `ref` as a regular prop on custom components. The `forwardRef` wrapper that was required in React 18 and earlier is no longer needed.

### Question 9 — Answer: B

The convention is: use `interface` for component props (making prop definitions immediately recognizable) and `type` for unions, computed types, and primitives. Options A, C, and D do not match the documented convention.

### Question 10 — Answer: C

`any` disables TypeScript's type checking entirely, allowing bugs to slip through. The type-safe alternative is `unknown`, which forces you to validate or narrow the type before using the data. In banking code, a type error can mean a customer loses money.

### Question 11 — Answer: True

TypeScript catches type errors at compile time (when the code is being built), not at runtime. This is its core value for banking applications — bugs are caught before code ever runs in production. For runtime validation, we use Zod.

### Question 12 — Answer: B

The guides teach defining Zod schemas first, then extracting TypeScript types with `z.infer<typeof schema>`. This keeps runtime validation and compile-time types permanently in sync. Option A gets the order backwards, and options C and D misrepresent Zod's purpose.

### Question 13 — Answer: B

`z.parse()` throws a ZodError if validation fails, crashing the application unless caught. `z.safeParse()` never throws — it returns `{ success: true, data }` or `{ success: false, error }`, letting you handle invalid data gracefully. Use `safeParse()` for API responses and `parse()` for startup configuration where failure should be fatal.

### Question 14 — Answer: True

Under the DPA (RA 10173), an IP address is considered personal information because it can directly or indirectly identify a person. The DPA's definition of personal information is broad and includes any data that can be linked to an individual.

### Question 15 — Answer: B

BSP Circular 1213 (AFASA) requires banks to migrate from SMS-based OTP to phishing-resistant authentication methods such as passkeys (FIDO2/WebAuthn) by June 2026. SMS OTP is vulnerable to SIM swapping, SS7 attacks, and social engineering.

### Question 16 — Answer: B

The three regulators are: BSP (Bangko Sentral ng Pilipinas — banking operations), NPC (National Privacy Commission — data privacy), and AMLC (Anti-Money Laundering Council — financial crime). Each governs a different aspect of how digital banking applications must be built.

### Question 17 — Answer: False

Under the DPA, consent is purpose-limited. Data collected for account opening cannot be used for marketing without separate, explicit consent. The UI must enforce this boundary with distinct consent checkboxes for each purpose.

### Question 18 — Answer: B

This violates the Data Privacy Act (RA 10173). Account numbers are personal information that must be masked when displayed. The standard pattern shows only the last 4 digits (e.g., "------7890") to prevent shoulder surfing and screenshot-based data theft.

### Question 19 — Answer: B

Using payment processor iframes (hosted fields) means card numbers never touch the application — they go directly from the iframe to the payment processor. This reduces PCI-DSS scope to SAQ A (the smallest scope), saving months of audit work. Options A, C, and D are factually incorrect.

### Question 20 — Answer: True

The DPA carries criminal penalties including imprisonment of one to six years, plus fines. This makes it one of the stricter data privacy laws in the region. Privacy violations are not just a corporate liability — they can result in personal criminal liability.

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
