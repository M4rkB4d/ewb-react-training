# Level 9 — Public-Facing Applications
## Slide Deck Outline

### Slide 1: Title Slide
- Level 9 — Public-Facing Applications
- EastWest Bank React Training
- Digital Platforms & Innovations

### Slide 2: Learning Objectives
- Evaluate SPA vs SSR trade-offs for different banking applications
- Set up a Next.js 15 project with the App Router and EWB design system
- Build pages with Server Components and multiple rendering strategies
- Deploy Next.js on Azure App Service with Front Door and Application Insights

### Slide 3: Two Types of Banking Application
- **Internal portal** (`portal.ewbanking.com`): authenticated users, rich interactivity, SPA
- **Public site** (`ewbanking.com`): marketing, product pages, SEO, first impressions
- Different audiences, different requirements, different architecture
- Levels 1–8 built the internal portal (Vite SPA). Level 9 builds the public site.
- *Speaker notes: Draw the line clearly. The portal is behind a login wall — no SEO, no public access. The public site is the front door.*

### Slide 4: Rendering Strategies
- **CSR (Client-Side Rendering)**: browser downloads JS, renders everything — the Vite SPA approach
- **SSR (Server-Side Rendering)**: server renders HTML on each request — fast first paint
- **SSG (Static Site Generation)**: pages rendered at build time — fastest, for content that rarely changes
- **ISR (Incremental Static Regeneration)**: static pages that revalidate on a schedule
- *Speaker notes: Show a timeline diagram for each strategy — time to first byte, time to interactive, JavaScript bundle size.*

### Slide 5: The Decision Framework
- SEO required? → SSR or SSG (search engines need server-rendered HTML)
- Content changes frequently? → SSR or ISR (not pure SSG)
- Highly interactive after load? → CSR portions within SSR pages
- Performance budget strict? → SSG for static pages, SSR for dynamic
- Internal, authenticated? → CSR (Vite SPA) is sufficient
- *Speaker notes: Walk through the decision tree for three EWB applications: public marketing site (SSG), product comparison tool (ISR), internal portal (CSR).*

### Slide 6: EWB Application Portfolio Mapping
- Product pages, rates, branch locator → SSG with ISR (revalidate hourly)
- Blog/news, press releases → SSG (rebuild on publish)
- Loan calculator, eligibility checker → SSR with client-side interactivity
- Account portal, fund transfers → CSR (Vite SPA, Levels 1–8)
- *Speaker notes: This mapping shows why we need both architectures. One size does not fit all — match the rendering strategy to the use case.*

### Slide 7: Next.js 15 Project Setup
- `npx create-next-app@latest ewb-public --typescript --tailwind --app`
- App Router: file-based routing with `app/` directory conventions
- Same EWB design system (Tailwind CSS 4 tokens, shared components)
- Same TypeScript strict mode, same Zod validation patterns
- *Speaker notes: Show the project scaffold. Highlight what carries over from the Vite SPA (design system, types, validation) and what is new (App Router, server components).*

### Slide 8: App Router File Conventions
- `page.tsx` — the route component (renders at that URL)
- `layout.tsx` — shared wrapper (header, footer, navigation)
- `loading.tsx` — streaming loading state while data fetches
- `error.tsx` — error boundary for that route segment
- `not-found.tsx` — custom 404 page
- *Speaker notes: Show the file tree for the public site. Each folder in app/ is a route — no manual router configuration needed.*

### Slide 9: Server Components — The Default
- Every component in `app/` is a Server Component by default
- Server Components run on the server — their code never ships to the browser
- Benefits: zero bundle impact, direct database/API access, server-side secrets
- Add `'use client'` only when you need: useState, useEffect, event handlers, browser APIs
- *Speaker notes: This is the opposite of the Vite SPA where everything runs in the browser. Show a product page that fetches data with async/await — no useEffect, no loading state management.*

### Slide 10: Client Components — When You Need Interactivity
- `'use client'` directive at the top of the file
- Use for: forms, interactive widgets, components that need browser APIs
- Pattern: Server Component fetches data → passes to Client Component as props
- Keep Client Components small — push as much as possible to Server Components
- *Speaker notes: Show the loan calculator — the page is a Server Component, the calculator widget is a Client Component. Data fetching happens on the server.*

### Slide 11: Data Fetching Strategies
- Server Components: `async function` with direct `fetch()` or database calls
- Caching: `fetch()` with `next: { revalidate: 3600 }` for ISR (revalidate every hour)
- Dynamic data: `export const dynamic = 'force-dynamic'` for per-request SSR
- `generateStaticParams` for pre-building dynamic routes (product pages, branch pages)
- *Speaker notes: Show three pages with different strategies — static product page, ISR rates page, dynamic eligibility checker. Each uses the right caching approach.*

### Slide 12: SEO and Metadata
- `generateMetadata` function for dynamic page titles, descriptions, Open Graph tags
- Structured data (JSON-LD) for product pages — helps search engines understand content
- `sitemap.ts` generates the sitemap automatically from routes
- `robots.ts` controls search engine crawling rules
- *Speaker notes: Show the metadata function for a product page. This is why the public site uses Next.js — search engines need this metadata to rank pages.*

### Slide 13: Security Headers in Next.js
- Configure CSP, SRI, and other headers in `next.config.ts`
- Middleware for server-side authentication checks (cookies, session validation)
- Route Handlers (`route.ts`) proxy external APIs — server-side secrets never reach the browser
- Same security standards as the Vite SPA — CSP, SRI, HTTPS-only
- *Speaker notes: Show the next.config.ts headers array. Same security posture as the SPA, different implementation mechanism.*

### Slide 14: Deploying Next.js on Azure
- Next.js needs a Node.js runtime — Azure App Service (Linux) instead of Blob Storage
- Docker image with Next.js standalone output (minimal footprint)
- Azure Front Door for CDN caching, HTTPS termination, and WAF
- Azure Pipelines: build → test → Docker build → push to ACR → deploy to App Service
- *Speaker notes: Diagram the architecture — App Service runs Node.js, Front Door caches static assets. Compare to the SPA deployment (Blob Storage, no runtime).*

### Slide 15: Monitoring and Observability
- Azure Application Insights for server-side telemetry (SSR render times, API call duration)
- Sentry for client-side error tracking (same as Vite SPA)
- Redis-backed session management with TTL enforcement
- SOX-compliant release checklist — same rigor as the internal portal
- *Speaker notes: The monitoring stack is similar to the SPA but adds server-side metrics. Show Application Insights tracking SSR render performance.*

### Slide 16: Key Takeaways
- Match the rendering strategy to the use case — not everything needs to be an SPA
- Server Components reduce bundle size and keep secrets on the server
- Next.js on Azure App Service with Front Door is the EWB standard for public-facing sites
- Same compliance standards apply — CSP, accessibility, audit trails, BSP requirements
- Congratulations: you have completed the EastWest Bank React Training curriculum
