# Pre-Training Assessment

> **EastWest Bank — Digital Platforms & Innovations**
>
> React Training Program · Baseline Knowledge Assessment

---

## Instructions

- Answer all 20 questions.
- For multiple choice, select the single best answer (A/B/C/D).
- For true/false, write True or False.
- This assessment is diagnostic only — it is not graded. Answer honestly based on what you currently know.
- Do not look up answers. The purpose is to measure your starting point so we can track your growth throughout the program.

---

### Question 1 (Multiple Choice)

What does the expression `UI = f(state)` mean in the context of React?

A. The UI framework requires a function called `f` to initialize application state
B. The user interface is a function of the application's state — given the same state, you always get the same UI
C. React uses a formula to calculate the optimal UI layout
D. The UI must be rebuilt from scratch every time the state changes

---

### Question 2 (True/False)

In React, you should modify state variables directly (e.g., `count = count + 1`) rather than using a setter function like `setCount`.

---

### Question 3 (Multiple Choice)

What is the primary benefit of TypeScript in a React project?

A. TypeScript makes the application run faster in the browser
B. TypeScript catches type errors at build time before the code reaches production
C. TypeScript replaces the need for unit tests
D. TypeScript is required by React 19 and the application will not compile without it

---

### Question 4 (Multiple Choice)

What does JSX compile to?

A. HTML that the browser renders directly
B. JavaScript function calls (e.g., `React.createElement()`) that produce a virtual DOM tree
C. CSS class definitions that style the component
D. TypeScript type declarations for the component

---

### Question 5 (True/False)

In a well-structured React project, a component's unit tests should be placed in a centralized `__tests__/` folder at the project root, far from the component source file.

---

### Question 6 (Multiple Choice)

What is the purpose of a design system in a banking application?

A. To make every page look identical regardless of its function
B. To provide reusable, consistent UI components with shared tokens (colors, spacing, typography) so the application looks and behaves consistently
C. To eliminate the need for CSS by using only JavaScript for styling
D. To automatically generate UI layouts from database schemas

---

### Question 7 (Multiple Choice)

What is the minimum color contrast ratio required by WCAG 2.1 AA for normal-sized text?

A. 2:1
B. 3:1
C. 4.5:1
D. 7:1

---

### Question 8 (True/False)

In a banking application, frontend form validation is sufficient to enforce transaction limits. Backend validation is optional since the frontend already prevents invalid amounts.

---

### Question 9 (Multiple Choice)

In a React application, what is the difference between "client state" and "server state"?

A. Client state is stored in the database; server state is stored in the browser
B. Client state is UI-related data the user controls (theme, sidebar open); server state is data fetched from an API that the server owns
C. Client state uses Redux; server state uses React Context
D. There is no practical difference — all state is managed the same way

---

### Question 10 (Multiple Choice)

What is the purpose of a "protected route" in a React application?

A. It encrypts all data transmitted on that route
B. It checks whether the user is authenticated (and optionally authorized) before rendering the page, redirecting to login if not
C. It prevents the route from being indexed by search engines
D. It adds HTTPS to the route automatically

---

### Question 11 (True/False)

A JSON Web Token (JWT) payload is encrypted, so its contents cannot be read without the server's secret key.

---

### Question 12 (Multiple Choice)

Where should an access token be stored in a banking SPA to best protect it from XSS attacks?

A. `localStorage`
B. `sessionStorage`
C. A cookie without the `HttpOnly` flag
D. In-memory (a JavaScript variable, e.g., in a state management store)

---

### Question 13 (Multiple Choice)

What does an error boundary in React do?

A. It catches all JavaScript errors anywhere in the application, including async code and event handlers
B. It catches errors during rendering and displays a fallback UI instead of crashing the entire application
C. It sends error reports to the server automatically
D. It prevents users from entering invalid data in forms

---

### Question 14 (True/False)

When using React 19 with the React Compiler, developers should still manually add `useMemo` and `useCallback` to every component for optimal performance.

---

### Question 15 (Multiple Choice)

Which HTTP header prevents a banking application from being embedded in an iframe on a malicious site (clickjacking)?

A. `Content-Type: application/json`
B. `X-Frame-Options: DENY` or `frame-ancestors 'none'` in CSP
C. `Authorization: Bearer <token>`
D. `Cache-Control: no-store`

---

### Question 16 (Multiple Choice)

What is the primary benefit of a CI/CD pipeline for a banking web application?

A. It eliminates the need for code reviews
B. It automates testing, building, and deployment so that every code change is verified before reaching production
C. It makes the application run faster by optimizing JavaScript at build time
D. It replaces version control systems like Git

---

### Question 17 (True/False)

In a feature-based project structure, shared utility code in `lib/` should freely import from feature modules like `features/payments/` to access payment-specific logic.

---

### Question 18 (Multiple Choice)

What is the key difference between a Single Page Application (SPA) and Server-Side Rendering (SSR)?

A. SPAs cannot use JavaScript; SSR applications can
B. In an SPA, the browser renders the UI using JavaScript after receiving a minimal HTML shell; in SSR, the server sends fully rendered HTML on each request
C. SSR applications cannot have interactive UI elements
D. SPAs are always faster than SSR applications

---

### Question 19 (True/False)

In Next.js App Router, every component is a Client Component by default and must be explicitly marked as a Server Component.

---

### Question 20 (Multiple Choice)

Why is server-side rendering preferred over client-side rendering for a bank's public-facing product pages that must be indexed by search engines?

A. Server-side rendering is required by Philippine law for all websites
B. Search engines may not reliably index JavaScript-rendered content, and regulators checking page source would see an empty HTML shell with client-side rendering
C. Client-side rendering cannot display images or videos
D. Server-side rendering eliminates the need for a CDN

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
