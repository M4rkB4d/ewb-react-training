# Level 5 Quiz — Data and Auth

> **EastWest Bank — Digital Platforms & Innovations**
>
> React Training Program · Level 5 Assessment

---

## Instructions

- Answer all 20 questions.
- For multiple choice, select the single best answer (A/B/C/D).
- For true/false, write True or False.

---

### Question 1 (Multiple Choice)

Why does EWB standardize on Axios over the native `fetch` API?

A. Axios is faster than fetch
B. Axios supports request/response interceptors for centralized auth token injection, error handling, and audit trail logging
C. fetch is not supported in modern browsers
D. Axios automatically encrypts request payloads

---

### Question 2 (Multiple Choice)

The Axios response interceptor for 401 errors uses plain `axios.post()` to call the refresh endpoint instead of `apiClient.post()`. What would happen if it used `apiClient` instead?

A. The refresh token would be sent in plaintext
B. The request would succeed but skip Zod validation
C. An infinite loop — the 401 interceptor would trigger itself recursively if the refresh also returns 401
D. The CORS headers would be missing from the request

---

### Question 3 (Multiple Choice)

According to BSP 982, where should the access token be stored in a single-page application?

A. localStorage
B. sessionStorage
C. An HttpOnly cookie
D. In-memory only (e.g., a Zustand store variable)

---

### Question 4 (True/False)

A JWT's payload is encrypted, so sensitive data like the user's role and email address are safe to include because only the server can read them.

---

### Question 5 (Multiple Choice)

In the EWB authentication flow, what does the backend return after the user submits a correct username and password when MFA is enabled (before the MFA step)?

A. An access token and refresh token
B. A temporary MFA token and a list of available MFA methods
C. A session cookie and redirect URL
D. The user profile with full permissions

---

### Question 6 (True/False)

Storing the access token in `sessionStorage` is safe from XSS attacks because `sessionStorage` is cleared when the tab closes.

---

### Question 7 (Multiple Choice)

What does PKCE (Proof Key for Code Exchange) protect against in the OAuth 2.0 Authorization Code flow?

A. SQL injection attacks on the auth server
B. Interception of the authorization code by a malicious app or browser extension
C. Brute force attacks on user passwords
D. Cross-site request forgery (CSRF) on the token endpoint

---

### Question 8 (Multiple Choice)

Why are passkeys (WebAuthn) considered phishing-resistant?

A. They use longer passwords that are harder to guess
B. They require biometric verification which cannot be faked
C. They are cryptographically bound to the origin (domain), so a passkey for `ewbanking.com` will never respond to `ewbanking-login.com`
D. They are stored on a hardware security module that cannot be accessed remotely

---

### Question 9 (True/False)

Frontend role-based access control (RBAC) using a `RoleGuard` component is sufficient to prevent unauthorized users from accessing admin features, and no additional backend checks are needed.

---

### Question 10 (Multiple Choice)

In the session timeout implementation, the BSP-mandated idle timeout for banking applications is:

A. 5 minutes
B. 10 minutes
C. 15 minutes
D. 30 minutes

---

### Question 11 (Multiple Choice)

What is the purpose of the `X-Request-ID` header added by the Axios request interceptor?

A. To authenticate the user with the backend
B. To provide a unique correlation ID for audit trail and log correlation per BSP 1019
C. To enable request caching on the CDN
D. To prevent duplicate requests from being processed

---

### Question 12 (True/False)

The temporary MFA token returned after password verification can be used to access any API endpoint, just like a regular access token.

---

### Question 13 (Multiple Choice)

During passkey registration, the server sends `excludeCredentials` in the options. What is its purpose?

A. To list credentials that have been revoked and should be deleted
B. To prevent the user from registering the same authenticator device twice
C. To specify which authentication methods are not allowed
D. To exclude certain browsers from the registration process

---

### Question 14 (Multiple Choice)

When the user refreshes the page, the in-memory access token is lost. How does the application restore the authenticated state?

A. The access token is recovered from the browser's cookie jar
B. The `useAuthInit` hook calls `/auth/refresh` with the HttpOnly refresh cookie to get a new access token
C. The user is always redirected to the login page to re-authenticate
D. The access token is stored in a Web Worker that survives page reloads

---

### Question 15 (True/False)

BSP Circular 1213 (AFASA) mandates phishing-resistant authentication by June 2026, with passkeys (WebAuthn) as the preferred method.

---

### Question 16 (Multiple Choice)

Why do the auth API functions (login, verifyMfa, refreshSession) use plain `axios` instead of the `apiClient` from B03?

A. Plain `axios` is faster than `apiClient`
B. `apiClient` would try to attach a Bearer token that does not exist yet, and the 401 interceptor could cause infinite loops during auth operations
C. `apiClient` does not support `withCredentials: true`
D. The auth endpoints use a different API domain

---

### Question 17 (Multiple Choice)

In the EWB role hierarchy, a user with the `manager` role attempts to access a page guarded with `requiredRole="teller"`. What happens?

A. Access is denied because the roles do not match exactly
B. Access is granted because `manager` has a higher hierarchical level than `teller`
C. The user is redirected to the login page
D. An error boundary catches the role mismatch

---

### Question 18 (True/False)

During passkey authentication, the server sends a random challenge that must be signed by the private key. This challenge prevents replay attacks because each authentication attempt uses a unique value.

---

### Question 19 (Multiple Choice)

What BSP circular requires that the Implicit OAuth flow (returning tokens in the URL fragment) NOT be used, and what flow must be used instead?

A. BSP 808 — use Client Credentials flow
B. BSP 1122 — use Authorization Code flow with PKCE
C. BSP 982 — use Resource Owner Password flow
D. BSP 1019 — use Device Authorization flow

---

### Question 20 (Multiple Choice)

In the login error handling, why does the error message say "Invalid username or password" rather than specifying which field was wrong?

A. It simplifies the error handling code
B. It prevents username enumeration attacks — revealing whether the username exists helps attackers narrow their targets
C. The backend does not distinguish between username and password failures
D. It is a design preference with no security implication

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
