# React at EWB — Fast-Track Guide

> **EastWest Bank — Digital Platforms & Innovations**
>
> 3-Day Fast Track · For Experienced React/TypeScript Developers

---

## Who This Is For

You already know React and TypeScript. You have built production applications before. You do not need someone to explain `useState` or how JSX works.

What you *do* need is EWB-specific context: our design system, compliance requirements, authentication patterns, deployment infrastructure, and the regulatory constraints that shape every technical decision at a Philippine bank.

**This track gets you production-ready in 3 days instead of 2 weeks.**

---

## What You Can Skip

The full onboarding program is 9 levels across 37 guides. As an experienced developer, you can skip the foundational material:

| Skip | Guide | Reason |
|------|-------|--------|
| Yes | A01 — What Is React | You know this |
| Yes | A02 — TypeScript for React | You know this |
| Yes | A04 — Components and JSX | You know this |
| Yes | A05 — Your First Test | You know this |
| Skim | B01 + B01b — Project Setup & Tooling | Skim for EWB-specific config (Tailwind theme, `cn()` utility, folder structure, Git hooks) |
| Skim | A08 — Accessibility Essentials | Skim unless you need a WCAG 2.1 AA refresher |
| Skim | A09 — State Management | Skim if you already know Zustand; read the EWB store patterns |
| Skim | B02 — Routing and Navigation | Skim for protected route patterns |
| Skim | A10 — Testing Components and Hooks | Skim for EWB testing conventions |

Everything else, you should read in full. The compliance, security, and architecture guides contain EWB-specific patterns you will not find elsewhere.

---

## Day 1: Compliance + Architecture + Design System

The most important day. Everything at EWB is built on compliance. You need to internalize this before writing a single line of code.

### Morning

| Order | Guide | Why It Matters |
|-------|-------|----------------|
| 1 | [A03 — Thinking in Compliance](../guides/level-01-welcome/A03_thinking-in-compliance.md) | The mental model. Every technical decision at EWB passes through a compliance lens. BSP circulars, RA 10173, PCI-DSS — this guide maps them to frontend concerns. |
| 2 | [A06 — Design System Foundations](../guides/level-03-building-ui/A06_design-system-foundations.md) | EWB brand tokens, component library patterns, Tailwind 4 theme. You will use these components in everything you build. |

### Afternoon

| Order | Guide | Why It Matters |
|-------|-------|----------------|
| 3 | [A18 — Architecture Patterns](../guides/level-08-mastery/A18_architecture-patterns.md) | Feature-sliced architecture, module boundaries, dependency rules. This is how EWB projects are structured. |
| 4 | [A09 — State Management](../guides/level-04-state-and-routing/A09_state-management.md) | Skim for EWB-specific Zustand patterns: auth store, feature stores, devtools configuration. Skip the basics if you know Zustand. |

### Day 1 Exercises

- [ ] Set up the portal project following B01 (skim mode — focus on EWB theme config)
- [ ] Build 3 components from the EWB design system (Button, Input, Card) using the patterns from A06
- [ ] [Level 3 Exercises](exercises/level-03-exercises.md) — complete exercises 1 and 2
- [ ] [Level 1 Quiz](quizzes/level-01-quiz.md) — take it cold to confirm you can skip Level 1

**Day 1 checkpoint**: You can explain EWB's compliance obligations, build components with the EWB design system, and describe the architecture pattern used across EWB projects.

---

## Day 2: Security + Authentication + Privacy

BSP Circular 1213 (AFASA) mandates phishing-resistant authentication by June 2026. This is not theoretical — it is a regulatory deadline. Every EWB developer must understand the auth stack.

### Morning

| Order | Guide | Why It Matters |
|-------|-------|----------------|
| 1 | [A11 — Authentication Part 1: Concepts](../guides/level-05-data-and-auth/A11_authentication-part1.md) | JWT architecture, refresh token rotation, session management. As an experienced dev, skim the JWT basics but read the EWB-specific interceptor and refresh patterns carefully. |
| 2 | [A15 — Security Hardening](../guides/level-07-production/A15_security-hardening.md) | CSP headers, XSS prevention, CSRF protection, subresource integrity. Skim patterns you already know; focus on the hardening checklist. |

### Afternoon

| Order | Guide | Why It Matters |
|-------|-------|----------------|
| 3 | [A16 — BSP Compliance Framework](../guides/level-07-production/A16_bsp-compliance-framework.md) | Maps every BSP circular to frontend controls. Audit trail implementation, data retention. This is what auditors look at. |
| 4 | [A17 — Data Privacy and Consent](../guides/level-07-production/A17_data-privacy-and-consent.md) | RA 10173 (Philippine DPA) implementation: PII handling, consent management, data masking. Skim implementation details; focus on the requirements. |

