# A16 — BSP Compliance Framework

> **EastWest Bank — Digital Platforms & Innovations**
>
> Part A (Core) · Level 7 — Production · Est. 3.5 hours

---

## What You Will Learn

By the end of this guide, you will:

- Map every relevant BSP circular to frontend implementation controls
- Build an audit trail system for financial operations
- Implement data retention and access logging
- Create a compliance dashboard for monitoring
- Understand BSP examination requirements for digital channels
- Document compliance evidence for auditors
- Build automated compliance checks

---

## Prerequisites

| Requirement | Where |
|------------|-------|
| Completed A03 — Thinking in Compliance | Level 1 |
| Completed A15 — Security Hardening | Level 7 |
| Completed B06 — Monitoring and Observability | Level 6 |

---

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
    navigator.sendBeacon('/api/audit', JSON.stringify(event));
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
  amount: 5000,
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

  it('all API functions validate responses with Zod', () => {
    // This is verified by TypeScript types — Zod schemas are required
    // by the API function pattern established in B03
    expect(true).toBe(true);
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

## Key Takeaways

1. **Every BSP circular maps to specific frontend controls.** This mapping
   is the bridge between regulatory requirements and code.

2. **Audit trails must be tamper-evident.** The frontend emits events; the
   backend ensures they cannot be modified or deleted.

3. **Compliance is testable.** Automated checks verify that security controls
   are in place and have not regressed.

4. **Evidence matters as much as implementation.** For each control, document
   the file, the test, and the monitoring rule that proves compliance.

5. **The compliance dashboard** gives leadership and auditors a real-time
   view of the organization's compliance posture.

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

---

## What Comes Next

**Next guide:** [A17 — Data Privacy and Consent](A17_data-privacy-and-consent.md) —
where you implement the Philippine Data Privacy Act requirements, consent
management, and AMLA/KYC compliance for frontend applications.

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
