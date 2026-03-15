# EWB Learning Platform — Complete Test Plan

**Date:** 2026-03-15
**Status:** Draft — pending Mark's review

## What "Production Ready" Means for a Learning Platform

A learning platform is NOT production ready when the code merely compiles.
It is production ready when a student can:

1. Clone the repo, checkout a level branch, and run the app
2. See a working banking application with realistic data
3. Follow guide instructions that match what they see in their editor
4. Run exercise tests that guide their learning (FAIL → build → PASS)
5. Switch branches and see clear progression

We have verified #1 partially (compiles, branches checkout). We have NOT verified #2-#5.

---

## Phase 1: Exercise Test Validation (CRITICAL)

**Why this is #1:** The exercise tests ARE the learning loop. If they don't work
correctly, the entire platform fails regardless of how pretty the UI looks.

**Structure:** 9 test files, 104 total tests across all levels.

**The contract:**
- On `level-XX-start`: Tests for level XX should FAIL (student hasn't built it yet)
- On `level-XX-complete`: Tests for level XX should PASS (solution exists)
- Tests for PREVIOUS levels should PASS on both -start and -complete

**Test matrix (18 branches x 9 test files = 162 test runs):**

| Branch | L1 Tests | L2 Tests | L3 Tests | L4 Tests | L5 Tests | L6 Tests | L7 Tests | L8 Tests | L9 Tests |
|--------|----------|----------|----------|----------|----------|----------|----------|----------|----------|
| level-01-start | FAIL | - | - | - | - | - | - | - | - |
| level-01-complete | PASS | - | - | - | - | - | - | - | - |
| level-02-start | PASS | FAIL | - | - | - | - | - | - | - |
| level-02-complete | PASS | PASS | - | - | - | - | - | - | - |
| ... | ... | ... | ... | ... | ... | ... | ... | ... | ... |
| level-09-start | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | FAIL |
| level-09-complete | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |

**How to test:** On each branch, run `npx vitest run src/test/exercises/level-XX.test.ts`

**Estimated effort:** ~1 hour (automated script)

---

## Phase 2: MSW Browser Worker (CRITICAL)

**Why:** Without this, students see a dead app. Login doesn't work, no data anywhere.

**What exists:** MSW is installed. Test handlers exist in `src/test/mocks/handlers.ts`
(node-only, 5 endpoints). Browser worker is NOT set up.

**What's needed:**

### 2a. Browser worker setup
- Create `public/mockServiceWorker.js` (MSW init script)
- Create `src/mocks/browser.ts` with `setupWorker()`
- Create `src/mocks/handlers.ts` (dev-mode handlers, superset of test handlers)
- Conditionally start worker in `main.tsx` when `import.meta.env.DEV`

### 2b. Missing mock handlers

| Endpoint | Method | Mock Response |
|----------|--------|---------------|
| `/api/auth/login` | POST | Return user + token (accept any valid-looking credentials) |
| `/api/auth/verify` | GET | Return current user from token |
| `/api/auth/logout` | POST | Return success |
| `/api/accounts` | GET | 3 accounts (savings, checking, time deposit) |
| `/api/accounts/:id` | GET | Account detail with balance |
| `/api/accounts/:id/transactions` | GET | 10-15 realistic transactions |
| `/api/transfers` | POST | Return success with reference number |
| `/api/billers` | GET | 5 Philippine billers (Meralco, PLDT, Globe, Manila Water, SSS) |
| `/api/billers/search` | GET | Filter billers by query |
| `/api/payments` | POST | Return success with receipt |
| `/api/rates/forex` | GET | 5 currency pairs (USD, EUR, JPY, SGD, AED) |
| `/api/products` | GET | 3 EWB products (savings, checking, time deposit) |
| `/api/products/:slug` | GET | Product detail with features and rates |

### 2c. Mock data requirements
- All money in centavos (integer)
- Filipino names (Juan Santos, Maria Cruz, etc.)
- Philippine context (Meralco, PLDT, SM Megamall)
- Realistic balances (not ₱1.00 or ₱999,999,999.00)
- Proper `en-PH` locale formatting
- Timestamps in Asia/Manila timezone

**Estimated effort:** ~2 hours

---

## Phase 3: Public Site Dev Fallback Data

**Why:** The public site uses server-side rendering. MSW browser worker doesn't
intercept server-side fetch calls. Pages degrade gracefully (empty arrays) but
show no content.

**What's needed:**

### Option A: Dev-mode static fallback (simpler)
In each `getProducts()`, `getRates()`, etc., return mock data when API fails
AND we're in development mode:

```typescript
async function getProducts() {
  try {
    const res = await fetch(...);
    if (!res.ok) throw new Error();
    return ProductListSchema.parse(await res.json());
  } catch {
    if (process.env.NODE_ENV === 'development') {
      return DEV_PRODUCTS; // Static mock data
    }
    return [];
  }
}
```

### Option B: MSW Node integration for Next.js (complex)
Set up MSW with `setupServer()` in Next.js instrumentation hook.
More complex, but more realistic. Probably overkill for a training platform.

**Recommendation:** Option A. Simple, obvious, and students can see how
fallback data works — it's a teaching moment.

**Estimated effort:** ~45 minutes

---

## Phase 4: QA Screenshots (IMPORTANT)

**Why:** Proof that testing happened. Without artifacts, the testing is
undocumented and unrepeatable.

**What's needed:**
- Save screenshots to `qa/screenshots/portal/` and `qa/screenshots/public-site/`
- Use a script or Playwright to capture screenshots programmatically
- Document what each screenshot shows

**Screenshot manifest:**

### Portal
1. `01-login-page.png` — Login form with EWB branding
2. `02-login-validation.png` — Empty submit showing validation errors
3. `03-dashboard.png` — Dashboard with account cards (requires mock login)
4. `04-accounts.png` — Account list with balances
5. `05-transfers.png` — Transfer wizard
6. `06-payments.png` — Payment flow with biller search
7. `07-404.png` — Not found page
8. `08-session-warning.png` — Session timeout dialog

### Public Site
1. `01-home.png` — Landing page with hero, products, rates
2. `02-products.png` — Product listing
3. `03-product-detail.png` — Individual product page
4. `04-rates.png` — Exchange rates table
5. `05-footer.png` — Footer with BSP/PDIC regulatory text

**Estimated effort:** ~30 minutes (after Phase 2-3 are done)

---

## Phase 5: Branch Runtime Verification

**Why:** We verified `tsc --noEmit` on 3 branches. We never verified that
`npm run dev` actually starts the app on level branches.

**What's needed:**
- On each branch with a package.json, run `npm install && npm run dev`
- Verify the app starts without errors
- Focus on: level-02-start (first runnable), level-05-start (mid), level-09-start

**Estimated effort:** ~30 minutes

---

## Phase 6: Guide-to-Code Cross-Reference (NICE TO HAVE)

**Why:** Guides contain code snippets. If a snippet doesn't match the actual
code in the companion repo at the correct branch, students get confused.

**What's needed:**
- For key guides (A04, A09, A11, A13, A18), extract code snippets
- Checkout the corresponding level branch
- Compare snippet against actual file
- Flag mismatches

**Estimated effort:** ~2 hours (manual, tedious)

---

## Priority Order

| Phase | Priority | Effort | Impact |
|-------|----------|--------|--------|
| 1. Exercise Test Validation | CRITICAL | 1 hr | Core learning loop verification |
| 2. MSW Browser Worker | CRITICAL | 2 hrs | Students can actually use the app |
| 3. Public Site Fallback | HIGH | 45 min | Public site shows real content |
| 4. QA Screenshots | HIGH | 30 min | Documented proof of testing |
| 5. Branch Runtime | MEDIUM | 30 min | Additional confidence |
| 6. Guide Cross-Ref | LOW | 2 hrs | Polish, not blocking |

**Total estimated effort: ~7 hours across 2-3 sessions**

---

## What This Changes

Before this plan: "The code compiles and passes 18/18 platform checks."
After this plan: "Students can clone, run, learn, and verify their work on every level."

That's the difference between a codebase and a learning platform.
