# React Enterprise Banking Documentation v2

**EastWest Bank — Digital Platforms & Innovations**

Production-ready React documentation for enterprise banking applications. Built for complete beginners, aligned with BSP regulatory requirements, and branded for EastWest Bank.

---

## Tech Stack

| Technology | Version | Role |
|-----------|---------|------|
| Node.js | 22 LTS | Runtime |
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
| ID | Title | Part | Est. Time |
|----|-------|------|-----------|
| A01 | What Is React | A (Core) | 2 hours |
| A02 | TypeScript for React | A (Core) | 3 hours |
| A03 | Thinking in Compliance | A (Core) | 1.5 hours |

### Level 2 — First App
| ID | Title | Part | Est. Time |
|----|-------|------|-----------|
| B01 | Project Setup | B (Vite SPA) | 3 hours |
| A04 | Components and JSX | A (Core) | 2.5 hours |
| A05 | Your First Test | A (Core) | 2 hours |

### Level 3 — Building UI
| ID | Title | Part | Est. Time |
|----|-------|------|-----------|
| A06 | Design System Foundations | A (Core) | 3 hours |
| A07 | Forms and Validation | A (Core) | 3.5 hours |
| A08 | Accessibility Essentials | A (Core) | 2.5 hours |

### Level 4 — State and Routing
| ID | Title | Part | Est. Time |
|----|-------|------|-----------|
| A09 | State Management | A (Core) | 3 hours |
| B02 | Routing and Navigation | B (Vite SPA) | 2.5 hours |
| A10 | Testing Components and Hooks | A (Core) | 3 hours |

### Level 5 — Data and Auth
| ID | Title | Part | Est. Time |
|----|-------|------|-----------|
| B03 | API Integration | B (Vite SPA) | 3.5 hours |
| A11 | Authentication Part 1: Concepts | A (Core) | 3 hours |
| B04 | Authentication Part 2: Implementation | B (Vite SPA) | 3.5 hours |
| A12 | Passkeys and WebAuthn | A (Core) | 3 hours |

### Level 6 — Quality
| ID | Title | Part | Est. Time |
|----|-------|------|-----------|
| A13 | Error Handling | A (Core) | 3 hours |
| B05 | Performance Optimization | B (Vite SPA) | 3 hours |
| A14 | Testing Advanced | A (Core) | 3.5 hours |
| B06 | Monitoring and Observability | B (Vite SPA) | 2.5 hours |

### Level 7 — Production
| ID | Title | Part | Est. Time |
|----|-------|------|-----------|
| B07 | Deployment and CI/CD | B (Vite SPA) | 3.5 hours |
| A15 | Security Hardening | A (Core) | 3.5 hours |
| A16 | BSP Compliance Framework | A (Core) | 3.5 hours |
| A17 | Data Privacy and Consent | A (Core) | 3 hours |

### Level 8 — Mastery
| ID | Title | Part | Est. Time |
|----|-------|------|-----------|
| A18 | Architecture Patterns | A (Core) | 3.5 hours |
| B08 | Internationalization | B (Vite SPA) | 3.5 hours |
| B09 | Integration Capstone | B (Vite SPA) | 4 hours |
| A19 | Real-Time Patterns | A (Core) | 2.5 hours |

### Level 9 — Public-Facing Applications (Next.js)
| ID | Title | Part | Est. Time |
|----|-------|------|-----------|
| A20 | SPA vs SSR Decision Framework | A (Core) | 2 hours |
| A21 | Next.js Project Setup | C (Next.js) | 3 hours |
| A22 | Server Components and Data Fetching | C (Next.js) | 3.5 hours |
| B10 | Deploying Next.js on Azure | C (Next.js) | 3 hours |

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
