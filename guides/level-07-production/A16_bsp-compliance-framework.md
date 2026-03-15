# A16 — BSP Compliance Framework

> **EastWest Bank — Digital Platforms & Innovations**
>
> Part A (Core) · Level 7 — Production

---

## What You Will Learn

By the end of this guide, you will:

- Map every relevant BSP circular to frontend implementation controls
- Understand the detailed requirements of each BSP circular and the specific frontend controls that satisfy them
- Build an audit trail system for financial operations
- Analyze realistic BSP examination findings and understand remediation procedures
- Implement data retention and access logging
- Create a compliance dashboard for monitoring
- Generate and maintain compliance evidence documentation for BSP examiners
- Implement log immutability and data retention policies
- Build automated compliance checks
- Prepare for BSP on-site examinations with confidence
- Manage exceptions and track remediation from finding to fix

---

## Prerequisites

| Requirement | Where |
|------------|-------|
| Completed A03 — Thinking in Compliance | Level 1 |
| Completed A15 — Security Hardening | Level 7 |
| Completed B06 — Monitoring and Observability | Level 6 |

---

> **Disclaimer on BSP circular references:** The section numbers cited
> throughout this guide (e.g., "Section 5.3", "Section 6.4") are
> **paraphrased for instructional purposes** and reflect the general
> requirements of each circular as understood at the time of writing.
> They are **not verbatim citations** from official BSP publications.
> Always verify requirements against the latest version of the actual
> BSP circular text from the Bangko Sentral ng Pilipinas website before
> making compliance decisions. Circular requirements are subject to
> amendment, and specific section numbering may differ between versions.

## Phase 1 — BSP Circular Mapping

### Complete circular-to-control mapping

| BSP Circular | Requirement | Frontend Control | Guide |
|-------------|-------------|-----------------|-------|
| **808** (IT Risk) | Risk assessment | Test coverage > 80% for financial features | A14 |
| **808** | Change management | CI/CD pipeline, release checklist | B07 |
| **982** (InfoSec) | Authentication | In-memory tokens, no localStorage | A11, B04 |
| **982** | Session management | 15-minute timeout, warning dialog | B04 |
| **982** | Access control | RBAC with route guards | B04 |
| **982** | Input validation | Zod schemas on all inputs | A07, B03 |
| **982** | Encryption | HTTPS only (CSP upgrade-insecure-requests) | A15 |
| **1019** (Cyber-Risk) | Error monitoring | Sentry integration, structured logging | B06 |
| **1019** | Incident correlation | X-Request-ID on every API call | B03 |
| **1019** | Audit trail | Financial operation logging | B06 |
| **1033** (E-Payment) | Accessibility | WCAG 2.1 AA compliance | A08 |
| **1033** | Transaction logging | All transfers logged with reference IDs | B06 |
| **1033** | User confirmation | Review step before transfers | A07 |
| **1105** (Digital Banks) | App security | CSP, SRI, security headers | A15 |
| **1105** | Maximum session | 8-hour absolute timeout | B04 |
| **1122** (Open Finance) | API validation | Zod on all API responses | B03 |
| **1122** | Data sharing consent | Consent management UI | A17 |
| **1213** (AFASA) | Phishing-resistant auth | Passkey/WebAuthn implementation | A12 |
| **1213** | Device binding | Passkey origin verification | A12 |

### Control implementation status

```tsx
// src/compliance/bsp-controls.ts

export interface ComplianceControl {
  circularNumber: string;
  circularName: string;
  requirement: string;
  controlDescription: string;
  implementationGuide: string;
  status: 'implemented' | 'in-progress' | 'planned';
  evidence: string;
}

export const bspControls: ComplianceControl[] = [
  {
    circularNumber: '982',
    circularName: 'Information Security',
    requirement: 'Session Management',
    controlDescription: 'Sessions timeout after 15 minutes of inactivity with a 2-minute warning',
    implementationGuide: 'B04',
    status: 'implemented',
    evidence: 'useSessionTimeout hook, SessionWarningDialog component, E2E test: session-timeout.spec.ts',
  },
  {
    circularNumber: '982',
    circularName: 'Information Security',
    requirement: 'Token Storage',
    controlDescription: 'Access tokens stored in JavaScript memory only, never in localStorage or sessionStorage',
    implementationGuide: 'A11, B04',
    status: 'implemented',
    evidence: 'useAuthStore — no persist middleware, security review document',
  },
  {
    circularNumber: '1213',
    circularName: 'AFASA',
    requirement: 'Phishing-Resistant Authentication',
    controlDescription: 'WebAuthn/passkey implementation with origin-bound credentials',
    implementationGuide: 'A12',
    status: 'implemented',
    evidence: 'PasskeyEnrollment component, usePasskeyLogin hook, E2E test: passkeys.spec.ts',
  },
  // ... all other controls
];
```

### Checkpoint 1

During a BSP examination, an auditor asks: "Show me evidence that your
frontend never stores authentication tokens in browser storage." What
specific files, tests, and monitoring rules would you point to?

---

## Phase 1b — BSP Circular Requirements in Detail

The mapping table above shows _what_ each circular requires. This section
digs into _why_ and _how_ — the specific language each circular uses, the
frontend control that satisfies it, and the evidence you need to prove it.

### BSP Circular 808 — IT Risk Management

BSP 808 establishes the baseline for technology risk governance. It requires
supervised institutions to conduct annual assessments of IT-related risks
and to maintain documented change management processes for all systems
handling customer data.

| Requirement | Paraphrased Text | Frontend Control | Evidence Required |
|------------|-----------------|-----------------|-------------------|
| **808-4.1** Annual IT Risk Assessment | Institutions shall perform a comprehensive annual assessment of risks arising from IT systems, identifying vulnerabilities and evaluating the adequacy of controls. | Test coverage reports (≥80% for financial features), dependency audit (npm audit), quarterly vulnerability scans. | Test coverage report from CI, npm audit output, Playwright E2E results for critical paths. |
| **808-4.3** Change Management Controls | All changes to production systems must follow a documented change management process including approval, testing, and rollback procedures. | CI/CD pipeline with required approvals, branch protection rules, automated test gates, feature flags for rollback. | Git merge history showing PR approvals, CI pipeline logs showing test gates, deployment rollback records. |
| **808-4.5** Software Development Standards | Institutions shall adopt secure software development practices and maintain coding standards. | ESLint compliance rules, TypeScript strict mode, code review requirements, security-focused linting (no-eval, no-danger). | ESLint configuration files, TypeScript `tsconfig.json` with `strict: true`, PR review history. |

### BSP Circular 982 — Enhanced Guidelines on Information Security Management

BSP 982 is the most impactful circular for frontend development. It defines
specific technical controls for authentication, session management, and data
protection in digital banking channels.

