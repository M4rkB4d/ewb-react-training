# Guide vs Branch Cross-Reference Audit — Full Findings

Generated: 2026-03-16
Audited: 37 guides across 9 levels, 18 branches of companion code
Method: audit-reviewer subagents reading extracted guides + branch code on disk

---

## Totals (All Levels 01-09 — COMPLETE)

| Severity | Count |
|----------|-------|
| CRITICAL | 17 |
| HIGH | 33 |
| MEDIUM | 42 |
| LOW | 26 |
| **TOTAL** | **118** |

Note: Deduplicated across 6 audit agents (overlap on Levels 01-03 and 07-08).

---

## CRITICAL Findings (11)

### C01. Balance test values — pesos vs centavos (Level 02 / A05)
- **Guide**: `balance={150000}` asserts `'₱150,000.00'` (treats as pesos)
- **Code**: `account-card.tsx` divides by 100 (treats as centavos) — would render `₱1,500.00`
- **Impact**: Guide's "14 tests pass" claim is false against real code
- **Fix**: Update A05 tests to use centavo values (`balance={15_000_000}`)

### C02. CardTitle color token (Level 03 / A06)
- **Guide**: `text-gray-900`
- **Code**: `text-ewb-navy` in `card.tsx`
- **Impact**: Visual mismatch when student copies guide code
- **Fix**: Update guide to `text-ewb-navy`

### C03. Badge/Alert success colors — ewb-lime vs emerald (Level 03 / A06)
- **Guide**: `bg-ewb-lime-100 text-ewb-lime-700` (Badge), `border-ewb-lime-200 bg-ewb-lime-50` (Alert)
- **Code**: `bg-emerald-50 text-emerald-700` (Badge), `border-emerald-200 bg-emerald-50` (Alert)
- **Impact**: Systemic color token mismatch across both components
- **Fix**: Update guide to use `emerald` tokens

### C04. ProtectedRoute pattern conflict (Level 04-05 / B02 → B04)
- **Guide B04**: Instructs students to replace B02's Outlet-based ProtectedRoute with children-prop version
- **Code**: Retains Outlet pattern from B02
- **Impact**: Students who follow B04 will diverge from live code
- **Fix**: B04 should note companion repo retains Outlet pattern

### C05. useAuthStore.getState() vs useAuthStore() (Level 05 / B04)
- **Guide**: `useAuthStore.getState()` for destructuring actions
- **Code**: `useAuthStore()` (subscribes to all store changes)
- **Impact**: Semantically different; contradicts guide's own best-practice note
- **Fix**: Align to one pattern consistently

### C06. usePasskeySupport — never calls the async check (Level 05 / A12)
- **Guide**: Async hook calling `isUserVerifyingPlatformAuthenticatorAvailable()`
- **Code**: Synchronous check that only tests API existence
- **Impact**: False positive `isSupported` on desktops without biometrics — exactly what the guide warns against
- **Fix**: Update branch code to match guide's async pattern

### C07. ConsentManager purpose enum downgraded (Level 07 / A17)
- **Guide**: `z.enum(['essential', 'analytics', 'marketing', 'data-sharing', 'biometric', 'location'])`
- **Code**: `z.string()` — accepts any arbitrary string
- **Impact**: Defeats DPA compliance validation the guide teaches
- **Fix**: Restore `z.enum()` in branch code

### C08. ConsentManager missing purposes (Level 07 / A17)
- **Guide**: 6 purposes including `data-sharing` and `location`
- **Code**: Only 4 purposes rendered (missing data-sharing, location)
- **Impact**: BSP 1122 Open Finance requirement not met; students see 4 toggles instead of 6
- **Fix**: Add missing purposes to component

### C09. Payment API method name (Level 08 / B09)
- **Guide**: `paymentApi.submitPayment(request)`
- **Code**: `paymentApi.submit()` — method doesn't exist as named
- **Impact**: Runtime TypeError for students following guide
- **Fix**: Update guide to `paymentApi.submit(request)`