> **A12 (Passkeys and WebAuthn)** is listed under Day 3 morning. It requires focused attention — do not rush it alongside all of security and compliance.

**Day 2 checkpoint**: You can implement JWT auth with refresh token rotation, configure security headers, and describe the BSP compliance controls required for your application.

---

## Day 3: Integration + Production + Next.js

Connect everything. API integration, CI/CD, real-time patterns, and the Next.js track for public-facing applications.

### Morning

| Order | Guide | Why It Matters |
|-------|-------|----------------|
| 1 | [A12 — Passkeys and WebAuthn](../guides/level-05-data-and-auth/A12_passkeys-and-webauthn.md) | WebAuthn registration and authentication flows, resident credentials. Required for BSP 1213 (AFASA) compliance — June 2026 deadline. |
| 2 | [B03 — API Integration](../guides/level-05-data-and-auth/B03_api-integration.md) | TanStack Query patterns, Zod response validation, optimistic updates. The "Zod everywhere" pattern is an EWB standard. Skim the TanStack basics if you know them; focus on EWB's API client architecture. |

### Afternoon

| Order | Guide | Why It Matters |
|-------|-------|----------------|
| 3 | [B07 — Deployment and CI/CD](../guides/level-07-production/B07_deployment-and-cicd.md) | Azure Pipelines configuration, staging/production environments, blue-green deployment. No GitHub Actions — EWB uses Azure Pipelines exclusively. Skim if you know CI/CD; focus on the EWB pipeline structure. |
| 4 | [A19 — Real-Time Patterns](../guides/level-08-mastery/A19_real-time-patterns.md) | WebSocket and SSE patterns for live data (transaction feeds, notifications). Skim for patterns; you likely know the fundamentals. |
| 5 | [A20 — SPA vs SSR Decision Framework](../guides/level-09-public-facing/A20_spa-vs-ssr-decision-framework.md) | When to use Vite SPA vs Next.js at EWB. The decision matrix is the key takeaway. |

### Day 3 Exercises

- [ ] [Level 5 Exercises](exercises/level-05-exercises.md) — complete exercises on API integration and auth flow
- [ ] [Level 7 Exercises](exercises/level-07-exercises.md) — complete the security hardening checklist exercise
- [ ] [Level 8 Exercises](exercises/level-08-exercises.md) — complete the real-time notification exercise
- [ ] [Level 7 Quiz](quizzes/level-07-quiz.md) — this is the most important quiz; it covers compliance

**Day 3 checkpoint**: You can integrate APIs with TanStack Query and Zod validation, configure Azure Pipelines, implement real-time data patterns, and set up a Next.js project for public-facing use.

---

## Key Differences from Standard React

If you are coming from another company or open-source React work, these are the patterns that will feel different at EWB:

### Zod Everywhere

Every API response, every form input, every route parameter is validated with Zod at runtime. This is not optional. TypeScript types are not enough — runtime validation catches contract drift between frontend and backend.

```typescript
// This is how every API call looks at EWB
const AccountSchema = z.object({
  accountNumber: z.string().regex(/^\d{10}$/),
  balance: z.number().int().nonnegative(), // centavos
  currency: z.enum(['PHP', 'USD']),
  status: z.enum(['active', 'dormant', 'closed']),
});

const accounts = AccountSchema.array().parse(response.data);
```

### Data Masking by Default

PII is masked in the UI, in logs, and in error reports. Account numbers show only the last 4 digits. Names are masked in non-essential contexts. This is a RA 10173 requirement.

### Audit Trail on Financial Operations

Every financial operation (transfer, payment, account inquiry) generates an audit event with timestamp, user ID, action type, and outcome. This is not backend-only — the frontend initiates and tracks these events.

### EWB Design System

All components use EWB brand tokens (Purple `#500778`, Magenta `#b1006f`, Gold `#dba464`, Lime `#d5e04d`, Navy `#06357A`). No arbitrary colors. The design system is built on Tailwind CSS 4 with custom theme tokens.

### Azure-Only Infrastructure

No AWS. No Vercel. No Netlify. Everything deploys to Azure:
- **Vite SPA** → Azure Blob Storage + CDN (via Azure Front Door)
- **Next.js** → Azure App Service
- **CI/CD** → Azure Pipelines (not GitHub Actions)
- **Monitoring** → Azure Application Insights
- **Secrets** → Azure Key Vault