| Requirement | Paraphrased Text | Frontend Control | Evidence Required |
|------------|-----------------|-----------------|-------------------|
| **982-5.3** Session Timeout | Digital banking sessions shall be automatically terminated after a maximum of 15 minutes of user inactivity. The system shall warn the user before session termination. | `useSessionTimeout` hook with 15-minute idle timer and 2-minute warning dialog. Server-side session validation on every request. | `session-timeout.spec.ts` E2E test, `SessionWarningDialog` component, server middleware logs showing session invalidation. |
| **982-5.4** Token and Credential Storage | Authentication credentials and session tokens shall not be stored in persistent browser storage mechanisms accessible to client-side scripts. | Access tokens held in Zustand store (JavaScript memory). Refresh tokens in `HttpOnly`, `Secure`, `SameSite=Strict` cookies. Zero use of `localStorage` or `sessionStorage` for auth data. | Automated test verifying no `localStorage`/`sessionStorage` usage in auth modules. Source code review of `useAuthStore`. |
| **982-5.5** Multi-Factor Authentication | Institutions shall implement multi-factor authentication for customer-facing digital channels, requiring at least two independent authentication factors. | MFA challenge during login (OTP or passkey as second factor). MFA step-up for sensitive operations (transfers, settings changes). | `mfa-flow.spec.ts` E2E test, `MfaChallengeDialog` component, audit trail showing MFA events. |
| **982-5.6** Access Logging | All access to customer accounts and sensitive data shall be logged with sufficient detail to support security investigations and audit trail reconstruction. | `emitAuditEvent()` called on every account view, balance check, transfer, and settings change. Events include userId, sessionId, requestId, and timestamp. | Audit log queries showing event coverage, `audit-service.ts` source code, Application Insights custom event dashboard. |
| **982-5.7** Input Validation | All user inputs shall be validated and sanitized to prevent injection attacks and data corruption. | Zod schemas for all form inputs and API request payloads. Server-side validation as the authority; client-side validation for UX. | Zod schema files per feature, ESLint rules (`no-eval`, `no-danger`), input validation test suite. |

### BSP Circular 1019 — Technology Risk Management for Cyber-Security

BSP 1019 focuses on detection, response, and recovery from cybersecurity
incidents. For frontend teams, the key obligations are audit trail integrity
and incident reporting support.

| Requirement | Paraphrased Text | Frontend Control | Evidence Required |
|------------|-----------------|-----------------|-------------------|
| **1019-6.1** Cyber Incident Detection | Institutions shall implement monitoring systems capable of detecting anomalous activities including unauthorized access attempts, unusual transaction patterns, and session hijacking indicators. | Failed login monitoring (alert after 5 failures), session anomaly detection (concurrent sessions from different geolocations), transaction velocity alerts. | Application Insights alert rules, failed login dashboard, anomaly detection query in Log Analytics. |
| **1019-6.2** Incident Response Procedures | Institutions shall maintain documented procedures for responding to cyber incidents, including containment, eradication, and recovery steps. | Frontend error boundary with incident ID, Sentry integration for crash reporting, graceful degradation for API failures. | Error boundary implementation, Sentry project configuration, incident response runbook referencing frontend components. |
| **1019-6.3** BSP Notification Timeline | Institutions shall report significant cyber incidents to BSP within 72 hours of detection, including the nature, impact, and containment measures taken. | Audit trail includes X-Request-ID for full request correlation across frontend and backend. Structured logging enables rapid incident reconstruction. | Sample incident report showing end-to-end correlation using X-Request-ID, log query demonstrating timeline reconstruction. |
| **1019-6.4** Audit Trail Immutability | Audit trail records shall be protected from unauthorized modification or deletion. Audit data must be retained for a minimum of five years. | Frontend emits events via `navigator.sendBeacon()` (cannot be intercepted or modified client-side). Backend enforces append-only storage. | Architecture diagram showing audit flow, backend storage configuration (append-only blob storage or immutable DB table), retention policy documentation. |

### BSP Circular 1033 — Electronic Payments and Financial Services

BSP 1033 covers electronic payment channels — transaction transparency,
accessibility, and record-keeping requirements.

| Requirement | Paraphrased Text | Frontend Control | Evidence Required |
|------------|-----------------|-----------------|-------------------|
| **1033-7.1** Transaction Logging | All electronic payment transactions shall be logged with the following details: amount, originator, beneficiary, timestamp, channel, and reference identifier. | `emitAuditEvent('TRANSFER_CONFIRM', { amount, fromAccountId, toAccountId, currency, referenceNumber, channel: 'web' })`. All transfer events include structured metadata. | Audit log sample showing all required fields, transfer flow E2E test verifying event emission. |
| **1033-7.2** Accessibility Requirements | Digital banking channels shall be accessible to persons with disabilities, conforming to recognized accessibility standards (WCAG 2.1 Level AA). | Semantic HTML, ARIA attributes, keyboard navigation, screen reader support, color contrast ratios ≥ 4.5:1, focus management. | axe-core automated accessibility test results, manual accessibility audit report, VPAT documentation. |
| **1033-7.3** Transaction Confirmation | Users shall be presented with a clear summary of transaction details before final submission, including all fees and charges. | Two-step confirmation flow: review step showing amount, recipient, fees, and total before a separate confirm action. No single-click transfers. | Transfer flow screenshots, `TransferReviewStep` component, E2E test showing two-step flow. |
| **1033-7.4** Log Retention | Transaction logs shall be retained for a minimum of seven years from the date of the transaction. | Frontend has no direct retention responsibility — but the audit events emitted must reach the backend retention system without loss. `sendBeacon` ensures delivery during page unload. | Backend retention policy documentation, Application Insights data retention configuration (7 years for transaction workspace). |

### BSP Circular 1105 — Guidelines on Digital Banking

BSP 1105 applies specifically to digital banks and digital channels of
traditional banks. It imposes stricter session and authentication requirements
than BSP 982.

| Requirement | Paraphrased Text | Frontend Control | Evidence Required |
|------------|-----------------|-----------------|-------------------|
| **1105-8.1** Absolute Session Timeout | Digital banking sessions shall have an absolute maximum duration of 8 hours, regardless of user activity. Upon reaching the absolute timeout, the session must be terminated and the user must re-authenticate. | `useSessionTimeout` hook with dual timers: 15-minute idle timeout AND 8-hour absolute timeout. Login timestamp stored in session state. | E2E test simulating 8-hour session, `useSessionTimeout` source showing absolute timer, audit events for `AUTH_SESSION_TIMEOUT` with reason 'absolute'. |
| **1105-8.2** Device Binding | For high-risk transactions, the device used for authentication shall be verified against registered devices. Institutions shall implement device fingerprinting or binding mechanisms. | Passkey credentials are inherently device-bound (WebAuthn `authenticatorAttachment: 'platform'`). Device trust score computed from User-Agent, screen resolution, and timezone consistency. | Passkey registration flow showing device binding, device trust score implementation, audit trail showing device verification events. |
| **1105-8.3** Transaction Velocity Checks | Institutions shall implement real-time monitoring of transaction frequency and volume to detect and prevent potential fraud. | Frontend rate limiting: disable transfer button after submission, show cooldown timer. Backend enforces actual velocity rules — frontend provides UX for rejected transactions. | Transfer component showing rate-limit UX, backend velocity rule configuration, alert rules for velocity threshold breaches. |
| **1105-8.4** Out-of-Band Authentication | For high-value transactions exceeding defined thresholds, institutions shall require authentication through an independent, out-of-band channel. | Step-up authentication dialog triggered when transfer amount exceeds threshold (e.g., PHP 50,000). Routes to OTP via SMS/email or passkey re-verification. | `useStepUpAuth` hook, threshold configuration, E2E test with high-value transfer triggering step-up. |

### BSP Circular 1122 — Open Finance Framework

BSP 1122 governs third-party data sharing through APIs. For frontend teams,
this means validating everything that comes from external systems and managing
user consent.

