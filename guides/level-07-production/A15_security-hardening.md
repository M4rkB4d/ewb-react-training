# A15 — Security Hardening

> **EastWest Bank — Digital Platforms & Innovations**
>
> Part A (Core) · Level 7 — Production · Est. 3.5 hours

---

## What You Will Learn

By the end of this guide, you will:

- Implement Content Security Policy (CSP) for XSS prevention
- Use Subresource Integrity (SRI) for third-party scripts
- Understand browser-native XSS prevention mechanisms
- Prevent common OWASP Top 10 vulnerabilities in React
- Implement secure input handling and output encoding
- Configure CORS correctly for banking APIs
- Build a security-aware development checklist

---

## Prerequisites

| Requirement | Where |
|------------|-------|
| Completed A13 — Error Handling | Level 6 |
| Completed A14 — Testing Advanced | Level 6 |

---

## Phase 1 — Content Security Policy

### What CSP does

CSP tells the browser which resources are allowed to load and execute. Without
CSP, an XSS vulnerability lets an attacker load any script from any domain.

### CSP directives for banking

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https://cdn.ewbanking.com;
  connect-src 'self' https://api.ewbanking.com https://*.sentry.io;
  font-src 'self';
  frame-src 'none';
  frame-ancestors 'none';
  form-action 'self';
  base-uri 'self';
  upgrade-insecure-requests;
```

| Directive | Value | Purpose |
|-----------|-------|---------|
| `default-src` | `'self'` | Default: only same-origin |
| `script-src` | `'self'` | No inline scripts, no external scripts |
| `style-src` | `'self' 'unsafe-inline'` | Tailwind needs inline styles |
| `img-src` | `'self' data:` | Same-origin images + data URIs |
| `connect-src` | `'self' + API domains` | API and monitoring endpoints |
| `frame-src` | `'none'` | No iframes allowed |
| `frame-ancestors` | `'none'` | Prevent being iframed (clickjacking) |
| `form-action` | `'self'` | Forms only submit to same origin |
| `base-uri` | `'self'` | Prevent base tag injection |

### CSP reporting

```
Content-Security-Policy-Report-Only:
  default-src 'self';
  report-uri /api/csp-report;
```

Use `Report-Only` during development to identify violations without breaking
the application. Move to enforcing mode after all violations are resolved.

```tsx
// src/lib/csp-report.ts
// Backend endpoint to receive CSP violation reports
// Log violations for BSP 1019 security monitoring
```

### Checkpoint 1

Why does the CSP include `'unsafe-inline'` for `style-src` but NOT for
`script-src`? What risk does each `'unsafe-inline'` introduce?

---

## Phase 2 — XSS Prevention in React

### React's built-in protection

React automatically escapes content rendered in JSX:

```tsx
// Safe — React escapes this automatically
const userInput = '<script>alert("XSS")</script>';
return <p>{userInput}</p>;
// Renders: <p>&lt;script&gt;alert("XSS")&lt;/script&gt;</p>
```

### Dangerous patterns to avoid

```tsx
// DANGEROUS — Never use dangerouslySetInnerHTML with user input
<div dangerouslySetInnerHTML={{ __html: userProvidedHtml }} />

// DANGEROUS — Never construct URLs from user input without validation
<a href={userProvidedUrl}>Click here</a>
// An attacker could set: javascript:alert('XSS')

// DANGEROUS — Never use eval() or Function()
eval(userInput);
new Function(userInput)();
```

### Safe patterns

```tsx
// Safe URL handling
function SafeLink({ url, children }: { url: string; children: React.ReactNode }) {
  const isSafeUrl = url.startsWith('https://') || url.startsWith('/');

  if (!isSafeUrl) {
    return <span>{children}</span>;
  }

  return <a href={url}>{children}</a>;
}
```

```bash
# Minimum version 3.3.2 required — CVE-2026-0540 (XSS bypass) affects earlier versions
npm install dompurify@^3.3.3
```

```tsx
// Safe HTML rendering (when absolutely necessary)
import DOMPurify from 'dompurify';

