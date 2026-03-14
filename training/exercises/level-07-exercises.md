# Level 7 — Production: Exercises

> **EastWest Bank — Digital Platforms & Innovations**
>
> Security Hardening, BSP Compliance, Data Privacy, Deployment & CI/CD

---

## Exercise 1 — Security Headers Middleware

**Difficulty:** Starter

### Learning Objectives

- Configure Content Security Policy headers for a banking SPA
- Understand the purpose of each security header
- Validate header presence with automated tests

### Requirements

Build a Vite plugin (or middleware function) that injects all required security headers during development. This ensures the development environment mirrors production Nginx behavior.

The headers must include:

1. `Content-Security-Policy` — strict policy matching the A15 guide
2. `X-Frame-Options: DENY`
3. `X-Content-Type-Options: nosniff`
4. `Referrer-Policy: strict-origin-when-cross-origin`
5. `Permissions-Policy: camera=(), microphone=(), geolocation=()`

### Starter Code

```tsx
// vite-plugin-security-headers.ts
import type { Plugin } from 'vite';

export function securityHeaders(): Plugin {
  return {
    name: 'security-headers',
    configureServer(server) {
      server.middlewares.use((_req, res, next) => {
        // TODO: Add all required security headers to res
        // Hint: use res.setHeader(name, value)
        next();
      });
    },
  };
}
```

### Acceptance Criteria

- [ ] All five security headers are present on every response in development
- [ ] CSP blocks inline scripts (`script-src 'self'` — no `unsafe-inline`)
- [ ] CSP allows Tailwind CSS inline styles (`style-src 'self'`)
- [ ] CSP allows connections to `https://api.ewbanking.com` and Sentry
- [ ] A Vitest test verifies each header is present and correctly configured
- [ ] The plugin is registered in `vite.config.ts`

---

## Exercise 2 — Consent Management Dashboard

**Difficulty:** Intermediate

### Learning Objectives

- Implement Philippine DPA (RA 10173) consent requirements
- Build a granular consent management UI
- Integrate consent state with audit logging (BSP 1019)

### Requirements

Build a `ConsentDashboard` component that displays the user's current consent preferences and allows them to modify non-essential consents. The component must:

1. Fetch current consent records from the API (`GET /user/consents`)
2. Display each consent purpose with a toggle switch
3. Mark "Essential Banking Services" as always-on and non-toggleable
4. Log all consent changes to the audit service (`CONSENT_GRANTED` / `CONSENT_REVOKED`)
5. Show the date each consent was granted or revoked
6. Validate API responses with Zod (BSP 1122)

Consent purposes to support:
- Essential Banking Services (required, cannot be disabled)
- Usage Analytics (optional)
- Marketing Communications (optional)
- Biometric Authentication (optional)
- Data Sharing — Open Finance (optional, per BSP 1122)
- Location Services (optional)

### Acceptance Criteria

- [ ] Essential consent is always enabled and the toggle is disabled
- [ ] Toggling a consent fires a mutation to `POST /user/consents`
- [ ] Each consent change emits an audit event via `emitAuditEvent()`
- [ ] Consent grant/revoke timestamps are displayed per purpose
- [ ] API responses are validated with Zod schemas
- [ ] Loading and error states are handled gracefully
- [ ] The component is accessible (proper labels, keyboard navigation)

---

## Exercise 3 — CI/CD Pipeline with Security Scanning

**Difficulty:** Challenge

### Learning Objectives

- Extend an Azure Pipelines configuration with security gates
- Integrate `npm audit` into the CI pipeline
- Build a deployment approval workflow compliant with SOX requirements

### Requirements

Extend the Azure Pipelines YAML from B07 to include:

1. **Dependency audit stage** — Runs `npm audit` and fails the build if any `critical` or `high` severity vulnerabilities are found. Allow `moderate` and `low` findings to pass with a warning.

2. **Security header verification** — After deploying to staging, run a script that fetches the staging URL and verifies all required security headers are present. Fail the pipeline if any header is missing.

3. **Release notes generation** — After a successful production deploy, generate a release summary including:
   - Git commit range since last deployment
   - List of changed files
   - Test coverage percentage
   - Dependency audit summary

### Starter Code

```yaml
# Add this stage to azure-pipelines.yml
- stage: SecurityAudit
  displayName: 'Security Audit'
  dependsOn: QualityGates
  jobs:
    - job: DependencyAudit
      displayName: 'Dependency Vulnerability Scan'
      pool:
        vmImage: 'ubuntu-latest'
      steps:
        - task: NodeTool@0
          inputs:
            versionSpec: '24'
        - script: npm ci
          displayName: 'Install dependencies'
        # TODO: Run npm audit and parse results
        # Fail on critical/high, warn on moderate/low
```

### Acceptance Criteria

- [ ] `npm audit` runs in the pipeline and fails the build on critical/high findings
- [ ] Moderate and low findings produce warnings but do not fail the build
- [ ] Security header verification script checks all headers from A15
- [ ] Release notes are generated as a build artifact
- [ ] The pipeline follows the SOX change management pattern from B07
- [ ] Staging deployment includes a health check before promotion

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
