# React Enterprise Banking Documentation v2

**EastWest Bank — Digital Platforms & Innovations**

Production-ready React documentation for enterprise banking applications. Built for complete beginners, aligned with BSP regulatory requirements, and branded for EastWest Bank.

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
| Playwright | 1.58+ | E2E Tests |
| MSW | 2.x | API Mocking |
| Axios | latest | HTTP Client |

---

## Guide Index

### Level 1 — Welcome
| ID | Title | Part |
|----|-------|------|
| A01 | What Is React | A (Core) |
| A02 | TypeScript for React | A (Core) |
| A03 | Thinking in Compliance | A (Core) |

### Level 2 — First App
| ID | Title | Part |
|----|-------|------|
| B01 | Project Setup | B (Vite SPA) |
| B01b | Project Tooling and Quality Gates | B (Vite SPA) |
| A04 | Components and JSX | A (Core) |
| A05 | Your First Test | A (Core) |

### Level 3 — Building UI
| ID | Title | Part |
|----|-------|------|
| A06 | Design System Foundations | A (Core) |
| A07 | Forms and Validation | A (Core) |
| A08 | Accessibility Essentials | A (Core) |

### Level 4 — State and Routing
| ID | Title | Part |
|----|-------|------|
| A09 | State Management | A (Core) |
| B02 | Routing and Navigation | B (Vite SPA) |
| A10 | Testing Components and Hooks | A (Core) |

### Level 5 — Data and Auth
| ID | Title | Part |
|----|-------|------|
| B03 | API Integration | B (Vite SPA) |
| A11 | Authentication Part 1: Concepts | A (Core) |
| B04 | Authentication Part 2: Implementation | B (Vite SPA) |
| A12 | Passkeys and WebAuthn | A (Core) |

### Level 6 — Quality
| ID | Title | Part |
|----|-------|------|
| A13 | Error Handling | A (Core) |
| B05 | Performance Optimization | B (Vite SPA) |
| A14 | Testing Advanced | A (Core) |
| B06 | Monitoring and Observability | B (Vite SPA) |

### Level 7 — Production
| ID | Title | Part |
|----|-------|------|
| A15 | Security Hardening | A (Core) |
| B07 | Deployment and CI/CD | B (Vite SPA) |
| A16 | BSP Compliance Framework | A (Core) |
| A17 | Data Privacy and Consent | A (Core) |

### Level 8 — Mastery
| ID | Title | Part |
|----|-------|------|
| A18 | Architecture Patterns | A (Core) |
| B08 | Internationalization | B (Vite SPA) |
| B09 | Integration Capstone | B (Vite SPA) |
| A19 | Real-Time Patterns | A (Core) |

### Level 9 — Public-Facing Applications (Next.js)
| ID | Title | Part |
|----|-------|------|
| A20 | SPA vs SSR Decision Framework | A (Core) |
| A21 | Next.js Project Setup | C (Next.js) |
| A22 | Server Components and Data Fetching | C (Next.js) |
| A23 | Server-Side Auth, API Routes, and Composition | C (Next.js) |
| B10 | Deploying Next.js on Azure | C (Next.js) |

### Appendix
| ID | Title |
|----|-------|
| X01 | EWB Design System Reference |
| X02 | BSP Circular Quick Reference |
| X03 | Migration from v1 |

---

## Architecture

This curriculum is structured in three parts:

| Part | Scope | Deployment |
|------|-------|------------|
| **Part A** — Core | React fundamentals, TypeScript, testing, security, compliance (~70% of content) | Framework-agnostic |
| **Part B** — Vite SPA | Internal banking applications (post-login portal) | Azure Blob Storage + CDN |
| **Part C** — Next.js | Public-facing applications (marketing, pre-login) | Azure App Service |

Levels 1–8 cover Parts A and B. Level 9 covers Part C.

---

## Companion Repository

The companion repo lives at `companion-repo/` within this project. It implements every pattern taught in these guides. Git tags map to each level.

---

## Target Infrastructure

EastWest Bank runs on **Microsoft Azure**. Deployment guides target:

| Service | Purpose |
|---------|---------|
| Azure Blob Storage | Static website hosting (Vite SPA) |
| Azure CDN | Content delivery and caching |
| Azure Front Door | WAF, global routing, blue-green deployment |
| Azure Application Insights | Monitoring and APM |
| Azure Key Vault | Secrets management |
| Azure Container Registry | Docker image storage |
| Azure App Service | Next.js deployment (Level 9) |
| Azure Pipelines | CI/CD pipelines |

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

## Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| EWB Purple | `#500778` | Primary brand color |
| EWB Magenta | `#b1006f` | Secondary accent |
| EWB Gold | `#dba464` | Accent, highlights |
| EWB Lime | `#d5e04d` | Success states |
| EWB Navy | `#06357A` | Info, secondary actions |

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