### C10. SSE auth — token in URL vs HttpOnly cookies (Level 08 / A19)
- **Guide**: Explicit security guidance: "NEVER pass tokens as query parameters", uses `withCredentials: true`
- **Code**: Reads token from Zustand and appends as URL query parameter
- **Impact**: Branch contradicts guide's banking security requirement
- **Fix**: Update branch to use cookie-based auth

### C11. WebSocket auth — token in sub-protocol vs cookies (Level 08 / A19)
- **Guide**: "NEVER pass tokens in sub-protocols", creates `new WebSocket(url)` with no token
- **Code**: `new WebSocket(url, [\`auth-${token}\`])` — passes token in sub-protocol
- **Impact**: Branch does exactly what guide bans for banking apps
- **Fix**: Update branch to cookie-based auth

### C12. createMoney missing integer validation (Level 08 / A18)
- **Guide**: `Number.isInteger()` guard that throws if centavo value is not integer
- **Code**: No validation — accepts any number silently
- **Impact**: Non-integer centavos pass through, violating the money-handling principle the guide teaches
- **Fix**: Add integer validation to branch code

### C13. tsconfig @/ path alias relies on Next.js plugin (Level 09 / A21)
- **Code**: `paths: { "@/*": ["./src/*"] }` but `app/` files import `@/lib/env` — works only via Next.js plugin
- **Impact**: Plain `tsc --noEmit` fails; students debugging type errors won't understand why
- **Fix**: Guide should note Next.js-specific resolution, or add `"./*"` to paths array

### C14. clientEnv ZodError thrown outside try/catch in server components (Level 09 / A22)
- **Code**: `rates-summary.tsx` wraps `fetch` in try/catch, but `clientEnv.NEXT_PUBLIC_API_URL` access happens before the try block and can throw ZodError
- **Impact**: Uncaught schema validation crash in production if env var missing
- **Fix**: Move clientEnv access inside try block, or use safeParse with fallback

### C15. RateAlertSchema test doesn't match actual API route (Level 09 / A22)
- **Code**: Test uses `{ email, productId, threshold }`; actual API route uses `{ email, currency, targetRate, direction }`
- **Impact**: Test passes but validates a completely different schema — false confidence
- **Fix**: Update test schema to match `app/api/rate-alerts/route.ts`

### C16. RoleGuard API mismatch — allowedRoles[] vs requiredRole (Level 04 / B02)
- **Guide B02**: Teaches `RoleGuard` with `allowedRoles: Array<Role>` and `allowedRoles.includes(user.role)`
- **Code**: No RoleGuard exists on level-04 at all. On level-05+, uses `requiredRole: Role` (single value) + `hasMinimumRole()` (hierarchical)
- **Impact**: Student copies B02 snippet → completely different interface from what codebase expects
- **Fix**: Rewrite B02 to teach `requiredRole` from the start, or add stub to level-04

### C17. formatPeso / format-currency.ts doesn't exist (Level 05 / B03)
- **Guide B03**: References `import { formatPeso } from '@/lib/format-currency'` throughout
- **Code**: Function is `formatPHP` at `src/lib/format.ts` — no `formatPeso` or `format-currency.ts` anywhere
- **Impact**: Module-not-found error on every import the guide shows
- **Fix**: Replace all B03 references with `formatPHP` from `@/lib/format`

---

## HIGH Findings (28)

### H01. test/setup.ts missing MSW lifecycle (Level 02 / A05)
Guide shows single-line setup; actual includes MSW server start/stop/cleanup.

### H02. env.ts schema completely different (Level 02 / B01b)
Guide validates passkeys/biometrics/timeout; actual validates Sentry/AppInsights/version.

### H03. Input component — useId() vs label-based ID (Level 03 / A06)
Guide teaches React useId(); actual derives ID from label string.

### H04. ConfirmationDialog early-return bug (Level 03 / A08)
Guide uses `if (!isOpen) return null` causing null ref on first open; actual always renders dialog.

### H05. ConfirmationDialog missing aria-labelledby (Level 03 / A08)
Guide includes `aria-labelledby`; actual omits it (accessibility regression).

