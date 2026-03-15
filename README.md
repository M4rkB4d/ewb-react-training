# React Enterprise Banking Documentation v2

**EastWest Bank — Digital Platforms & Innovations**

A complete React training platform for building production-grade banking applications. 37 guides across 9 progressive levels, a full companion codebase, and comprehensive training materials — all aligned with BSP regulatory requirements.

---

## Quick Start

### For Students

```bash
# 1. Clone and start at Level 1
git clone <repo-url> ewb-react-training
cd ewb-react-training
git checkout level-01-start

# 2. Set up the portal
cd companion-repo/portal
npm install
npm run dev

# 3. Open your browser at http://localhost:5173
```

Access your guides on Notion (or from the `guides/` directory on the `main` branch). Work through each level sequentially.

### For the Instructor

See [`training/INSTRUCTOR_GUIDE.md`](training/INSTRUCTOR_GUIDE.md) for classroom pacing, common pitfalls, and demo tips.

### Full Onboarding Schedule

See [`training/ONBOARDING.md`](training/ONBOARDING.md) for the 13-day program schedule.

---

## How the Training Works

Each level follows a **read → practice → verify** cycle:

1. **Read** the guides for your current level
2. **Practice** by completing exercises in the companion repo
3. **Verify** your work with automated tests:

```bash
npm run test:exercises:01    # Level 1 exercises
npm run test:exercises:02    # Level 2 exercises
# ... through 09
```

### Branch Strategy

| Branch | What It Is |
|--------|-----------|
| `level-XX-start` | Your starting point — skeleton code for that level |
| `level-XX-complete` | Reference implementation — what the finished code should look like |
| `main` | Everything: all code, all guides, all training materials |

**Moving between levels:**

```bash
# Compare your work with the reference:
git diff level-01-start level-01-complete

# Move to the next level:
git checkout level-02-start
npm install    # New dependencies appear at each level
npm run dev
```

---

## Tech Stack

| Technology | Version | Role |
|-----------|---------|------|
| Node.js | 24 LTS | Runtime |
| React | 19.x | UI Framework |
| TypeScript | 5.9 | Type Safety |
| Vite | 7.x | Build Tool |
| Tailwind CSS | 4.x | Styling |
| Zustand | 5.x | Client State |
| TanStack Query | 5.x | Server State |
| Zod | 4.x | Validation |
| React Hook Form | 7.x | Forms |
| React Router | 7.x | Routing |
| Vitest | 4.x | Unit/Integration Tests |
| MSW | 2.x | API Mocking |
| Axios | latest | HTTP Client |
| Next.js | 15.x | SSR (Level 9) |

---

## Curriculum — 9 Levels, 37 Guides

### Level 1 — Welcome
| ID | Title | Part |
|----|-------|------|
| A01 | What Is React | Core |
| A02 | TypeScript for React | Core |
| A03 | Thinking in Compliance | Core |

### Level 2 — First App
| ID | Title | Part |
|----|-------|------|
| B01 | Project Setup | Vite SPA |
| B01b | Project Tooling and Quality Gates | Vite SPA |
| A04 | Components and JSX | Core |
| A05 | Your First Test | Core |

### Level 3 — Building UI
| ID | Title | Part |
|----|-------|------|
| A06 | Design System Foundations | Core |
| A07 | Forms and Validation | Core |
| A08 | Accessibility Essentials | Core |

### Level 4 — State and Routing
| ID | Title | Part |
|----|-------|------|
| A09 | State Management | Core |
| B02 | Routing and Navigation | Vite SPA |
| A10 | Testing Components and Hooks | Core |

### Level 5 — Data and Auth
| ID | Title | Part |
|----|-------|------|
| B03 | API Integration | Vite SPA |
| A11 | Authentication Part 1: Concepts | Core |
| B04 | Authentication Part 2: Implementation | Vite SPA |
| A12 | Passkeys and WebAuthn | Core |

### Level 6 — Quality
| ID | Title | Part |
|----|-------|------|
| A13 | Error Handling | Core |
| B05 | Performance Optimization | Vite SPA |
| A14 | Testing Advanced | Core |
| B06 | Monitoring and Observability | Vite SPA |

### Level 7 — Production
| ID | Title | Part |
|----|-------|------|
| A15 | Security Hardening | Core |
| B07 | Deployment and CI/CD | Vite SPA |
| A16 | BSP Compliance Framework | Core |
| A17 | Data Privacy and Consent | Core |

