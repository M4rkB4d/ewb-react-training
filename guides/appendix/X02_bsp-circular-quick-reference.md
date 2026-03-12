# X02 — BSP Circular Quick Reference

> **EastWest Bank — Digital Platforms & Innovations**
>
> Appendix · Reference

---

## Overview

This reference summarizes BSP (Bangko Sentral ng Pilipinas) circulars that
affect frontend development for digital banking applications. Each circular
is mapped to specific frontend implementation requirements.

---

## BSP Circular 808 — IT Risk Management

**Full title:** Guidelines on Information Technology Risk Management

**What it requires:**
- IT risk assessment for all digital services
- Change management procedures for production deployments
- Business continuity and disaster recovery plans

**Frontend impact:**

| Requirement | Implementation | Guide |
|------------|---------------|-------|
| Change management | SOX-compliant release checklists | B07 |
| Test coverage | Unit + integration + E2E tests before release | A14 |
| Risk assessment | Security review for new features | A15 |
| Documentation | Architecture Decision Records (ADRs) | A18 |

---

## BSP Circular 982 — Enhanced Guidelines on InfoSec Management

**Full title:** Enhanced Guidelines on Information Security Management

**What it requires:**
- Multi-factor authentication for digital channels
- Session management controls
- Access control based on roles and privileges
- Encryption for data in transit and at rest

**Frontend impact:**

| Requirement | Implementation | Guide |
|------------|---------------|-------|
| MFA | OTP verification after login | A11, B04 |
| Session timeout | 15-minute idle timeout with 2-minute warning | B04 |
| Maximum session | 8-hour absolute maximum | B04 |
| RBAC | Role-based route protection | A11, B04 |
| HTTPS | All API calls over TLS | B03 |
| Token storage | Access token in-memory, refresh in HttpOnly cookie | A11, B04 |

---

## BSP Circular 1019 — Cybersecurity Risk Management

**Full title:** Guidelines on Cybersecurity Risk Management

**What it requires:**
- Cyber risk identification and assessment
- Security monitoring and incident detection
- Incident response and recovery procedures
- Regular security testing

**Frontend impact:**

| Requirement | Implementation | Guide |
|------------|---------------|-------|
| Error monitoring | Sentry integration with PII stripping | B06 |
| Structured logging | JSON-formatted error logs with severity | A13, B06 |
| Incident detection | Anomaly detection via error patterns | B06 |
| Security events | CSP violation reporting | A15 |
| Audit trail | All actions logged with timestamp and user | A16 |

---

## BSP Circular 1033 — E-Payment Regulations

**Full title:** Regulations on Electronic Payments and Financial Services

**What it requires:**
- Consumer protection for electronic payments
- Transaction logging and receipts
- Accessibility for digital payment channels
- Complaint resolution mechanisms

**Frontend impact:**

| Requirement | Implementation | Guide |
|------------|---------------|-------|
| Accessibility | WCAG 2.1 AA compliance | A08 |
| Transaction receipts | Payment receipt with reference number | B09 |
| Transaction logging | Every payment action audited | A16 |
| Error disclosure | Clear error messages without technical details | A13 |
| Keyboard navigation | All features accessible via keyboard | A08 |

---

## BSP Circular 1105 — Digital Banking Framework

**Full title:** Guidelines on the Establishment of Digital Banks

**What it requires:**
- Secure digital channel delivery
- Customer identity verification
- Maximum session duration limits
- Application security testing

**Frontend impact:**

| Requirement | Implementation | Guide |
|------------|---------------|-------|
| App security | CSP, SRI, input validation | A15 |
| Session limits | 8-hour absolute maximum session | B04 |
| KYC verification | Document upload, identity validation | A17 |
| Security testing | Automated security checks in CI | B07, A15 |

---

## BSP Circular 1122 — Open Finance Framework

**Full title:** Guidelines on Open Finance

**What it requires:**
- Secure API access for third-party providers
- Customer consent for data sharing
- API security standards
- Data portability

**Frontend impact:**

