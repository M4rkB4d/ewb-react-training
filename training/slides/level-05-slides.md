# Level 5 — Data & Auth
## Slide Deck Outline

### Slide 1: Title Slide
- Level 5 — Data & Auth
- EastWest Bank React Training
- Digital Platforms & Innovations

### Slide 2: Learning Objectives
- Build a type-safe API client with Axios and interceptors
- Implement JWT-based authentication with secure token storage
- Understand MFA requirements and the AFASA timeline
- Implement passkey registration and authentication (WebAuthn)
- Validate all API responses with Zod schemas

### Slide 3: API Client Architecture
- Axios as the HTTP layer: interceptors, automatic transforms, timeout handling
- Centralized auth token injection — every request gets the token automatically
- Response interceptors: handle 401 (token expired), 403 (forbidden), 500 (server error)
- `X-Request-ID` on every request for audit trail correlation (BSP 1019)
- *Speaker notes: Show the Axios instance config with interceptors. Emphasize that individual API calls never handle auth — the interceptor does it.*

### Slide 4: Type-Safe API Layer
- Zod schema for every API response — validate before trusting
- Pattern: `api.get('/accounts')` → Axios response → Zod parse → typed data
- TanStack Query integration: query functions call the typed API client
- Retry logic with exponential backoff for transient failures
- *Speaker notes: Demo what happens when the API returns unexpected data — Zod catches it immediately instead of a runtime crash later.*

### Slide 5: Token Refresh Flow
- Access tokens expire (15 minutes) — refresh tokens extend the session
- Interceptor detects 401, pauses requests, refreshes token, retries
- Queue concurrent requests during refresh — do not fire multiple refresh calls
- If refresh fails → force logout, clear all state, redirect to login
- *Speaker notes: Diagram the flow on a whiteboard. This is the most complex auth pattern — get it wrong and users get logged out randomly.*

### Slide 6: Authentication Concepts
- Authentication = "Who are you?" / Authorization = "What can you do?"
- JWT structure: header.payload.signature — never decode on the frontend to make auth decisions
- Access tokens in memory (JavaScript variable) — never localStorage, never cookies accessible to JS
- Refresh tokens in httpOnly secure cookies — inaccessible to JavaScript
- *Speaker notes: Show a JWT decoded. Explain why localStorage is a security risk — any XSS vulnerability exposes the token.*

### Slide 7: Role-Based Access Control (RBAC)
- Roles: customer, teller, manager, admin
- Frontend RBAC is UX — hide buttons and routes users cannot access
- Backend RBAC is security — the API enforces permissions regardless of frontend
- Pattern: `useAuth().hasRole('manager')` for conditional rendering
- *Speaker notes: Critical point — frontend RBAC is cosmetic. A determined attacker can call any API endpoint. The backend must enforce authorization.*

### Slide 8: Multi-Factor Authentication (MFA)
- BSP 982 mandates MFA for financial transactions
- Flow: username/password → MFA challenge → session established
- MFA methods: TOTP app, SMS OTP (being phased out), email OTP
- Login form handles the two-step flow with clear UX transitions
- *Speaker notes: Demo the login form — enter credentials, see MFA challenge, enter code, session starts. Show error handling for wrong codes.*

### Slide 9: Session Management
- 15-minute inactivity timeout (BSP 982 requirement)
- Warning dialog at 13 minutes: "Your session will expire in 2 minutes"
- Activity detection: mouse movement, keyboard input, API calls reset the timer
- Server-side session validation — the frontend timer is UX, the backend enforces
- *Speaker notes: Demo the timeout warning. Explain that the 15-minute limit is non-negotiable — it is a BSP requirement.*

### Slide 10: The AFASA Mandate
- BSP Circular 1213: phishing-resistant authentication by June 2026
- Every traditional auth method can be phished (passwords, SMS OTP, TOTP, push)
- AFASA requires at least one phishing-resistant factor for financial transactions
- EastWest Bank's answer: passkeys (FIDO2/WebAuthn)
- *Speaker notes: Walk through the phishing attack for each method. Passkeys are fundamentally different — the credential is bound to the origin.*

### Slide 11: Passkeys — How They Work
- Public-key cryptography: private key stays on device, public key on server
- Origin-bound: the credential only works on `ewbanking.com` — phishing sites cannot trigger it
- Biometric or PIN unlock — the private key never leaves the device
- Cross-device: synced via iCloud Keychain, Google Password Manager, Windows Hello
- *Speaker notes: Diagram the registration and authentication flows. Emphasize that the server never sees the private key.*

### Slide 12: Implementing Passkey Registration
- Call `navigator.credentials.create()` with server-provided challenge
- The authenticator creates a key pair, returns the public key
- Send public key to server for storage
- UI: "Register a passkey" button → biometric prompt → success confirmation
- *Speaker notes: Live demo if possible — register a passkey on a test device. Show the WebAuthn API options object.*

### Slide 13: Implementing Passkey Authentication
- Call `navigator.credentials.get()` with server-provided challenge
- The authenticator signs the challenge with the private key
- Send signed assertion to server for verification
- Fallback: if passkey fails, offer MFA as backup (transition period)
- *Speaker notes: Demo passkey login — click "Sign in with passkey," biometric prompt, authenticated. Compare the UX to password + MFA.*

### Slide 14: Migration Strategy
- Phase 1 (now): Offer passkey registration alongside password + MFA
- Phase 2 (pre-June 2026): Prompt passkey enrollment at every login
- Phase 3 (June 2026): Require passkey for financial transactions
- Passkey management UI: list registered passkeys, add new, revoke lost devices
- *Speaker notes: The migration is gradual. We do not break existing logins overnight — we incentivize and then require.*

### Slide 15: Key Takeaways
- Every API response is validated with Zod — never trust unvalidated data
- Tokens live in memory, never in localStorage (XSS risk)
- MFA is mandatory for financial transactions (BSP 982)
- Passkeys are the AFASA-compliant path — phishing-resistant by design
- Next: Level 6 — Quality
