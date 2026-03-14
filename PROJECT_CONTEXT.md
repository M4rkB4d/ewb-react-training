# React Enterprise Docs v2 — Project Context

**This file is the single source of truth about this project. Read this first.**

---

## What This Is

Internal React training documentation and companion code for **EastWest Bank** (Philippines). Built by Mark Paul, Head of Digital Platforms & Innovations (R&D team).

**Origin**: Started as internal docs for Mark's R&D team. His boss found them, launched a company-wide initiative for Mark to teach everyone in the group React web development. Evolved from team docs into a full learning platform.

**Audience**: Complete beginners to experienced devs across EastWest Bank. Must work step-by-step — code must compile, explanations must make sense, everything must teach correctly.

**No AI traces**: EastWest Bank is not ready for AI-assisted workflow visibility. No Co-Authored-By lines, no AI mentions in code, comments, READMEs, or commits. Nothing.

---

## Project Structure

```
react-enterprise-docs-v2/
├── guides/                  ← 37 markdown files (THE source of truth)
│   ├── level-01-welcome/       A01, A02, A03
│   ├── level-02-first-app/     B01, B01b, A04, A05
│   ├── level-03-building-ui/   A06, A07, A08
│   ├── level-04-state-and-routing/  A09, B02, A10
│   ├── level-05-data-and-auth/      B03, A11, B04, A12
│   ├── level-06-quality/       A13, B05, A14, B06
│   ├── level-07-production/    A15, B07, A16, A17
│   ├── level-08-mastery/       A18, B08, B09, A19
│   ├── level-09-public-facing/ A20, A21, A22, A23, B10
│   └── appendix/              X01, X02, X03
├── companion-repo/          ← Working code for learners (Git repo)
│   ├── portal/                 Vite SPA (Levels 1-8)
│   └── public-site/            Next.js (Level 9)
├── reference/               ← Cheat sheet, glossary, index
├── training/                ← 47 files: quizzes, exercises, answer-keys, demos, slides, onboarding
├── scripts/                 ← validate-guide-paths.mjs, verify-setup.sh
└── README.md
```

## Three Parts

| Part | Scope | Guides | Deployment |
|------|-------|--------|------------|
| **A — Core** | React fundamentals, TS, testing, security, compliance (~70%) | A01–A19 | Framework-agnostic |
| **B — Vite SPA** | Internal banking portal (post-login) | B01–B09 | Azure Blob Storage + CDN |
| **C — Next.js** | Public-facing applications (pre-login) | A20–A22, B10 | Azure App Service |

## Tech Stack

| Technology | Version | Role |
|-----------|---------|------|
| React | 19.x | UI Framework |
| TypeScript | 5.9 | Type Safety |
| Vite | 7.x | Build Tool (Portal) |
| Next.js | 15.x | Framework (Public Site) |
| Tailwind CSS | 4.x | Styling |
| Zustand | 5.x | Client State |
| TanStack Query | 5.x | Server State |
| Zod | 4.x | Validation |
| React Hook Form | 7.x | Forms |
| React Router | 7.x | Routing (Portal) |
| Vitest | 4.x | Tests |
| Azure Pipelines | — | CI/CD (not GitHub Actions) |

## Azure Infrastructure

EastWest Bank runs on Microsoft Azure:
- Azure Blob Storage + CDN — Vite SPA hosting
- Azure Front Door — WAF, routing, blue-green deployment
- Azure Application Insights — Monitoring + APM
- Azure Key Vault — Secrets management
- Azure Container Registry — Docker images
- Azure App Service — Next.js deployment (Level 9)
- Azure Pipelines — CI/CD (replaced GitHub Actions in commit 06dd5c6)

## BSP Compliance Coverage

Frontend requirements for Philippine banking regulations:
- BSP Circulars: 808, 982, 1019, 1033, 1105, 1122
- **BSP Circular 1213/AFASA** — Phishing-Resistant Auth (June 2026 deadline)
- Philippine DPA (RA 10173), NPC Circulars
- AMLA/RA 9160 (KYC)
- PCI-DSS, GDPR, SOX

## EWB Brand Colors

| Token | Hex | Usage |
|-------|-----|-------|
| EWB Purple | `#500778` | Primary brand |
| EWB Magenta | `#b1006f` | Secondary accent |
| EWB Gold | `#dba464` | Highlights |
| EWB Lime | `#d5e04d` | Success states |
| EWB Navy | `#06357A` | Info, secondary actions |

---

## What's Been Done

### Guides (COMPLETE)
- 37 markdown files (~28,000 lines total)
- All 9 levels written, verified, committed
- Azure Pipelines migration complete (zero GitHub Actions references)
- Code examples verified across all 31 code-bearing guides
- Structure normalized, security/cross-platform fixes applied
- Known remaining issues: A17 contradicts Zod teaching, B03/B06 reference non-existent env vars

### Reference (COMPLETE)
- CHEAT_SHEET.md (258 lines)
- GLOSSARY.md (262 lines)
- INDEX.md (134 lines)

### Git History (docs repo — 15 commits)
Clean level-by-level history from initial commit through Azure Pipelines migration.

---

## What's Been Done (continued)

### Companion Repo (COMPLETE)
- Portal (Vite SPA) — Levels 1-8, builds clean, 56 tests passing
- Public Site (Next.js) — Level 9, builds clean with graceful API fallbacks
- Missing files created, type errors fixed, guide bugs reconciled

### Training Materials (COMPLETE)
- 47 files across quizzes, exercises, answer-keys, demos, slides
- ONBOARDING.md — 13-day schedule (expanded from 12 for security/compliance depth)
- QUICK_START.md — 3-day fast-track for experienced developers
- Capstone defined: fund transfer flow with grading rubric
- Setup validation script: `scripts/verify-setup.sh`

---

## What's NOT Done

### Notion Publishing
- Guides need to be republished after companion repo build surfaces and fixes guide bugs
- v1 guides were on Notion; v2 may need fresh publish

### Companion Repo → GitHub
- Push as separate repo for learners
- With level-by-level commit history and tags

---

## Known Issues

- A17 contradicts Zod teaching in some code examples
- B03/B06 reference non-existent environment variables
- Notion pages need fresh publish with v2 content
- Companion repo needs its own GitHub repo with level-by-level tags
