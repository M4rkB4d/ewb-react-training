# React Developer Onboarding Program

> **EastWest Bank — Digital Platforms & Innovations**
>
> 13-Day Intensive · 9 Levels · 37 Guides · Capstone Project

---

## Program Overview

This is the official React onboarding program for EastWest Bank developers. Over 13 working days, you will go from zero React knowledge to building production-grade banking applications that meet BSP regulatory requirements.

**What you will build**: A fully functional internal banking portal (Vite SPA) and a public-facing application (Next.js) — both with authentication, compliance controls, real-time features, and Azure deployment pipelines.

**Time commitment**: Full-time, 8 hours per day. Morning sessions focus on reading guides and working through examples. Afternoon sessions focus on hands-on exercises, demos, and quizzes. Breaks are built into each day — take them.

**Pacing**: Most days cover one level. Heavier levels (Data & Auth, Security & Compliance) are split across two or three days so you have time to absorb the material. If you finish early, review the companion repo code for that level. If you fall behind, prioritize the Core (A-series) guides — the Vite SPA (B-series) guides can be caught up later.

---

## Prerequisites

Before Day 1, make sure you have:

- [ ] Node.js 22.x installed
- [ ] VS Code with the following extensions: ESLint, Prettier, Tailwind CSS IntelliSense
- [ ] Git configured with your EWB credentials
- [ ] Access to the companion repo (ask your team lead)
- [ ] Basic HTML/CSS knowledge (you do not need to know React or TypeScript)

**Verify your setup** by running the setup check script:

```bash
bash scripts/verify-setup.sh
```

Fix any failures before Day 1. If you hit issues, ask your team lead — do not spend Day 1 morning debugging your environment.

---

## Week 1 — Foundations (Levels 1–5)

### Day 1: Level 1 — Welcome

Get oriented. Understand what React is, learn TypeScript basics, and develop the compliance mindset that drives every technical decision at EWB.

| Session | Content | Est. Time |
|---------|---------|-----------|
| **Morning** | [A01 — What Is React](../guides/level-01-welcome/A01_what-is-react.md) | 2 hours |
| | [A02 — TypeScript for React](../guides/level-01-welcome/A02_typescript-for-react.md) | 3 hours |
| **Afternoon** | [A03 — Thinking in Compliance](../guides/level-01-welcome/A03_thinking-in-compliance.md) | 1 hour |
| | [Level 1 Quiz](quizzes/level-01-quiz.md) | 30 min |
| | [Level 1 Exercises](exercises/level-01-exercises.md) | 1 hour |
| | [Level 1 Demo](demos/level-01-demo.md) | 30 min |

**End-of-day checkpoint**: You can explain what React is, write basic TypeScript types/interfaces, and describe why compliance matters for banking UIs.

---

### Day 2: Level 2 — First App

Set up the project from scratch, build your first components, and write your first test. By the end of today, you have a running application.

| Session | Content | Est. Time |
|---------|---------|-----------|
| **Morning** | [B01 — Project Setup](../guides/level-02-first-app/B01_project-setup.md) | 2 hours |
| | [B01b — Project Tooling and Quality Gates](../guides/level-02-first-app/B01b_project-tooling.md) | 1.5 hours |
| | [A04 — Components and JSX](../guides/level-02-first-app/A04_components-and-jsx.md) | 2 hours |
| **Afternoon** | [A05 — Your First Test](../guides/level-02-first-app/A05_your-first-test.md) | 2 hours |
| | [Level 2 Quiz](quizzes/level-02-quiz.md) | 30 min |
| | [Level 2 Exercises](exercises/level-02-exercises.md) | 30 min |

**End-of-day checkpoint**: You have a running Vite + React + TypeScript project with the EWB Tailwind theme configured and at least one passing test.

---

### Day 3: Level 3 — Building UI

Build a component library with the EWB brand. Learn forms, validation with Zod and React Hook Form, and accessibility fundamentals.

