# EWB Banking Portal — Level 5: Data & Auth

You're on the **Level 5 Start** branch.

## What's Here

- Everything from Levels 1-4 — completed
- Routing, state management, layout working
- `portal/src/lib/api-client.ts` — Stub for you to implement
- `portal/src/features/` — Empty directory structure for feature modules

## What You'll Build

This is the biggest level. You'll connect the app to a real API and add authentication:

1. Axios API client with interceptors
2. TanStack Query for server state
3. Authentication flow (login, MFA, session management)
4. Passkeys / WebAuthn integration
5. Account features (list, detail, transactions)
6. Protected routes and role-based access

## New Dependencies

This level introduces: `axios`, `@tanstack/react-query`

## Getting Started

```bash
cd portal
npm install
npm run dev
```

## When You're Done

```bash
git diff level-05-start level-05-complete
git checkout level-06-start && npm install
```
