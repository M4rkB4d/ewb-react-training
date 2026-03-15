# A03 — Thinking in Compliance

> **EastWest Bank — Digital Platforms & Innovations**
>
> Part A (Core) · Level 1 — Welcome

---

## What You Will Learn

By the end of this guide, you will:

- Understand why compliance exists and why it matters for frontend developers
- Know the BSP regulatory landscape that governs Philippine banking applications
- Recognize which regulations affect your daily React code
- Map each compliance area to the guide where you will learn to implement it
- Understand the June 2026 AFASA deadline and what it means for authentication
- Know the difference between compliance as a checkbox and compliance as a culture

---

## Prerequisites

| Requirement | Where |
|------------|-------|
| Read A01 — What Is React | Level 1 |
| Read A02 — TypeScript for React | Level 1 |

No code is written in this guide. This is purely conceptual — building the mental model
you need before writing compliant banking applications.

---

## Why This Guide Exists

Most React tutorials skip compliance entirely. They teach you to build a todo app,
not a banking app. The difference is enormous.

When you build a todo app and something goes wrong, you lose a grocery list. When you
build a banking app and something goes wrong, you lose real money. Real customer data.
Real regulatory standing.

EastWest Bank is regulated by the Bangko Sentral ng Pilipinas (BSP). Every application
we build must meet their requirements. This is not optional. This is not a nice-to-have.
This is the cost of operating as a bank.

But here is the good news: compliance is not a burden bolted on at the end. When done
right, compliance is simply good engineering. Secure code is compliant code. Accessible
interfaces are compliant interfaces. Proper error handling is compliant error handling.

This guide teaches you to think in compliance from day one — so that by the time you
reach the detailed implementation guides, the mindset is already there.

---

## Phase 1 — The Regulatory Landscape

### Who Regulates Philippine Banks?

Three primary regulators govern how EastWest Bank builds digital applications:

**Bangko Sentral ng Pilipinas (BSP)**

The central bank of the Philippines. BSP issues circulars — legally binding regulations
that all banks must follow. Non-compliance can result in fines, sanctions, or loss of
banking license. BSP circulars cover everything from IT risk management to authentication
requirements to cyber-risk reporting.

**National Privacy Commission (NPC)**

The Philippine equivalent of Europe's data protection authorities. NPC enforces the
Data Privacy Act of 2012 (Republic Act 10173). Every application that collects, stores,
or processes personal information must comply. Violations carry criminal penalties —
not just fines, but imprisonment.

**Anti-Money Laundering Council (AMLC)**

Enforces the Anti-Money Laundering Act (Republic Act 9160). Any application that
processes financial transactions must implement Know Your Customer (KYC) controls
and suspicious transaction reporting. This directly affects how we build account
opening flows, fund transfer interfaces, and transaction monitoring dashboards.

### The Compliance Stack

Think of compliance as a stack, similar to a technology stack:

```
┌─────────────────────────────────────────────┐
│           International Standards            │
│         PCI-DSS · GDPR · SOX · ISO 27001    │
├─────────────────────────────────────────────┤
│           Philippine Laws                    │
│    DPA (RA 10173) · AMLA (RA 9160)          │
├─────────────────────────────────────────────┤
│          BSP Circulars                       │
│  808 · 982 · 1019 · 1033 · 1105 · 1122     │
│         1213/AFASA                           │
├─────────────────────────────────────────────┤
│         NPC Circulars                        │
│          16-03 · 2023-06                     │
├─────────────────────────────────────────────┤
│        EastWest Bank Policies                │
│   Internal security standards & procedures   │
└─────────────────────────────────────────────┘
```

Each layer builds on the ones above it. BSP circulars implement the intent of Philippine
laws. EastWest Bank policies implement the requirements of BSP circulars. Your React
code implements those policies.

You do not need to memorize every circular. You need to understand which ones affect
your code and where to find the implementation details in these guides.

### Checkpoint 1

Answer these without looking back:

1. Name the three regulators that govern EastWest Bank's digital applications.
2. What is the difference between a BSP circular and a Philippine law?
3. What are the consequences of DPA (RA 10173) violations beyond fines?

---

