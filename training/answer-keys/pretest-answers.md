# Pre-Training Assessment — Answer Key

> **EastWest Bank — Digital Platforms & Innovations**
>
> React Training Program · Instructor Reference

---

## Purpose

This pretest establishes a baseline measurement of each trainee's knowledge before the program begins. Compare results against level quiz scores to quantify learning gain. The pretest is diagnostic — it should not be graded or used for pass/fail decisions.

## Scoring Guide

| Score | Interpretation |
|-------|---------------|
| 0–5 | Beginner — limited React/web security knowledge. Will benefit most from Levels 1–3. |
| 6–10 | Intermediate — solid web fundamentals, gaps in React patterns or banking-specific security. |
| 11–15 | Advanced — strong foundation. Focus training time on Levels 5–9 (auth, quality, production, architecture). |
| 16–20 | Expert — already knows most of the material. Can serve as a peer mentor during exercises. |

---

## Quiz Answers

### Question 1 — Answer: B

`UI = f(state)` means the user interface is a pure function of the application's state. When state changes, React re-runs the component functions and updates the DOM to match. This declarative model is fundamental to React — you describe what the UI should look like, not how to update it step by step.

*Maps to: Level 1 — A01 What is React*

### Question 2 — Answer: False

Direct mutation (`count = count + 1`) changes a local variable that React does not observe. The UI will not update. You must use the setter function (`setCount(count + 1)`) so React knows the value changed and triggers a re-render.

*Maps to: Level 1 — A01 What is React*

### Question 3 — Answer: B

TypeScript catches type errors at compile time (during `tsc` or the build step), preventing entire categories of bugs from reaching production. It does not affect runtime performance (A), does not replace tests (C), and is not required by React (D) — though it is strongly recommended.

*Maps to: Level 1 — A02 TypeScript for React*

### Question 4 — Answer: B

JSX is syntactic sugar. The build tool (Vite/Babel) transforms JSX into `React.createElement()` calls (or the JSX runtime equivalent in React 17+), producing a virtual DOM tree of plain JavaScript objects. The browser never sees JSX directly.

*Maps to: Level 2 — A04 Components and JSX*

### Question 5 — Answer: False

Co-locating tests next to the source files they test (e.g., `button.test.tsx` beside `button.tsx`) is the recommended practice. It makes tests easier to find, maintain, and ensures they move with the component during refactoring.

*Maps to: Level 2 — A05 Your First Test*

### Question 6 — Answer: B

A design system provides reusable components, design tokens (colors, spacing, typography), and patterns that ensure visual and behavioral consistency across the application. It is not about making pages identical (A) or eliminating CSS (C).

*Maps to: Level 3 — A06 Design System Foundations*

### Question 7 — Answer: C

WCAG 2.1 AA requires a minimum contrast ratio of 4.5:1 for normal text. Large text (18px+ regular or 14px+ bold) requires 3:1. This is a compliance requirement for banking applications under BSP Circular 1033.

*Maps to: Level 3 — A08 Accessibility Essentials*

### Question 8 — Answer: False

Frontend validation is a UX convenience, not a security control. Users can bypass any frontend check using browser DevTools or direct API calls. Backend validation is mandatory — especially for financial limits where AMLA compliance requires server-side enforcement.

*Maps to: Level 3 — A07 Forms and Validation*

### Question 9 — Answer: B

Client state is data the application owns and the user controls — UI preferences, form inputs, sidebar open/closed. Server state is data that originates from the backend and must be fetched, cached, and kept in sync — account balances, transaction history, user profiles. Tools like Zustand handle client state; TanStack Query handles server state.

*Maps to: Level 4 — A09 State Management*

### Question 10 — Answer: B

A protected route checks authentication (is the user logged in?) and optionally authorization (does the user have the required role?) before rendering. If the check fails, the user is redirected to the login page. This prevents unauthorized access to sensitive pages like account dashboards or fund transfers.

*Maps to: Level 4 — B02 Routing and Navigation*

### Question 11 — Answer: False

