# EWB React Training - Level 09: Public-Facing Applications

**EastWest Bank - Digital Platforms & Innovations**
**Branch:** `level-09-complete`

---

## About This Level

Reference implementation with Next.js pages, API routes, middleware, and deployment config.

**Guides for this level:** A20, A21, A22, A23, B10
Access your guides on Notion (link provided by your instructor).

---

## Getting Started

This is the reference implementation. Run it to see the completed code:

```bash
cd companion-repo/portal
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Public Site (Next.js)

This level includes a second application — the public-facing marketing site:

```bash
cd companion-repo/public-site
npm install
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

---

## Running Tests

```bash
cd companion-repo/portal

# Run this level's exercise tests
npm run test:exercises:09

# Run all exercise tests (current + previous levels)
npm run test:exercises
```

All tests should pass on this branch.

---

## Exercises

1. **Product Pages** ('public-site/app/products/') — Dynamic routes with not-found
2. **Rates Page** ('public-site/app/rates/') — Streaming with loading/error states
3. **Middleware** ('public-site/middleware.ts') — Security headers and health check
4. **Deployment** ('public-site/Dockerfile', 'azure-pipelines.yml') — Multi-stage Docker + CI/CD

---

## Comparing Your Work

See what changed between start and complete:

```bash
git diff level-09-start level-09-complete
```

---

## Tech Stack

React 19 | TypeScript 5 | Vite 7 | Zustand 5 | TanStack Query 5 | Zod 4 | Tailwind 4 | Vitest 4 | MSW 2

---

*EastWest Bank Digital Platforms & Innovations*
