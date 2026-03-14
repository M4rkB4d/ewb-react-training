# Glossary

> **EastWest Bank — Digital Platforms & Innovations**

---

## A

**AFASA** — Anti-Financial Account Scam Act (RA 12010). Philippine law
requiring phishing-resistant authentication for financial services. BSP
Circular 1213 implements the rules. Deadline: June 2026.

**AMLA** — Anti-Money Laundering Act (RA 9160). Requires KYC, suspicious
transaction reporting, and 5-year record retention.

**Audit Trail** — Chronological record of system activities. BSP 1019
requires logging all financial operations with timestamp, user, action, and
outcome.

**Axios** — HTTP client library used for all API calls. Configured with
interceptors for auth token injection and error handling.

---

## B

**BSP** — Bangko Sentral ng Pilipinas. The central bank of the Philippines.
Regulates all banking operations including digital channels.

**Bounded Context** — DDD concept. A boundary within which a particular
domain model applies. In the frontend, each feature module is a bounded
context.

---

## C

**CLS** — Cumulative Layout Shift. Web Vital measuring unexpected layout
movements. Target: < 0.1.

**CSP** — Content Security Policy. HTTP header that restricts which
resources the browser can load. Prevents XSS by blocking inline scripts.

**CTAP2** — Client to Authenticator Protocol 2. The protocol between the
browser and a hardware authenticator (e.g., fingerprint sensor).

---

## D

**DDD** — Domain-Driven Design. Software design approach that models code
around business domains. Applied to frontend via feature-slice architecture.

**DPA** — Data Privacy Act (RA 10173). Philippine law governing personal
data processing. Requires consent, data minimization, and data subject
rights.

**DOMPurify** — Library for sanitizing HTML to prevent XSS attacks. Used
when rendering user-generated HTML content.

---

## E

**E2E** — End-to-End testing. Tests that simulate real user interactions
in a browser using Playwright.

**Error Boundary** — React component that catches JavaScript errors in its
child component tree. Implemented as a class component (no hook equivalent).

**Event Bus** — Pub/sub messaging system for cross-feature communication.
Features emit events; other features subscribe without direct imports.

---

## F

**Facade Pattern** — A design pattern that provides a simplified interface
to a complex subsystem. Each feature module exports a facade via `index.ts`.

**Feature-Slice Architecture** — Code organization by business capability.
Each feature has its own API, components, hooks, stores, and types.

**FIDO2** — The standard encompassing WebAuthn and CTAP2 for passwordless
authentication. Passkeys are FIDO2 credentials.

---

## H

**HttpOnly Cookie** — A cookie that cannot be accessed by JavaScript. Used
for refresh tokens to prevent XSS theft.

---

## I

**ICU MessageFormat** — International Components for Unicode message syntax.
Used by react-intl for pluralization and complex translations.

**INP** — Interaction to Next Paint. Web Vital measuring responsiveness.
Target: < 200ms.

---

## J

**JWT** — JSON Web Token. Compact token format used for authentication.
Contains header, payload, and signature.

---

## K

**KYC** — Know Your Customer. Identity verification process required by
AMLA. Three tiers: basic, enhanced, high-risk.

---

## L

**LCP** — Largest Contentful Paint. Web Vital measuring time to render the
largest visible element. Target: < 2.5s.

**Lazy Loading** — Loading code on demand. Routes use `lazy()` to create
separate chunks downloaded only when visited.

---

## M

**MFA** — Multi-Factor Authentication. Requires two or more verification
factors. BSP 982 mandates MFA for digital banking.

**MSW** — Mock Service Worker. Library for intercepting API calls in tests.
Uses service workers in the browser and Node.js in test environments.

**Money (Value Object)** — Immutable pairing of amount (in centavos) and
currency. Example: `Money { amount: 500_000, currency: 'PHP' }` = ₱5,000.00.
Never use floating-point for financial amounts.

---

## N

**NPC** — National Privacy Commission. Philippine government body enforcing
the Data Privacy Act.

---

## O

**OAuth 2.0** — Authorization framework. EWB uses Authorization Code Flow
with PKCE for single-page applications.

**Optimistic Update** — Updating the UI before the server confirms the
operation. Used for transfers and payments to feel instant.

---

## P

**Passkey** — A FIDO2 credential stored by the operating system or password
manager. Phishing-resistant because it is bound to the website origin.

**PCI-DSS** — Payment Card Industry Data Security Standard. Defines
security requirements for handling card data. Frontend achieves SAQ A scope
reduction through iframe tokenization.

**PHP** — Philippine Peso. The primary currency in all EWB applications.
ISO 4217 code: PHP. Symbol: ₱.

**PKCE** — Proof Key for Code Exchange. Extension to OAuth 2.0 that prevents
authorization code interception. Required for SPA OAuth flows.

---

## Q

**Query Key Factory** — Pattern for creating hierarchical TanStack Query
cache keys. Enables targeted cache invalidation.

---

## R

**RBAC** — Role-Based Access Control. Users are assigned roles (customer,
teller, manager, admin) that determine feature access.

**React Compiler** — Separate build tool that performs compile-time optimization
for React 19, automatically inserting memoization. Replaces manual `useMemo`
and `useCallback`.

**RTL** — React Testing Library. Testing utility that encourages testing
components the way users interact with them.

---

## S

**SRI** — Subresource Integrity. HTML attribute that ensures loaded
resources have not been tampered with. Uses cryptographic hashes.

**SSE** — Server-Sent Events. One-way server-to-client streaming over
HTTP. Auto-reconnects. Used for transaction alerts and notifications.

**SOX** — Sarbanes-Oxley Act. US federal law requiring financial controls
and audit trails. Applies to EWB as a publicly listed company.

---

## T

**TanStack Query** — Server state management library. Handles caching,
refetching, pagination, and optimistic updates for API data.

**TanStack Virtual** — List virtualization library. Renders only visible
rows for long lists (transaction history).

**Trusted Types** — Browser API that prevents DOM XSS by requiring typed
objects for dangerous sinks. Part of CSP enforcement.

---

## V

**Value Object** — An immutable object compared by value, not identity.
Example: `Money { amount: 5000, currency: 'PHP' }`.

**Vitest** — Testing framework powered by Vite. Used for unit and
integration tests. Compatible with Jest API.

**Virtualization** — Rendering only visible items in a list. Keeps DOM
node count constant regardless of list size.

---

## W

**WCAG** — Web Content Accessibility Guidelines. Level AA compliance is
required by BSP 1033 for digital banking.

**WebAuthn** — Web Authentication API. Browser API for creating and using
passkeys. Part of the FIDO2 standard.

**Web Vitals** — Google's metrics for web performance: LCP, INP, CLS.
Measured and reported to track user experience.

**WebSocket** — Bidirectional communication protocol. Used for real-time
features like customer support chat.

---

## Z

**Zod** — TypeScript-first schema validation library. Used for form
validation, API response validation, and runtime type checking.

**Zustand** — Lightweight state management library. Used for all client
state (auth, UI preferences, drafts). No Context API.

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
