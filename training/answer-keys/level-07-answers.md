# Level 7 Answer Key — Production

> **EastWest Bank — Digital Platforms & Innovations**
>
> React Training Program · Level 7 Instructor Reference

---

## Quiz Answers

### Question 1 — Answer: B

`frame-ancestors 'none'` prevents any site from embedding your application in an iframe, blocking clickjacking attacks. `script-src` controls script execution, `connect-src` controls fetch/XHR destinations, and `default-src` is a fallback that can be overridden by more specific directives.

### Question 2 — Answer: False

React escapes content rendered via `{variable}` in JSX, but `dangerouslySetInnerHTML` bypasses this protection entirely, inserting raw HTML without escaping. Content passed through it requires DOMPurify sanitization to be safe.

### Question 3 — Answer: B

`script-src 'self'` without `'unsafe-inline'` blocks all inline `<script>` tags and `javascript:` URLs, which are the primary XSS attack vectors. The other directives control different resource types (default fallback, iframe embedding, and network connections respectively).

### Question 4 — Answer: C

Vite embeds all `VITE_*` variables directly into the JavaScript bundle at build time. Anyone inspecting the page source or JavaScript files can read the database connection string, including the username, password, host, and database name. Secrets must never use the `VITE_` prefix.

### Question 5 — Answer: B

SRI computes a cryptographic hash of a file and compares it against the `integrity` attribute. If a CDN is compromised and serves a modified script, the hash will not match and the browser will block execution, protecting against supply-chain attacks.

### Question 6 — Answer: B

The `DeployStaging` stage has `dependsOn: Build`, meaning the Build stage must complete successfully first. The Build stage itself depends on `QualityGates`, so the full sequence is QualityGates, then Build, then DeployStaging.

### Question 7 — Answer: False

AMLA (RA 9160) requires banks to retain customer identification records and transaction data for at least 5 years after account closure. The bank must explain this to the customer and can only delete data not subject to legal retention requirements.

### Question 8 — Answer: C

BSP 982 Section 5.4 requires that authentication tokens not be stored in persistent browser storage accessible to client-side scripts. Tokens must be held in JavaScript memory only (e.g., a Zustand store without persist middleware). `localStorage` and `sessionStorage` are both accessible to any script on the page, making them vulnerable to XSS exfiltration.

### Question 9 — Answer: C

Azure Blob Storage with Azure CDN and Front Door is recommended for Vite SPAs. No server runtime to manage means no runtime vulnerabilities to patch. The WAF on Front Door satisfies BSP 808 requirements for internet-facing applications.

### Question 10 — Answer: True

BSP Circular 1105 Section 8.1 requires that digital banking sessions have an absolute maximum duration of 8 hours. Upon reaching this limit, the session must be terminated and the user must re-authenticate, regardless of activity.

### Question 11 — Answer: B

Automated compliance tests (e.g., verifying that auth-store does not contain `localStorage` or `persist`) run on every build. If a developer accidentally introduces a non-compliant pattern, the test fails and the build is blocked, providing continuous verification.

### Question 12 — Answer: C

The DPA data minimization principle requires displaying the minimum PII necessary. For account numbers, only the last 4 digits are shown by default (`••••••7890`). The `maskAccountNumber` function in A17 shows the last 4 characters, and users must explicitly click "Show" to reveal the full number.

### Question 13 — Answer: True

`navigator.sendBeacon()` sends data asynchronously and is guaranteed to complete even during page unload. Standard `fetch()` calls may be cancelled by the browser when the user closes a tab or navigates away, which would cause audit events to be lost — unacceptable for BSP 1019 compliance.

### Question 14 — Answer: B

BSP 1033 Section 7.3 requires a two-step confirmation flow where users see a clear summary of transaction details — including amount, recipient, fees, and total — before a separate confirm action. No single-click transfers are permitted.

### Question 15 — Answer: B

`try_files` attempts to serve the requested file, then the directory, and falls back to `index.html` if neither exists. This enables client-side routing because all route paths (e.g., `/transfers`, `/accounts/123`) serve the SPA entry point, allowing React Router to handle them.

### Question 16 — Answer: False

Tailwind CSS 4 compiles all utility classes to standard CSS files at build time — no inline styles are injected at runtime. Therefore, `style-src` does not need `'unsafe-inline'`. Adding it would weaken the CSP for no benefit.

### Question 17 — Answer: B

`X-Request-ID` enables full request correlation across the frontend and backend during incident investigation. When a security event occurs, the operations team can trace the complete request path using this identifier, as required by BSP 1019 Section 6.3.

### Question 18 — Answer: C

AMLA (RA 9160) requires a minimum of 5 years of retention for customer identification records after account closure. This means the frontend cannot offer complete data erasure — it must explain which data is subject to legal retention.

### Question 19 — Answer: True

In the blue-green deployment strategy, Azure Front Door switches the backend origin between Blue (current) and Green (new) storage accounts. If issues are detected, Front Door switches the origin back to Blue instantly, providing immediate rollback.

### Question 20 — Answer: B

When receiving `postMessage` events, you must validate `event.origin` against a trusted origins list before processing the message. Without this check, any page can send messages to your application, potentially injecting malicious data. After origin validation, the message payload should also be validated with Zod.

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