| Requirement | Paraphrased Text | Frontend Control | Evidence Required |
|------------|-----------------|-----------------|-------------------|
| **1122-9.1** API Response Validation | Institutions shall validate all data received from third-party APIs to ensure integrity, completeness, and conformity to expected schemas before processing or displaying to users. | Zod schemas on every API response. `parse()` (not `safeParse()`) for critical financial data — fail loudly on unexpected shapes. Type-safe API layer with strict response contracts. | Zod schema files per API endpoint, API layer source showing `.parse()` calls, test suite verifying schema validation. |
| **1122-9.2** Data Sharing Consent | Users shall provide explicit, informed, and revocable consent before their data is shared with third parties. Consent records must include scope, duration, and the identity of the receiving party. | Consent management UI showing exactly what data will be shared, with whom, for how long. Granular opt-in (not bundled consent). Revocation flow with confirmation. | `ConsentManagement` component, consent grant/revoke E2E tests, audit trail showing `CONSENT_GRANTED` and `CONSENT_REVOKED` events with metadata. |
| **1122-9.3** Third-Party Access Auditing | Institutions shall maintain audit trails of all data access by third parties, including the data accessed, the purpose, and the timestamp. | Frontend displays third-party access history to the user (transparency). Each API call to third parties includes correlation IDs for audit. | Third-party access history UI, backend audit logs showing third-party data access, consent dashboard showing active connections. |
| **1122-9.4** API Scope Limitations | Third-party access shall be limited to the minimum data necessary for the stated purpose. API scopes shall be granular and explicitly mapped to consented purposes. | Frontend consent UI shows exact scopes being granted. API client sends only consented scopes in authorization headers. Scope mismatch triggers error boundary. | Scope configuration documentation, consent UI screenshots showing granular scopes, test verifying scope enforcement. |

### BSP Circular 1213 — Anti-Financial Account Scam Act (AFASA)

BSP 1213 is the newest and most prescriptive circular. It mandates
phishing-resistant authentication methods, with a compliance deadline of
**June 2026**.

| Requirement | Paraphrased Text | Frontend Control | Evidence Required |
|------------|-----------------|-----------------|-------------------|
| **1213-10.1** Phishing-Resistant Authentication | By June 2026, institutions shall implement authentication mechanisms resistant to phishing attacks. Acceptable methods include FIDO2/WebAuthn-based authenticators that verify the relying party origin. | WebAuthn/passkey implementation using `navigator.credentials.create()` and `navigator.credentials.get()`. Browser verifies origin automatically — phishing sites cannot intercept credentials. | `PasskeyEnrollment` component, `usePasskeyLogin` hook, E2E test on `https://` origin, WebAuthn configuration showing `rpId` matching production domain. |
| **1213-10.2** Origin Verification | Authentication credentials shall be cryptographically bound to the relying party's origin. The system shall reject authentication attempts where the origin does not match the registered credential. | WebAuthn handles this natively — the browser includes the origin in the `clientDataJSON` signed by the authenticator. Server MUST verify `origin` in the response. | Server-side verification code checking `clientDataJSON.origin`, test with mismatched origin returning authentication failure. |
| **1213-10.3** Enrollment Identity Verification | Before enrolling a phishing-resistant credential, institutions shall verify the user's identity through an existing authenticated session with multi-factor verification. | Passkey enrollment requires active session + MFA step-up. Users cannot register a passkey without first proving their identity via existing credentials plus OTP. | Enrollment flow showing MFA step-up requirement, E2E test attempting enrollment without MFA (must fail), audit trail showing `AUTH_MFA_SUCCESS` before `AUTH_PASSKEY_REGISTER`. |
| **1213-10.4** Fallback Authentication Methods | Institutions shall maintain fallback authentication methods for users unable to use phishing-resistant credentials, while documenting the additional risk accepted. | Fallback to password + OTP with documented risk acceptance. Progressive enrollment: prompt passkey setup on every login until enrolled. Fallback usage logged for risk monitoring. | Fallback flow implementation, progressive enrollment prompt component, risk acceptance documentation, audit trail distinguishing passkey vs. fallback logins. |
| **1213-10.5** Compliance Deadline | Full compliance with phishing-resistant authentication requirements is required by June 30, 2026. Institutions shall submit implementation plans to BSP by December 31, 2025. | Implementation plan tracking in compliance dashboard. Migration metrics: percentage of users with passkeys enrolled, fallback usage rate, enrollment funnel conversion. | Compliance dashboard showing AFASA metrics, monthly migration report, implementation timeline documentation. |

### Checkpoint 1b

Pick any two circulars from the tables above. For each, write down: (a) the
single most critical requirement for frontend developers, (b) the exact
component or hook that implements it, and (c) what happens if the control
fails during a BSP examination.

---

## Phase 2 — Audit Trail Implementation

### Audit event types

```tsx
// src/compliance/audit-types.ts

export type AuditEventType =
  | 'AUTH_LOGIN_SUCCESS'
  | 'AUTH_LOGIN_FAILURE'
  | 'AUTH_LOGOUT'
  | 'AUTH_SESSION_TIMEOUT'
  | 'AUTH_TOKEN_REFRESH'
  | 'AUTH_MFA_CHALLENGE'
  | 'AUTH_MFA_SUCCESS'
  | 'AUTH_MFA_FAILURE'
  | 'AUTH_PASSKEY_REGISTER'
  | 'AUTH_PASSKEY_LOGIN'
  | 'ACCOUNT_VIEW'
  | 'ACCOUNT_BALANCE_VIEW'
  | 'TRANSFER_INITIATE'
  | 'TRANSFER_CONFIRM'
  | 'TRANSFER_CANCEL'
  | 'TRANSFER_FAILURE'
  | 'PAYMENT_INITIATE'
  | 'PAYMENT_CONFIRM'
  | 'PAYMENT_SUBMITTED'
  | 'PAYMENT_FAILED'
  | 'SETTINGS_CHANGE'
  | 'DATA_EXPORT'
  | 'CONSENT_GRANTED'
  | 'CONSENT_REVOKED';

export interface AuditEvent {
  type: AuditEventType;
  timestamp: string;
  userId: string | null;
  sessionId: string;
  requestId: string;
  metadata: Record<string, unknown>;
  ipAddress?: string; // Set by backend
  userAgent?: string; // Set by backend
}
```

### Audit service

```tsx
// src/compliance/audit-service.ts
import { useAuthStore } from '@/stores/auth-store';
import { env } from '@/lib/env';
import type { AuditEventType } from './audit-types';

let sessionId: string | null = null;

function getSessionId(): string {
  if (sessionId == null) {
    sessionId = crypto.randomUUID();
  }
  return sessionId;
}

export function emitAuditEvent(
  type: AuditEventType,
  metadata: Record<string, unknown> = {},
): void {
  const userId = useAuthStore.getState().user?.id ?? null;
  const requestId = crypto.randomUUID();

  const event = {
    type,
    timestamp: new Date().toISOString(),
    userId,
    sessionId: getSessionId(),
    requestId,
    metadata,
  };

  // BSP 1019 — All audit events must be persisted.
  // We use sendBeacon instead of fetch because sendBeacon is guaranteed
  // to complete even during page unload (tab close, navigation away).
  // A regular fetch() may be cancelled by the browser mid-navigation,
  // which would silently drop audit events — unacceptable for compliance.
  if (import.meta.env.PROD) {
    navigator.sendBeacon(`${env.VITE_API_BASE_URL}/audit`, JSON.stringify(event));
  }

  if (import.meta.env.DEV) {
    console.info('[AUDIT]', type, metadata);
  }
}

// Reset session ID on logout
export function resetAuditSession(): void {
  sessionId = null;
}
```

### Using the audit service

```tsx
// In login flow
emitAuditEvent('AUTH_LOGIN_SUCCESS', { method: 'password' });
emitAuditEvent('AUTH_LOGIN_FAILURE', { reason: 'invalid_credentials' });
emitAuditEvent('AUTH_MFA_CHALLENGE', { methods: ['otp'] });

// In transfer flow
emitAuditEvent('TRANSFER_INITIATE', {
  fromAccountId: 'acc-1',
  toAccountId: 'acc-2',
  amount: 500_000, // ₱5,000.00 in centavos
  currency: 'PHP',
});

emitAuditEvent('TRANSFER_CONFIRM', {
  referenceNumber: 'EWB-2026-0001',
});
```

### Checkpoint 2

