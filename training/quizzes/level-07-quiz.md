# Level 7 — Production: Quiz

> **EastWest Bank — Digital Platforms & Innovations**
>
> Security Hardening, BSP Compliance, Data Privacy, Deployment & CI/CD

---

## Instructions

Answer all 12 questions. For multiple choice, select the single best answer. For short answer, keep responses to 2-3 sentences.

---

### Question 1 (Multiple Choice)

Which Content Security Policy directive prevents your banking application from being embedded in an iframe (clickjacking protection)?

A. `script-src 'self'`
B. `frame-ancestors 'none'`
C. `connect-src 'self'`
D. `default-src 'self'`

---

### Question 2 (True/False)

React automatically escapes all content rendered in JSX, including content passed through `dangerouslySetInnerHTML`.

---

### Question 3 (Multiple Choice)

Which Content Security Policy directive prevents inline `<script>` tags from executing, mitigating the most common XSS attack vector?

A. `default-src 'self'`
B. `script-src 'self'` (without `'unsafe-inline'`)
C. `frame-ancestors 'none'`
D. `connect-src 'self'`

---

### Question 4 (Short Answer)

A developer adds `VITE_DATABASE_URL=postgres://user:pass@db.internal:5432/ewb` to `.env.production`. Explain why this is a critical security vulnerability.

---

### Question 5 (Multiple Choice)

What is the primary purpose of Subresource Integrity (SRI) in a banking application?

A. To minify JavaScript bundles for faster load times
B. To detect and block tampered scripts loaded from CDNs
C. To enforce HTTPS on all resource requests
D. To validate API response schemas at runtime

---

### Question 6 (Multiple Choice)

In the Azure Pipelines CI/CD configuration for EWB, which stage does `DeployStaging` directly depend on (via `dependsOn`)?

A. `QualityGates`
B. `Build`
C. `E2ETests`
D. `DeployProduction`

---

### Question 7 (True/False)

Under the Philippine Data Privacy Act (RA 10173), a bank customer can request complete deletion of all their personal data, and the bank must fully comply.

---

### Question 8 (Short Answer)

Explain the purpose of `navigator.sendBeacon()` in the audit service. Why is it used instead of a standard `fetch()` call for audit events?

---

### Question 9 (Multiple Choice)

Which deployment model is recommended for a Vite SPA at EastWest Bank?

A. Azure Container Apps with Nginx
B. Azure App Service with Node.js runtime
C. Azure Blob Storage with Azure CDN and Front Door
D. Azure Static Web Apps with managed functions

---

### Question 10 (Short Answer)

Under AMLA (RA 9160), what is the minimum retention period for customer identification records after an account is closed? Why does this affect the frontend's data erasure functionality?

---

### Question 11 (Multiple Choice)

In the BSP compliance framework, what technique ensures that automated tests verify security controls have not regressed?

A. Manual code review before each release
B. Automated compliance test suites (e.g., verifying no `localStorage` usage for tokens)
C. Monthly BSP audit submissions
D. End-to-end tests of all user workflows

---

### Question 12 (Multiple Choice)

Which data masking pattern is correct for displaying a Philippine bank account number `1234567890` per DPA requirements?

A. `1234567890` (show full number)
B. `123•••7890` (show first 3 and last 4)
C. `••••7890` (show only last 4)
D. `••••••••••` (fully masked)

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
