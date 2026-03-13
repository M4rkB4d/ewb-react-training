# A20 — SPA vs SSR Decision Framework

> **EastWest Bank — Digital Platforms & Innovations**
>
> Part A (Core) · Level 9 — Public-Facing Applications · Est. 2 hours

---

## What You Will Learn

By the end of this guide, you will:

- Distinguish between CSR, SSR, SSG, and ISR rendering strategies
- Evaluate trade-offs for each strategy in banking contexts
- Apply a structured decision framework to choose between SPA and SSR
- Understand why public-facing banking sites need different architecture than internal portals
- Know when SEO, performance budgets, and compliance requirements favor server rendering
- Map EastWest Bank's application portfolio to the right rendering strategy

---

## Prerequisites

| Requirement | Where |
|------------|-------|
| Completed all Level 1–8 guides | Levels 1–8 |
| B07 — Deployment and CI/CD | Level 7 |
| A18 — Architecture Patterns | Level 8 |

---

## Phase 1 — Two Types of Banking Application

EastWest Bank operates two fundamentally different digital experiences.

### Internal applications (post-login)

The banking portal at `portal.ewbanking.com` serves authenticated employees and
customers. Every user has logged in before seeing any content. This is the
application you built throughout Levels 1–8 — a Vite SPA deployed to Azure
Blob Storage with Azure CDN.

Characteristics of the internal portal:

- All users are authenticated
- No search engine indexing needed
- Rich interactivity (transfers, account management, real-time balance)
- Fast subsequent navigation via client-side routing
- Deployed as static files — no server runtime

The Vite SPA is the correct architecture for this application.

### Public-facing applications (pre-login)

The public website at `ewbanking.com` serves anonymous visitors browsing
products, checking exchange rates, finding branches, and starting loan
applications. These users have not logged in. Many arrive from Google search
results.

Characteristics of the public site:

- Mostly anonymous visitors
- SEO is critical — Google must index product pages, rates, and disclosures
- First-load performance matters — visitors on 4G in provincial Philippines
- Regulatory content must be discoverable (BSP 1033 fee disclosures)
- Some pages transition to authenticated (loan application status)

A Vite SPA is the wrong tool for this. When the browser downloads a SPA,
it receives an empty HTML shell. All content is rendered by JavaScript after
the bundle loads. Search engines may not index JavaScript-rendered content
reliably, and users on slow connections see a blank screen until the bundle
downloads and executes.

### The two-project architecture

| Concern | Internal Portal | Public Website |
|---------|----------------|----------------|
| URL | `portal.ewbanking.com` | `ewbanking.com` |
| Users | Authenticated employees and customers | Anonymous public visitors |
| SEO | Not needed | Critical |
| Framework | Vite SPA (React) | Next.js (React) |
| Deployment | Azure Blob Storage + CDN | Azure App Service |
| First load | JS bundle renders everything | Server sends complete HTML |
| Navigation | Client-side (React Router) | Mix of server and client |

Both applications use React. Both share design tokens and component patterns.
The difference is how and where the HTML is generated.

### Checkpoint 1

Your team is building a new "Compare Savings Accounts" page. It shows interest
rates, minimum balances, and product features. Google must index this page.
Customers visit it before creating an account. Which type of application is
this — internal or public-facing? What rendering approach would you recommend?

---

## Phase 2 — The Rendering Spectrum

React applications can generate HTML in four different ways. Each has distinct
trade-offs for performance, SEO, and operational complexity.

### Client-Side Rendering (CSR)

This is what the Vite SPA does. The server sends a minimal HTML file with a
`<div id="root"></div>` and a JavaScript bundle. The browser downloads the
bundle, executes it, and React renders the entire UI.

```
Browser                    CDN (static files)
  │                              │
  │── GET /products ────────────>│
  │<── empty HTML + JS bundle ───│
  │                              │
  │  [Download JS: 200-500ms]    │
  │  [Parse + Execute: 100-300ms]│
  │  [React renders UI]          │
  │  [Fetch data from API]       │
  │  [Re-render with data]       │
  │                              │
  │  Content visible: 1-3 seconds│
```

**Advantages:** Simple deployment (static files on Blob Storage), rich
interactivity after load, no server runtime to manage.

**Disadvantages:** Blank page until JS loads, poor SEO (search engines see
empty HTML), large initial bundle, every user pays the full rendering cost.

### Server-Side Rendering (SSR)

