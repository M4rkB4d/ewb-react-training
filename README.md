# EWB React Training

**EastWest Bank — Digital Platforms & Innovations**

Welcome to the React training program. This repository contains a banking portal that you will explore, study, and build across 9 levels.

---

## How This Repo Works

This repository uses **branches** to organize the training into levels. Each level has two branches:

- **`level-XX-start`** — Your starting point. This is where you begin working.
- **`level-XX-complete`** — The reference answer. Switch to this after you finish to compare your work.

### The 9 Levels

| Level | Name | Type | What You Do |
|-------|------|------|-------------|
| 01 | Welcome | Reading | Read the guides. No code yet. |
| 02 | First App | Guided | Explore pre-built code. Run tests. |
| 03 | Building UI | Guided | Study design system, forms, accessibility. |
| 04 | State & Routing | Guided | Study state management and navigation. |
| 05 | Data & Auth | Build | Your first coding exercises. Implement from TODO stubs. |
| 06 | Quality | Build | Error handling, testing infrastructure. |
| 07 | Production | Build | Security, compliance, deployment. |
| 08 | Mastery | Build | i18n, real-time data, payment API. |
| 09 | Public-Facing | Build | Next.js, server-side rendering, CI/CD. |

**Guided levels (01–04):** The code is already written. Read the guides, explore the source code, and run tests.

**Build levels (05–09):** Exercise files have `TODO` comments. Write the code to make the tests pass.

### Where Is the Code?

```
companion-repo/
├── portal/        ← The main banking app (React 19 + Vite)
└── public-site/   ← The public website (Next.js) — Level 9 only
```

### Comparing Your Work

See the difference between your starting point and the reference answer:

```bash
git diff level-XX-start level-XX-complete
```

Or compare a specific file:

```bash
git diff level-XX-start level-XX-complete -- src/stores/auth-store.ts
```

### Need Help?

- **Guides:** Available on Notion (link from your instructor)
- **Tests:** Run `npm run test:exercises` to check your progress
- **Reference:** Switch to the `-complete` branch to see the answer


---
---

# Level 03: Building UI

**Branch:** `level-03-complete`

---

## About This Level

Reference implementation with design system components, form validation, and accessibility patterns.

**Guides for this level:** A06, A07, A08
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

## Running Tests

```bash
cd companion-repo/portal

# Run this level's exercise tests
npm run test:exercises:03

# Run all exercise tests (current + previous levels)
npm run test:exercises
```

All tests should pass on this branch.

---

## Exercises

Study the BeneficiaryForm (Zod validation + React Hook Form) and the accessible DataTable component.

---

## Comparing Your Work

See what changed between start and complete:

```bash
git diff level-03-start level-03-complete
```

---

## Next Level

```bash
git checkout level-04-start
cd companion-repo/portal
npm install
```

Then follow the instructions in that branch's README.

---

**Tech Stack:** React 19 | TypeScript 5 | Vite 7 | Zustand 5 | TanStack Query 5 | Zod 4 | Tailwind 4 | Vitest 4 | MSW 2
