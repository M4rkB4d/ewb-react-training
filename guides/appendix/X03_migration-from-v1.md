# X03 — Migration from v1

> **EastWest Bank — Digital Platforms & Innovations**
>
> Appendix · Reference

---

## Overview

This guide maps v1 documentation (19 guides) to v2 documentation (24 guides
across 8 levels). Use this reference if you completed parts of v1 and want
to know where to pick up in v2.

---

## v1 → v2 Guide Mapping

| v1 Guide | v1 Topic | v2 Guide(s) | Notes |
|----------|----------|-------------|-------|
| Doc 01 | React Fundamentals | A01, A02 | Split into React core + TypeScript |
| Doc 02 | Project Setup | B01 | Vite 7, Tailwind 4, Node 24 |
| Doc 03 | Components | A04 | React 19 patterns (ref as prop) |
| Doc 04 | Design System | A06 | EWB brand colors, Tailwind 4 @theme |
| Doc 05 | Forms | A07 | Zod 4, React Hook Form 7 |
| Doc 06 | Accessibility | A08 | Largely similar, WCAG 2.1 AA |
| Doc 07 | State Management | A09 | Zustand 5, TanStack Query 5 |
| Doc 08 | Routing | B02 | React Router 7, lazy() |
| Doc 09 | API Integration | B03 | Axios only (no fetch) |
| Doc 10 | Testing | A05, A10, A14 | Split across 3 guides by level |
| Doc 11 | Error Handling | A13 | Custom error taxonomy added |
| Doc 12 | Performance | B05 | React Compiler, TanStack Virtual |
| Doc 13 | Auth | A11, B04, A12 | Major restructure + passkeys |
| Doc 14 | i18n | B08 | fil-PH + zh-Hans replacing es-MX + ar-SA |
| Doc 15 | Deployment | B07 | Docker + Azure Pipelines |
| Doc 16 | Security | A15 | CSP, SRI, Trusted Types, PCI-DSS |
| Doc 17 | Architecture | A18 | Feature-slice + DDD |
| Doc 18 | Real-time | A19 | WebSocket + SSE + polling |
| Doc 19 | Capstone | B09 | Bill Payment (new feature) |

---

## What Is New in v2

These topics have no v1 equivalent:

| v2 Guide | Topic | Why It Was Added |
|----------|-------|-----------------|
| A03 | Thinking in Compliance | BSP awareness from day 1 |
| A05 | Your First Test | Testing starts at Level 2 |
| A12 | Passkeys and WebAuthn | AFASA June 2026 deadline |
| A16 | BSP Compliance Framework | Complete circular mapping |
| A17 | Data Privacy and Consent | DPA + AMLA requirements |
| B06 | Monitoring and Observability | Sentry + structured logging |
| X01 | EWB Design System Reference | Brand token documentation |
| X02 | BSP Circular Quick Reference | Regulation summary |

---

## Key Technology Changes

| Technology | v1 | v2 | Migration Notes |
|-----------|----|----|----------------|
| Node.js | 20/22 | 24 LTS | Update `.nvmrc` and CI configs |
| React | 18 | 19 | Remove manual `useMemo`/`useCallback` (React Compiler) |
| Vite | 5/6 | 7 | Update `vite.config.ts`, check plugin compatibility |
| Tailwind | 3 | 4 | `@theme` replaces `theme.extend`, CSS-first config |
| Zustand | 4 | 5 | Minor API changes, check middleware imports |
| TanStack Query | 4/5 | 5 (latest) | Query key factory pattern, `isPending` replaces `isLoading` |
| Zod | 3 | 4 | New API surface, check schema definitions |
| React Router | 6 | 7 | `lazy()` built in, loader/action patterns |
| Vitest | 1/2 | 4 | Browser Mode now stable |
| MSW | 1/2 | 2 | `http.get()` replaces `rest.get()` |

---

## Key Pattern Changes

### Authentication

**v1:** Token stored in localStorage, manual refresh logic scattered across
interceptors and components.

**v2:** Access token in-memory (Zustand store, never persisted). Refresh
token in HttpOnly cookie (backend-managed). Silent refresh via 401 Axios
interceptor. Passkey support added.

### HTTP Client

**v1:** Mix of `fetch` and `axios` depending on the guide.

**v2:** Axios exclusively. Standardized interceptors for auth, error
handling, and request tracking.

### State Management

**v1:** Context API for some state, Zustand for other state.

**v2:** Zustand for all client state. No Context API (except for third-party
providers like IntlProvider). TanStack Query for all server state.

### Testing

**v1:** Testing introduced in Doc 10 (after 9 guides of code).

**v2:** First test in A05 (Level 2). Testing is progressive — simple tests
early, advanced patterns later.

### Locales

**v1:** `en-US`, `es-MX`, `ar-SA` (generic international coverage).

**v2:** `en-US`, `fil-PH`, `zh-Hans` (EWB customer base in the Philippines).

### Currency

**v1:** USD as primary currency in examples.

**v2:** PHP (Philippine Peso) as primary currency. `₱` symbol,
`Intl.NumberFormat` with `currency: 'PHP'`.

### Branding

**v1:** Generic blue theme with neutral color palette.

**v2:** EWB brand colors — purple `#500778`, magenta `#b1006f`, gold
`#dba464`, lime `#d5e04d`, navy `#06357A`. Full Tailwind 4 theme with
WCAG AA verified contrast ratios.

---

## Migration Checklist

If you completed v1 and want to update your knowledge to v2:

- [ ] Read A03 — Thinking in Compliance (BSP context, new in v2)
- [ ] Review B01 — Project Setup (Node 24, Vite 7, Tailwind 4 changes)
- [ ] Review A09 — State Management (Zustand 5 changes)
- [ ] Read A11+B04 — Authentication (complete rewrite, in-memory tokens)
- [ ] Read A12 — Passkeys and WebAuthn (entirely new)
- [ ] Read A16 — BSP Compliance Framework (entirely new)
- [ ] Read A17 — Data Privacy and Consent (entirely new)
- [ ] Review B05 — Performance (React Compiler replaces manual memoization)
- [ ] Review B08 — Internationalization (new locales: fil-PH, zh-Hans)

---

## Companion Repo

**v1 repo:** `react-enterprise-companion` (stays as-is, not deleted)

**v2 repo:** `eastwest-react-companion` (new, separate project)

The v2 companion repo is built from scratch with the updated tech stack.
It is not a fork or upgrade of the v1 repo.

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