The server runs React on every request, generates complete HTML, and sends it
to the browser. The browser shows the HTML immediately, then "hydrates" it
with JavaScript to make it interactive.

```
Browser                    App Service (Node.js)
  │                              │
  │── GET /products ────────────>│
  │                              │ [Fetch data from API]
  │                              │ [React renders to HTML]
  │<── complete HTML + JS ───────│
  │                              │
  │  Content visible immediately │
  │  [Download JS in background] │
  │  [Hydrate: attach events]    │
  │                              │
  │  Interactive: 500ms-1s later │
```

**Advantages:** Fast first paint (content visible immediately), SEO-friendly
(complete HTML for search engines), works even with JS disabled.

**Disadvantages:** Requires a running server (Azure App Service), TTFB depends
on server processing time, more complex deployment.

### Static Site Generation (SSG)

HTML is generated once at build time, not per request. The pre-built HTML files
are served as static files — like a SPA, but with real content in the HTML.

```
Build Server                CDN (static files)        Browser
  │                              │                       │
  │ [Fetch data from API]        │                       │
  │ [React renders to HTML]      │                       │
  │── Upload HTML files ────────>│                       │
  │                              │                       │
  │                              │<── GET /products ─────│
  │                              │── complete HTML ──────>│
  │                              │                       │
  │                              │  Content visible: fast │
```

**Advantages:** Fastest possible TTFB (pre-built files from CDN), no server
processing per request, extremely cost-effective.

**Disadvantages:** Content is stale until the next build, not suitable for
frequently changing or personalized data, build time grows with page count.

### Incremental Static Regeneration (ISR)

A hybrid approach. Pages are statically generated at build time but regenerated
in the background after a configurable time interval. The first visitor after
the interval triggers a rebuild — subsequent visitors get the updated page.

```
Browser                    CDN + App Service
  │                              │
  │── GET /rates ───────────────>│
  │<── cached HTML (age: 45s) ───│ [Cache still valid, serve immediately]
  │                              │
  │  Content visible: very fast  │
  │                              │
  │                     [60s later, next request triggers background rebuild]
  │                     [New HTML cached for next 60 seconds]
```

**Advantages:** CDN speed with configurable freshness, background regeneration
does not block users, scales well for high-traffic pages.

**Disadvantages:** Data can be stale for up to `revalidate` seconds, requires
a running server for the regeneration process.

### Comparison table

| Criterion | CSR (SPA) | SSR | SSG | ISR |
|-----------|-----------|-----|-----|-----|
| First paint | Slow (JS must load) | Fast | Fastest | Fast |
| SEO | Poor | Excellent | Excellent | Excellent |
| Data freshness | Real-time (API calls) | Real-time | Stale until rebuild | Configurable staleness |
| Server required | No | Yes | No (build only) | Yes (for regeneration) |
| Cost | Very low (~₱250/mo) | Medium (~₱2,800/mo) | Very low | Medium |
| Complexity | Low | High | Low | Medium |
| Best for | Authenticated apps | Personalized pages | Stable content | Frequently updated content |

### Checkpoint 2

Exchange rates change every few minutes. The rates page must show current rates
and be indexed by Google. Which rendering strategy is the best fit, and why
would SSG alone be insufficient?

---

## Phase 3 — The Decision Framework

### Decision tree

Use this flowchart to determine the rendering strategy for any page:

```
Does this page need to be indexed by search engines?
├── NO → Is it behind authentication?
│   ├── YES → CSR (Vite SPA) — the internal portal
│   └── NO → CSR is fine, but consider SSG if content is stable
│
└── YES → Does the content change per user (personalized)?
    ├── YES → SSR (server renders per request)
    │
    └── NO → How often does the content change?
        ├── Rarely (weekly/monthly) → SSG (build-time generation)
        ├── Frequently (minutes/hours) → ISR (background regeneration)
        └── Real-time → SSR with short cache
```

### EWB application portfolio mapping

