# EWB React Training Platform — Final QA Plan

**Date:** 2026-03-16
**Status:** Approved — Final gate before Option C (GitHub push + Notion publish)
**Supersedes:** `qa/test-plan.md` (draft)

---

## Purpose

This is the **ship/no-ship decision framework** for the EWB React Enterprise Portal
training curriculum. It defines exactly what we test, how we test it, what "pass" looks
like, and what blocks shipping.

The curriculum has already been through:
- 4 rounds of guide text audits (86 fixes across 26 guides, converged to 0 findings)
- 3+ rounds of guide-to-repo alignment audits (~45 fix types across 18 branches)
- 1 prior runtime test session (3 critical bugs found and fixed)

What has NOT been done: compiling the code, running tests, verifying user flows in browser,
or validating the student learning path. This plan covers all of that.

---

## Scope

| Asset | Count | QA Coverage |
|-------|-------|-------------|
| Guide text files | 30 guides across 9 levels | Already audited — 4 rounds, converged |
| Companion repo branches | 18 (L01-start through L09-complete) | Coverage below |
| `-complete` branches | 9 (L01-complete through L09-complete) | **Full test** — all tiers |
| `-start` branches | 9 (L01-start through L09-start) | **Compile check** — tsc + import chain only |
| Scaffold-only branches | 3 (L01-start, L01-complete, L02-start) | No build infra — Tier 1.8 only |
| Public site branches (Next.js) | 3 (L09-start, L09-complete, master) | Tiers 1-3, 7 |
| Exercise test files | 9 (level-01 through level-09) | Tier 1.4 |
| Unit/component test files | ~11 (progressive from L06+) | Tier 1.5 |

### Branch Testing Strategy

**`-complete` branches are the priority.** They contain the full solution code —
every feature, every test, every component. If a -complete branch breaks, the
curriculum is wrong. These get the FULL test suite: deps, tsc, build, vitest,
eslint, browser testing.

**`-start` branches are derivative.** Each `-start` is essentially the previous
level's `-complete` plus some empty scaffolding. If `level-04-complete` passes all
tests, `level-05-start` should too — it's the same code with stub files added.

**What `-start` branches need:**
- `tsc --noEmit` — verify the scaffolding doesn't break compilation
- Import chain validation — verify no imports reference files that don't exist yet
- `level-01-start` gets extra attention as the FIRST thing a student touches

**What `-start` branches DON'T need:**
- Full vitest run (redundant with previous -complete)
- Browser functional testing (same app state as previous -complete)
- ESLint (same code as previous -complete plus stubs)

This cuts Pass 1 effort significantly — 9 full test runs + 9 compile checks
instead of 18 full runs.

---

## Three-Pass Structure

### Pass 1: Code Quality & Build Verification
> "Does the code work?"
> Automated. 9 `-complete` branches (full), 6 `-start` branches (compile-only). ~2 hours.

### Pass 2: Browser Functional Testing
> "Does the app work?"
> Preview-based. 4-5 key branches. ~1.5 hours.

### Pass 3: Curriculum Integrity
> "Does the teaching work?"
> Semi-automated. All 9 level pairs. ~2 hours.

**Total estimated effort: 5-6 hours across 2 sessions.**

---

## Pass 1: Code Quality & Build Verification

### Tier 1.1 — Dependency Installation

**What:** `npm ci` on every buildable branch.
**Why:** If dependencies can't install, nothing else matters.
**Branches:** 9 `-complete` branches (full). Since `package.json` and lock file are
identical across all branches, one successful `npm ci` validates them all. Run once,
reuse `node_modules` by switching branches without reinstalling.
**Command:**
```bash
cd companion-repo/portal && npm ci
cd companion-repo/public-site && npm ci  # L09+ only
```
**Pass:** Exit code 0. No `ERESOLVE` errors. No peer dependency conflicts.
**Fail action:** Regenerate lock file with `npm install`, verify, commit.
**Ship-blocking:** YES

### Tier 1.2 — TypeScript Compilation