## Phase 2 — BSP Circulars That Affect Frontend Code

Not every BSP circular is relevant to frontend development. Backend teams handle
database encryption, network security, and server hardening. But several circulars
have direct implications for the React code you write.

### BSP Circular 808 — IT Risk Management

**What it requires:** Banks must manage IT risks systematically. Every change to
production systems must be tracked, tested, and approved.

**What it means for you:**
- Every feature must have automated tests before deployment
- Change management processes must be followed (no cowboy deployments)
- Test coverage is not a nice-to-have — it is a regulatory requirement

**Where you learn this:** A05 (Your First Test), A14 (Testing Advanced), B07 (Deployment)

### BSP Circular 982 — Information Security

**What it requires:** Banks must implement comprehensive information security controls
including authentication, access control, and encryption.

**What it means for you:**
- Authentication must follow prescribed patterns (multi-factor, session management)
- Role-based access control (RBAC) must be enforced in the UI
- Sensitive data must never be exposed in logs, URLs, or browser storage
- Form inputs for sensitive fields must prevent autocomplete and screenshots

**Where you learn this:** A11 (Auth Concepts), B04 (Auth Implementation), A15 (Security)

### BSP Circular 1019 — Cyber-Risk Reporting

**What it requires:** Banks must detect, report, and respond to cybersecurity incidents
within prescribed timeframes.

**What it means for you:**
- Frontend errors must be captured and reported to monitoring systems
- Structured logging must include enough context for incident investigation
- Error boundaries must prevent cascading failures from hiding security incidents

**Where you learn this:** A13 (Error Handling), B06 (Monitoring and Observability)

### BSP Circular 1033 — Electronic Payment Services

**What it requires:** Electronic payment systems must be accessible, secure, and provide
adequate consumer protection.

**What it means for you:**
- Payment interfaces must meet accessibility standards (WCAG 2.1 AA minimum)
- Transaction confirmations must be clear and unambiguous
- Users must be able to review transaction details before confirming
- Error states in payment flows must guide users to resolution

**Where you learn this:** A07 (Forms), A08 (Accessibility), B09 (Integration Capstone)

### BSP Circular 1105 — Digital Banks

**What it requires:** Applications for digital banking channels must meet enhanced
security requirements including identity verification and fraud prevention.

**What it means for you:**
- All digital interfaces must implement proper session management
- Idle timeout must be enforced (automatic logout after inactivity)
- Device fingerprinting and anomaly detection may be required
- User interfaces must clearly communicate security status

**Where you learn this:** B04 (Auth Implementation), A15 (Security Hardening)

### BSP Circular 1122 — Open Finance

**What it requires:** Banks participating in open finance must implement secure API
access, consent management, and data sharing controls.

**What it means for you:**
- Third-party API integrations must follow OAuth 2.0 standards
- User consent for data sharing must be explicit, granular, and revocable
- API responses must be validated before rendering (never trust external data)

**Where you learn this:** B03 (API Integration), A17 (Data Privacy and Consent)

### BSP Circular 1213 / AFASA — The June 2026 Deadline

This circular deserves special attention because it has an imminent deadline.

**What it requires:** The Anti-Financial Account Scam Act
(AFASA, RA 12010) mandates that banks migrate away from SMS-based OTP to phishing-resistant
authentication methods by June 2026.

**What "phishing-resistant" means:**
- SMS OTP can be intercepted (SIM swapping, SS7 attacks, social engineering)
- Phishing-resistant methods cannot be replayed even if the user is tricked
- The approved standard is FIDO2/WebAuthn — commonly known as passkeys

**What it means for you:**
- Every authentication flow must support passkey registration and login
- SMS OTP flows must remain as fallback during migration but cannot be the only option
- The migration must be transparent to users — they should be guided, not forced
- Frontend must handle the WebAuthn API for credential creation and assertion

**Timeline:**

```
┌──────────────────────────────────────────────────────────────┐
│                    AFASA Timeline                             │
├────────────┬────────────┬────────────┬───────────────────────┤
│  2024 Q4   │  2025 Q2   │  2025 Q4   │    June 2026          │
│  Circular  │  Planning  │  Pilot     │    Full                │
│  issued    │  phase     │  rollout   │    enforcement         │
└────────────┴────────────┴────────────┴───────────────────────┘
                                              ▲
                                              │
                                        We are here
                                     (March 2026 — 3 months)
```