| Application / Page | SEO? | Personalized? | Data Freshness | Strategy | Justification |
|--------------------|------|---------------|----------------|----------|---------------|
| Account dashboard | No | Yes | Real-time | CSR (SPA) | Authenticated, no SEO |
| Transaction history | No | Yes | Real-time | CSR (SPA) | Authenticated, interactive |
| Fund transfer | No | Yes | Real-time | CSR (SPA) | Authenticated, multi-step |
| Product catalog | Yes | No | Monthly | SSG | Stable content, SEO critical |
| Savings account details | Yes | No | Monthly | SSG | Product info rarely changes |
| Exchange rates | Yes | No | Every few minutes | ISR (60s) | Fresh enough, CDN speed |
| Branch/ATM locator | Yes | No | Weekly | SSG | Locations rarely change |
| Loan application form | Yes | Partially | Per session | SSR | Regulatory, multi-step |
| Loan calculator | Yes | No | Monthly | SSG + client | Static page, interactive widget |
| Account opening | Yes | Yes | Per session | SSR | Personalized flow, compliance |
| Marketing promotions | Yes | No | Daily | ISR (3600s) | Changes daily, not per-minute |
| Fee disclosures | Yes | No | Quarterly | SSG | BSP 1033 regulatory content |
| Contact/Support | Yes | No | Rarely | SSG | Almost never changes |
| API documentation | Yes | No | Per release | SSG | Changes only with releases |

### The per-route advantage

Next.js allows mixing rendering strategies within a single application. The
product catalog can be SSG while the loan application is SSR and the exchange
rates use ISR — all in the same codebase, the same deployment.

This is why Level 9 introduces Next.js specifically for the public site. No
other mainstream React framework offers this level of per-route rendering
control with the same developer experience.

### Checkpoint 3

A product manager wants the loan application page to be SSG for maximum
performance. The page collects personal information and must display
BSP-mandated consent notices that vary by product type (personal loan vs auto
loan vs home loan). Explain why SSG is not appropriate here and what strategy
you would recommend instead.

---

## Phase 4 — Compliance Implications

Rendering strategy is not purely a performance decision. For a BSP-regulated
bank, compliance requirements directly influence which strategy is appropriate.

### SEO and regulatory disclosure (BSP 1033)

BSP Circular 1033 requires that fees, charges, and terms for banking products
be clearly disclosed and accessible to the public. If these disclosures are
rendered only by JavaScript (CSR), search engines may not index them reliably.

Server rendering (SSR, SSG, ISR) ensures regulatory text is present in the
HTML response. Google indexes the complete content without executing JavaScript.
This matters for compliance audits — the regulator can verify disclosures are
publicly accessible by checking the page source.

### Performance for digital channels (BSP 1105)

BSP Circular 1105 mandates that digital banking channels be responsive and
accessible. In the Philippines, many customers access banking websites on
mobile devices over 4G connections, particularly in provincial areas where
bandwidth is limited.

Performance budgets for the EWB public site:

| Metric | Target (Desktop / Fiber) | Target (Mobile / 4G) |
|--------|--------------------------|----------------------|
| LCP | < 1.5s | < 2.5s |
| FID / INP | < 100ms | < 200ms |
| CLS | < 0.1 | < 0.1 |
| Time to Interactive | < 2.0s | < 3.5s |

Server rendering delivers content in the initial HTML response, improving LCP
on slow connections. A CSR application sends an empty HTML shell followed by
a large JavaScript bundle — on 4G, this can mean 3–5 seconds of blank screen.

### Server-side data access (BSP 982)

In the Vite SPA, environment variables prefixed with `VITE_` are embedded into
the JavaScript bundle. Anyone can read them by inspecting the source. This is
why API keys and secrets must never use the `VITE_` prefix (covered in B07).

Server-rendered applications access secrets directly on the server. The Next.js
server can read from Azure Key Vault, connect to databases, and call internal
APIs — none of this is exposed to the browser. This reduces the client-side
attack surface, which aligns with BSP 982 information security requirements.

### Monitoring and audit trails (BSP 1019)

Server-side rendering generates server logs for every page request. This
provides an additional data source for BSP 1019 cyber-risk monitoring. The
operations team can detect anomalous access patterns (sudden spikes in rate
page views, automated scraping of product terms) directly from server logs.

Client-side monitoring (Sentry, Application Insights from B06) remains valuable
for JavaScript errors and Web Vitals, but server logs capture a class of
events that client-side monitoring cannot see.

### Checkpoint 4

Your security team asks: "Can server-side rendering eliminate the need for the
Content-Security-Policy header?" What is the correct answer, and what does CSP
protect against regardless of rendering strategy?

---

## Phase 5 — When NOT to Use SSR

Server rendering is not universally better. It adds complexity and cost that
are only justified when the benefits (SEO, performance, security) are needed.

### The internal portal stays as a SPA