**What:** `tsc --noEmit` on every buildable branch (strict mode).
**Why:** Catches missing imports, type mismatches, broken references. This is where
alignment fixes get validated — missing `types/auth.ts`, `permissions.ts`, wrong
function signatures all surface here.
**Branches:** 9 `-complete` branches (full) + 6 buildable `-start` branches (compile-only).
This is the ONE tier where `-start` branches get full treatment — compilation proves
the student's starting point isn't broken.
**Command:**
```bash
cd companion-repo/portal && npx tsc --noEmit -p tsconfig.app.json
cd companion-repo/public-site && npx tsc --noEmit  # L09+ only
```
**Pass:** Zero errors on ALL branches.
**Fail action:** Fix type errors on the failing branch, re-run.
**Ship-blocking:** YES — a branch that doesn't compile is unusable by trainees.
**Risk:** HIGH — 12 branches have never been type-checked. Alignment fixes touched
dozens of files. Likely to surface issues.

### Tier 1.3 — Vite Production Build

**What:** `npm run build` (runs `tsc -b && vite build`) on every buildable branch.
**Why:** Catches issues `tsc` alone misses — CSS imports, path alias resolution,
asset references, dynamic imports, tree-shaking problems.
**Branches:** 9 `-complete` branches (portal). `next build` for L09-complete (public-site).
`-start` branches skip this — if tsc passes (Tier 1.2) and the previous -complete
builds, the -start will too.
**Command:**
```bash
cd companion-repo/portal && npm run build
cd companion-repo/public-site && npm run build  # L09+ only
```
**Pass:** Exit code 0. `dist/` created with `index.html` and JS/CSS bundles.
**Fail action:** Fix build errors. Common causes: unresolved `@/` imports, missing
CSS classes, broken dynamic import paths.
**Ship-blocking:** YES
**Note:** `next build` for public-site may warn about Azure/Redis modules at build time.
Acceptable — these are server-only and fail gracefully without credentials.

### Tier 1.4 — Exercise Test Matrix

**What:** Run exercise tests per-branch and verify the learning contract.
**Why:** THE core feedback loop for students. If exercise tests are broken, the
entire curriculum fails regardless of how the code looks.
**Branches:** 9 `-complete` branches (L02-complete onward). `-start` branches skip
this tier — they don't introduce new test files, and their existing tests are the
same as the previous -complete branch.

**The contract:**
- On `-complete` branches: ALL available exercise tests PASS
- Test for level N appears first on `level-N-complete`

**Command:**
```bash
cd companion-repo/portal
npx vitest run src/test/exercises/  # run all available exercise tests
```

**Test matrix (`-complete` branches only):**

| Branch | Test Files Present | Expected Result |
|--------|-------------------|-----------------|
| level-02-complete | L01, L02 | ALL PASS |
| level-03-complete | L01, L02, L03 | ALL PASS |
| level-04-complete | L01-L04 | ALL PASS |
| level-05-complete | L01-L05 | ALL PASS |
| level-06-complete | L01-L06 | ALL PASS |
| level-07-complete | L01-L07 | ALL PASS |
| level-08-complete | L01-L08 | ALL PASS |
| level-09-complete | L01-L09 | ALL PASS |

**Pass:** Every test on every branch passes.
**Fail action:** Investigate. Either the test expectations are wrong (update test)
or the source code doesn't match (update source). Cross-reference with guides to
determine which is authoritative.
**Ship-blocking:** YES — broken exercise tests = broken learning experience.
**Risk:** HIGH — these tests have NEVER been run. Dynamic imports (`await import('@/...')`)
may fail. Centavos/pesos mismatches are likely.

### Tier 1.5 — Unit & Component Tests

**What:** `vitest run` (all tests) on branches that have inline test files.
**Why:** Validates component rendering, utility functions, accessibility assertions,
MSW integration in test environment.
**Branches:** `-complete` branches from L06-complete onward (where component/unit
tests appear). L09-complete is the comprehensive run since it has all test files.
`-start` branches skip this — same test files as previous -complete.
**Command:**
```bash
cd companion-repo/portal && npx vitest run
cd companion-repo/public-site && npx vitest run  # L09+ only
```
**Pass:** All tests pass. Zero failures.
**Fail action:** Fix test or source code. MSW `onUnhandledRequest: 'error'` may cause
cascading failures if handler paths are wrong — fix handlers first.
**Ship-blocking:** YES

### Tier 1.6 — ESLint

