# Level 5 Quiz — Data and Auth

> **EastWest Bank — Digital Platforms & Innovations**
>
> React Training Program · Level 5 Assessment

---

## Instructions

- Answer all 12 questions.
- For multiple choice, select the single best answer (A/B/C/D).
- For short answer, keep responses to 2-3 sentences.
- Time estimate: 25 minutes.

---

### Question 1 (Multiple Choice)

Why does EWB standardize on Axios over the native `fetch` API?

A. Axios is faster than fetch
B. Axios supports request/response interceptors for centralized auth token injection, error handling, and audit trail logging
C. fetch is not supported in modern browsers
D. Axios automatically encrypts request payloads

---

### Question 2 (Short Answer)

The Axios error interceptor for 401 responses uses a plain `axios.post()` call to the refresh endpoint instead of `apiClient.post()`. Explain what would happen if it used `apiClient` instead.

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

In the EWB authentication flow, what does the backend return after the user submits a correct username and password (before MFA)?

A. An access token and refresh token
B. A temporary MFA token and a list of available MFA methods
C. A session cookie and redirect URL
D. The user profile with full permissions

---

### Question 6 (Short Answer)

A developer proposes storing the access token in `sessionStorage` because "it is cleared when the tab closes, so XSS cannot steal it after the user leaves." Identify the flaw in this argument.

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

### Question 9 (Short Answer)

BSP Circular 1213 (AFASA) mandates phishing-resistant authentication by June 2026. EWB's migration strategy has three phases. Describe why existing users retain a password fallback during Phase 3 instead of switching entirely to passkeys.

---

### Question 10 (True/False)

Frontend role-based access control (RBAC) using a `RoleGuard` component is sufficient to prevent unauthorized users from accessing admin features, and no additional backend checks are needed.

---

### Question 11 (Multiple Choice)

In the session timeout implementation, the BSP-mandated idle timeout for banking applications is:

A. 5 minutes
B. 10 minutes
C. 15 minutes
D. 30 minutes

---

### Question 12 (Short Answer)

The `useAuthInit` hook attempts a silent refresh on page load to restore the authenticated state. Explain the full sequence: what happens when a user refreshes the page, where does the refresh token come from, and what happens if the refresh fails?

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
