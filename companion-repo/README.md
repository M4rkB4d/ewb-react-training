# EastWest Bank — React Enterprise Companion Repo

Working code companion for the React Enterprise Learning Path. Contains two independent applications that implement the patterns taught across all nine levels of the curriculum.

## Structure

```
companion-repo/
├── portal/          ← Internal banking portal (Levels 1–8)
├── public-site/     ← Public-facing website (Level 9)
└── .gitignore
```

### Portal — Internal Banking SPA

Single-page application built with the Vite + React stack. Covers Levels 1–8 including component architecture, state management, routing, authentication, API integration, error handling, testing, performance, security, compliance, internationalization, and real-time features.

| Technology | Version |
|-----------|---------|
| React | 19.2 |
| TypeScript | 5.9 |
| Vite | 7.3 |
| React Router | 7.13 |
| TanStack Query | 5.90 |
| Zustand | 5.3 |
| Zod | 4.3 |
| Tailwind CSS | 4.2 |
| React Hook Form | 7.58 |
| Vitest | 3.2 |

#### Running the Portal

```bash
cd portal
npm install
npm run dev        # http://localhost:5173
npm run build      # Production build → dist/
npm run lint       # ESLint
```

### Public Site — Next.js Public Website

Server-rendered public-facing website built with Next.js 15 App Router. Covers Level 9 including Server Components, ISR, Route Handlers, Azure Key Vault integration, Redis sessions, rate limiting, and Azure Pipelines deployment.

| Technology | Version |
|-----------|---------|
| Next.js | 15.3 |
| React | 19.2 |
| TypeScript | 5.9 |
| Zod | 3.24 |
| Tailwind CSS | 4.1 |
| ioredis | 5.6 |
| Azure Identity SDK | 4.6 |
| Azure Key Vault SDK | 4.9 |

#### Running the Public Site

```bash
cd public-site
npm install
npm run dev        # http://localhost:3000
npm run build      # Production build → .next/
npm run type-check # TypeScript verification
```

> **Note:** `npm run build` requires backend API endpoints configured in `.env.local`. For TypeScript verification without running backends, use `npm run type-check`.

## Architecture

The two applications are completely independent — separate `package.json`, separate builds, separate deployments. This mirrors real-world enterprise architecture where internal tools and public-facing sites have different technology stacks, deployment pipelines, and security requirements.

| Concern | Portal | Public Site |
|---------|--------|-------------|
| Framework | Vite SPA | Next.js App Router |
| Rendering | Client-side | Server Components + ISR |
| Auth | Token-based (client) | Cookie-based (server) |
| State | Zustand + TanStack Query | Server-first, minimal client state |
| Routing | React Router | File-based (app/) |
| API | Direct fetch from browser | Route Handlers + server-side fetch |
| Deployment | Static hosting | Docker + Azure Container Apps |
| CI/CD | Azure Pipelines | Azure Pipelines |

## Guide Mapping

| Level | Guides | Application |
|-------|--------|-------------|
| 1 — Welcome | A01, A02 | Portal |
| 2 — First App | A04, A05, B01 | Portal |
| 3 — Building UI | A06, A07, A08 | Portal |
| 4 — State & Routing | A09, A10, B02 | Portal |
| 5 — Data & Auth | A11, A12, B03, B04 | Portal |
| 6 — Quality | A13, A14, B05, B06 | Portal |
| 7 — Production | A15, A16, A17, B07 | Portal |
| 8 — Mastery | A18, A19, B08, B09 | Portal |
| 9 — Public-Facing | A20, A21, A22, B10 | Public Site |
| Appendix | X01, X03 | Portal |