An auditor asks: "Can your audit trail be tampered with from the frontend?"
What is the correct answer, and what backend controls must be in place?

---

## Phase 2b — Audit Finding Examples

Real BSP examinations produce formal findings. Understanding the format and
severity of these findings helps you build controls that will withstand
scrutiny. Below are six realistic examination findings modeled on common
issues discovered in Philippine banking applications.

### Finding: Session Timeout Not Enforced on Fund Transfer Pages

**BSP Circular:** 982, Section 5.3 — Session Management

**Severity:** Critical

**Examiner's Observation:** During testing of the fund transfer module, the
examiner left the application idle on the transfer confirmation page for
25 minutes. Upon returning, the transfer could still be submitted without
re-authentication. The session timeout mechanism appears to be suspended
during multi-step transaction flows.

**Expected Control:** All pages, including those within multi-step transaction
flows, must enforce the 15-minute idle timeout. No page or component should
suppress or pause the session timer.

**Actual State:** The `TransferConfirmStep` component calls
`pauseSessionTimeout()` to prevent the user from being logged out while
reviewing transfer details. This effectively disables the idle timeout on
the most security-sensitive page in the application.

**Remediation Required:** Remove the `pauseSessionTimeout()` call from all
transaction pages. The session timer must run continuously. If the user is
idle for 15 minutes on any page — including mid-transaction — the session
must be terminated and the incomplete transaction discarded.

**Evidence to Produce:** Updated `TransferConfirmStep` component without
timeout suppression, E2E test showing session termination on the transfer
page after 15 minutes, audit log showing `AUTH_SESSION_TIMEOUT` events
originating from transfer flow pages.

---

### Finding: Audit Trail Events Missing User IP Address

**BSP Circular:** 1019, Section 6.4 — Audit Trail Completeness

**Severity:** High

**Examiner's Observation:** A sample of 500 audit trail records was examined.
All records contained userId, sessionId, and timestamp, but 100% of records
had a null value for `ipAddress`. The institution's audit trail does not
capture the originating IP address of user actions.

**Expected Control:** Every audit trail event must include the user's IP
address to support forensic investigation and geographic anomaly detection.

**Actual State:** The frontend `emitAuditEvent()` function does not set the
`ipAddress` field, and the backend `/api/audit` endpoint does not extract
it from the request headers (`X-Forwarded-For` or socket remote address).

**Remediation Required:** The backend audit ingestion endpoint must extract
the client IP from `X-Forwarded-For` (respecting the trusted proxy chain)
and attach it to every audit record before persistence. The frontend does
not need modification — IP extraction is a backend responsibility.

**Evidence to Produce:** Updated backend audit endpoint code showing IP
extraction, sample audit records with populated `ipAddress` field, network
architecture diagram showing proxy chain and `X-Forwarded-For` trust
configuration.

---

### Finding: PII Visible in Application Insights Telemetry

**BSP Circular:** RA 10173 (Data Privacy Act), BSP 982 Section 5.8

**Severity:** Critical

**Examiner's Observation:** Application Insights custom events for
`TRANSFER_CONFIRM` include the full beneficiary name, account number, and
transfer amount in the `metadata` field. This PII is accessible to all
developers with Application Insights read access and is retained for 90
days in the default telemetry workspace.

**Expected Control:** Telemetry and logging systems must not contain
personally identifiable information. Account numbers must be masked, names
must be excluded or anonymized, and access to telemetry must be restricted
by role.

**Actual State:** The `emitAuditEvent('TRANSFER_CONFIRM', { ... })` call
passes the raw `beneficiaryName` and full `toAccountNumber` in the metadata
object. No sanitization occurs before the data reaches Application Insights.

**Remediation Required:** Implement a telemetry sanitizer that masks
account numbers (show last 4 digits only), removes beneficiary names, and
strips any other PII before events are sent to Application Insights.
Separate the compliance audit trail (which may contain PII in a secured,
access-controlled store) from the telemetry stream (which must be PII-free).

**Evidence to Produce:** Telemetry sanitizer implementation, before/after
comparison of Application Insights events, data classification policy
showing which fields are PII, Application Insights access control
configuration.

---

### Finding: No Consent Management for Data Sharing API

**BSP Circular:** 1122, Section 9.2 — Data Sharing Consent

**Severity:** High

**Examiner's Observation:** The application exposes an API endpoint that
shares account balance data with a third-party fintech partner. Users are
not presented with a consent dialog before data sharing occurs. The
institution has no record of user consent for any active data-sharing
connection.

**Expected Control:** Before any customer data is shared with a third party,
the user must provide explicit, informed consent specifying: what data is
shared, with whom, for what purpose, and for how long. Consent must be
revocable.

**Actual State:** The third-party integration was added during a product
sprint without the consent management component. Account data flows to the
partner API on every dashboard load with no user awareness or approval.

**Remediation Required:** Implement a consent management UI that presents
data-sharing details before activation. Store consent records with scope,
timestamp, and expiry. Block all third-party data sharing until consent is
recorded. Provide a revocation flow in account settings.

**Evidence to Produce:** `ConsentManagement` component implementation,
consent grant flow E2E test, consent records in the database with
timestamps, revocation flow E2E test, audit events for `CONSENT_GRANTED`
and `CONSENT_REVOKED`.

---

### Finding: MFA Not Enforced for High-Value Transactions

**BSP Circular:** 1105, Section 8.4 — Out-of-Band Authentication

**Severity:** Critical

**Examiner's Observation:** A fund transfer of PHP 500,000 was executed
using only password authentication. No second-factor challenge was
triggered. The institution's documented policy states that transfers above
PHP 50,000 require step-up authentication, but the frontend does not
enforce this threshold.

**Expected Control:** Transactions exceeding defined thresholds must trigger
step-up authentication through an independent channel (OTP via SMS/email
or biometric re-verification).

**Actual State:** The `useTransfer` hook submits the transfer request
directly without checking the amount against step-up thresholds. The
backend accepts the transfer because it relies on the frontend to trigger
the MFA challenge.

**Remediation Required:** Implement amount-based step-up authentication in
the transfer flow. The backend must independently enforce MFA requirements
for high-value transactions — the frontend step-up is a UX enhancement,
not the security boundary. Both layers must enforce the threshold.

**Evidence to Produce:** `useStepUpAuth` hook implementation, threshold
configuration (PHP 50,000), E2E test showing MFA challenge for high-value
transfer, E2E test showing transfer proceeds without MFA below threshold,
backend enforcement logs.

---

### Finding: Passkey Enrollment Without Identity Verification

**BSP Circular:** 1213 (AFASA), Section 10.3 — Enrollment Identity Verification

**Severity:** High

**Examiner's Observation:** A user can register a passkey immediately after
logging in with username and password alone. No additional identity
verification (MFA step-up) is required before the passkey credential is
bound to the account. An attacker who compromises a password could register
their own passkey, establishing persistent phishing-resistant access.

**Expected Control:** Passkey enrollment must require multi-factor identity
verification. The user must prove their identity through an existing MFA
method (OTP, security questions, or existing biometric) before a new
WebAuthn credential is registered.

**Actual State:** The `PasskeyEnrollment` component checks only that the
user has an active session (`isAuthenticated === true`). It does not
verify that the session was established with MFA, nor does it trigger a
step-up challenge before `navigator.credentials.create()`.

**Remediation Required:** Add an MFA step-up gate before passkey
enrollment. The enrollment flow must verify that the current session
includes a recent MFA challenge (within the last 5 minutes) or trigger
a new one. The backend must reject credential registration requests that
lack MFA proof.

**Evidence to Produce:** Updated `PasskeyEnrollment` component with MFA
gate, E2E test attempting enrollment without MFA (must fail), E2E test
showing successful enrollment after MFA, audit trail showing
`AUTH_MFA_SUCCESS` immediately preceding `AUTH_PASSKEY_REGISTER`.