**What:** `npx eslint .` with `strictTypeChecked` preset.
**Why:** Code quality gate. This is teaching material — every line teaches a pattern.
Sloppy code teaches sloppy habits. Banking-specific rules (no eval, no any, strict
boolean expressions) enforce security discipline.
**Branches:** L09-complete first (most comprehensive `-complete` branch). If clean,
spot-check L05-complete and L03-complete. `-start` branches skip — same code.
**Command:**
```bash
cd companion-repo/portal && npx eslint .
```
**Pass:** Zero errors. Warnings acceptable (react-refresh single-export, etc.)
**Fail action:** Fix errors. `strict-boolean-expressions` is the likely culprit for
most findings — change `if (value)` to `if (value != null)`.
**Ship-blocking:** ERRORS only. Warnings are informational.
**Risk:** HIGH — `strictTypeChecked` on 15 branches is aggressive. May produce many
findings. Budget extra time.

### Tier 1.7 — Security & Hygiene

**What:** A sweep for things that would be embarrassing or dangerous in a banking
training context.
**Why:** Mark's job depends on this. EWB is not ready for visible AI involvement.
The code is teaching security patterns to bank developers — it must be spotless.

**Checks:**

| Check | Command/Method | Pass Criteria |
|-------|---------------|---------------|
| npm audit | `npm audit --audit-level=high` | No high/critical vulnerabilities |
| AI traces in commits | `git log --all --grep="claude\|anthropic\|AI\|generated\|copilot" -i` | Zero matches |
| AI traces in code | `grep -ri "claude\|anthropic\|co-authored\|generated by\|chatgpt\|copilot" src/` | Zero matches |
| Hardcoded secrets | `grep -ri "password.*=\|secret.*=\|token.*=\|api.key" src/ --include="*.ts" --include="*.tsx"` | Only in types/schemas, never actual values |
| TODO/FIXME in code | `grep -rn "TODO\|FIXME\|HACK\|XXX" src/` | Only intentional exercise placeholders |
| console.log in source | `grep -rn "console\." src/ --include="*.ts" --include="*.tsx" --exclude="*.test.*"` | Only allowed patterns (DEV guards, MSW debug) |
| .env files committed | `git ls-files "*.env" ".env*"` | Only `.env.example` — never `.env` or `.env.local` |
| No binary blobs | Check for large files, images, etc. that shouldn't be in repo | Clean |

**Ship-blocking:** AI traces = ABSOLUTE BLOCKER. Security vulnerabilities = case-by-case.
TODOs/console.logs = acceptable if intentional.

### Tier 1.8 — Cross-Branch Consistency

**What:** Verify config files are identical across branches. Verify file count
increases monotonically.
**Why:** A trainee switching branches should never encounter a broken config.
Config drift means one branch's tests work differently than another's.

**Files that MUST be identical across all 15 buildable branches:**
- `package.json`
- `package-lock.json`
- `tsconfig.json`
- `tsconfig.app.json`
- `tsconfig.node.json`
- `vite.config.ts`
- `vitest.config.ts`
- `eslint.config.js`
- `tailwind.config.ts` (if it exists)
- `.env.example`
- `index.html`

**Command:**
```bash
for config in package.json tsconfig.json vite.config.ts vitest.config.ts eslint.config.js; do
  echo "=== $config ==="
  for branch in level-02-complete ... level-09-complete; do
    git rev-parse "$branch:companion-repo/portal/$config" 2>/dev/null
  done | sort -u | wc -l  # MUST be 1
done
```

**Pass:** Each config has exactly 1 unique blob hash across all branches.
**Fail action:** Identify the divergent branch, copy the canonical version, commit.
**Ship-blocking:** YES for package.json, tsconfig, vitest.config. NO for cosmetic configs.

---

## Pass 2: Browser Functional Testing

> Uses Claude Preview MCP tools: `preview_start`, `preview_screenshot`,
> `preview_click`, `preview_fill`, `preview_console_logs`, `preview_network`

### Tier 2.1 — Dev Server Boot

**What:** Start `npm run dev` and verify the app loads without crashes.
**Why:** The prior runtime report found a CRITICAL white-screen-of-death bug from
Azure Insights. We need to verify the fix holds and no new boot crashes exist.
**Branches:** L02-complete, L05-complete, L08-complete, L09-complete

