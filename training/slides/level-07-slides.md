# Level 7 — Production
## Slide Deck Outline

### Slide 1: Title Slide
- Level 7 — Production
- EastWest Bank React Training
- Digital Platforms & Innovations

### Slide 2: Learning Objectives
- Implement Content Security Policy (CSP) and Subresource Integrity (SRI)
- Map BSP circulars to concrete frontend controls
- Build privacy-compliant interfaces under the Philippine Data Privacy Act (RA 10173)
- Deploy with Azure Pipelines CI/CD to Azure Blob Storage and CDN

### Slide 3: Content Security Policy (CSP)
- CSP tells the browser which resources are allowed to load and execute
- Without CSP, one XSS vulnerability lets an attacker load any script from any domain
- Key directives: `script-src 'self'`, `connect-src` (API domains), `frame-ancestors 'none'`
- Deploy via HTTP header or `<meta>` tag — header is preferred for banking
- *Speaker notes: Show a CSP header for EWB. Demo what happens when a script from an unauthorized domain tries to load — the browser blocks it.*

### Slide 4: Subresource Integrity (SRI)
- SRI verifies that third-party scripts have not been tampered with
- `<script src="cdn.example.com/lib.js" integrity="sha384-abc123...">`
- If the file hash does not match, the browser refuses to execute it
- Protects against CDN compromise and supply-chain attacks
- *Speaker notes: Explain the attack scenario — an attacker compromises a CDN and modifies a script. Without SRI, every user runs the malicious code.*

### Slide 5: OWASP Top 10 in React
- **XSS**: React escapes output by default — but `dangerouslySetInnerHTML` bypasses it
- **Injection**: never interpolate user input into URLs or API paths
- **Broken access control**: frontend RBAC is UX, backend RBAC is security
- **Security misconfiguration**: CSP, SRI, HTTPS-only, secure cookies
- *Speaker notes: For each OWASP item, show the React-specific mitigation. React helps, but it does not make you invulnerable.*

### Slide 6: Secure Input Handling
- Sanitize user input before rendering — especially in search results and error messages
- Never use `dangerouslySetInnerHTML` unless absolutely necessary (and sanitize first)
- CORS: configure allowed origins for the banking API — no wildcard (`*`) in production
- Validate on the client (UX) AND the server (security) — always both
- *Speaker notes: Show an XSS payload in a search field. With proper escaping, it renders as text. Without it, it executes.*

### Slide 7: BSP Compliance Framework — Overview
- Every BSP circular maps to concrete frontend controls
- BSP 808 (IT Risk) → test coverage, CI/CD pipeline, change management
- BSP 982 (InfoSec) → authentication, session management, input validation, encryption
- BSP 1019 (Cyber-Risk) → monitoring, audit trails, incident correlation
- *Speaker notes: This slide is the bridge between regulation and engineering. Auditors ask for evidence — our controls are that evidence.*

### Slide 8: BSP Compliance — The Control Map
- BSP 1033 (E-Payment) → WCAG 2.1 AA accessibility, transaction logging
- BSP 1213 (AFASA) → passkeys, phishing-resistant authentication
- PCI-DSS → never store, process, or display full card numbers on the frontend
- Each control has a responsible guide, implementation pattern, and verification method
- *Speaker notes: Show the full circular-to-control mapping table. Each row is an audit artifact — this is what BSP examiners review.*

### Slide 9: Audit Trail System
- Every financial operation logged: user, timestamp, action, amount, reference ID (IP captured server-side)
- Structured logging format for machine readability
- Logs forwarded to Azure Application Insights for centralized analysis
- Audit log retention: 5 years minimum (AMLA — RA 9160)
- *Speaker notes: Show a sample audit log entry for a fund transfer. This is what compliance officers and auditors review during examinations.*

### Slide 10: Data Privacy Act (RA 10173)
- Applies to all processing of personal information of Philippine citizens
- Six key requirements: consent, purpose limitation, data minimization, access rights, correction rights, erasure rights
- Frontend responsibility: collect consent before gathering data, display minimum PII
- Data masking by default — unmasked only on explicit user action
- *Speaker notes: This is law, not policy. Violations carry criminal penalties. Every form that collects personal data needs explicit consent.*

### Slide 11: Consent Management
- Explicit opt-in before collecting any personal data — no pre-checked boxes
- Granular consent: marketing vs. analytics vs. essential cookies
- Consent stored with timestamp and version — auditable proof of consent
- Users can withdraw consent at any time through account settings
- *Speaker notes: Show the consent dialog. Emphasize that consent must be freely given, specific, informed, and unambiguous.*

### Slide 12: AMLA and KYC Requirements
- Anti-Money Laundering Act (RA 9160) — Know Your Customer (KYC) at onboarding
- Frontend role: collect and validate identity documents, report suspicious activity
- Transaction monitoring: flag unusual patterns for compliance review
- Never implement KYC bypass — even for "VIP" customers
- *Speaker notes: Brief overview — the backend handles most AMLA logic, but the frontend collects the data and must not provide workarounds.*

### Slide 13: Production Build and Deployment
- `npm run build` → Vite produces minified, tree-shaken, content-hashed output
- Deployed to Azure Blob Storage + CDN — no server runtime required
- Azure Pipelines CI/CD: build → test → security scan → deploy
- Blue-green deployment for zero-downtime releases
- *Speaker notes: Show the pipeline YAML. Emphasize that tests run before deployment — broken code never reaches production.*

### Slide 14: Azure Infrastructure
- Azure Blob Storage (`$web` container) for static files — no server runtime needed
- Azure CDN / Front Door for global caching and HTTPS termination
- Environment-specific configuration: dev, staging, production
- SOX-compliant change management: approval gates before production deployment
- *Speaker notes: Diagram the architecture — Blob Storage → CDN → Front Door → browser. No servers to manage for the SPA.*

### Slide 15: Release Process
- Feature branch → pull request → code review → approval
- Pipeline: lint → type-check → unit tests → integration tests → E2E → build → deploy
- Staging environment mirrors production — validate before promoting
- Release checklist: compliance sign-off, security review, performance baseline
- *Speaker notes: Walk through a release. The checklist is not bureaucracy — it is evidence of due diligence for BSP examinations.*

### Slide 16: Key Takeaways
- CSP and SRI are the first line of defense against XSS and supply-chain attacks
- Every BSP circular maps to frontend controls — compliance is engineering
- Data privacy (RA 10173) requires consent before collection and masking by default
- Azure Pipelines enforces quality gates — broken code never reaches production
- Next: Level 8 — Mastery