JWT payloads are Base64Url-encoded, not encrypted. Anyone with the token can decode and read the payload using `atob()` or tools like jwt.io. Only the signature is cryptographic — it proves the token was issued by the server and has not been tampered with. Never store sensitive data in JWT payloads.

*Maps to: Level 5 — A11 Authentication Part 1*

### Question 12 — Answer: D

In-memory storage (a JavaScript variable in a state management store like Zustand) is the most XSS-resistant option for access tokens. `localStorage` and `sessionStorage` are trivially accessible to any injected script. Non-HttpOnly cookies are also readable by JavaScript. Note: in-memory storage is XSS-resistant, not XSS-proof — an active XSS exploit can still access JavaScript variables.

*Maps to: Level 5 — A11 Authentication Part 1*

### Question 13 — Answer: B

Error boundaries catch errors during rendering, lifecycle methods, and constructors of the component tree below them. They display a fallback UI instead of a white screen. They do NOT catch errors in event handlers, async code, or server-side rendering — those require try/catch.

*Maps to: Level 6 — A13 Error Handling*

### Question 14 — Answer: False

React Compiler is a build-time tool that automatically memoizes components, values, and callbacks. For new code, developers should not add manual `useMemo` or `useCallback` — the compiler handles this. Adding manual memoization on top of the compiler is redundant.

*Maps to: Level 6 — B05 Performance Optimization*

### Question 15 — Answer: B

`X-Frame-Options: DENY` or the CSP directive `frame-ancestors 'none'` prevents a page from being embedded in an iframe. This blocks clickjacking attacks where an attacker overlays a transparent iframe of your banking site on their malicious page to trick users into clicking buttons.

*Maps to: Level 7 — A15 Security Hardening*

### Question 16 — Answer: B

A CI/CD pipeline automates the verification and deployment process: running linters, type checks, unit tests, integration tests, building the application, and deploying to staging/production. Every code change is verified before it can affect users, reducing the risk of regressions reaching production.

*Maps to: Level 7 — B07 Deployment and CI/CD*

### Question 17 — Answer: False

The dependency rule in feature-based architecture is one-way: features import from shared code (`lib/`, `components/`, `hooks/`), but shared code must never import from features. If shared code needs feature data, it accepts props instead. This prevents circular dependencies and keeps shared code reusable across features.

*Maps to: Level 8 — A18 Architecture Patterns*

### Question 18 — Answer: B

In an SPA, the server sends a minimal HTML shell (`<div id="root"></div>`) and JavaScript renders the UI in the browser. In SSR, the server runs the application code and sends fully rendered HTML, which the browser can display immediately. SSR provides better SEO, faster initial paint, and server-side data access.

*Maps to: Level 9 — A20 SPA vs SSR Decision Framework*

### Question 19 — Answer: False

The opposite is true. In Next.js App Router, every component is a Server Component by default. To make a component run in the browser (for interactivity, useState, event handlers), you must add `'use client'` as the first line of the file.

*Maps to: Level 9 — A22 Server Components and Data Fetching*

### Question 20 — Answer: B

With client-side rendering, the browser receives an empty HTML shell. Fee disclosures and product information only appear after JavaScript loads and executes. Search engines may not reliably index this content, and regulators checking page source would see an empty page. Server-side rendering ensures all content is present in the HTML response.

*Maps to: Level 9 — A20 SPA vs SSR Decision Framework*

---

## Level Mapping Summary

| Question | Level | Topic |
|----------|-------|-------|
| 1–2 | Level 1 | React fundamentals, state model |
| 3 | Level 1 | TypeScript benefits |
| 4–5 | Level 2 | JSX, testing co-location |
| 6–8 | Level 3 | Design system, accessibility, validation |
| 9–10 | Level 4 | State management, routing |
| 11–12 | Level 5 | JWT, token storage |
| 13–14 | Level 6 | Error handling, React Compiler |
| 15–16 | Level 7 | Security headers, CI/CD |
| 17 | Level 8 | Architecture patterns |
| 18–20 | Level 9 | SPA vs SSR, Next.js, compliance |

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