### Checkpoint 2b

Review the six findings above. For each, identify which finding could have
been caught by an automated test and write a one-line description of that
test. Which findings require manual review or architecture changes that
cannot be caught by automated testing alone?

---

## Phase 3 — Compliance Dashboard

### Dashboard concept

```tsx
// src/features/compliance/components/compliance-dashboard.tsx
import { bspControls } from '@/compliance/bsp-controls';

export function ComplianceDashboard() {
  const implemented = bspControls.filter((c) => c.status === 'implemented');
  const inProgress = bspControls.filter((c) => c.status === 'in-progress');
  const planned = bspControls.filter((c) => c.status === 'planned');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">BSP Compliance Status</h1>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded bg-green-50 p-4">
          <p className="text-3xl font-bold text-green-700">{implemented.length}</p>
          <p className="text-sm text-green-600">Implemented</p>
        </div>
        <div className="rounded bg-amber-50 p-4">
          <p className="text-3xl font-bold text-amber-700">{inProgress.length}</p>
          <p className="text-sm text-amber-600">In Progress</p>
        </div>
        <div className="rounded bg-gray-50 p-4">
          <p className="text-3xl font-bold text-gray-700">{planned.length}</p>
          <p className="text-sm text-gray-600">Planned</p>
        </div>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="p-2">Circular</th>
            <th className="p-2">Requirement</th>
            <th className="p-2">Control</th>
            <th className="p-2">Status</th>
            <th className="p-2">Evidence</th>
          </tr>
        </thead>
        <tbody>
          {bspControls.map((control, index) => (
            <tr key={index} className="border-b">
              <td className="p-2 font-mono">{control.circularNumber}</td>
              <td className="p-2">{control.requirement}</td>
              <td className="p-2">{control.controlDescription}</td>
              <td className="p-2">
                <span className={`inline-block rounded px-2 py-0.5 text-xs ${
                  control.status === 'implemented'
                    ? 'bg-green-100 text-green-700'
                    : control.status === 'in-progress'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-gray-100 text-gray-700'
                }`}>
                  {control.status}
                </span>
              </td>
              <td className="p-2 text-xs text-gray-500">{control.evidence}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## Phase 3b — Evidence Documentation

Implementing a control is half the work. The other half is proving to a BSP
examiner that the control exists, works, and continues to work. This section
covers how to create, organize, and maintain compliance evidence.

### Evidence types and when to use them

| Evidence Type | Best For | Example |
|--------------|---------|---------|
| **Test file** | Proving a control works and has not regressed | `session-timeout.spec.ts` — E2E test showing 15-minute idle termination |
| **Screenshot** | UI controls, accessibility, consent flows | Screenshot of consent dialog showing granular permissions |
| **Log sample** | Audit trail completeness, event coverage | 50-row sample from Application Insights showing all required audit fields |
| **Code reference** | Implementation details, architectural controls | `useAuthStore` source showing no `persist` middleware |
| **Configuration** | Security headers, ESLint rules, CI pipeline settings | `Content-Security-Policy` header configuration |
| **Architecture diagram** | Data flow, security boundaries, system integration | Diagram showing audit event flow from browser to append-only storage |

### Evidence data model

```tsx
// src/compliance/evidence-types.ts

export interface ComplianceEvidence {
  controlId: string;           // e.g., "BSP-982-5.3"
  description: string;         // "Session timeout enforced at 15 minutes"
  evidenceType: 'test' | 'screenshot' | 'log' | 'code' | 'config';
  location: string;            // File path or URL
  lastVerified: string;        // ISO date
  verifiedBy: string;          // Team member
  status: 'current' | 'expired' | 'needs-review';
}

export interface EvidencePackage {
  generatedAt: string;
  generatedBy: string;
  controls: Array<{
    control: ComplianceControl;
    evidence: ComplianceEvidence[];
    overallStatus: 'compliant' | 'non-compliant' | 'partial';
  }>;
}
```

### Evidence freshness requirements

Not all evidence has the same shelf life. Some controls require continuous
proof; others are verified periodically.

| Evidence Category | Refresh Frequency | Trigger |
|------------------|-------------------|---------|
| Automated test results | Every CI build | Code change merged to main |
| Security header configuration | Monthly | Scheduled compliance scan |
| Audit trail samples | Quarterly | Pre-examination preparation |
| Accessibility audit | Semi-annually | Major UI redesign or WCAG update |
| Architecture diagrams | On change | Any architectural modification |
| Penetration test results | Annually | Annual security assessment |

Evidence older than its refresh period has a status of `expired`. Expired
evidence does not prove current compliance — an examiner will flag it.

### Automated evidence generation in CI

The most reliable evidence is generated automatically. Configure your CI
pipeline to produce evidence artifacts on every build.

```tsx
// scripts/generate-compliance-evidence.ts

import { writeFileSync } from 'node:fs';
import { bspControls } from '../src/compliance/bsp-controls';
import type { ComplianceEvidence, EvidencePackage } from '../src/compliance/evidence-types';

interface TestResult {
  testName: string;
  status: 'passed' | 'failed';
  duration: number;
  file: string;
}

function collectTestEvidence(testResults: TestResult[]): ComplianceEvidence[] {
  const complianceTests = testResults.filter(
    (t) => t.file.includes('compliance') || t.file.includes('security'),
  );

  return complianceTests.map((test) => ({
    controlId: extractControlId(test.testName),
    description: test.testName,
    evidenceType: 'test' as const,
    location: test.file,
    lastVerified: new Date().toISOString(),
    verifiedBy: 'CI Pipeline',
    status: test.status === 'passed' ? 'current' as const : 'needs-review' as const,
  }));
}

function extractControlId(testName: string): string {
  // Map test names to BSP control IDs
  const controlMap: Record<string, string> = {
    'session timeout': 'BSP-982-5.3',
    'token storage': 'BSP-982-5.4',
    'no localStorage': 'BSP-982-5.4',
    'zod validation': 'BSP-1122-9.1',
    'csp headers': 'BSP-1105-8.1',
  };

  const key = Object.keys(controlMap).find((k) =>
    testName.toLowerCase().includes(k),
  );
  return key ? controlMap[key] : 'UNMAPPED';
}

function generateEvidencePackage(testResults: TestResult[]): void {
  const evidence = collectTestEvidence(testResults);

  const pkg: EvidencePackage = {
    generatedAt: new Date().toISOString(),
    generatedBy: 'CI Pipeline — compliance-evidence-generator',
    controls: bspControls.map((control) => ({
      control,
      evidence: evidence.filter((e) =>
        e.controlId.includes(control.circularNumber),
      ),
      overallStatus: 'compliant' as const, // Simplified — real logic would check evidence coverage
    })),
  };

  writeFileSync(
    'compliance-evidence-report.json',
    JSON.stringify(pkg, null, 2),
  );
}

// Called by CI after test suite completes
export { generateEvidencePackage };
```

### CI pipeline integration

Add an evidence generation step to your CI workflow:

```yaml
# In your Azure Pipelines configuration
- stage: ComplianceEvidence
  displayName: 'Compliance Evidence'
  dependsOn: Test
  jobs:
    - job: GenerateEvidence
      displayName: 'Generate Compliance Evidence'
      pool:
        vmImage: 'ubuntu-latest'
      steps:
        - task: NodeTool@1
          inputs:
            versionSpec: '24.x'
          displayName: 'Install Node.js'
        - script: npm ci
          displayName: 'Install dependencies'
        - script: npx tsx scripts/generate-compliance-evidence.ts
          displayName: 'Generate compliance evidence report'
        - task: PublishBuildArtifacts@1
          inputs:
            pathToPublish: compliance-evidence-report.json
            artifactName: compliance-evidence
          displayName: 'Publish compliance evidence artifact'