### H06. AFASA timeline hardcoded date (Level 01 / A03)
"We are here" points to March 2026 — will become stale.

### H07. refreshPromise mutex missing from api-client (Level 05 / B03)
Guide explains refresh token race condition prevention; actual code has no mutex.

### H08. passkey-api.ts missing withCredentials (Level 05 / A12)
Guide says `withCredentials: true` needed for unauthenticated requests; actual omits it.

### H09. global-error-handlers.ts — unconditional preventDefault (Level 06 / A13)
Guide conditionally suppresses in production only; actual suppresses everywhere (hides dev errors).

### H10. monitoring.ts missing Sentry integrations (Level 06 / B06)
Guide includes browserTracingIntegration + replayIntegration; actual omits integrations array entirely.

### H11. use-login.ts post-login redirect (Level 05 / B04)
Guide navigates to `/dashboard`; actual falls back to `/`.

### H12. Auth store path — feature-scoped vs flat (Level 04 / A09)
Guide shows `features/auth/stores/auth-store.ts`; actual is `stores/auth-store.ts`.

### H13. Compliance dashboard — ewb-lime vs emerald (Level 07 / A16)
Same systemic color token mismatch as C03, in compliance-dashboard.tsx.

### H14. ConsentManager not wired into settings page (Level 07 / A17)
Component exists but settings.tsx was a stub (fixed in previous session for level-05, but check level-07).

### H15. compliance/evidence-types.ts missing (Level 07 / A16)
Guide describes evidence infrastructure; no files exist on branch.

### H16. compliance.test.ts missing + buggy raw import (Level 07 / A16)
Guide shows test file with incorrect `?raw` import pattern; file doesn't exist.

### H17. Dockerfile + nginx.conf missing (Level 07 / B07)
Guide describes Docker deployment in detail; no artifacts on branch.

### H18. Payment receipt architecture differs (Level 08 / B09)
Guide passes receipt as props; branch stores in Zustand and reads from store.

### H19. Payment schema export name differs (Level 08 / B09)
Guide uses `paymentReceiptSchema`; branch exports `paymentSchema`. Exercise test expects latter.

### H20. ICU plural syntax broken in en-US.json (Level 08 / B08)
Branch has doubled minute count: `{minutes} {minutes, plural, ...}`.

### H21. SSE payload — no Zod validation (Level 08 / A19)
Guide teaches Zod safeParse; branch does `JSON.parse(event.data)` with direct cast.

### H22. WebSocket payload — no Zod validation (Level 08 / A19)
Guide teaches Zod safeParse; branch casts `data as { accountId: string }`.

### H23. Adaptive polling — JSON.stringify vs timestamp (Level 08 / A19)
Guide uses expensive JSON.stringify comparison; branch uses cleaner dataUpdatedAt. Guide should match branch.

### H24. LoginForm test passes non-existent onSubmit prop (Level 04 / A10)
Guide test renders `<LoginForm onSubmit={handleSubmit} />`; actual component has no such prop.

### H25. Next.js 16 version claim (Level 09 / A21)
Guide consistently references "Next.js 16" throughout. As of knowledge cutoff, Next.js 15 was current stable. May be forward-looking but misleads students who try to verify.

### H26. ICU plural syntax broken in fil-PH.json (Level 08 / B08)
Same doubled-interpolation bug as H20, also in Filipino locale file line 32.

### H27. Route Handler revalidation vs Server Component ISR (Level 09 / A22)
`app/api/rates/route.ts` uses `next: { revalidate: 30 }` inside a Route Handler — this doesn't work the same as in Server Components. Guide should clarify the fetch chain and caching differences.

### H28. Redis module-level serverEnv access defeats lazy validation (Level 09 / A23)
`redis.ts` calls `serverEnv.REDIS_URL` at module load time, causing synchronous crash if env var missing — defeats the lazy validation pattern `env.ts` was designed to provide.