**Steps per branch:**
1. `preview_start` with `npm run dev`
2. `preview_screenshot` — verify login page renders (not white screen)
3. `preview_console_logs` — verify zero errors, MSW "[MSW] Mock API enabled" message
4. `preview_network` — verify no failed requests on initial load

**Pass:** App renders. Console clean. MSW bootstrapped.
**Ship-blocking:** YES — if the app doesn't boot, trainees can't learn.

### Tier 2.2 — Authentication Flow

**What:** Walk through the complete login → MFA → dashboard flow.
**Why:** Authentication is the FIRST thing a trainee sees. If it's broken, they're
stuck on page one.
**Branches:** L05-complete (first branch with full auth), L09-complete

**Steps:**
1. Navigate to `/` — verify redirect to `/login`
2. Submit empty form — verify validation errors appear
3. Fill credentials — submit — verify MFA prompt appears (or login succeeds if MSW handles it)
4. Complete MFA — verify redirect to dashboard
5. Verify dashboard renders with account data from MSW
6. Screenshot each step

**Pass:** Full flow completes. Dashboard shows mock account data.
**Fail action:** Check MSW handlers, auth store, route guards. If MSW browser worker
isn't set up, this is a CRITICAL infrastructure gap that blocks ALL browser testing.
**Ship-blocking:** YES

### Tier 2.3 — Core Banking Flows

**What:** Test the primary user journeys a trainer would demo.
**Why:** The trainer will demo these live. If they break mid-demo, it's catastrophic.
**Branch:** L09-complete (has all features)

**Flows to test:**

| Flow | Steps | Key Assertions |
|------|-------|----------------|
| Account overview | Dashboard → Account list | Cards render with formatted balances (₱ symbol, commas, 2 decimals) |
| Account detail | Click account → transactions | Transaction list renders, amounts formatted, pagination works |
| Transfer | Transfers → Fill form → Confirm | Form validation, confirmation dialog, success receipt |
| Payment wizard | Payments → Search biller → Details → Review → Confirm | Multi-step wizard, biller search with ARIA, receipt from mutation |
| Consent management | Settings → Privacy | Toggle switches, required consent locked |
| Role-based access | Navigate to admin route as customer | RoleGuard blocks, redirects to /unauthorized |
| Error handling | Navigate to /nonexistent | 404 page renders with recovery link |
| Session | Idle timeout simulation | Session warning dialog appears |

**Per-flow:**
1. Screenshot at each step
2. `preview_console_logs` — zero errors
3. `preview_network` — all requests intercepted by MSW, no 404s/500s

**Pass:** All flows complete without errors. Screenshots document each step.
**Fail action:** Fix the specific component/hook/handler. Cross-reference with guide.
**Ship-blocking:** YES for auth, accounts, transfers. NO for edge cases (session timeout).

### Tier 2.4 — Currency & Formatting Verification

**What:** Verify all monetary amounts display correctly throughout the app.
**Why:** This is a BANKING app. A formatting bug (showing centavos instead of pesos,
missing ₱ symbol, wrong decimal places) would be immediately noticed and deeply
embarrassing. The centavos convention (₱100.50 = 10050 internally) is a core teaching
point — if the UI shows "10050" instead of "₱100.50", the lesson fails.
**Branch:** L09-complete

**Checks:**
- Account balances on dashboard cards
- Account balance on detail page
- Transaction amounts in list
- Transfer amount in confirmation
- Payment amount in review/receipt
- CurrencyDisplay component output

**Pass:** All amounts show PHP format: `₱XX,XXX.XX`
**Ship-blocking:** YES

### Tier 2.5 — Public Site (Next.js)

**What:** Verify the public-facing site renders correctly.
**Why:** L09 guides teach SSR/Next.js. The public site is the capstone project.
**Branch:** L09-complete

**Steps:**
1. Start public-site dev server
2. Test routes: `/`, `/products`, `/products/savings-account`, `/rates`
3. Verify: hero renders, product cards show, exchange rate table renders
4. Check footer for BSP/PDIC regulatory text
5. Screenshot each page

**Pass:** All pages render. Graceful fallback when API data unavailable (mock data
or empty state with explanation).
**Fail action:** If pages show blank content, implement dev-mode fallback data per
the existing test plan's Phase 3 recommendation.
**Ship-blocking:** NO for empty states (API not available). YES for crashes.