function SafeHtml({ html }: { html: string }) {
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: [],
  });

  return <div dangerouslySetInnerHTML={{ __html: clean }} />;
}
```

### Checkpoint 2

A developer needs to render HTML from a CMS (content management system) for
marketing pages on the banking site. What is the safest approach? What tags
and attributes should be allowed?

---

## Phase 3 — Subresource Integrity (SRI)

### What SRI protects against

If a CDN is compromised and serves a modified script, SRI detects the
modification and blocks execution:

```html
<script
  src="https://cdn.example.com/library.js"
  integrity="sha384-abc123..."
  crossorigin="anonymous"
></script>
```

The browser computes the hash of the downloaded file and compares it to the
`integrity` attribute. If they do not match, the script is blocked.

### SRI with Vite

Vite can generate SRI hashes for output files:

```tsx
// vite.config.ts
import { defineConfig } from 'vite';
import sri from 'vite-plugin-sri';

export default defineConfig({
  plugins: [sri()],
});
```

This automatically adds `integrity` attributes to all `<script>` and `<link>`
tags in the generated `index.html`.

---

## Phase 4 — Secure Input Handling

### Input validation at the boundary

```tsx
// src/lib/sanitize.ts
import { z } from 'zod';

// Strict schemas for all user input
export const usernameSchema = z
  .string()
  .min(3)
  .max(50)
  .regex(/^[a-zA-Z0-9._-]+$/, 'Username contains invalid characters');

export const searchQuerySchema = z
  .string()
  .max(200)
  .transform((val) => val.trim());

export const amountSchema = z
  .number()
  .int('Amount must be in centavos (integer)')
  .positive('Amount must be positive')
  .max(100_000_000, 'Amount exceeds maximum limit'); // Max ₱1,000,000.00 in centavos
```

### PCI-DSS scope reduction

```tsx
// NEVER handle raw card numbers in the frontend
// Use iframe-based tokenization from the payment processor

// src/features/payments/components/card-input.tsx
export function CardInput() {
  return (
    <div>
      <label htmlFor="card-frame">Card Number</label>
      {/* Payment processor's iframe — card data never touches our JavaScript */}
      <iframe
        id="card-frame"
        src="https://tokenizer.payment-processor.com/card-input"
        title="Secure card input"
        className="h-12 w-full rounded border"
      />
      <p className="text-xs text-gray-500">
        Card data is handled securely by our payment processor.
      </p>
    </div>
  );
}
```

> **PCI-DSS:** By using iframe-based tokenization, the frontend never handles
> raw card numbers (PAN). This reduces PCI-DSS scope to SAQ A — the simplest
> compliance level.

---

## Phase 5 — CSRF Protection

### What CSRF is

Cross-Site Request Forgery (CSRF) tricks an authenticated user's browser into
making unwanted requests. If your session relies on cookies (including the
HttpOnly refresh token), a malicious page can forge requests to your API.

```
1. User logs into banking portal (session cookie set)
2. User visits malicious site in another tab
3. Malicious site sends: POST /api/transfers { to: "attacker", amount: 50000 }
4. Browser attaches the session cookie automatically
5. Server processes the transfer — it looks legitimate
```

### CSRF protection strategies for SPAs

**Strategy 1: SameSite cookies (primary defense)**

```
Set-Cookie: refreshToken=...; HttpOnly; Secure; SameSite=Strict; Path=/api/auth
```

`SameSite=Strict` prevents the browser from sending the cookie on cross-site
requests. This is the strongest protection and works in all modern browsers.

**Strategy 2: CSRF token (defense in depth)**

For sensitive operations (transfers, password changes), use a server-issued
CSRF token in addition to SameSite cookies:

```tsx
// src/lib/api-client.ts
// Request a CSRF token before sensitive operations
async function getCsrfToken(): Promise<string> {
  const response = await apiClient.get('/auth/csrf-token');
  return response.data.token;
}

// Include it in mutation requests
async function createTransfer(payload: TransferRequest): Promise<TransferResponse> {
  const csrfToken = await getCsrfToken();
  const response = await apiClient.post('/transfers', payload, {
    headers: { 'X-CSRF-Token': csrfToken },
  });
  return transferResponseSchema.parse(response.data);
}
```

**Strategy 3: Check Origin header (server-side)**

The server should verify that the `Origin` or `Referer` header matches the
expected domain for all state-changing requests.

### Checkpoint 5

A developer argues that CSRF is not a problem for SPAs because "we use Bearer
tokens, not cookies." Under what circumstances is this wrong? (Hint: think about
the refresh token.)

---

## Phase 6 — Additional Security Headers

### Permissions-Policy

Restricts which browser features your application can use. Banking apps should
not need camera, microphone, or geolocation access:

```
Permissions-Policy:
  camera=(),
  microphone=(),
  geolocation=(),
  payment=(),
  usb=()