### H29. BeneficiaryForm uses non-existent `bg-ewb-blue-600` token (Level 03 / A07)
`beneficiary-form.tsx` line 149 uses `bg-ewb-blue-600` and `hover:bg-ewb-blue-700` — but `ewb-blue` is not defined in the theme (only ewb-purple, ewb-magenta, ewb-gold, ewb-lime, ewb-navy). Button renders with no background — effectively invisible.

### H30. CSS `--color-success` token teaches WCAG-failing value (Level 02 / B01)
Guide teaches `--color-success: var(--color-ewb-lime)` but branch overrides to `#059669` (emerald-600) with comment "lime fails WCAG on white". Guide is teaching students to set up a design token that fails accessibility.

### H31. Auth store A09 "simplified" version vs level-04 branch full store (Level 04 / A09)
Guide teaches stripped-down auth store (user, accessToken, isAuthenticated only). Level-04 branch already has full production store (status, mfaToken, mfaMethods, etc). Student following A09 overwrites the real store with incomplete one, breaking level-04 exercises.

### H32. SidebarNav active state colors mismatch (Level 04 / B02)
Guide teaches `bg-ewb-purple-100 text-ewb-purple-700` (light treatment). Actual code uses `bg-ewb-purple-700 text-ewb-gold-300` (dark background with gold text). Completely different visual output.

### H33. A13 ErrorBoundary fallback API differs (Level 06 / A13)
Guide's function fallback signature: `(error: Error, reset: () => void) => ReactNode`. Actual code: `(error: Error) => ReactNode` (no reset). Student using guide's API gets TypeScript error.

---

## MEDIUM Findings (27)

### M01. Vitest test imports — globals vs explicit (Level 02 / A05)
### M02. "14 tests" count outdated (Level 02 / A05)
### M03. Barrel export incomplete in ui/index.ts (Level 03 / A06)
### M04. maskPhone formatting differs (Level 03 / A07)
### M05. MaskedValue variable names/wrapper element differ (Level 03 / A07)
### M06. ConfirmationDialog aria-labelledby in branch (Level 03 / A08)
### M07. clsx/tailwind-merge not in initial install command (Level 02 / B01)
### M08. Account/Transaction type file paths differ (Level 01 / A02)
### M09. MSW handlers exact paths vs wildcards (Level 04 / A10)
### M10. usePasskeyRegister file missing from branch (Level 05 / A12)
### M11. RouteErrorBoundary Link vs Button (Level 04 / B02)
### M12. React Compiler plugin config not shown (Level 06 / B05)
### M13. SessionWarningDialog native dialog vs div overlay (Level 05 / B04)
### M14. useAuthInit deps — getState() vs hook (Level 05 / B04)
### M15. test/setup.ts missing cleanup() (Level 04 / A10)
### M16. sanitize.ts amountSchema — centavos vs pesos model (Level 07 / A15)
### M17. DataAccessRequest text-success undefined token (Level 07 / A17)
### M18. DocumentUpload hardcoded ID vs useId() (Level 07 / A17)
### M19. audit-service.ts comment differences (Level 07 / A16)
### M20. B07 "What Comes Next" link ordering (Level 07 / B07)
### M21. bsp-controls.ts stub only 3 entries (Level 07 / A16)
### M22. BillerSearch missing debounce (Level 08 / B09)
### M23. BillerSearch ARIA roles dropped (Level 08 / B09)
### M24. PaymentForm missing htmlFor/id on biller fields (Level 08 / B09)
### M25. CurrencyDisplay CSS class + missing aria-label (Level 08 / B08)
### M26. PaymentReceipt ewb-lime vs emerald (Level 08 / B09)
### M27. consent/types.ts const-array vs union type (Level 07 / A17)
### M28. use-idle-timeout.ts vs use-session-timeout.ts (Level 07 / A15)
Guide references `src/features/auth/hooks/use-idle-timeout.ts`; actual hook is `src/hooks/use-session-timeout.ts` (different path and name).
### M29. RequireRole component path mismatch (Level 07 / A15)
Guide shows `src/features/auth/components/require-role.tsx`; actual is `src/components/auth/role-guard.tsx`.
### M30. security-logger.ts missing (Level 07 / A15)
Guide references `src/lib/security-logger.ts`; closest actual file is `src/lib/error-logger.ts`.
### M31. post-message-handler.ts missing (Level 07 / A15)
Guide references safe postMessage handling file; doesn't exist on branch.
### M32. B10 rate-limit.ts missing crypto import (Level 09 / B10)
Guide code block omits `import crypto from 'node:crypto'`; actual file has it. Guide snippet won't compile.
### M33. A22 revalidate vs cache clarification (Level 09 / A22)
Guide sets `next: { revalidate: 3600 }` without explicit `cache` — would benefit from one-line clarification that revalidate implies caching.

