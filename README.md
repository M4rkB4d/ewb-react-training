# EWB React Training - Level 07: Production

**EastWest Bank - Digital Platforms & Innovations**
**Branch:** `level-07-complete`

---

## About This Level

Reference implementation with PII masking, input sanitization, RBAC permissions, and deployment config.

**Guides for this level:** A15, B07, A16, A17
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
npm run test:exercises:07

# Run all exercise tests (current + previous levels)
npm run test:exercises
```

All tests should pass on this branch.

---

## Exercises

1. **PII Masking** ('src/lib/masking.ts') — Account number, email, phone masking
2. **Input Sanitization** ('src/lib/sanitize.ts') — XSS protection
3. **Permissions** ('src/lib/permissions.ts') — Role-based access control

---

## Comparing Your Work

See what changed between start and complete:

```bash
git diff level-07-start level-07-complete
```

---

## Next Level

```bash
git checkout level-08-start
cd companion-repo/portal
npm install
```

Then follow the instructions in that branch's README.

---

## Tech Stack

React 19 | TypeScript 5 | Vite 7 | Zustand 5 | TanStack Query 5 | Zod 4 | Tailwind 4 | Vitest 4 | MSW 2

---

*EastWest Bank Digital Platforms & Innovations*
