# EWB React Training - Level 06: Quality

**EastWest Bank - Digital Platforms & Innovations**
**Branch:** `level-06-complete`

---

## About This Level

Reference implementation with error hierarchy, MSW mocks, and test factories.

**Guides for this level:** A13, B05, A14, B06
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
npm run test:exercises:06

# Run all exercise tests (current + previous levels)
npm run test:exercises
```

All tests should pass on this branch.

---

## Exercises

1. **Error Hierarchy** ('src/lib/errors.ts') — AppError base class with subclasses
2. **MSW Handlers** ('src/test/mocks/handlers.ts', 'server.ts') — Mock API setup
3. **Test Factories** ('src/test/factories/') — User and account factories

---

## Comparing Your Work

See what changed between start and complete:

```bash
git diff level-06-start level-06-complete
```

---

## Next Level

```bash
git checkout level-07-start
cd companion-repo/portal
npm install
```

Then follow the instructions in that branch's README.

---

## Tech Stack

React 19 | TypeScript 5 | Vite 7 | Zustand 5 | TanStack Query 5 | Zod 4 | Tailwind 4 | Vitest 4 | MSW 2

---

*EastWest Bank Digital Platforms & Innovations*