### M34. error.tsx placeholder logging (Level 09 / A22)
`app/rates/error.tsx` uses `console.error` with comment "Log to Application Insights (from B06)" but no actual SDK call. Guide should mark as placeholder.

### M35. generateStaticParams clientEnv throw risk (Level 09 / A22)
`app/products/[slug]/page.tsx` calls `clientEnv` inside `generateStaticParams` — ZodError can throw before the catch block's fetch. Should access `process.env` directly.

### M36. LoanCalculator no formula correctness test (Level 09 / A22)
Test only checks "monthly payment text exists" — never asserts the actual calculated value. For a banking app, an incorrect formula would be a significant teaching error.

### M37. RootLayout lang="en" vs en-PH (Level 09 / A21)
`<html lang="en">` but footer uses `en-PH` locale. For a Filipino banking app, should use `lang="en-PH"` or discuss in guide.

### M38. AccountCard component doesn't exist in level-02 branch (Level 02 / A04)
A04 teaches building `account-card.tsx` but the level-02 branch has `account-dashboard.tsx` and `transaction-history.tsx` instead. Students can't find reference implementation.

### M39. B04/B05 page paths use `-page` suffix that doesn't exist (Level 05-06 / B04, B05)
Guide router snippets reference `'./pages/dashboard-page'`, `'./pages/accounts-page'`. Actual files are `@/pages/dashboard`, `@/pages/accounts` (no suffix). Module-not-found errors.

### M40. A10 test asserts button text `/processing/i` but actual shows "Signing in..." (Level 04 / A10)
Test regex will never match the actual button text, causing false test failure.

### M41. useAccounts query key breaks optimistic updates (Level 04 / A09)
Guide uses `['accounts']` but actual uses `accountKeys.lists()` → `['accounts', 'list']`. The `getQueryData(accountKeys.all)` call in optimistic update returns `undefined`, silently breaking snapshot/rollback.

### M42. B03 query-client retry checks `error instanceof ApiError` but errors are raw Axios (Level 05 / B03)
Retry condition never matches because interceptor doesn't wrap errors as ApiError before they reach TanStack Query.

---

## LOW Findings (19)

