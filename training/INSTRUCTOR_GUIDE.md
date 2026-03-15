# Instructor Guide

> **EastWest Bank — Digital Platforms & Innovations**
>
> For the trainer delivering the React Onboarding Program

---

## How This Training Works

The 13-day program uses a **read → practice → review** cycle each day:

1. **Morning**: Students read guides (2-3 per day, from Notion or markdown)
2. **Afternoon**: Exercises, quizzes, live demos
3. **End of day**: Quiz review, exercise check-in, Q&A

You have complete materials: 37 guides, 9 quiz sets, 9 exercise sets, 9 demo scripts, 9 slide outlines, and answer keys for everything.

---

## Companion Repo — Branch Strategy

The companion repo uses **level branches** so students see only the code relevant to their current level.

### Student Setup (Day 1)

```bash
git clone <repo-url> ewb-portal
cd ewb-portal
git checkout level-01-start
cd companion-repo/portal
npm install
npm run dev
```

### How Students Transition Between Levels

```bash
# After completing a level, compare work:
git diff level-01-start level-01-complete

# Move to next level:
git checkout level-02-start
npm install    # New dependencies may appear
npm run dev
```

### Branch Reference

| Branch | Purpose |
|--------|---------|
| `level-XX-start` | What students begin with — skeleton + previous level code |
| `level-XX-complete` | Reference implementation — what the code should look like after exercises |
| `main` | Everything: all code, all guides, all training materials |

### Exercise Tests

Students can validate their exercise work with automated tests:

```bash
npm run test:exercises:01    # Level 1 exercises
npm run test:exercises:02    # Level 2 exercises
# ... through 09
npm run test:exercises       # All levels
```

Tests start red and go green as students complete their implementations.

---

## Per-Level Teaching Notes

### Level 1 — Welcome (Day 1)

**Key concepts**: React mental model, TypeScript basics, compliance mindset

**Common misconceptions**:
- Students think TypeScript is a separate language. Clarify: it's a superset of JavaScript that adds types.
- Students think compliance is something added later. Emphasize: compliance shapes technical decisions from day one.

**Demo tip**: The currency formatter exercise is the hook — when students see `formatPHP(150_000)` render as `₱150,000.00`, they get their first "I built something real" moment.

**Watch for**: Students confused by `z.infer` vs regular TypeScript interfaces. Show both side by side.

---

### Level 2 — First App (Day 2)

**Key concepts**: Vite, components, JSX, first test

**Common stumbling points**:
- Vite dev server not starting: usually a port conflict or missing `npm install`
- Tailwind not working: check that `@import 'tailwindcss'` is in `index.css` (not the old `@tailwind` directives)
- First test failing: jsdom environment not configured in `vitest.config.ts`

**Demo tip**: Live-code a component from scratch. Let students see the feedback loop: save file → browser updates instantly.

**Pair programming**: The Transaction History component exercise works great as a pair exercise — one person types, one navigates.

---

### Level 3 — Building UI (Day 3)

**Key concepts**: Design system, forms, Zod validation, accessibility

**Common stumbling points**:
- React Hook Form + Zod resolver wiring: students often forget `@hookform/resolvers`
- Validation error display: students put errors above the form instead of next to each field
- Accessibility: students forget `aria-describedby` linking error messages to inputs

**Demo tip**: Show the design system page first, then reveal how each component is built. Top-down understanding helps.

**Critical teaching moment**: Show how Zod validation at the form level mirrors Zod validation at the API level (introduced in Level 5). This is the first hint of "validate at every boundary."

---

### Level 4 — State & Routing (Day 4)

**Key concepts**: Zustand, React Router, layout composition

**Common stumbling points**:
- Zustand selectors: students subscribe to the entire store instead of specific slices. Show the re-render difference with React DevTools.
- Nested routes: students confused by `<Outlet />` placement in layouts
- Testing stores: students try to render components instead of testing stores directly with `getState()`

**Demo tip**: Open React DevTools, toggle a filter, and show only the filter panel re-rendering — not the entire page. This makes selectors concrete.

---

### Level 5 — Data & Auth (Days 5-6)

**This is the hardest level.** Budget two days.

**Key concepts**: Axios interceptors, TanStack Query, authentication flow, passkeys

**Day 5 focus**: API client, TanStack Query basics, simple data fetching
**Day 6 focus**: Authentication flow, MFA, passkeys, protected routes

**Common stumbling points**:
- Token refresh loop: students use `apiClient` inside the refresh interceptor, causing infinite loops. Stress: use plain `axios` for refresh.
- Stale closures in interceptors: the token read must use `getState()` (not a stored reference)
- Pre-auth vs post-auth API calls: login endpoints use plain `axios` with full URL. Authenticated endpoints use `apiClient`.
- `withCredentials: true` — students forget this and cookies don't send

**Demo tip**: For passkeys, use Chrome DevTools → Application → WebAuthn to simulate a virtual authenticator. Not everyone has hardware keys.

**Assessment gate**: If a student can't explain the token refresh flow by end of Day 6, they need extra time before Level 6.