### Level 8 — Mastery
| ID | Title | Part |
|----|-------|------|
| A18 | Architecture Patterns | Core |
| B08 | Internationalization | Vite SPA |
| B09 | Integration Capstone | Vite SPA |
| A19 | Real-Time Patterns | Core |

### Level 9 — Public-Facing Applications
| ID | Title | Part |
|----|-------|------|
| A20 | SPA vs SSR Decision Framework | Core |
| A21 | Next.js Project Setup | Next.js |
| A22 | Server Components and Data Fetching | Next.js |
| A23 | Server-Side Auth, API Routes, and Composition | Next.js |
| B10 | Deploying Next.js on Azure | Next.js |

### Appendix
| ID | Title |
|----|-------|
| X01 | EWB Design System Reference |
| X02 | BSP Circular Quick Reference |
| X03 | Migration from v1 |

---

## Training Materials

| Resource | Location | Purpose |
|----------|----------|---------|
| Onboarding Schedule | [`training/ONBOARDING.md`](training/ONBOARDING.md) | 13-day program with daily breakdown |
| Quick Start (Experienced Devs) | [`training/QUICK_START.md`](training/QUICK_START.md) | 3-day fast-track path |
| Instructor Guide | [`training/INSTRUCTOR_GUIDE.md`](training/INSTRUCTOR_GUIDE.md) | Classroom pacing and teaching tips |
| Exercises | [`training/exercises/`](training/exercises/) | Hands-on coding tasks per level |
| Quizzes | [`training/quizzes/`](training/quizzes/) | Knowledge checks per level |
| Answer Keys | [`training/answer-keys/`](training/answer-keys/) | Solutions for exercises and quizzes |
| Demos | [`training/demos/`](training/demos/) | Live demo scripts per level |
| Slides | [`training/slides/`](training/slides/) | Presentation outlines per level |
| Measurement Framework | [`training/MEASUREMENT_FRAMEWORK.md`](training/MEASUREMENT_FRAMEWORK.md) | Training effectiveness metrics |
| Cheat Sheet | [`reference/CHEAT_SHEET.md`](reference/CHEAT_SHEET.md) | Quick reference for patterns |
| Glossary | [`reference/GLOSSARY.md`](reference/GLOSSARY.md) | Banking and technical terms |
| Guide Index | [`reference/INDEX.md`](reference/INDEX.md) | Master index by level and topic |

---

## Companion Repository

Two applications that implement every pattern from the guides:

| App | Stack | Purpose | Directory |
|-----|-------|---------|-----------|
| **Banking Portal** | Vite + React 19 | Internal post-login application | `companion-repo/portal/` |
| **Public Site** | Next.js 16 | Public-facing marketing site | `companion-repo/public-site/` |

### Running Tests

```bash
# Portal — 56 reference implementation tests
cd companion-repo/portal
npm run test:run

# Portal — exercise validation tests
npm run test:exercises

# Public Site — 12 tests
cd companion-repo/public-site
npm run test:run
```

---

## Environment Setup

Run the setup verification script to check your machine:

```bash
bash scripts/verify-setup.sh
```

**Prerequisites:**
- Node.js 24.x
- VS Code with ESLint, Prettier, Tailwind CSS IntelliSense
- Git configured with your EWB credentials

---

## Architecture

| Part | Scope | Deployment |
|------|-------|------------|
| **Part A** — Core | React fundamentals, TypeScript, testing, security, compliance (~70% of content) | Framework-agnostic |
| **Part B** — Vite SPA | Internal banking applications (post-login portal) | Azure Blob Storage + CDN |
| **Part C** — Next.js | Public-facing applications (marketing, pre-login) | Azure App Service |

Levels 1–8 cover Parts A and B. Level 9 covers Part C.

---

## BSP Compliance Coverage

This documentation covers frontend requirements for:
- BSP Circular 808 (IT Risk Management)
- BSP Circular 982 (Information Security)
- BSP Circular 1019 (Cyber-Risk Reporting)
- BSP Circular 1033 (Electronic Payment Services)
- BSP Circular 1105 (Digital Banks)
- BSP Circular 1122 (Open Finance)
- **BSP Circular 1213/AFASA** (Phishing-Resistant Auth — **June 2026 deadline**)
- Philippine DPA (RA 10173)
- NPC Circulars 16-03, 2023-06
- AMLA/RA 9160 (KYC)
- PCI-DSS, GDPR, SOX

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