### L01. React Compiler "separate" wording (Level 01 / A01)
### L02. PinInput useRef-in-array comment (Level 03 / A04)
### L03. B01 Vitest version "4.x" doesn't exist (Level 02 / B01)
### L04. vitest-axe package version pin (Level 03 / A06)
### L05. A01 Axios forward reference (Level 01 / A01)
### L06. auth-api.ts revokeSession conceptual only (Level 05 / A11)
### L07. format-currency.ts vs currency.ts filename (Level 05 / B03)
### L08. Account type import path in test factory (Level 06 / A14)
### L09. Sentry.setUser in use-login.ts illustrative (Level 06 / B06)
### L10. csp-report.ts stub clarification (Level 07 / A15)
### L11. Docker node/nginx versions (Level 07 / B07)
### L12. ESLint .eslintrc.cjs deprecated format (Level 07 / A16)
### L13. A17 next guide link wording (Level 07 / A17)
### L14. zodResolver `as any` cast not in guide (Level 08 / B09)
### L15. DI factory pattern illustrative note (Level 08 / A18)
### L16. intl-provider.tsx non-null assertion (Level 08 / B08)
### L17. use-live-balance.ts import path (Level 08 / A19)
### L18. B03 logging interceptor — console.info vs logger.debug (Level 05 / B03)
### L19. A05 balance test default props (Level 02 / A05)
### L20. createMoney comment example values differ (Level 08 / A18)
Guide: "₱100.50 = 10050"; Code: "₱1,500.00 = 150000". Both correct, just inconsistent.
### L21. A21 create-next-app@latest vs version table (Level 09 / A21)
Command uses `@latest` but version table says "Next.js 16" — mildly confusing if 16 isn't current.
### L22. A22 serverEnv footnote with no code example (Level 09 / A22)
Guide suggests using `serverEnv.INTERNAL_API_URL` in production via comment but shows no implementation.
### L23. async cookies() API (Level 09 / B10)
Code uses `await cookies()` (Next.js 15+ async API). Guides should be consistent about this being a breaking change from Next.js 14.
### L24. Key Vault cache TTL undocumented (Level 09 / A23)
`keyvault.ts` uses 5-minute cache TTL with no explanation. Guide should note secret rotation propagation delay trade-off.
### L25. Tailwind v4 CSS syntax (Level 09 / A21)
Code uses `@import "tailwindcss"` (v4 syntax). If any guide shows v3 setup (`@tailwind base; @tailwind components;`), that's a mismatch.
### L26. Design system page not added to router (Level 03 / A06)
Guide creates `src/pages/design-system.tsx` but doesn't mention adding it to the router. Students can't navigate to it.

---

## Systemic Patterns

### Pattern 1: Color Token Drift (ewb-lime → emerald)
Affects: C03, H13, H29, H30, M25, M26
**Root cause**: `ewb-lime` fails WCAG contrast on white backgrounds. Branch CSS overrides `--color-success` to emerald-600, but guides still teach lime. Need bulk find-replace across all guide files AND fix the `--color-success` token definition in the B01 guide. Also fix the `bg-ewb-blue-600` in `beneficiary-form.tsx` (token doesn't exist at all).

### Pattern 2: Security Guidance vs Branch Code
Affects: C10, C11, H07, H08, H21, H22
The guides teach defense-in-depth (cookie auth, Zod validation, refresh mutexes). The branch code takes shortcuts. These are the highest-priority fixes because they undermine the curriculum's security teaching credibility.

### Pattern 3: Guide teaches best practice, branch takes shortcut
Affects: C06, H03, H04, M14, M18
Several cases where the guide teaches the correct React/a11y pattern but the branch code implements a simpler version. The guide should be the authority; branch should match.

### Pattern 4: Missing files on branch
Affects: H15, H16, H17, M10
Some guide-described files (evidence-types, compliance tests, Dockerfile, passkey register hook) don't exist on the branch at all.

### Pattern 5: Method/prop name mismatches
Affects: C09, H24, L07, L17
Direct naming differences that cause TypeScript/runtime errors for students.

---

## Recommended Fix Priority

### Tier 1 — Fix immediately (causes errors or security issues)
C01, C06, C07, C08, C09, C10, C11, C12, C14, C15, C16, C17, H07, H20, H21, H22, H24, H26

### Tier 2 — Fix soon (confusing mismatches that undermine teaching)
C02, C03, C04, C05, C13, H01, H02, H03, H04, H05, H08, H09, H10, H13, H18, H19, H27, H28, H29, H30, H31, H32, H33

### Tier 3 — Fix when touching those files (cosmetic/naming)
All MEDIUM and LOW findings

---

## Decision Needed: Fix Guides or Fix Branch Code?

For each finding, the fix could go either way. General principle:
- **If the guide teaches the CORRECT pattern**: Fix the branch code to match
- **If the branch code is BETTER**: Fix the guide to match
- **If they're just different**: Pick one and align both

Security findings (C10, C11, H07, H08, H21, H22): Fix the **branch code** — the guides teach the correct banking security patterns.

Color tokens (C03, H13, M25, M26): Fix the **guides** — emerald is the WCAG-compliant choice already in the code.

Missing files (H15, H16, H17): Add **stub files to branches** or mark as exercises in guides.