```

| Feature | Setting | Why |
|---------|---------|-----|
| `camera=()` | Disabled | Banking portal does not use the camera |
| `microphone=()` | Disabled | No audio features |
| `geolocation=()` | Disabled | Location not needed (if needed, allow `self` only) |
| `payment=()` | Disabled | Payment Request API handled by tokenization iframe |
| `usb=()` | Disabled | No USB device access |

Add this header alongside your other security headers in the deployment
configuration (Azure Front Door or the application itself).

### Content-Type validation

Always verify that API responses are actually JSON before parsing:

```tsx
// In your API client interceptor
apiClient.interceptors.response.use((response) => {
  const contentType = response.headers['content-type'];
  if (contentType != null && !contentType.includes('application/json')) {
    // A non-JSON response could be a sign of a proxy injection or
    // misconfigured server returning HTML error pages
    throw new Error(`Unexpected Content-Type: ${contentType}`);
  }
  return response;
});
```

This prevents scenarios where a compromised proxy serves an HTML page containing
malicious scripts instead of the expected JSON response.

---

## Phase 7 — Security Checklist

### Development security checklist

| Check | Details |
|-------|---------|
| No `dangerouslySetInnerHTML` with user data | Sanitize with DOMPurify if needed |
| No `eval()` or `new Function()` | Use safe alternatives |
| No secrets in `VITE_*` environment variables | Secrets stay on the backend |
| No PII in logs or error messages | Use IDs, not names/emails |
| All API responses validated with Zod | BSP 1122 |
| Auth tokens in memory only | BSP 982 |
| CSP headers configured | A15 |
| SRI on external resources | A15 |
| No raw card numbers in JavaScript | PCI-DSS |
| `rel="noopener noreferrer"` on external links | Prevent tab-napping |
| HTTPS everywhere | `upgrade-insecure-requests` in CSP |
| Clickjacking protection | `X-Frame-Options: DENY` |
| CSRF protection | `SameSite=Strict` on cookies + CSRF tokens for transfers |
| Permissions-Policy header | Restrict camera, microphone, geolocation, payment, USB |
| Content-Type validation | Reject non-JSON responses from API endpoints |

---

## Key Takeaways

1. **CSP is the primary XSS defense** beyond React's built-in escaping.
   Configure it strictly and monitor violations.

2. **React escapes by default** — but `dangerouslySetInnerHTML`, `href`,
   and `eval()` bypass this protection. Avoid them with user input.

3. **SRI** protects against compromised CDNs. Use it for all external
   resources.

4. **Never handle raw card numbers** in frontend JavaScript. Use
   iframe-based tokenization for PCI-DSS scope reduction.

5. **Validate all input with Zod** at system boundaries. Never trust
   data from users, APIs, or URLs.

6. **CSRF protection** combines `SameSite=Strict` cookies with CSRF tokens
   for sensitive operations. Bearer tokens alone do not protect against CSRF
   when HttpOnly cookies are also in play.

7. **Permissions-Policy** restricts browser features your app should never use.
   Disable camera, microphone, geolocation, and payment API access.

---

## Exercises

### Exercise 1 — CSP Nonce Strategy
Research and implement CSP nonce-based script loading to eliminate
`'unsafe-inline'` from `style-src`. How would this work with Vite and
Tailwind CSS?

### Exercise 2 — Security Headers Audit
Write a script that fetches your deployed application and verifies all
required security headers are present. Report any missing or misconfigured
headers.

### Exercise 3 — Dependency Vulnerability Scan
Set up `npm audit` in the CI pipeline. Configure it to fail the build on
critical and high severity vulnerabilities. Document the process for reviewing
and resolving audit findings.

---

## What Comes Next

**Next guide:** [A16 — BSP Compliance Framework](A16_bsp-compliance-framework.md) —
where you build the compliance dashboard, audit trail implementation, and
map every BSP circular to concrete frontend controls.

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
