# Level 5 Exercises — Data and Auth

> **EastWest Bank — Digital Platforms & Innovations**
>
> React Training Program · Level 5 Hands-On Exercises

---

## Exercise 1 — Secure API Client with Token Refresh

**Difficulty:** Intermediate
**Estimated Time:** 45 minutes

### Learning Objectives

- Configure Axios with request and response interceptors
- Implement silent token refresh on 401 responses
- Add BSP-compliant request correlation headers

### Scenario

The portal's API client must attach the access token to every request, add a unique `X-Request-ID` for audit trail correlation (BSP 1019), and transparently refresh expired tokens without interrupting the user.

### Requirements

1. Create an `apiClient` Axios instance with:
   - `baseURL` from environment config
   - `withCredentials: true` (for HttpOnly refresh cookie)
   - 30-second timeout
2. Add a request interceptor that:
   - Reads the access token from the auth store via `getState()`
   - Attaches it as `Authorization: Bearer <token>`
   - Adds `X-Request-ID` (UUID) and `X-Timestamp` headers
3. Add a response interceptor that:
   - On 401: attempts a token refresh using plain `axios.post()` (not `apiClient`)
   - On successful refresh: updates the auth store, retries the original request
   - On failed refresh: clears auth and redirects to `/login`
   - Prevents infinite retry loops with a `_retry` flag
4. Write tests using MSW that verify:
   - The auth header is attached to requests
   - Token refresh works on 401
   - Failed refresh clears auth state

### Starter Code

```tsx
// src/lib/api-client.ts
import axios from 'axios';
import { env } from './env';

export const apiClient = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  timeout: 30_000,
  withCredentials: true,
});

// Add your interceptors here
```

### Acceptance Criteria

- [ ] Every request includes `Authorization`, `X-Request-ID`, and `X-Timestamp` headers
- [ ] 401 responses trigger a silent refresh without user interruption
- [ ] The refresh call uses plain `axios` to avoid interceptor loops
- [ ] Failed refresh clears auth state and redirects to login
- [ ] No duplicate retries (the `_retry` flag prevents infinite loops)

---

## Exercise 2 — Login Flow with MFA Support

**Difficulty:** Challenge
**Estimated Time:** 60 minutes

### Learning Objectives

- Implement a multi-step authentication flow with discriminated union types
- Build a login form that transitions between credential entry and MFA verification
- Handle all auth state transitions in the Zustand store

### Scenario

The login flow has two steps: (1) username/password, and (2) MFA code verification. The backend returns a discriminated union: either `{ mfaRequired: true, mfaToken, methods }` or `{ mfaRequired: false, user, accessToken }`. The UI must handle both paths.

### Requirements

1. Define the `LoginResponse` type as a Zod discriminated union on `mfaRequired`
2. Implement the auth store with these statuses: `idle`, `loading`, `mfa-required`, `authenticated`, `unauthenticated`
3. Build a `LoginForm` component that:
   - Validates username (required) and password (min 8 characters) with Zod + React Hook Form
   - Shows an error alert on failed login
   - Transitions to `MfaForm` when status is `mfa-required`
4. Build an `MfaForm` component that:
   - Accepts a 6-digit numeric code
   - Strips non-digit characters on input
   - Uses `inputMode="numeric"` and `autoComplete="one-time-code"`
   - Disables submit until exactly 6 digits are entered
5. After successful MFA, store the auth data and navigate to the dashboard (or the post-login redirect path)

### Acceptance Criteria

- [ ] Login response is validated with Zod discriminated union
- [ ] Auth store transitions correctly through all statuses
- [ ] MFA form only accepts numeric input, exactly 6 digits
- [ ] Accessibility: labels, error roles, focus management (auto-focus MFA input)
- [ ] Post-login redirect preserves the original destination from `location.state.from`
- [ ] Auth API calls use plain `axios`, not `apiClient` (to avoid interceptor interference)

---

## Exercise 3 — Passkey Registration and Feature Detection

**Difficulty:** Challenge
**Estimated Time:** 60 minutes

### Learning Objectives

- Detect WebAuthn browser support with feature detection
- Implement the passkey registration flow using the WebAuthn API
- Build a passkey management UI with list and delete operations

### Scenario

As part of AFASA compliance (BSP Circular 1213, June 2026 deadline), users need the ability to register passkeys from their account settings. The UI must detect browser support, guide users through registration, and display their registered passkeys.

### Requirements

1. Build a `usePasskeySupport` hook that checks:
   - `window.PublicKeyCredential` exists
   - `isUserVerifyingPlatformAuthenticatorAvailable` is available
2. Build a `usePasskeyRegister` mutation hook that:
   - Fetches registration options from `GET /webauthn/register/options`
   - Converts base64url challenge and user ID to `ArrayBuffer`
   - Calls `navigator.credentials.create()` with the options
   - Sends the credential to `POST /webauthn/register/verify`
   - Invalidates the `['passkeys']` query on success
3. Build a `PasskeySettings` component that:
   - Shows a "not supported" message when WebAuthn is unavailable
   - Displays a registration button with loading/success/error states
   - Lists registered passkeys with name, device type, creation date
   - Allows deletion with a confirmation prompt
4. Include base64url encode/decode utility functions

### Acceptance Criteria

- [ ] Feature detection correctly identifies unsupported browsers
- [ ] Registration flow handles the full WebAuthn ceremony (options, create, verify)
- [ ] Base64url conversion utilities correctly handle ArrayBuffer round-trips
- [ ] Passkey list uses TanStack Query with Zod validation
- [ ] Delete requires user confirmation before executing
- [ ] Unsupported browsers see a clear message suggesting a compatible browser

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