```

Every successful build produces a timestamped evidence package. When an
examiner asks "Show me proof that session timeout is enforced," you pull
the latest CI artifact and point to the passing test.

### Checkpoint 3b

An examiner asks: "How do you know this control was working three months
ago?" What evidence would you produce, and how does your CI pipeline
ensure that evidence exists?

---

## Phase 4 — Automated Compliance Checks

### Compliance test suite

```tsx
// src/compliance/compliance.test.ts
import { describe, it, expect } from 'vitest';

describe('BSP Compliance Checks', () => {
  it('auth store does not use persist middleware for tokens', async () => {
    const storeSource = await import('@/stores/auth-store?raw');
    // Verify no persist middleware wrapping the token state
    expect(storeSource.default).not.toContain("persist(");
  });

  it('no localStorage usage for auth tokens', async () => {
    // Search for localStorage.setItem patterns
    const authStore = await import('@/stores/auth-store?raw');
    expect(authStore.default).not.toContain('localStorage');
    expect(authStore.default).not.toContain('sessionStorage');
  });

  it('all API functions validate responses with Zod', async () => {
    // Import the API module source to verify Zod usage.
    // Every API function must call .parse() on response data.
    const apiSource = await import('@/features/accounts/api/accounts-api?raw');
    expect(apiSource.default).toContain('.parse(');
    expect(apiSource.default).toContain("from 'zod'");
  });
});
```

### ESLint rules for compliance

```tsx
// .eslintrc.cjs (compliance rules)
module.exports = {
  rules: {
    // BSP 982 — No eval for code execution
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',

    // BSP 982 — No direct DOM manipulation (XSS risk)
    'react/no-danger': 'error',

    // BSP 982 — No console.log in production (data leakage)
    'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
  },
};
```

---

## Phase 4b — Data Retention and Log Immutability

BSP circulars specify minimum retention periods for different categories
of data. The frontend team must understand these requirements because they
determine what gets logged, how it is transmitted, and what happens to it
over time.

### BSP retention requirements

| Data Category | BSP Circular | Minimum Retention | Notes |
|--------------|-------------|-------------------|-------|
| Audit trail events (login, logout, access) | 1019 | 5 years | Immutable. No modification or deletion permitted. |
| Transaction logs (transfers, payments) | 1033 | 7 years | Must include amount, parties, timestamp, channel, reference ID. |
| Consent records | 1122 | Duration of consent + 5 years | Must prove what the user consented to, when, and when revoked. |
| Security incident records | 1019 | 5 years | Full incident timeline from detection to resolution. |
| Session logs | 982 | 1 year | Session start/end, timeout events, device information. |

### Frontend logging strategy

Not everything belongs in every logging destination. Separate your logging
streams by purpose and sensitivity.

```tsx
// src/compliance/logging-strategy.ts

/**
 * Frontend logging is split into two streams:
 *
 * 1. COMPLIANCE AUDIT TRAIL → Backend audit API → Append-only storage
 *    - Contains: All AuditEventType events (auth, transfers, consent)
 *    - May contain PII (stored in access-controlled audit database)
 *    - Retention: 5-7 years depending on event type
 *    - Transmitted via: navigator.sendBeacon(`${env.VITE_API_BASE_URL}/audit`)
 *
 * 2. TELEMETRY → Application Insights
 *    - Contains: Performance metrics, error tracking, usage analytics
 *    - Must NOT contain PII (accessible to all developers)
 *    - Retention: 90 days (default) to 2 years (extended)
 *    - Transmitted via: Application Insights SDK
 */

export function sanitizeForTelemetry(
  data: Record<string, unknown>,
): Record<string, unknown> {
  const piiFields = [
    'accountNumber',
    'beneficiaryName',
    'email',
    'phoneNumber',
    'address',
    'fullName',
  ];

  const sanitized = { ...data };

  for (const field of piiFields) {
    if (field in sanitized) {
      if (field === 'accountNumber' && typeof sanitized[field] === 'string') {
        // Mask account number: show last 4 digits only
        const value = sanitized[field] as string;
        sanitized[field] = `****${value.slice(-4)}`;
      } else {
        sanitized[field] = '[REDACTED]';
      }
    }
  }

  return sanitized;
}
```

### Log immutability — append-only audit trail

BSP 1019 requires that audit records cannot be modified or deleted. The
frontend's role is to emit events reliably; the backend ensures immutability.

The recommended architecture:

1. **Frontend emits** via `navigator.sendBeacon()` — fire-and-forget, survives
   page unload.
2. **Backend ingests** into an append-only store. Options:
   - Azure Blob Storage with immutability policies (WORM — Write Once, Read Many)
   - Database table with no UPDATE/DELETE permissions for the application user
   - Event stream (Azure Event Hubs) with immutable retention
3. **Hash chain verification** — each audit record includes a hash of the
   previous record, forming a verifiable chain.

```tsx
// Backend concept — included here for frontend developer awareness
// src/compliance/hash-chain.ts

import { createHash } from 'node:crypto';

export interface HashedAuditRecord {
  sequenceNumber: number;
  event: Record<string, unknown>;
  timestamp: string;
  previousHash: string;
  currentHash: string;
}

export function computeRecordHash(
  event: Record<string, unknown>,
  previousHash: string,
): string {
  const payload = JSON.stringify({ event, previousHash });
  return createHash('sha256').update(payload).digest('hex');
}