### Tier 2.6 — Responsive & Accessibility Spot-Check

**What:** Quick viewport resize test and basic accessibility verification.
**Why:** Banking apps must meet WCAG 2.1 AA. The curriculum teaches accessibility
patterns — the app should demonstrate them.
**Branch:** L09-complete

**Checks:**
- `preview_resize` to mobile viewport (375x812) — verify layout doesn't break
- `preview_resize` to tablet viewport (768x1024) — verify responsive behavior
- Screen reader landmarks: main, nav, headings hierarchy
- Form labels: all inputs have visible labels or aria-label
- Color contrast: key text meets 4.5:1 ratio

**Pass:** No layout breaks. Major accessibility landmarks present.
**Ship-blocking:** NO (nice-to-have polish), but document issues for future fix.

---

## Pass 3: Curriculum Integrity

### Tier 3.1 — Student Path Validation (Start → Complete Diff)

**What:** For each of the 9 levels, diff the `-start` vs `-complete` branch and
verify every changed file is addressed in the corresponding guide(s).
**Why:** This IS the teaching contract. If the diff contains files the guide never
mentions, the student has no way to know they need to create/modify those files.
If the guide references files not in the diff, the instructions are dead.

**Method per level:**
```bash
git diff --stat level-XX-start..level-XX-complete -- companion-repo/portal/src/
```

**For each changed file, verify:**
1. The guide explicitly tells the student to create or modify this file
2. The guide shows the correct file path
3. The guide's code snippet matches the file content on -complete
4. The guide's instructions, when followed in order, produce the complete file

**Red flags:**
- File in diff but NOT in guide = **undocumented dependency** (student gets stuck)
- File in guide but NOT in diff = **dead instruction** (student does unnecessary work)
- File in diff with changes not covered by guide = **partial instruction** (student
  gets a different result than expected)

**Pass:** Every file in every diff is documented in the corresponding guide(s).
Zero undocumented dependencies.
**Fail action:** Either add the missing file to the guide, or add it to the -start
branch so the student already has it.
**Ship-blocking:** YES for undocumented dependencies. NO for minor omissions in
already-existing files.

### Tier 3.2 — Progressive Import Chain Validation

**What:** On each `-start` branch, verify that ALL imports in existing files resolve
to files that exist on that branch.
**Why:** When a student checks out `level-05-start`, they should be able to compile
and run the project BEFORE writing any new code. If an existing file imports
something that doesn't exist yet (because it's part of the Level 5 exercise), the
project is broken out of the box.

**Method:**
```bash
# On each -start branch, extract all import paths and verify each target exists
grep -rh "from '@/" companion-repo/portal/src/ | sed "s/.*from '@\///" | sed "s/'.*//" | sort -u
# Then check each path resolves to an existing .ts/.tsx file
```

**Pass:** Zero unresolved imports on any -start branch.
**Fail action:** Either add a stub/placeholder file to the -start branch, or
restructure the imports so they don't reference future files.
**Ship-blocking:** YES — a broken -start branch means the student can't even begin.

### Tier 3.3 — Exercise Test Contract Verification

**What:** Verify that exercise test files appear on the correct branches and test
the right things.
**Why:** Tier 1.4 runs the tests. This tier verifies the TEST DESIGN is correct.

