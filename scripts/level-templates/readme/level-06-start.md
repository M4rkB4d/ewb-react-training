# EWB Banking Portal — Level 6: Quality

You're on the **Level 6 Start** branch.

## What's Here

- Everything from Levels 1-5 — completed
- Full auth flow, API integration, account features
- `portal/src/components/error/` — Empty directory for error handling
- `portal/src/lib/errors.ts` — Stub for error hierarchy

## What You'll Build

In Level 6, you'll make the app production-quality:

1. Error boundary components (route-level and component-level)
2. Structured error hierarchy with typed errors
3. Global error handlers and error logging
4. Performance monitoring (Azure Application Insights, Web Vitals)
5. Advanced testing patterns (MSW mocks, factories, a11y tests)

## New Dependencies

This level introduces: `@microsoft/applicationinsights-web`, `@sentry/react`, `web-vitals`, `msw`, `@chialab/vitest-axe`

## Getting Started

```bash
cd portal
npm install
npm run dev
```

## When You're Done

```bash
git diff level-06-start level-06-complete
git checkout level-07-start && npm install
```
