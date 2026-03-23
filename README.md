# EWB React Training - Level 05: Data and Auth

**EastWest Bank - Digital Platforms & Innovations**
**Branch:** `level-05-complete`

---

## About This Level

Reference implementation with API client, auth store, and account query hook.

**Guides for this level:** B03, A11, B04, A12
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
npm run test:exercises:05

# Run all exercise tests (current + previous levels)
npm run test:exercises
```

All tests should pass on this branch.

---

## Exercises

1. **Secure API Client** ('src/lib/api-client.ts') — Axios with interceptors, token refresh
2. **Auth Store** ('src/stores/auth-store.ts') — Zustand store with auth state machine
3. **Account Query Hook** ('src/features/accounts/hooks/use-accounts.ts') — TanStack Query integration

---

## Comparing Your Work

See what changed between start and complete:

```bash
git diff level-05-start level-05-complete
```

---

## Next Level

```bash
git checkout level-06-start
cd companion-repo/portal
npm install
npm run dev
```

---

## Tech Stack

React 19 | TypeScript 5 | Vite 7 | Zustand 5 | TanStack Query 5 | Zod 4 | Tailwind 4 | Vitest 4 | MSW 2

---

*EastWest Bank Digital Platforms & Innovations*
