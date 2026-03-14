# EWB Banking Portal — Level 7: Production

You're on the **Level 7 Start** branch.

## What's Here

- Everything from Levels 1-6 — completed
- Error handling, monitoring, advanced testing all working
- `portal/src/compliance/` — Empty directory for compliance framework
- `portal/src/lib/masking.ts` — Stub for PII masking

## What You'll Build

In Level 7, you'll harden the app for production deployment:

1. Security hardening (CSP, XSS prevention, input sanitization)
2. PII masking for sensitive data display
3. Role-based permissions system
4. BSP compliance framework (audit logging, control evidence)
5. Data privacy and consent management
6. Deployment pipeline (Dockerfile, nginx, Azure Pipelines)

## New Dependencies

This level introduces: `dompurify`, `vite-plugin-sri`

## Getting Started

```bash
cd portal
npm install
npm run dev
```

## When You're Done

```bash
git diff level-07-start level-07-complete
git checkout level-08-start && npm install
```