// Verification: walk the chain and confirm each hash matches
export function verifyChainIntegrity(
  records: HashedAuditRecord[],
): { valid: boolean; brokenAt?: number } {
  for (let i = 1; i < records.length; i++) {
    const expectedHash = computeRecordHash(
      records[i].event,
      records[i - 1].currentHash,
    );
    if (records[i].currentHash !== expectedHash) {
      return { valid: false, brokenAt: i };
    }
  }
  return { valid: true };
}
```

### Archive tiering strategy

Keeping 7 years of transaction logs in hot storage is expensive and
unnecessary. Use a tiered approach:

| Tier | Duration | Storage | Access Time | Use Case |
|------|----------|---------|-------------|----------|
| **Hot** | 0–30 days | Primary database / Application Insights | Milliseconds | Active monitoring, incident investigation |
| **Warm** | 30 days – 1 year | Azure Table Storage / secondary database | Seconds | Quarterly audits, trend analysis |
| **Cold** | 1 – 5+ years | Azure Blob Storage (cool tier) with immutability policies | Minutes | BSP examination, legal hold, historical audit |
| **Archive** | 5 – 7 years | Azure Blob Storage (archive tier) | Hours (rehydration required) | Regulatory retention compliance |

### Data destruction after retention period

When the retention period expires, data must be destroyed — not just
deleted, but rendered unrecoverable. Document the destruction process:

1. **Identify** — Query for records past their retention date.
2. **Verify** — Confirm no legal hold or active investigation applies.
3. **Destroy** — Cryptographic erasure (delete the encryption key) or
   physical deletion with verification.
4. **Document** — Record the destruction in a retention log: what was
   destroyed, when, by whom, and under what authority.
5. **Audit** — The destruction record itself is retained permanently.

The frontend team does not perform data destruction, but you must understand
the lifecycle because examiners will ask: "What happens to audit data after
the retention period?" The answer must be documented and practiced.

### Checkpoint 4b

An examiner asks: "Show me evidence that your audit trail from 3 years ago
has not been tampered with." What technical mechanism provides this proof,
and what would you demonstrate?

---

## Phase 5 — BSP Examination Preparation

A BSP examination is not a surprise quiz — it follows a predictable
structure. Preparation is the difference between a clean examination and
a list of findings that consume the next quarter.

### Self-assessment questionnaire

Before the examination, walk through these questions internally. Every
developer on the team should know these answers.

| # | Examiner's Question | Expected Answer |
|---|---------------------|-----------------|
| 1 | How are user sessions managed? | 15-minute idle timeout with 2-minute warning dialog, plus 8-hour absolute timeout. Both enforced client-side with server-side validation on every API request. Session terminated server-side if either threshold is exceeded. |
| 2 | Where are authentication tokens stored? | Access tokens in JavaScript memory (Zustand store, no persist middleware). Refresh tokens in HttpOnly, Secure, SameSite=Strict cookies. Nothing in localStorage or sessionStorage. |
| 3 | How do you detect unauthorized access? | Failed login monitoring with alerts after 5 consecutive failures. Session anomaly detection for concurrent sessions from different locations. Full audit trail with X-Request-ID correlation across frontend and backend. |
| 4 | How is multi-factor authentication enforced? | MFA required on every login (OTP or passkey as second factor). Step-up MFA required for transfers above PHP 50,000 and for passkey enrollment. Backend independently enforces MFA requirements. |
| 5 | What phishing-resistant authentication is available? | WebAuthn/passkey implementation with origin-bound credentials. Browser verifies relying party origin automatically. Enrollment requires active MFA session. Full compliance with BSP 1213 (AFASA). |
| 6 | How are API responses validated? | Every API response is validated with a Zod schema using `.parse()` — not `.safeParse()` for critical financial data. Invalid responses throw and are caught by error boundaries. Type safety enforced at compile time and runtime. |
| 7 | How do you ensure data shared with third parties is consented? | Consent management UI presents exactly what data is shared, with whom, for how long. Granular opt-in per data category. Consent records include scope, timestamp, and third-party identity. Revocation flow available in account settings. |
| 8 | Can the audit trail be tampered with? | No. Frontend emits events via `sendBeacon` (no client-side interception). Backend stores in append-only storage with hash chain verification. Application database user has no UPDATE or DELETE permissions on audit tables. |
| 9 | How long are transaction logs retained? | 7 years per BSP 1033. Tiered storage: hot (30 days), warm (1 year), cold (5+ years). Immutability policies on all tiers. Destruction only after retention period with documented approval. |
| 10 | What happens when a user's session is compromised? | Immediate session revocation via backend. Audit trail enables full reconstruction of the attacker's actions using sessionId and X-Request-ID. Incident response runbook includes BSP notification within 72 hours if customer data is affected. |
| 11 | How do you handle accessibility requirements? | WCAG 2.1 Level AA compliance. Semantic HTML, ARIA attributes, keyboard navigation, screen reader support, 4.5:1 contrast ratios. Automated axe-core testing in CI. Semi-annual manual accessibility audit. |
| 12 | How are code changes controlled? | All changes go through pull requests with required approvals. CI pipeline enforces lint, type-check, test, and security scan gates. Branch protection on main. Feature flags for gradual rollout and instant rollback. |

### Document production checklist

Prepare these documents before the examination team arrives:

- [ ] **System architecture diagram** — showing frontend, backend, API gateway, audit storage, and third-party integrations
- [ ] **Data flow diagram** — showing how customer data moves through the system, where it is stored, and how it is protected
- [ ] **BSP control mapping** — the Phase 1 table, printed and annotated with evidence locations
- [ ] **Latest CI compliance report** — evidence package from the most recent build
- [ ] **Test coverage report** — showing coverage for financial features (target: >80%)
- [ ] **Accessibility audit report** — most recent axe-core results and manual audit findings
- [ ] **Incident response runbook** — documented procedures for security incidents
- [ ] **Consent management documentation** — consent flows, data sharing agreements, revocation procedures
- [ ] **Audit trail sample** — 100-row sample showing all required fields populated
- [ ] **Retention policy documentation** — showing storage tiers, retention periods, and destruction procedures
- [ ] **Change management log** — last 6 months of production deployments with approvals
- [ ] **AFASA implementation plan** — timeline for BSP 1213 compliance (deadline: June 2026)

### Interview preparation

BSP examinations include interviews with technical staff. Know who should
be in the room and what they should be prepared to discuss.

**Required attendees:**
- **Tech Lead / Engineering Manager** — architecture decisions, security controls, development process
- **Senior Frontend Developer** — implementation details, testing strategy, specific control implementations
- **DevOps / Platform Engineer** — CI/CD pipeline, deployment process, monitoring configuration
- **Information Security Officer** — security policies, incident response, risk assessment

**Key talking points:**
- Demonstrate, do not just describe. Show the running application, the test suite, the audit trail.
- Reference specific BSP circular sections when discussing controls.
- Acknowledge gaps honestly. An acknowledged gap with a remediation plan is better than a hidden gap.
- Have the compliance dashboard ready to show real-time control status.

### Common examination findings in banking apps

These are the top 5 findings examiners discover most frequently. Build
your controls to avoid them.

1. **Incomplete audit trails** — Missing fields (IP address, user agent),
   gaps in event coverage (account views not logged), or events lost
   during page navigation. Fix: comprehensive `AuditEventType` coverage
   and `sendBeacon` for reliable delivery.

2. **Session management inconsistencies** — Timeout enforced on some pages
   but not others, or idle timer reset by background API polling. Fix:
   single `useSessionTimeout` hook at the app root, never paused or
   suppressed by child components.

3. **PII in telemetry** — Account numbers, names, or email addresses
   appearing in Application Insights or browser console logs. Fix:
   telemetry sanitizer that strips PII before transmission, `no-console`
   ESLint rule for production.

4. **Missing MFA for sensitive operations** — Login requires MFA but
   high-value transfers do not. Fix: step-up authentication for operations
   above defined thresholds, enforced on both frontend and backend.

5. **Stale evidence** — Test reports from 6 months ago, architecture
   diagrams that do not match the current system. Fix: CI-generated
   evidence on every build, evidence freshness tracking in the compliance
   dashboard.

### Examination timeline

Understanding the timeline helps you prepare without panic.

| Phase | Duration | What Happens |
|-------|----------|-------------|
| **Notification** | 2–4 weeks before | BSP sends formal examination notice. Scope and focus areas identified. |
| **Preparation** | 2 weeks | Gather documents, run self-assessment, brief the team, generate fresh evidence. |
| **On-site examination** | 1–3 days | Examiners review documents, interview staff, test controls, sample audit data. |
| **Preliminary findings** | End of on-site | Examiners share initial observations (not yet formal findings). |
| **Formal findings report** | 30 days after | Written report with findings classified by severity. |
| **Remediation plan** | 30 days after report | Institution submits remediation plan with timelines. |
| **Remediation execution** | Per plan | Fix findings according to committed timelines. |
| **Re-examination** | 3–6 months after | BSP verifies remediation. Unresolved critical findings escalate. |

### Checkpoint 5

Your team has 2 weeks to prepare for a BSP examination focused on digital
channel security. Write a day-by-day preparation plan covering: which
documents to gather first, which self-assessment questions to rehearse,
and who needs to be briefed.

---

## Phase 6 — Exception and Remediation Management

Not every control can be implemented immediately. Business constraints,
technical dependencies, and vendor limitations sometimes require temporary
exceptions. BSP expects these exceptions to be documented, approved, and
time-bound — never informal or open-ended.

### Exception request process

When a control cannot be met, follow this process:

1. **Document** the exception using the template below.
2. **Assess** the risk introduced by the missing control.
3. **Identify** compensating controls that partially mitigate the risk.
4. **Approve** — the Information Security Officer and a business stakeholder
   must sign off.
5. **Set expiry** — no exception is permanent. Maximum duration: 90 days,
   renewable once with re-approval.
6. **Track** — the exception appears on the compliance dashboard with a
   countdown to expiry.

### Exception request template

```tsx
// src/compliance/exception-types.ts