| Requirement | Implementation | Guide |
|------------|---------------|-------|
| Consent management | Explicit opt-in for data sharing | A17 |
| API security | Token-based auth for third-party APIs | B03 |
| Data portability | Data export functionality | A17 |
| Consent UI | Granular consent toggles per purpose | A17 |

---

## BSP Circular 1213 / AFASA — Anti-Financial Account Scam Act

**Full title:** Implementing Rules and Regulations of the Anti-Financial
Account Scam Act (RA 12010)

**What it requires:**
- Phishing-resistant authentication methods
- Passkey/FIDO2 support for customer authentication
- Migration timeline: June 2026 deadline for new registration methods
- Scam reporting and prevention mechanisms

**Frontend impact:**

| Requirement | Implementation | Guide |
|------------|---------------|-------|
| Passkey registration | WebAuthn `navigator.credentials.create()` | A12 |
| Passkey login | WebAuthn `navigator.credentials.get()` | A12 |
| Feature detection | `usePasskeySupport` hook | A12 |
| Migration UI | Progressive enrollment prompts | A12 |
| Passkey management | List, rename, delete passkeys | A12 |

**Timeline:**
- Phase 1 (Now): Optional passkey enrollment
- Phase 2 (Q1 2026): Prompted enrollment for existing users
- Phase 3 (June 2026): Required for new user registrations

---

## Philippine Data Privacy Act (RA 10173)

**Not a BSP circular**, but mandatory for all Philippine businesses processing
personal information.

**What it requires:**
- Lawful basis for data collection
- Explicit consent before processing personal data
- Data subject rights (access, correction, erasure)
- Privacy impact assessments
- Breach notification within 72 hours

**Frontend impact:**

| Requirement | Implementation | Guide |
|------------|---------------|-------|
| Consent collection | ConsentManager with purpose-based toggles | A17 |
| PII masking | Account numbers, emails, phones masked by default | A17 |
| Data access | User can request data export | A17 |
| Minimal display | Show minimum PII necessary | A17 |
| Cookie consent | Cookie consent banner | A17 |

---

## AMLA (RA 9160) — Anti-Money Laundering Act

**What it requires:**
- Customer identification (KYC)
- Record retention (5 years after account closure)
- Suspicious transaction reporting
- Covered transaction reporting (500,000 PHP threshold)

**Frontend impact:**

| Requirement | Implementation | Guide |
|------------|---------------|-------|
| KYC data collection | 3-tier KYC form (basic, enhanced, high-risk) | A17 |
| Document upload | ID upload with file validation | A17 |
| Data retention notice | Explain 5-year retention to users | A17 |
| Amount validation | Flag transactions above reporting threshold | A07, A17 |

---

## PCI-DSS — Payment Card Industry Data Security Standard

**Not a BSP regulation**, but required for any system that processes card data.

**Frontend impact:**

| Requirement | Implementation | Guide |
|------------|---------------|-------|
| Scope reduction | Never handle raw card numbers | A15 |
| Iframe tokenization | Use payment gateway iframes | A15 |
| Card masking | Show only last 4 digits, never full PAN | A17 |
| Input security | Zod validation on all inputs | A07, A15 |

---

## SOX — Sarbanes-Oxley Act

**Applies to EastWest Bank** as a publicly listed company (PSE: EW).

**Frontend impact:**

| Requirement | Implementation | Guide |
|------------|---------------|-------|
| Change management | Release checklists, approval gates | B07 |
| Audit trail | All deployments logged | B07 |
| Access control | Role-based access to admin features | A11 |
| Documentation | Release notes, change logs | B07 |

---

## Quick Lookup: Which Circular Applies?

| If you are building... | Check these |
|----------------------|-------------|
| Login/authentication | BSP 982, 1213/AFASA |
| Payment/transfer forms | BSP 1033, AMLA, PCI-DSS |
| Data collection forms | DPA (RA 10173), AMLA |
| API integrations | BSP 1122, 982 |
| Error handling/monitoring | BSP 1019 |
| Deployment pipeline | BSP 808, SOX |
| Any customer-facing UI | BSP 1033 (accessibility) |
| Session management | BSP 982, 1105 |
| Data display | DPA (masking), PCI-DSS (card numbers) |

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