---

### Level 6 — Quality (Day 7)

**Key concepts**: Error boundaries, error hierarchy, monitoring, advanced testing

**Common stumbling points**:
- Error boundaries must be class components — React has no hook API for this
- MSW v2 uses `http.get()` / `http.post()`, not the old `rest.get()` syntax
- Students confuse `ErrorBoundary` (catches render errors) with `try/catch` (catches async errors)

**Demo tip**: Deliberately throw an error in a component and show how the error boundary catches it without crashing the entire app. Then show what happens WITHOUT the boundary.

**Testing exercise**: The factory pattern exercise is highly reusable — students will use `createAccount()` and `createUser()` for every test going forward.

---

### Level 7 — Production (Days 8-9)

**Key concepts**: Security hardening, BSP compliance, data privacy, CI/CD

**Day 8 focus**: Security (CSP, XSS prevention, PII masking, permissions)
**Day 9 focus**: BSP compliance framework, DPA consent, CI/CD pipeline

**Common stumbling points**:
- CSP: students try to use inline scripts/styles after adding CSP headers
- PII masking: students mask data in components instead of using a reusable utility
- Azure Pipelines YAML: indentation errors are the number one issue

**Demo tip**: Show a real BSP audit checklist. Walk through what evidence each compliance control produces. Make it tangible — not abstract regulation.

**Critical teaching moment**: The `azure-pipelines.yml` is real and deployable. Walk through each stage: lint → test → build → containerize → deploy.

---

### Level 8 — Mastery (Days 10-11)

**Key concepts**: i18n, real-time patterns, architecture, capstone integration

**Day 10 focus**: Internationalization, real-time hooks (WebSocket, SSE, polling)
**Day 11 focus**: Transfer wizard, payment system, integration capstone

**Common stumbling points**:
- i18n: students hardcode strings instead of using `<FormattedMessage>` or `intl.formatMessage()`
- WebSocket reconnection: students forget to clean up in the useEffect return
- Currency input: the pesos-to-centavos boundary conversion (`* 100` at form submission, not in the display)

**Demo tip**: Switch the locale and watch the entire UI update — dates, numbers, currency, messages. This is the payoff of proper i18n architecture.

**Capstone guidance**: The integration capstone (B09) ties everything together. Let students work through it independently. Resist the urge to help immediately — the struggle is the learning.

---

### Level 9 — Public-Facing (Days 12-13)

**Key concepts**: Next.js, Server Components, SSR/SSG, Azure deployment

**Day 12 focus**: SPA vs SSR decision framework, Next.js setup, Server Components
**Day 13 focus**: Advanced Server Components, deployment to Azure

**Common stumbling points**:
- `'use client'` boundary: students add it everywhere instead of keeping it at the leaf level
- Server Components cannot use hooks, event handlers, or browser APIs
- `generateStaticParams` for pre-rendering dynamic routes
- Students confuse the portal (Vite SPA) with the public-site (Next.js) — clarify these are separate apps

**Demo tip**: Show the same page rendered as a Server Component vs a Client Component. Compare the HTML output — Server Components send zero JavaScript.

---

## Pacing Adjustments

### If a cohort is ahead of schedule:
- Add pair programming exercises
- Introduce code review sessions (students review each other's exercise solutions)
- Deep-dive into the appendix guides (X01 Design System Reference, X02 BSP Circulars)

### If a cohort is behind:
- Skip B-series (Vite SPA) guides — prioritize A-series (Core concepts)
- Use the QUICK_START.md 3-day fast-track path for experienced developers
- Focus exercises on levels 1-5 (foundations), skim levels 6-8

### For mixed-experience cohorts:
- Pair experienced developers with beginners for exercises
- Advanced students can work ahead on the capstone while beginners catch up
- Use the difficulty tags on exercises (Starter / Intermediate / Challenge)

---

## Assessment Strategy

| Method | Frequency | Purpose |
|--------|-----------|---------|
| Quizzes | End of each level | Knowledge check (multiple choice + short answer) |
| Exercise tests | Continuous | `npm run test:exercises:XX` — automated pass/fail |
| Code review | Days 6, 9, 11 | Instructor reviews exercise solutions |
| Capstone | Days 10-11 | Integration of all concepts |
| Final demo | Day 13 | Students present their public-site to the team |

### Minimum passing criteria:
- All 9 quizzes completed (answers reviewed in class)
- Levels 1-5 exercise tests passing
- Capstone project builds without errors
- Can explain the authentication flow and compliance controls

---

## Materials Checklist

Before Day 1, verify:

- [ ] Companion repo is accessible to all students (GitHub / Azure DevOps)
- [ ] All students have completed Prerequisites from ONBOARDING.md
- [ ] `scripts/verify-setup.sh` passes on a representative student machine
- [ ] Notion workspace is set up with all 37 guides (or printed/shared as markdown)
- [ ] You have run through at least Levels 1-3 demos yourself
- [ ] Screen sharing is set up for live demos
- [ ] Quiz answer keys are NOT shared with students (keep in your materials only)

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
