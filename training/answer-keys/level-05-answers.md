# Level 5 Answer Key — Data and Auth

> **EastWest Bank — Digital Platforms & Innovations**
>
> React Training Program · Level 5 Instructor Reference

---

## Quiz Answers

### Question 1 — Answer: B

Axios interceptors enable centralized concerns: auth token injection on every request, error classification and handling on every response, and audit trail headers (X-Request-ID) without modifying individual API calls. Speed (A) is not a factor. Fetch is well-supported (C). Axios does not encrypt payloads (D).

### Question 2 — Answer: C

Using `apiClient.post()` for the refresh call would create an infinite loop. If the refresh endpoint also returned 401 (e.g., expired refresh token), the response interceptor would try to refresh again, which would 401 again, endlessly. Using plain `axios.post()` bypasses the interceptors entirely, allowing the refresh failure to propagate cleanly to the catch block.

### Question 3 — Answer: D

BSP 982 Section 5.4 requires tokens to be protected from XSS. In-memory storage (a JavaScript variable in a Zustand store) is not persisted to any browser storage API, so passive scripts scanning localStorage or sessionStorage cannot find it. Note: in-memory storage is XSS-resistant, not XSS-proof — an active XSS exploit running in the same execution context can still read JavaScript variables. localStorage (A) and sessionStorage (B) are both trivially accessible to any script on the page. HttpOnly cookies (C) are for the refresh token, managed by the backend.

### Question 4 — Answer: False

JWT payloads are Base64Url-encoded, not encrypted. Anyone with the token can decode the payload and read its contents using `atob()` or tools like jwt.io. Only the signature is cryptographic — it proves the token was issued by the server and has not been tampered with. Never put sensitive data in JWT payloads beyond what is needed for authorization.

### Question 5 — Answer: B

When MFA is enabled, the backend returns a temporary MFA token and the list of available methods (e.g., OTP, passkey). This temporary token cannot be used to access any API endpoint — it is only valid for the MFA verification step. The actual access token is issued only after successful MFA verification.

### Question 6 — Answer: False

`sessionStorage` is still vulnerable to XSS while the tab is open. Any injected script can call `sessionStorage.getItem('accessToken')` and exfiltrate the token during the active session. "Cleared when the tab closes" only protects against access after the session ends, not against active XSS attacks during the session.

### Question 7 — Answer: B

PKCE prevents authorization code interception. In a SPA, the authorization code passes through the browser URL. A malicious browser extension or compromised redirect could capture this code. PKCE ties the code to a cryptographic verifier that only the original client knows, making the stolen code useless without the verifier.

### Question 8 — Answer: C

Passkeys use public-key cryptography bound to the web origin. The browser enforces that a passkey created for `ewbanking.com` will only respond to authentication challenges from that exact domain. A phishing site on `ewbanking-login.com` cannot trigger the passkey. This is enforced cryptographically by the browser, not by user judgment.

### Question 9 — Answer: False

Frontend RBAC is a UX convenience that hides UI elements the user should not see. A user can bypass any frontend check by opening DevTools, modifying JavaScript, or calling the API directly. BSP 808 requires the backend to independently verify permissions on every request.

### Question 10 — Answer: C

BSP 982 Section 5.3 mandates a 15-minute idle timeout for banking sessions. The implementation tracks user activity (mouse, keyboard, touch, scroll) and shows a warning 2 minutes before expiry. If no activity is detected within 15 minutes, the user is automatically logged out.

### Question 11 — Answer: B

The `X-Request-ID` header provides a unique correlation identifier for each API request, enabling end-to-end request tracing across frontend and backend logs. BSP 1019 requires audit trail capabilities for all financial operations, and the correlation ID links frontend actions to backend processing.

### Question 12 — Answer: False

The temporary MFA token is only valid for the MFA verification step (`POST /auth/mfa`). It cannot be used as a Bearer token to access any other API endpoint. The real access token is issued only after the MFA challenge is successfully completed.

### Question 13 — Answer: B

`excludeCredentials` contains the IDs of passkeys already registered for the user. The browser checks this list and prevents the same authenticator from being registered again, avoiding duplicate credentials that would create confusion in the passkey management UI.

### Question 14 — Answer: B

When the page reloads, the in-memory access token is lost. The `useAuthInit` hook runs on mount (when status is `idle`), calling `refreshSession()` which sends a POST to `/auth/refresh` with `withCredentials: true`. The browser automatically includes the HttpOnly refresh cookie. If valid, the backend returns a new access token and user data.

### Question 15 — Answer: True

BSP Circular 1213 (AFASA) mandates phishing-resistant authentication by June 2026. Passkeys (WebAuthn) are the preferred method because they are cryptographically bound to the origin, making phishing impossible. EWB's migration strategy has three phases: staff enrollment, customer prompts, and required for new accounts.

### Question 16 — Answer: B

`apiClient` has a request interceptor that attaches a Bearer token from the auth store. During login, there is no token yet, so it would send an empty Authorization header. The 401 response interceptor would then try to refresh a token that does not exist — and while the `_retry` guard prevents a true infinite loop, it would redirect to `/login`, breaking the auth flow entirely. Plain `axios` bypasses all interceptors.

### Question 17 — Answer: B

The `hasMinimumRole` function uses a numeric hierarchy (`customer: 0, teller: 1, manager: 2, admin: 3`). Since `manager` (2) is higher than `teller` (1), the check `roleHierarchy['manager'] >= roleHierarchy['teller']` returns true, granting access. Higher roles automatically inherit lower-role permissions.

### Question 18 — Answer: True

The server generates a fresh random challenge for every authentication attempt. The browser signs this challenge with the passkey's private key. If an attacker captured a valid signed assertion, they could not replay it because the server would reject it — the challenge would not match the current expected value.

### Question 19 — Answer: B

BSP 1122 (Open Finance) requires OAuth 2.0 with PKCE for all third-party integrations. The Implicit flow is deprecated because it returns tokens directly in the URL fragment, where they can be leaked through browser history, referrer headers, or browser extensions. Authorization Code flow with PKCE is the only approved method for SPAs.

### Question 20 — Answer: B

Revealing whether the username or password was incorrect enables username enumeration attacks. An attacker could submit usernames and observe "User not found" vs "Wrong password" responses to build a list of valid usernames, then focus brute-force attacks on those accounts. A generic message prevents this information leakage.

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