**Where you learn this:** A12 (Passkeys and WebAuthn) — a dedicated guide for this

### Checkpoint 2

Match each scenario to the BSP circular it relates to:

1. A user reports that the payment confirmation screen does not work with a screen reader.
2. A production deployment was pushed without running the test suite.
3. An error in the fund transfer flow is swallowed silently and never logged.
4. The login page only offers SMS OTP with no passkey option.
5. A third-party API response is rendered directly without validation.

Answers: 1→1033, 2→808, 3→1019, 4→1213, 5→1122

---

## Phase 3 — Philippine Data Privacy

### The Data Privacy Act (RA 10173)

The DPA is the Philippines' comprehensive data privacy law. It applies to any entity
that processes personal information of Philippine citizens or residents.

**Key concepts every developer must know:**

**Personal Information** — Any information that can identify a person, directly or
indirectly. This includes:
- Full name, address, phone number, email
- Account numbers, transaction history, balances
- IP addresses, device identifiers, cookies
- Biometric data (fingerprints, facial recognition)

**Sensitive Personal Information** — A subset that receives extra protection:
- Government-issued IDs (SSS, TIN, passport numbers)
- Health and medical records
- Financial information (income, credit history)
- Racial or ethnic origin, religious beliefs

**What the DPA requires from frontend applications:**

1. **Consent before collection.** You cannot collect personal data without clear,
   informed consent. Consent forms must explain what data is collected, why it is
   needed, how long it will be stored, and who it will be shared with.

2. **Purpose limitation.** Data collected for account opening cannot be used for
   marketing without separate consent. Your UI must enforce this boundary.

3. **Data minimization.** Collect only what you need. If a form asks for more data
   than the feature requires, that is a compliance violation.

4. **Right to access and erasure.** Users must be able to view their data and request
   deletion. Your application must support these workflows.

5. **Breach notification.** If a data breach occurs, affected users must be notified
   within prescribed timeframes. Your monitoring must detect breaches quickly.

### NPC Circular 16-03 — Personal Data Breach Management

This NPC circular prescribes how organizations must handle data breaches.

**What it means for you:**
- Frontend monitoring must detect anomalous behavior that could indicate a breach
- Error logs must contain enough detail for breach investigation
- The application must support emergency notification workflows

**Where you learn this:** B06 (Monitoring), A17 (Data Privacy)

### NPC Circular 2023-06 — Security Measures

This circular sets minimum security requirements for personal data processing.

**What it means for you:**
- Authentication must use industry-standard methods
- Data in transit must be encrypted (HTTPS everywhere)
- Sensitive data must not be cached in browser storage
- Input validation must prevent injection attacks

**Where you learn this:** A15 (Security Hardening), A11 (Auth Concepts)

### Data Masking — A Frontend Responsibility

One of the most visible compliance requirements for frontend developers is data masking.
When displaying sensitive data, you must show enough for the user to identify the record
but not enough for an observer (shoulder surfing, screenshots) to steal the information.

Common masking patterns in banking:

| Data Type | Full Value | Masked Display |
|-----------|-----------|----------------|
| Account number | 1234567890 | ••••••7890 |
| Card number | 4532 1234 5678 9012 | •••• •••• •••• 9012 |
| Phone number | +63 917 123 4567 | +63 917 ••• 4567 |
| Email | juan.santos@email.com | j••••••••s@email.com |
| Full name | Juan Miguel Santos | Juan M. S. |

You will implement these patterns in A07 (Forms and Validation) and use them throughout
every guide that displays personal data.

### Checkpoint 3

True or false:

1. An IP address is not personal information under the DPA.
2. Consent for account opening also covers marketing communications.
3. If the backend encrypts data, the frontend has no data privacy obligations.
4. Account numbers displayed in full on screen violate data masking requirements.
5. The DPA only applies to Philippine citizens, not residents.

Answers: 1→False, 2→False, 3→False, 4→True, 5→False

---

## Phase 4 — Financial Crime Prevention