**Verify per level:**
1. `level-XX.test.ts` does NOT exist on `level-XX-start` (student hasn't earned it)
2. `level-XX.test.ts` DOES exist on `level-XX-complete` (solution is available)
3. The test imports modules that exist on the -complete branch
4. The test assertions match what the guide teaches (e.g., if guide says `formatPHP`
   takes centavos, the test should pass centavos not pesos)

**Pass:** Test files appear on correct branches. Test expectations match guide content.
**Ship-blocking:** YES

### Tier 3.4 — Guide Prerequisite Chain

**What:** Verify that each level's guides only reference concepts, APIs, and patterns
taught in previous levels (or the current level's earlier guides).
**Why:** A Level 5 guide that casually uses a Level 7 concept leaves the student
confused and unable to follow along.

**Method:** For each guide, scan for:
- Import paths that reference features from later levels
- API patterns not yet introduced
- Components not yet created
- Libraries not yet explained

**Pass:** No forward references.
**Ship-blocking:** NO for minor references. YES if a guide is fundamentally
incomprehensible without later material.

---

## Ship Readiness Checklist

Run once after all three passes complete.

| # | Check | Method | Blocker? |
|---|-------|--------|----------|
| 1 | No AI traces in git history | `git log --all --oneline` scan | YES |
| 2 | No AI traces in source code | grep across all branches | YES |
| 3 | README.md is accurate and complete | Manual review on master | YES |
| 4 | .env.example documents all env vars | Compare with env.ts schema | YES |
| 5 | npm audit clean (no high/critical) | `npm audit --audit-level=high` | YES |
| 6 | No .env files committed | `git ls-files` check | YES |
| 7 | No hardcoded credentials | grep for password/secret/token assignments | YES |
| 8 | Branch names are consistent | `git branch -a` review | NO |
| 9 | QA screenshots saved | `qa/screenshots/` directory | NO |
| 10 | This QA plan + results documented | `qa/final-qa-results.md` | YES |

---

## GO / NO-GO Decision Framework

### GO (proceed to Option C):
- Pass 1 Tiers 1.1-1.5: ALL GREEN (deps, tsc, build, exercise tests, unit tests)
- Pass 1 Tier 1.7: No AI traces, no security issues
- Pass 2 Tiers 2.1-2.4: App boots, auth works, core flows work, currency correct
- Pass 3 Tier 3.1: No undocumented dependencies in start→complete diffs
- Ship Readiness Checklist items 1-7: All clear

### NO-GO (fix first):
- ANY branch fails to compile (tsc)
- ANY exercise test fails on its -complete branch
- App crashes on boot (white screen)
- Authentication flow broken
- Currency amounts display incorrectly
- AI traces found anywhere
- Undocumented files in start→complete diffs (student gets stuck)

### CONDITIONAL GO (ship with known issues):
- ESLint warnings (not errors)
- Public site empty states without mock data
- Responsive layout minor issues
- Accessibility findings (document for future fix)
- Guide prerequisite minor forward references

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Exercise tests fail due to centavos/pesos mismatch | HIGH | CRITICAL | Cross-ref test expectations with guide's centavos convention |
| TypeScript errors on intermediate branches | HIGH | HIGH | Fix per-branch, re-run tsc |
| MSW browser worker not set up | MEDIUM | CRITICAL | If missing, implement per existing test-plan.md Phase 2 |
| strictTypeChecked ESLint produces 100+ findings | HIGH | MEDIUM | Fix errors, accept warnings, don't block ship on lint-only |
| npm audit finds vulnerabilities in deps | MEDIUM | HIGH | Evaluate each CVE — training repo may accept lower bar |
| Lock file generated with different npm version | LOW | HIGH | Regenerate with Node 22 npm, commit |
| Dynamic imports in exercise tests fail | MEDIUM | HIGH | Check vitest.config.ts path alias, fix resolver |
| AI traces in older commits | MEDIUM | CRITICAL | Rewrite history if needed (last resort) or ensure only clean commits push |

---

## Execution Order

1. **Pass 1 first** — if the code doesn't compile, Passes 2 and 3 are moot
2. **Within Pass 1**: Tier 1.1 (deps) → 1.2 (tsc) → 1.3 (build) → 1.4 (exercise tests) → 1.5 (unit tests) → 1.6 (eslint) → 1.7 (security) → 1.8 (consistency)
3. **Pass 2 after Pass 1 is green** — can't test in browser if it doesn't build
4. **Pass 3 can run in parallel with Pass 2** — it's mostly diff analysis and guide reading
5. **Ship Readiness Checklist after all passes complete**

---

## Documentation Deliverables

After QA completes, the following artifacts will exist in `qa/`:

| File | Content |
|------|---------|
| `final-qa-plan.md` | This document |
| `final-qa-results.md` | Pass/fail results for every tier on every branch |
| `screenshots/` | Browser screenshots from Pass 2 |
| `exercise-test-matrix.md` | Actual test results per branch (pass/fail/skip) |

These artifacts serve as proof of testing for Mark's stakeholders and as a baseline
for future regression testing.
