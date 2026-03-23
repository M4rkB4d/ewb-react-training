# EWB React Training - Level 08: Mastery

**EastWest Bank - Digital Platforms & Innovations**
**Branch:** `level-08-complete`

---

## About This Level

Reference implementation with message catalogs, locale store, real-time hooks, and payment API.

**Guides for this level:** A18, B08, B09, A19
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
npm run test:exercises:08

# Run all exercise tests (current + previous levels)
npm run test:exercises
```

All tests should pass on this branch.

---

## Exercises

1. **i18n Message Catalogs** ('src/i18n/messages/') — en-US, fil-PH, zh-Hans
2. **Locale Store** ('src/stores/locale-store.ts') — Zustand with persist middleware
3. **Real-time Hooks** ('src/hooks/') — WebSocket, EventSource, Polling
4. **Payment API** ('src/features/payments/api/payment-api.ts') — Zod schema

---

## Comparing Your Work

See what changed between start and complete:

```bash
git diff level-08-start level-08-complete
```

---

## Next Level

```bash
git checkout level-09-start
cd companion-repo/portal
npm install
```

Then follow the instructions in that branch's README.

---

## Tech Stack

React 19 | TypeScript 5 | Vite 7 | Zustand 5 | TanStack Query 5 | Zod 4 | Tailwind 4 | Vitest 4 | MSW 2

---

*EastWest Bank Digital Platforms & Innovations*