| Session | Content | Est. Time |
|---------|---------|-----------|
| **Morning** | [A06 — Design System Foundations](../guides/level-03-building-ui/A06_design-system-foundations.md) | 3 hours |
| | [A07 — Forms and Validation](../guides/level-03-building-ui/A07_forms-and-validation.md) | 3 hours |
| **Afternoon** | [A08 — Accessibility Essentials](../guides/level-03-building-ui/A08_accessibility-essentials.md) | 2 hours |
| | [Level 3 Quiz](quizzes/level-03-quiz.md) | 30 min |
| | [Level 3 Exercises](exercises/level-03-exercises.md) | 30 min |
| | [Level 3 Demo](demos/level-03-demo.md) | 30 min |

**End-of-day checkpoint**: You have Button, Input, Card, and Badge components using EWB brand colors. You can build a form with Zod validation and explain WCAG 2.1 AA requirements.

---

### Day 4: Level 4 — State and Routing

Learn state management with Zustand, client-side routing with React Router, and how to test components and hooks properly.

| Session | Content | Est. Time |
|---------|---------|-----------|
| **Morning** | [A09 — State Management](../guides/level-04-state-and-routing/A09_state-management.md) | 3 hours |
| | [B02 — Routing and Navigation](../guides/level-04-state-and-routing/B02_routing-and-navigation.md) | 2 hours |
| **Afternoon** | [A10 — Testing Components and Hooks](../guides/level-04-state-and-routing/A10_testing-components-and-hooks.md) | 3 hours |
| | [Level 4 Quiz](quizzes/level-04-quiz.md) | 30 min |
| | [Level 4 Exercises](exercises/level-04-exercises.md) | 30 min |

**End-of-day checkpoint**: You can manage client state with Zustand, set up protected routes, and write component tests with React Testing Library.

---

### Days 5–6: Level 5 — Data and Auth

This is the heaviest level — API integration, authentication, and passkeys. Split across two days so you have time to absorb the material properly. Authentication is critical for banking; rushing it creates security gaps.

**Day 5 — API Integration and Auth Concepts**

| Session | Content | Est. Time |
|---------|---------|-----------|
| **Morning** | [B03 — API Integration](../guides/level-05-data-and-auth/B03_api-integration.md) | 3 hours |
| | Break | 15 min |
| | [A11 — Authentication Part 1: Concepts](../guides/level-05-data-and-auth/A11_authentication-part1.md) | 3 hours |
| **Afternoon** | [Level 5 Exercises](exercises/level-05-exercises.md) — Exercise 1 (API Client) | 1 hour |
| | [Level 5 Demo](demos/level-05-demo.md) — Parts 1-2 (API Client, JWT) | 30 min |

**Day 5 checkpoint**: You can fetch and cache API data with TanStack Query, build an Axios client with interceptors, and explain JWT + refresh token architecture.

**Day 6 — Auth Implementation and Passkeys**

| Session | Content | Est. Time |
|---------|---------|-----------|
| **Morning** | [B04 — Authentication Part 2: Implementation](../guides/level-05-data-and-auth/B04_authentication-part2.md) | 3 hours |
| | Break | 15 min |
| | [A12 — Passkeys and WebAuthn](../guides/level-05-data-and-auth/A12_passkeys-and-webauthn.md) | 3 hours |
| **Afternoon** | [Level 5 Exercises](exercises/level-05-exercises.md) — Exercises 2-3 (MFA Login, Passkeys) | 2.5 hours |
| | [Level 5 Quiz](quizzes/level-05-quiz.md) | 30 min |
| | [Level 5 Demo](demos/level-05-demo.md) — Parts 3-4 (MFA, WebAuthn) | 30 min |

**Day 6 checkpoint**: You can implement JWT authentication with token refresh, build a login flow with MFA, and explain the WebAuthn registration/authentication ceremony for BSP 1213 compliance.

---

## Week 2 — Production (Levels 6–8)

### Day 7: Level 6 — Quality

Error handling patterns, performance optimization, advanced testing strategies, and monitoring with Azure Application Insights.