export interface ComplianceException {
  exceptionId: string;               // e.g., "EXC-2026-003"
  controlId: string;                 // e.g., "BSP-1213-10.1"
  controlDescription: string;        // "Phishing-resistant authentication"
  businessJustification: string;     // Why the control cannot be met now
  riskAssessment: {
    inherentRisk: 'critical' | 'high' | 'medium' | 'low';
    residualRisk: 'critical' | 'high' | 'medium' | 'low';
    riskDescription: string;         // What could go wrong
  };
  compensatingControls: string[];    // What mitigations are in place instead
  requestedBy: string;               // Team member requesting the exception
  approvedBy: string;                // CISO or delegate
  approvalDate: string;              // ISO date
  expiryDate: string;                // ISO date — max 90 days from approval
  status: 'active' | 'expired' | 'remediated';
  remediationPlan: string;           // How and when the control will be implemented
}
```

**Example exception:**

```tsx
const afasaException: ComplianceException = {
  exceptionId: 'EXC-2026-003',
  controlId: 'BSP-1213-10.1',
  controlDescription: 'Phishing-resistant authentication (WebAuthn/Passkeys)',
  businessJustification:
    'WebAuthn implementation is in progress. Passkey enrollment UI complete, ' +
    'but backend credential storage migration is scheduled for Q2 2026. ' +
    'Full deployment blocked by backend dependency.',
  riskAssessment: {
    inherentRisk: 'high',
    residualRisk: 'medium',
    riskDescription:
      'Users remain on password + OTP authentication, which is susceptible ' +
      'to phishing attacks. Risk is partially mitigated by OTP requirement ' +
      'and fraud monitoring.',
  },
  compensatingControls: [
    'MFA (password + OTP) enforced on all logins',
    'Transaction monitoring for anomalous patterns',
    'Real-time fraud alerts to users via SMS',
    'Phishing awareness training for customers (monthly)',
  ],
  requestedBy: 'Frontend Tech Lead',
  approvedBy: 'Chief Information Security Officer',
  approvalDate: '2026-03-01',
  expiryDate: '2026-05-30',
  status: 'active',
  remediationPlan:
    'Backend credential storage migration completes April 2026. ' +
    'Integration testing May 2026. Full passkey rollout June 2026, ' +
    'ahead of BSP 1213 deadline.',
};
```

### Remediation tracking

When a BSP examination produces findings, each finding must be tracked
from discovery to verified resolution.

```tsx
// src/compliance/remediation-types.ts

export interface RemediationItem {
  findingId: string;                 // e.g., "BSP-EXAM-2026-F01"
  bspCircular: string;               // e.g., "982"
  findingTitle: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  discoveredDate: string;            // ISO date
  assignedTo: string;                // Team or individual
  status: 'open' | 'in-progress' | 'implemented' | 'verified';
  targetDate: string;                // ISO date — based on severity
  completedDate?: string;            // ISO date — when fix was deployed
  verifiedDate?: string;             // ISO date — when fix was confirmed working
  verifiedBy?: string;               // Who verified (should not be the implementer)
  evidence: string[];                // Proof that the fix works
}
```

### Remediation timelines by severity

BSP expects remediation timelines proportional to risk. These are the
standard targets:

| Severity | Target Resolution | Escalation If Missed |
|----------|------------------|---------------------|
| **Critical** | 7 calendar days | Reported to BSP, board notification |
| **High** | 30 calendar days | Escalation to CTO and CISO |
| **Medium** | 90 calendar days | Tracked in quarterly risk report |
| **Low** | Next audit cycle | Included in annual risk assessment |

Critical findings typically require an immediate compensating control
(even if imperfect) deployed within 24 hours, followed by a proper fix
within 7 days.

### Prioritization framework

When multiple findings arrive simultaneously — which happens after every
examination — prioritize using this framework:

1. **Critical findings with customer data exposure** — fix first, everything
   else waits.
2. **Critical findings without data exposure** — fix within the week.
3. **High findings that affect audit trail integrity** — these compound over
   time; fix early.
4. **High findings for specific transaction types** — scope the risk and
   schedule accordingly.
5. **Medium findings** — batch into a compliance sprint within 90 days.
6. **Low findings** — add to backlog, address in normal development flow.

Never negotiate severity with the examiner. If you disagree with a finding's
classification, submit a formal response through your compliance team — but
start remediation immediately regardless.

### Checkpoint 6

Your team receives 4 findings from a BSP examination: one Critical (session
timeout bypass), one High (missing IP in audit trail), one Medium (stale
accessibility audit), and one Low (console.log statements in one module).
Draft a remediation plan with specific timelines, assigned owners, and the
evidence you will produce to prove each fix.

---

## Key Takeaways

1. **Every BSP circular maps to specific frontend controls.** This mapping
   is the bridge between regulatory requirements and code.

2. **Audit trails must be tamper-evident.** The frontend emits events; the
   backend ensures they cannot be modified or deleted. Hash chain
   verification provides cryptographic proof of integrity.

3. **Compliance is testable.** Automated checks verify that security controls
   are in place and have not regressed. CI pipelines generate evidence
   artifacts on every build.

4. **Evidence matters as much as implementation.** For each control, document
   the file, the test, and the monitoring rule that proves compliance.
   Stale evidence is almost as bad as no evidence.

5. **The compliance dashboard** gives leadership and auditors a real-time
   view of the organization's compliance posture.

6. **Examination preparation is systematic.** Know the questions, prepare the
   documents, brief the team. No surprises.

7. **Exceptions are documented, not hidden.** When a control cannot be met,
   the exception is approved, time-bound, and tracked. Compensating
   controls reduce residual risk.

8. **Remediation follows severity.** Critical findings get fixed in days,
   not weeks. Every fix produces evidence. Every fix is verified by
   someone other than the implementer.

---

## Exercises

### Exercise 1 — Audit Report Generator
Build a component that generates a monthly compliance report summarizing:
total login attempts, failed logins, transfers by channel, session timeouts,
and security events. Export as structured data.

### Exercise 2 — Control Gap Analysis
Review the bspControls array. For each control marked as "planned," write a
brief implementation proposal including the specific components, hooks, and
tests that would be needed.

### Exercise 3 — Compliance Test Suite
Write 5 additional automated compliance tests that verify:
1. CSP headers include `frame-ancestors 'none'`
2. No hardcoded API keys in source code
3. All forms use CSRF tokens
4. Session timeout is configured to 15 minutes
5. Password inputs use `type="password"`

### Exercise 4 — Evidence Package Generator
Extend the `generateEvidencePackage` script from Phase 3b to:
1. Map each test result to a BSP control ID automatically
2. Flag controls that have no associated test evidence
3. Generate a summary report showing overall compliance percentage
4. Output both JSON and a human-readable text format for examiner review

### Exercise 5 — Mock BSP Examination
Pair with another developer. One person plays the BSP examiner using the
self-assessment questionnaire from Phase 5. The other answers. Switch roles.
After both rounds, document which questions were hardest to answer and what
evidence was missing.

### Exercise 6 — Exception Lifecycle
Write a complete exception for a scenario where your team cannot implement
device binding (BSP 1105-8.2) because the backend device fingerprinting
service is not yet available. Include: business justification, risk
assessment, three compensating controls, a 60-day expiry, and a remediation
plan with specific milestones.

---

## What Comes Next

**Next guide:** [A17 — Data Privacy and Consent](A17_data-privacy-and-consent.md) —
where you implement the Philippine Data Privacy Act requirements, consent
management, and AMLA/KYC compliance for frontend applications.

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
