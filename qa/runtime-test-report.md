# Runtime Test Report

**Date:** 2026-03-15
**Tested by:** JARVIS (automated browser testing via Claude in Chrome)
**Environment:** Windows 11, Chrome, Node 22, Vite 7.3.1, Next.js 16.1.6

## Portal (Vite SPA — `companion-repo/portal`)

### Routes Tested

| Route | Status | Notes |
|-------|--------|-------|
| `/` | PASS | Redirects to `/login` (ProtectedRoute works) |
| `/login` | PASS | EWB branding, passkey + credentials form renders |
| `/login` (empty submit) | PASS | Validation errors: "Username is required", "Password must be at least 8 characters" |
| `/login` (with credentials) | PASS | API call fails gracefully (no backend), MutationCache error logged via logger |
| `/nonexistent-page` | PASS | 404 page: "Page not found" + "Return to Dashboard" button |

### Bugs Found & Fixed

1. **CRITICAL: Azure Application Insights crash (white screen of death)**
   - **File:** `src/lib/azure-insights.ts`
   - **Symptom:** App renders blank white screen — React never mounts
   - **Root cause:** `initAzureInsights()` creates `ApplicationInsights` with empty connection string, SDK throws `"Please provide instrumentation key"`
   - **Fix:** Added guard: `if (!env.VITE_APPINSIGHTS_CONNECTION_STRING) return;`

2. **PREVENTIVE: Sentry init without DSN guard**
   - **File:** `src/lib/monitoring.ts`
   - **Symptom:** No crash (Sentry is resilient to empty DSN), but unnecessary init
   - **Fix:** Added DSN check to condition: `if (import.meta.env.PROD && env.VITE_SENTRY_DSN)`

### Console Errors

- Zero errors after fixes applied
- MutationCache errors from login attempts are expected (no API backend in dev)

## Public Site (Next.js SSR — `companion-repo/public-site`)

### Routes Tested

| Route | Status | Notes |
|-------|--------|-------|
| `/` | PASS | Home page: hero, nav, featured products, exchange rates, footer with BSP/PDIC text |
| `/products` | PASS | "Our Products" header, empty grid (no API), footer renders |
| `/products/savings-account` | PASS | "Product Not Found" graceful fallback with "Browse All Products" CTA |
| `/rates` | PASS | "Exchange Rates" with table headers (Currency, Buy, Sell), empty rows (no API) |
| `/apply/status` | PASS | Redirects to login (auth required), 404 on /login is expected (login lives on portal) |

### Bugs Found & Fixed

1. **CRITICAL: Azure Monitor instrumentation crash**
   - **File:** `instrumentation.ts`
   - **Symptom:** Next.js fails to start: `"No instrumentation key or connection string was provided"`
   - **Root cause:** `useAzureMonitor()` called without checking for connection string
   - **Fix:** Added guard: `process.env.APPLICATIONINSIGHTS_CONNECTION_STRING` to condition

### Console Errors

- Hydration mismatch from browser extension (`cz-shortcut-listen` attribute) — NOT our code
- `Failed to fetch products: 404` — expected, graceful degradation logged via console.error
- Next.js dev overlay "1 Issue" — middleware deprecation warning (Next.js 16 change)

## Branch Switching Test (Student Simulation)

All 18 level branches checked out cleanly. File count progression:

| Branch | Files | Notes |
|--------|-------|-------|
| level-01-start | 14 | Scaffolding only (barrel exports, test stubs, gitkeeps) |
| level-01-complete | 15 | +1 file |
| level-02-start | 19 | Project foundation |
| level-02-complete | 35 | +16 files (first components, tests) |
| level-03-start | 39 | UI layer begins |
| level-03-complete | 49 | +10 files (design system, forms) |
| level-04-start | 50 | Routing layer |
| level-04-complete | 57 | +7 files |
| level-05-start | 67 | Data & auth |
| level-05-complete | 115 | +48 files (API, auth, features) |
| level-06-start | 118 | Quality layer |
| level-06-complete | 140 | +22 files (error handling, testing) |
| level-07-start | 146 | Production layer |
| level-07-complete | 162 | +16 files (security, compliance) |
| level-08-start | 172 | Mastery layer |
| level-08-complete | 199 | +27 files (real-time, i18n) |
| level-09-start | 209 | Public-facing |
| level-09-complete | 236 | +27 files (Next.js, SSR) |

### TypeScript Compilation

| Branch | Portal | Public Site |
|--------|--------|-------------|
| level-05-complete | PASS (0 errors) | N/A (not yet introduced) |
| level-09-complete | PASS (0 errors) | PASS (0 errors) |
| master | PASS (0 errors) | PASS (0 errors) |

## Summary

- **3 bugs found** (2 critical, 1 preventive)
- **3 bugs fixed** — all in monitoring/instrumentation init guards
- **Both apps compile clean** after fixes (`tsc --noEmit`)
- **All routes render** without runtime crashes
- **Graceful degradation** works correctly when API backend is unavailable
- **18/18 branches** checkout cleanly with healthy file progression
- **TypeScript clean** on representative branches (level-05, level-09, master)