| Session | Content | Est. Time |
|---------|---------|-----------|
| **Morning** | [A13 — Error Handling](../guides/level-06-quality/A13_error-handling.md) | 3 hours |
| | Break | 15 min |
| | [B05 — Performance Optimization](../guides/level-06-quality/B05_performance-optimization.md) | 2.5 hours |
| **Afternoon** | [A14 — Testing Advanced](../guides/level-06-quality/A14_testing-advanced.md) | 2.5 hours |
| | [Level 6 Quiz](quizzes/level-06-quiz.md) | 30 min |
| | [Level 6 Exercises](exercises/level-06-exercises.md) — Exercise 1 (Error Boundary) | 1 hour |

> **B06 (Monitoring)** moves to Day 8 morning. This keeps Day 7 at a manageable 7.5 hours of guide content.

**End-of-day checkpoint**: You can implement error boundaries, optimize bundle size and rendering, and write integration tests with MSW.

---

### Days 8–10: Level 7 — Security and Compliance

The most critical level for banking. Security hardening, BSP compliance framework, and data privacy (RA 10173). Everything here directly affects audit readiness. Split across **three days** because these topics demand focus — a misunderstood security control is worse than no control at all.

**Day 8 — Monitoring and Security Hardening**

> **Why this order:** Security hardening (A15) comes before deployment (B07).
> You must understand CSP headers, XSS prevention, and security controls
> *before* deploying anything to a real environment. Deploying first and
> hardening later teaches the wrong habit — and in banking, it means
> production exposure before controls are in place.

| Session | Content | Est. Time |
|---------|---------|-----------|
| **Morning** | [B06 — Monitoring and Observability](../guides/level-06-quality/B06_monitoring-and-observability.md) | 2.5 hours |
| | Break | 15 min |
| | [A15 — Security Hardening](../guides/level-07-production/A15_security-hardening.md) — Phases 1-4 (CSP, XSS, SRI, Input Handling) | 3 hours |
| **Afternoon** | [A15 — Security Hardening](../guides/level-07-production/A15_security-hardening.md) — Phases 5-8 (CSRF, OWASP, Audit Findings, Checklist) | 2 hours |
| | [Level 7 Exercises](exercises/level-07-exercises.md) — Exercise 1 (Security Headers) | 1 hour |

**Day 8 checkpoint**: You can configure Azure Application Insights, implement CSP headers, prevent XSS and CSRF attacks, and identify common audit findings.

**Day 9 — BSP Compliance Framework and Deployment**

| Session | Content | Est. Time |
|---------|---------|-----------|
| **Morning** | [A16 — BSP Compliance Framework](../guides/level-07-production/A16_bsp-compliance-framework.md) — Phases 1-3 (BSP Mapping, Audit Trail, Compliance Dashboard) | 3 hours |
| | Break | 15 min |
| | [A16 — BSP Compliance Framework](../guides/level-07-production/A16_bsp-compliance-framework.md) — Phases 4-6 (Automated Checks, Evidence, Examination Prep) | 2.5 hours |
| **Afternoon** | [B07 — Deployment and CI/CD](../guides/level-07-production/B07_deployment-and-cicd.md) | 3 hours |

**Day 9 checkpoint**: You can map BSP circulars to frontend controls, implement audit trail logging, generate compliance evidence, prepare for BSP examination, and configure Azure Pipelines.

**Day 10 — Data Privacy and Compliance Exercises**

| Session | Content | Est. Time |
|---------|---------|-----------|
| **Morning** | [A17 — Data Privacy and Consent](../guides/level-07-production/A17_data-privacy-and-consent.md) | 3 hours |
| | Break | 15 min |
| | [Level 7 Exercises](exercises/level-07-exercises.md) — Exercises 2-3 (Consent, CI/CD) | 2 hours |
| **Afternoon** | [Level 7 Quiz](quizzes/level-07-quiz.md) | 30 min |
| | [Level 7 Demo](demos/level-07-demo.md) | 30 min |
| | Review and catch-up time | 1.5 hours |

**Day 10 checkpoint**: You can handle PII per RA 10173, build a consent management flow, and pass the Level 7 compliance quiz.