### BSP Compliance is a Feature, Not a Checkbox

BSP circulars (808, 982, 1019, 1033, 1105, 1122, 1213) are not something you bolt on at the end. They influence architecture, authentication, error handling, logging, and deployment. Guide A03 explains the mindset; A16 provides the implementation framework.

---

## Exercises to Complete (Cherry-Picked)

You do not need to do every exercise from the full program. These are the ones that matter most for an experienced developer:

| Priority | Exercise | From Level | Focus |
|----------|----------|------------|-------|
| Required | EWB Design System components | Level 3 | Build Button, Input, Card, Badge with EWB tokens |
| Required | Auth flow implementation | Level 5 | JWT + refresh tokens + protected routes |
| Required | Security hardening checklist | Level 7 | CSP, XSS prevention, security headers |
| Required | BSP compliance controls | Level 7 | Audit trail, data masking, consent management |
| Required | API integration with Zod validation | Level 5 | TanStack Query + Zod response parsing |
| Recommended | Passkey registration/authentication | Level 5 | WebAuthn flow (BSP 1213 deadline: June 2026) |
| Recommended | Azure Pipeline configuration | Level 7 | Build + test + deploy pipeline |
| Recommended | Real-time notification system | Level 8 | WebSocket/SSE integration |
| Optional | Integration capstone (B09) | Level 8 | Full application with all patterns integrated |

---

## Final Validation

After 3 days, you should be able to demonstrate all of the following. If you cannot, go back and fill the gap before starting production work.

### Must Have

- [ ] **Explain EWB's compliance obligations**: Name the relevant BSP circulars and their frontend implications. Explain RA 10173 requirements for PII handling.
- [ ] **Build with the EWB design system**: Create components using EWB brand tokens and Tailwind 4 theme. Use the `cn()` utility for variant management.
- [ ] **Implement authentication**: JWT with refresh token rotation, protected routes, session timeout handling. Explain the passkey/WebAuthn flow.
- [ ] **Validate everything with Zod**: API responses, form inputs, route parameters, environment variables. No unvalidated external data.
- [ ] **Configure security headers**: CSP, X-Frame-Options, Strict-Transport-Security, and other headers from the hardening checklist.
- [ ] **Implement audit logging**: Financial operations generate audit events with the required fields.
- [ ] **Mask PII**: Account numbers, names, and other PII are masked in UI, logs, and error reports.
- [ ] **Deploy to Azure**: Configure an Azure Pipeline that builds, tests, and deploys a Vite SPA to Blob Storage.

### Should Have

- [ ] **Build with Next.js**: Set up a Next.js 16 project with Server Components and deploy to Azure App Service.
- [ ] **Implement real-time features**: WebSocket or SSE connection with reconnection logic and state synchronization.
- [ ] **Write comprehensive tests**: Unit tests for utilities, component tests for key flows, integration tests with MSW.
- [ ] **Describe the architecture**: Explain the feature-sliced architecture pattern and module boundary rules used at EWB.

---

## Additional Reading

If you finish early or want deeper context on specific topics:

| Guide | Topic |
|-------|-------|
| [A07 — Forms and Validation](../guides/level-03-building-ui/A07_forms-and-validation.md) | React Hook Form + Zod patterns |
| [A13 — Error Handling](../guides/level-06-quality/A13_error-handling.md) | Error boundaries, retry logic, user-facing error states |
| [A14 — Testing Advanced](../guides/level-06-quality/A14_testing-advanced.md) | MSW, integration testing, test architecture |
| [B05 — Performance Optimization](../guides/level-06-quality/B05_performance-optimization.md) | Bundle splitting, lazy loading, render optimization |
| [B06 — Monitoring and Observability](../guides/level-06-quality/B06_monitoring-and-observability.md) | Azure Application Insights, custom telemetry |
| [B08 — Internationalization](../guides/level-08-mastery/B08_internationalization.md) | Multi-language support, currency/date formatting |
| [A22 — Server Components and Data Fetching](../guides/level-09-public-facing/A22_server-components-data-fetching.md) | React Server Components, data fetching, caching |
| [A23 — Server-Side Auth, API Routes, and Composition](../guides/level-09-public-facing/A23_server-components-advanced.md) | Server-side auth, route handlers, composition patterns |
| [X02 — BSP Circular Quick Reference](../guides/appendix/X02_bsp-circular-quick-reference.md) | All BSP circulars in one page |

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
