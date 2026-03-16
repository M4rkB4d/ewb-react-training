# Level 7 Quiz — Production

> **EastWest Bank — Digital Platforms & Innovations**
>
> React Training Program · Level 7 Assessment

---

## Instructions

- Answer all 20 questions.
- For multiple choice, select the single best answer (A/B/C/D).
- For true/false, write True or False.

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

### Question 4 (Multiple Choice)

A developer adds `VITE_DATABASE_URL=postgres://user:pass@db.internal:5432/ewb` to `.env.production`. Why is this a critical security vulnerability?

A. Vite does not support database connections from the frontend
B. The connection string exceeds the maximum environment variable length
C. Vite embeds all `VITE_*` variables into the JavaScript bundle, making them readable by anyone
D. The `VITE_` prefix is reserved for Vite internal variables only

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

### Question 8 (Multiple Choice)

According to BSP Circular 982, where should access tokens be stored in a banking SPA?

A. In `localStorage` for persistence across sessions
B. In `sessionStorage` so they are cleared when the tab closes
C. In JavaScript memory (e.g., a Zustand store) with no persistence
D. In a cookie with `SameSite=None` for cross-origin access

---

### Question 9 (Multiple Choice)

Which deployment model is recommended for a Vite SPA at EastWest Bank?

A. Azure Container Apps with Nginx
B. Azure App Service with Node.js runtime
C. Azure Blob Storage with Azure CDN and Front Door
D. Azure Static Web Apps with managed functions

---

### Question 10 (True/False)

Under BSP Circular 1105, digital banking sessions must have an absolute maximum duration of 8 hours, regardless of user activity.

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
C. `••••••7890` (show only last 4)
D. `••••••••••` (fully masked)

---

### Question 13 (True/False)

The `navigator.sendBeacon()` API is used for audit events because it guarantees delivery even when the user closes the tab or navigates away, unlike standard `fetch()` which may be cancelled during page unload.

---

### Question 14 (Multiple Choice)

According to BSP Circular 1033, what must the frontend present to users before a fund transfer is submitted?

A. A CAPTCHA challenge to prevent automated transfers
B. A clear review step showing amount, recipient, fees, and total before a separate confirm action
C. A biometric authentication prompt
D. A 30-second mandatory waiting period

---

### Question 15 (Multiple Choice)

In the Nginx configuration for the Vite SPA, what does the `try_files $uri $uri/ /index.html` directive achieve?

A. It redirects all HTTP requests to HTTPS
B. It serves the SPA entry point for all routes, enabling client-side routing
C. It blocks requests to files that do not exist
D. It compresses response bodies with gzip

---

### Question 16 (True/False)

Tailwind CSS 4 requires `'unsafe-inline'` in the CSP `style-src` directive because it injects inline styles at runtime.

---

### Question 17 (Multiple Choice)

What is the purpose of the `X-Request-ID` header on every API call, as required by BSP 1019?

A. To authenticate the user making the request
B. To enable full request correlation across frontend and backend for incident investigation
C. To prevent CSRF attacks on API endpoints
D. To track API response times for performance monitoring

---

### Question 18 (Multiple Choice)

Under AMLA (RA 9160), what is the minimum retention period for customer identification records after an account is closed?

A. 1 year
B. 3 years
C. 5 years
D. 10 years

---

### Question 19 (True/False)

In the blue-green deployment strategy described for EWB, Azure Front Door can instantly switch traffic back to the previous version if issues are detected after deployment.

---

### Question 20 (Multiple Choice)

When handling `postMessage` events from third-party iframes (such as a payment processor), what is the critical security step?

A. Parse the message with `JSON.parse()` before using it
B. Validate the `event.origin` against a trusted origins list before processing the message
C. Convert the message to a string before passing it to React state
D. Log the message to Application Insights before acting on it

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