### AMLA / RA 9160 — Anti-Money Laundering

The Anti-Money Laundering Act requires banks to implement controls that prevent
the financial system from being used for money laundering and terrorism financing.

**What it means for frontend development:**

**Know Your Customer (KYC)**

Before a user can open an account or perform certain transactions, their identity
must be verified. The frontend handles the user-facing portion of KYC:
- Document upload interfaces (ID verification)
- Selfie capture for facial comparison
- Address verification forms
- Source of funds declaration

**Transaction Monitoring**

Certain transaction patterns trigger alerts. The frontend must:
- Display transaction limits clearly
- Show warnings when approaching limits
- Implement confirmation flows for large transactions
- Never allow users to bypass transaction controls through UI manipulation

**Sanctions Screening**

The application must check customer names and transaction counterparties against
sanctions lists. While the actual screening happens on the backend, the frontend
must handle the user experience when a match is found — showing appropriate messages
without revealing the screening logic.

**Where you learn this:** A17 (Data Privacy and Consent), B09 (Integration Capstone)

### PCI-DSS — Payment Card Industry

If your application handles credit or debit card data, PCI-DSS applies. The good
news: modern approaches minimize PCI scope for frontend applications.

**The golden rule: never handle raw card numbers.**

Instead of accepting card numbers in your own form fields, use payment processor
iframes (hosted fields). The card number never touches your application — it goes
directly from the iframe to the payment processor.

**What this means for you:**
- Card payment forms use embedded iframes, not native input fields
- Your application never stores, processes, or transmits card numbers
- PCI-DSS scope is reduced to SAQ A (the smallest scope)
- You still must serve the page over HTTPS and implement basic security controls

**Where you learn this:** A07 (Forms), A15 (Security Hardening)

### SOX — Sarbanes-Oxley

If EastWest Bank has publicly traded securities, SOX compliance requires documented
change management processes for systems that affect financial reporting.

**What it means for you:**
- Every deployment must follow a documented change management process
- Code changes must be reviewed and approved before merging
- Release processes must include rollback plans
- Audit trails must capture who changed what and when

**Where you learn this:** B07 (Deployment and CI/CD)

### Checkpoint 4

1. Why should a banking application never accept raw credit card numbers in its own
   form fields?
2. What is KYC and which part does the frontend handle?
3. Why must transaction limits be clearly displayed in the UI?

---

## Phase 5 — The Developer's Role

### You Are the Last Line of Defense

Backend teams build APIs with security controls. DevOps teams configure firewalls and
encryption. Compliance teams write policies and conduct audits.

But the frontend is where the user interacts with the application. It is the surface
that attackers probe. It is the interface that regulators examine. It is the experience
that customers trust with their money.

Your React code is the last line of defense between a secure system and a compromised
one. A cross-site scripting (XSS) vulnerability in your component can bypass every
backend control. A missing access check in your route guard can expose data that the
API was designed to protect.

This is not meant to intimidate you. It is meant to empower you. When you understand
compliance, you write better code. When you write better code, you build trust — with
your team, with regulators, and with the millions of customers who depend on EastWest
Bank.

### Compliance Is Not a Phase

The most common mistake in software development is treating compliance as a final
phase — something you bolt on before launch. This approach fails every time because:

1. **Retrofitting is expensive.** Rebuilding an authentication system to support
   passkeys after the entire application is built costs 10x more than designing
   for passkeys from the start.

2. **Compliance affects architecture.** How you structure state management, how you
   handle errors, how you build forms — these architectural decisions have compliance
   implications. By the time you reach "the compliance phase," these decisions are
   already made and changing them means rewriting.

3. **Compliance is continuous.** New circulars are issued. Existing regulations are
   updated. Your application must evolve. If compliance is integrated into how you
   build, adapting is natural. If compliance is a bolt-on, every regulatory change
   triggers a crisis.

That is why this documentation teaches compliance in context, not in isolation.
Every guide from Level 2 onward includes compliance notes specific to the topic
being taught. By the time you reach the dedicated compliance guides in Level 7,
you will have already been writing compliant code for five levels.

### The Compliance Mindset

Before writing any feature, ask yourself these questions:

1. **Does this feature handle personal information?**
   If yes → DPA requirements apply. Consent, masking, minimization.

2. **Does this feature involve authentication or access control?**
   If yes → BSP 982 and 1213/AFASA apply. Secure patterns, passkey support.

3. **Does this feature process financial transactions?**
   If yes → BSP 1033 and AMLA apply. Confirmation flows, transaction limits, logging.

4. **Does this feature display sensitive data?**
   If yes → Masking patterns apply. Never show full account numbers, card numbers, or IDs.

5. **Does this feature need to work for everyone?**
   Always yes → BSP 1033 accessibility requirements. WCAG 2.1 AA minimum.

6. **Can errors in this feature go undetected?**
   If yes → BSP 1019 applies. Monitoring, structured logging, error boundaries.

7. **Does this feature change production behavior?**
   If yes → BSP 808 and SOX apply. Tests, code review, change management.

These questions become second nature after a few guides. By Level 5, you will ask
them automatically.

### Checkpoint 5

Consider a "Fund Transfer" feature. Which compliance areas apply?
List at least five specific requirements from what you learned in this guide.

Expected answer should include: authentication (BSP 982), transaction confirmation
(BSP 1033), data masking for account numbers (DPA), transaction limits (AMLA),
accessibility (BSP 1033), error monitoring (BSP 1019), testing before deployment
(BSP 808), passkey authentication option (BSP 1213/AFASA).

---

## Phase 6 — Your Compliance Roadmap

### How These Guides Build Compliance Knowledge

This table maps every compliance requirement to the guide where you learn to
implement it. Use this as a reference throughout your learning journey.

| Compliance Area | Regulation | Implementation Guide | Level |
|----------------|-----------|---------------------|-------|
| Test coverage | BSP 808 | A05, A10, A14 | 2, 4, 6 |
| Change management | BSP 808, SOX | B07 | 7 |
| Authentication | BSP 982, 1213 | A11, B04, A12 | 5 |
| Access control (RBAC) | BSP 982 | B04 | 5 |
| Secure session management | BSP 982, 1105 | B04 | 5 |
| Passkeys / WebAuthn | BSP 1213/AFASA | A12 | 5 |
| Error monitoring | BSP 1019 | A13, B06 | 6 |
| Incident detection | BSP 1019 | B06 | 6 |
| Accessibility (WCAG AA) | BSP 1033 | A08 | 3 |
| Transaction flows | BSP 1033 | A07, B09 | 3, 8 |
| Digital channel security | BSP 1105 | A15 | 7 |
| API security | BSP 1122 | B03 | 5 |
| Consent management | BSP 1122, DPA | A17 | 7 |
| Data masking | DPA | A07 | 3 |
| PII handling | DPA, NPC 16-03 | A17 | 7 |
| Privacy by design | DPA, NPC 2023-06 | A15, A17 | 7 |
| KYC interfaces | AMLA/RA 9160 | A17 | 7 |
| Card payment security | PCI-DSS | A07, A15 | 3, 7 |
| XSS prevention | PCI-DSS, BSP 982 | A15 | 7 |
| CSP / SRI / Trusted Types | NPC 2023-06 | A15 | 7 |
| Deployment controls | SOX, BSP 808 | B07 | 7 |
| Audit trail | BSP 808, SOX | A16 | 7 |
| BSP compliance dashboard | All circulars | A16 | 7 |

### The Progressive Compliance Path

```
Level 1 ─── Awareness (this guide)
              │
Level 2 ─── Testing basics (your first compliance control)
              │
Level 3 ─── Accessibility + data masking (user-facing compliance)
              │
Level 4 ─── State management patterns (secure data handling)
              │
Level 5 ─── Auth + passkeys (the AFASA sprint)
              │
Level 6 ─── Error handling + monitoring (incident detection)
              │
Level 7 ─── Full compliance framework (audit, privacy, security)
              │
Level 8 ─── Integration (everything together in a real feature)
```

Each level builds on the previous one. You never learn compliance in isolation —
you learn it while building real banking features.

---

## Key Takeaways

1. **Compliance is engineering, not paperwork.** Secure, accessible, well-tested code
   is inherently compliant code.

