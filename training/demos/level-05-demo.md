# Level 5 Demo — Data and Auth

> **EastWest Bank — Digital Platforms & Innovations**
>
> React Training Program · Instructor Demo Outline · 20 minutes

---

## Setup

- Portal project open in VS Code
- Dev server running with MSW enabled for mock API
- Browser open with Network tab visible
- jwt.io open in a separate tab for JWT decoding

---

## Part 1 — The API Client and Interceptors (5 min)

### Show

1. Open `src/lib/api-client.ts` — walk through the Axios instance creation
2. Point out `withCredentials: true` — "This sends the HttpOnly cookie with every request"
3. Show the request interceptor: token injection, `X-Request-ID`, `X-Timestamp`
4. Show the response interceptor: the 401 → refresh → retry flow

### Demo Live

1. Open the portal, log in, navigate to accounts
2. Open Network tab — click on any API request
3. Show the request headers: `Authorization: Bearer ...`, `X-Request-ID: UUID`, `X-Timestamp`
4. "Every request is traceable. BSP 1019 requires this for audit trails."

### Type Live

Walk through why refresh uses plain `axios` not `apiClient`:

```tsx
// This would cause an infinite loop:
// apiClient.post('/auth/refresh')  → 401 → refresh → 401 → refresh → ...

// This bypasses interceptors:
axios.post(`${env.VITE_API_BASE_URL}/auth/refresh`, null, { withCredentials: true })
```

### Emphasize

- "The interceptor handles token refresh silently. The user never sees a login screen for expired tokens."
- Show the `_retry` flag that prevents infinite loops

---

## Part 2 — JWT and Secure Token Storage (5 min)

### Show

1. Open jwt.io in the browser
2. Paste a sample JWT — decode it live
3. Point out: header (algorithm), payload (claims), signature
4. "The payload is not encrypted. Anyone can read it. Only the signature proves authenticity."

### Talk Through

Draw the token storage strategy on a whiteboard or slide:

```
Access Token  → Zustand store (in-memory JavaScript variable)
               Lost on page refresh → that is the design
               XSS cannot steal it after reload

Refresh Token → HttpOnly cookie (set by backend)
               JavaScript cannot read it → XSS cannot steal it
               Browser sends it automatically with withCredentials

Page Refresh  → Access token gone → interceptor calls /auth/refresh
               → HttpOnly cookie sent → new access token → user continues
```

### Demo Live

1. Open Application tab in DevTools → show "no access token in localStorage or sessionStorage"
2. Open Cookies — "the refresh token is here, but marked HttpOnly — we cannot read it from JS"
3. Refresh the page — show in Network tab that `/auth/refresh` fires automatically
4. Show in React DevTools that auth store goes: idle → loading → authenticated

### Emphasize

- "localStorage is the #1 security mistake in SPAs. BSP 982 explicitly forbids it for tokens."
- "The access token lifetime is 30 minutes. The refresh token is 7 days. After 7 days: full re-login with MFA."

---

## Part 3 — Login Flow with MFA (5 min)

### Show

1. Open `src/features/auth/api/auth-api.ts` — show the Zod discriminated union
2. Open `src/features/auth/components/login-form.tsx` — show the two-step flow
3. Open `src/features/auth/components/mfa-form.tsx` — show the 6-digit input

### Demo Live

1. Navigate to `/login` — enter credentials
2. Show the network request: `POST /auth/login` → response has `mfaRequired: true`
3. Form transitions to MFA screen — point out the auto-focus, numeric keyboard hint
4. Enter MFA code — show the `POST /auth/mfa` request
5. After success: redirected to dashboard, auth store shows `authenticated`

### Type Live

Show the auth state machine on the board:

```
idle → loading → mfa-required → authenticated
                              → unauthenticated (error)
```

"TypeScript's discriminated union on `status` makes it impossible to accidentally access the user object in the `mfa-required` state."

### Emphasize

- "MFA is mandatory for banking. BSP 982. AFASA tightens this further by June 2026."
- Show `inputMode="numeric"` and `autoComplete="one-time-code"` — "Mobile UX matters."

---

## Part 4 — Passkeys and AFASA Compliance (5 min)

### Show

1. Open `src/features/auth/hooks/use-passkey-support.ts` — feature detection
2. Open `src/features/auth/hooks/use-passkey-register.ts` — the registration flow
3. Open the login page — show the "Sign in with Passkey" button above the password form

### Demo Live

1. Click "Sign in with Passkey" — show the browser's WebAuthn prompt (biometric/PIN)
2. Walk through what happens: server sends challenge → browser signs with private key → server verifies
3. "The passkey is bound to `ewbanking.com`. A phishing site on `ewbanking-login.com` cannot trigger it."

### Talk Through

The migration timeline:
- **Phase 1 (now):** Staff enrollment, passkey as optional second factor
- **Phase 2 (April):** Customer prompts after login, passkey as primary
- **Phase 3 (June):** Required for new accounts, password fallback for existing

"The passkey button is above the login form. This trains users to reach for it first."

### Emphasize

- "Passkeys are the only authentication method that is truly phishing-resistant. SMS OTP, TOTP, even push notifications can be phished."
- "BSP Circular 1213 (AFASA) requires phishing-resistant auth by June 2026. We are building ahead of the deadline."
- "Always provide a password fallback — not all devices support WebAuthn yet."

---

## Wrap-Up

- Axios interceptors centralize auth, logging, and error handling
- Tokens: access in memory, refresh in HttpOnly cookie, never localStorage
- MFA is a distinct step with its own temporary token
- Passkeys are phishing-resistant because they are origin-bound
- AFASA deadline: June 2026

**Transition:** "Next level — quality engineering. Error boundaries, performance optimization, E2E testing, and production monitoring."

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