The banking portal at `portal.ewbanking.com` has 50–200 authenticated users.
Every user logs in before seeing any content. There is no SEO requirement. The
rich interactivity (real-time balance updates, transfer wizards, account
filtering) is better served by a client-side application with local state
management.

Converting the internal portal to Next.js SSR would be over-engineering:

- **No SEO benefit** — the portal is not indexed by search engines
- **Added complexity** — server and client rendering models to maintain
- **Higher cost** — Azure App Service (~₱2,800/mo) vs Blob Storage (~₱250/mo)
- **Slower development** — every component decision requires "server or client?"
- **No security improvement** — the portal is already behind authentication

The Vite SPA from Levels 1–8 remains the correct architecture.

### Cost considerations

| Deployment | Azure Service | Approximate Monthly Cost |
|------------|---------------|--------------------------|
| Vite SPA (static files) | Blob Storage + CDN | ~₱250 |
| Next.js (server rendering) | App Service (B2) + Redis | ~₱3,500 |
| Next.js (containerized) | Container Apps | ~₱2,800–5,600 |

Server rendering requires a running Node.js process. This means compute costs,
memory allocation, and a server to monitor and patch. Only use SSR when the
benefits (SEO, compliance, performance for anonymous users) justify the
operational overhead.

### Complexity tax

Server-rendered applications carry additional complexity:

- **Two execution environments** — code runs on the server and the client. A
  function that works in Node.js may not work in the browser, and vice versa.
- **Caching is harder** — CDN cache, server-side cache, and client-side cache
  must all be coordinated. Cache invalidation across layers is a common source
  of bugs.
- **Debugging spans boundaries** — an error might originate on the server
  during rendering, on the client during hydration, or in the gap between them.
- **Deployment is heavier** — Docker images, health checks, readiness probes,
  and deployment slot management replace simple file uploads.

These are not reasons to avoid SSR. They are reasons to use it deliberately,
only where the trade-offs are justified.

### Checkpoint 5

A developer proposes converting the internal banking portal from Vite SPA to
Next.js SSR "because Next.js is newer and better." List three specific reasons
why this would be over-engineering for the internal portal.

---

## Key Takeaways

1. **CSR (SPA) is for internal, authenticated applications** — the Vite SPA
   from Levels 1–8 is correct for the banking portal. No SEO, no server needed.

2. **SSR is for public-facing pages with personalized data** — loan
   applications, account opening flows where content varies per user and SEO
   matters.

3. **SSG is for stable public content** — product catalogs, fee disclosures,
   branch lists. Fastest possible performance with zero server cost per request.

4. **ISR bridges the gap** — exchange rates, promotional pages that change
   frequently but not per-request. CDN speed with configurable freshness.

5. **Next.js lets you choose per route** — one application can mix SSG, SSR,
   ISR, and client components. This is why it is the right tool for the public
   site.

6. **Compliance favors server rendering for public pages** — SEO for regulatory
   disclosures (BSP 1033), faster LCP for accessibility (BSP 1105), server-side
   secrets management (BSP 982).

7. **Do not SSR everything** — the internal portal stays as a Vite SPA. Use
   server rendering only where the trade-offs justify the added complexity and
   cost.

---

## Exercises

### Exercise 1 — Application Portfolio Mapping

Take the complete list of EastWest Bank digital applications: internal portal,
public website, mobile web, admin dashboard, partner API portal, and branch
kiosk interface. For each, recommend CSR, SSR, SSG, or ISR as the primary
rendering strategy. Justify each choice with specific criteria from the
decision framework in Phase 3.

### Exercise 2 — Performance Budget Definition

Define a performance budget for the EWB public website. Include LCP, FID/INP,
CLS, and Time to Interactive targets. Specify different targets for desktop
(fiber connection) and mobile (4G in provincial Philippines). For each metric,
explain how CSR, SSR, and SSG affect the result differently.

### Exercise 3 — Stakeholder Brief

Write a one-page brief for non-technical stakeholders (VP of Digital Banking)
explaining why the public website needs a different technology stack than the
internal portal. Avoid technical jargon. Focus on business outcomes: search
engine ranking, customer acquisition, page load time on mobile, and regulatory
compliance.

---

## What Comes Next

This guide established the *why* — when to use SPA versus server-rendered
architecture. The next guide puts this into practice.

**Next guide:** [A21 — Next.js Project Setup](A21_nextjs-project-setup.md) —
where you create the Next.js project for the EWB public website, configure
the design system, and set up server-side environment management with Azure
Key Vault.

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