2. **Three regulators matter:** BSP (banking operations), NPC (data privacy), AMLC
   (financial crime). Know which one governs what.

3. **BSP 1213/AFASA is urgent.** June 2026 deadline for phishing-resistant authentication.
   Passkeys are the answer. Guide A12 covers implementation.

4. **Never handle raw card numbers.** Use payment processor iframes. PCI-DSS scope
   reduction saves the entire team months of audit work.

5. **Data masking is your responsibility.** The backend may store full account numbers,
   but the frontend decides what the user (and anyone looking over their shoulder) sees.

6. **The DPA carries criminal penalties.** Privacy violations can result in imprisonment,
   not just fines. Take personal data handling seriously.

7. **Compliance is progressive in these guides.** Every level adds compliance knowledge
   in context. By Level 7, you will already be writing compliant code naturally.

8. **Ask the seven questions.** Before building any feature, run through the compliance
   checklist from Phase 5. It takes 30 seconds and prevents weeks of remediation.

---

## Exercises

### Exercise 1 — Compliance Mapping

You are tasked with building an "Account Opening" feature. List every compliance
area that applies and cite the specific regulation for each.

Think about: What data do you collect? How do you verify identity? What consent
is needed? How do you authenticate the user? What accessibility standards apply?

Write your answers before checking the solution below.

<details>
<summary>Solution</summary>

| Requirement | Regulation | Why |
|------------|-----------|-----|
| KYC document upload | AMLA/RA 9160 | Identity verification required |
| Consent for data collection | DPA (RA 10173) | Cannot collect PII without consent |
| Purpose-specific consent | DPA | Separate consent for marketing |
| Data minimization | DPA | Only collect necessary fields |
| Accessible forms | BSP 1033 | Electronic services must be accessible |
| Passkey enrollment | BSP 1213/AFASA | New accounts should offer passkeys |
| Secure authentication | BSP 982 | Multi-factor auth required |
| Session management | BSP 1105 | Digital channel security |
| Error monitoring | BSP 1019 | Track failures for incident detection |
| Test coverage | BSP 808 | All changes must be tested |
| Change management | SOX | Documented deployment process |
| PII masking in confirmation | DPA | Mask account numbers after creation |

</details>

### Exercise 2 — Spot the Violations

Review this fictional feature description and identify all compliance violations:

> "We built a fund transfer page. It accepts the recipient's full account number
> and displays it unmasked in the confirmation screen. Authentication uses SMS OTP
> only. The form does not have any ARIA labels. We deployed it Friday evening without
> running the test suite. Error messages show stack traces to help users report bugs.
> Card numbers are accepted in a regular text input field."

List every violation and cite the regulation.

<details>
<summary>Solution</summary>

1. **Unmasked account number in confirmation** — DPA data masking violation
2. **SMS OTP only** — BSP 1213/AFASA requires phishing-resistant option
3. **No ARIA labels** — BSP 1033 accessibility violation (WCAG 2.1 AA)
4. **Deployed without tests** — BSP 808 IT risk management violation
5. **Stack traces shown to users** — BSP 1019 information disclosure risk
6. **Card numbers in regular input** — PCI-DSS violation (must use hosted fields)
7. **Friday evening deployment** — SOX change management concern (reduced support staff)

</details>

### Exercise 3 — The AFASA Presentation

Imagine you need to explain the BSP 1213/AFASA deadline to your team lead who is
not technical. Write a 5-sentence explanation that covers:

- What the regulation requires
- Why SMS OTP is being phased out
- What passkeys are (in simple terms)
- When the deadline is
- What happens if the bank does not comply

This exercise practices communicating compliance in business terms — a skill you
will use throughout your career.

---

## What Comes Next

You now have the mental model for compliance. You understand who regulates EastWest
Bank, what they require, and where in these guides you will learn to implement
each requirement.

Starting with Level 2, every guide includes compliance notes inline. When you see
a comment citing a BSP circular in a code example, you will know exactly why it is
there and what it protects.

**Next guide:** [B01 — Project Setup](../level-02-first-app/B01_project-setup.md)
— where you scaffold your first EastWest Bank React project and set up the tooling
that enables compliant development from the first commit.

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