---

### Day 11: Level 8 — Architecture and Mastery

Advanced architecture patterns, real-time features (WebSocket, SSE), and internationalization for multi-language banking interfaces.

| Session | Content | Est. Time |
|---------|---------|-----------|
| **Morning** | [A18 — Architecture Patterns](../guides/level-08-mastery/A18_architecture-patterns.md) | 3 hours |
| | Break | 15 min |
| | [B08 — Internationalization](../guides/level-08-mastery/B08_internationalization.md) | 2.5 hours |
| **Afternoon** | [A19 — Real-Time Patterns](../guides/level-08-mastery/A19_real-time-patterns.md) | 2.5 hours |
| | [Level 8 Quiz](quizzes/level-08-quiz.md) | 30 min |
| | [Level 8 Exercises](exercises/level-08-exercises.md) — Exercise 1 (Event Catalog) | 1 hour |

**End-of-day checkpoint**: You can implement feature-sliced architecture, add multi-language support with proper currency/date formatting, and build real-time notification systems.

---

## Week 3 — Next.js and Capstone (Days 12–13)

### Day 12: Level 9 — Public-Facing Applications

Transition from Vite SPA to Next.js. Learn SSR vs SPA decision-making, Server Components, and Azure App Service deployment.

| Session | Content | Est. Time |
|---------|---------|-----------|
| **Morning** | [A20 — SPA vs SSR Decision Framework](../guides/level-09-public-facing/A20_spa-vs-ssr-decision-framework.md) | 2 hours |
| | [A21 — Next.js Project Setup](../guides/level-09-public-facing/A21_nextjs-project-setup.md) | 3 hours |
| **Afternoon** | [A22 — Server Components and Data Fetching](../guides/level-09-public-facing/A22_server-components-data-fetching.md) | 2 hours |
| | [A23 — Server-Side Auth, API Routes, and Composition](../guides/level-09-public-facing/A23_server-components-advanced.md) | 2 hours |
| | [Level 9 Quiz](quizzes/level-09-quiz.md) | 30 min |

> **B10 (Deploying Next.js on Azure)** is recommended reading but not required for the capstone. Complete it if time allows, or read it when you first deploy a Next.js project to production.

**End-of-day checkpoint**: You can set up a Next.js 15 project, build pages with Server Components, implement server-side authentication, create API routes, and explain when to use SSR vs SPA at EWB.

---

### Day 13: Capstone

Bring everything together. Complete the integration capstone, participate in a code review, and demonstrate your work.

| Session | Content | Est. Time |
|---------|---------|-----------|
| **Morning** | [B09 — Integration Capstone](../guides/level-08-mastery/B09_integration-capstone.md) | 4 hours |
| | Review and fix any failing tests across your project | 1 hour |
| **Afternoon** | Code review session with your team lead | 1.5 hours |
| | Final quiz: cross-level assessment | 1 hour |
| | Wrap-up: questions, feedback, next steps | 30 min |

**End-of-day checkpoint**: You have a working portal application that passes all tests, meets EWB design standards, handles authentication, and includes compliance controls. Your code has been reviewed and approved.

---

## Resources

### Companion Repo

The companion repo contains working code for every level. Use it as reference — do not copy-paste from it. Build the code yourself following the guides, then compare with the companion repo when stuck.

```
companion-repo/
├── portal/          ← Vite SPA (Levels 1–8)
└── public-site/     ← Next.js (Level 9)
```

### Reference Materials

| Document | Description |
|----------|-------------|
| [Cheat Sheet](../reference/CHEAT_SHEET.md) | Quick-reference for React, TypeScript, Tailwind, Zod, and more |
| [Glossary](../reference/GLOSSARY.md) | Definitions of terms used across all guides |
| [Guide Index](../reference/INDEX.md) | Complete list of all 37 guides with time estimates |

### Appendix Guides

| Guide | When to Read |
|-------|-------------|
| [X01 — EWB Design System Reference](../guides/appendix/X01_ewb-design-system-reference.md) | Alongside Level 3 (design system) |
| [X02 — BSP Circular Quick Reference](../guides/appendix/X02_bsp-circular-quick-reference.md) | Alongside Level 7 (compliance) |
| [X03 — Migration from v1](../guides/appendix/X03_migration-from-v1.md) | Only if working on legacy v1 codebases |

---

## Assessment and Progress Tracking

### Quizzes

Each level has a quiz. Complete the quiz at the end of each day before moving on.

| Quiz | Level | Location |
|------|-------|----------|
| Level 1 Quiz | Welcome | [quizzes/level-01-quiz.md](quizzes/level-01-quiz.md) |
| Level 2 Quiz | First App | [quizzes/level-02-quiz.md](quizzes/level-02-quiz.md) |
| Level 3 Quiz | Building UI | [quizzes/level-03-quiz.md](quizzes/level-03-quiz.md) |
| Level 4 Quiz | State and Routing | [quizzes/level-04-quiz.md](quizzes/level-04-quiz.md) |
| Level 5 Quiz | Data and Auth | [quizzes/level-05-quiz.md](quizzes/level-05-quiz.md) |
| Level 6 Quiz | Quality | [quizzes/level-06-quiz.md](quizzes/level-06-quiz.md) |
| Level 7 Quiz | Security and Compliance | [quizzes/level-07-quiz.md](quizzes/level-07-quiz.md) |
| Level 8 Quiz | Architecture | [quizzes/level-08-quiz.md](quizzes/level-08-quiz.md) |
| Level 9 Quiz | Public-Facing | [quizzes/level-09-quiz.md](quizzes/level-09-quiz.md) |

### Exercises

Hands-on exercises reinforce each level. Work through them during afternoon sessions.

| Exercise Set | Location |
|-------------|----------|
| Level 1–9 Exercises | [exercises/](exercises/) |
| Level 1–9 Answer Keys | [answer-keys/](answer-keys/) |

> **Rule**: Attempt every exercise before checking the answer key. The struggle is where the learning happens.

### Capstone Project (Day 12)

The capstone is your graduation requirement. You will build a **fund transfer flow** in the portal application that exercises every major pattern from the program.

#### What You Build

A complete transfer feature: select source account, enter recipient details, specify amount/currency, confirm with MFA, show success receipt with transaction reference. The flow must:

- Fetch accounts from the API (TanStack Query + Zod validation)
- Use a multi-step form wizard (React Hook Form + Zod)
- Mask account numbers and PII in the UI (RA 10173)
- Require MFA confirmation before executing (BSP 982)
- Log an audit event for the transfer (BSP 1033)
- Handle errors with an error boundary and user-friendly messages
- Pass TypeScript strict mode with zero errors

#### Grading Criteria

| Criterion | Weight | What Your Team Lead Checks |
|-----------|--------|---------------------------|
| **Working application** | 20% | Portal builds (`npm run build` clean), runs, and the transfer flow works end-to-end |
| **Authentication** | 20% | Login, token refresh, session timeout, and MFA confirmation are implemented |
| **Compliance controls** | 25% | Audit logging, data masking, CSP headers, and consent checks are in place |
| **Code quality** | 20% | TypeScript strict, Zod on all external data, error boundaries, no `any` types |
| **Test coverage** | 15% | Unit tests for utilities, component tests for the transfer form, at least one integration test with MSW |

#### Passing Score

You must score **70% or higher** across all criteria. Any criterion scoring below 50% is an automatic re-do regardless of total score. Your team lead will conduct a code review on Day 12 — come prepared to explain your decisions.

---

## Tips for Success

- **Type every code example yourself.** Do not copy-paste from the guides. The muscle memory matters.
- **Run the code after every change.** Small feedback loops catch mistakes early.
- **Ask questions immediately.** Do not sit stuck for more than 15 minutes — ask your team lead or post in the team channel.
- **Take the quizzes seriously.** They surface gaps you did not know you had.
- **Read the compliance guides carefully.** At EWB, security and compliance are not optional extras — they are the foundation.

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
