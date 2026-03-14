# Level 9 — Public-Facing Applications: Instructor Demo Outline

> **EastWest Bank — Digital Platforms & Innovations**
>
> Duration: 18-20 minutes

---

## Demo Overview

Demonstrate the public-facing application architecture using Next.js 15. Show the contrast between the Vite SPA (internal portal) and the Next.js application (public site). Cover Server Components, rendering strategies, and Azure deployment.

---

## Part 1 — SPA vs SSR Side by Side (4 min)

### What to show

1. Open the Vite SPA in one browser tab — right-click → View Page Source
   - Show the empty `<div id="root"></div>` — no content in the HTML
   - This is what Google sees if it does not execute JavaScript
2. Open the Next.js public site in another tab — right-click → View Page Source
   - Show the full product catalog HTML already in the page source
   - Show the `<title>` and `<meta>` tags rendered server-side
3. Open Chrome DevTools → Network → disable JavaScript → reload both pages
   - Vite SPA: blank white page
   - Next.js: full content visible

### Talking points

- The internal portal does not need SEO — the empty HTML shell is fine
- The public site MUST have content in the HTML: Google indexing, BSP 1033 disclosures, users on slow 4G
- This is not about which is "better" — it is about matching the tool to the requirement
- Cost difference: ~250 PHP/month (Blob Storage) vs ~3,900 PHP/month (App Service) — justified for public-facing

---

## Part 2 — Server Components in Action (5 min)

### What to show

1. Open `app/products/page.tsx` — a Server Component
   - Show the `async` function component with `await fetch()`
   - No `useEffect`, no `useState`, no loading spinner
   - The data is fetched on the server; HTML is sent complete
2. Open `app/products/compare/comparison-tool.tsx` — a Client Component
   - Show the `'use client'` directive at the top
   - Show `useState` for product selection
   - Explain: this part needs interactivity, so it must run in the browser

### What to type live

Demonstrate the `'use client'` boundary:

```tsx
// Try adding useState to a Server Component
// (remove 'use client' from comparison-tool.tsx temporarily)
// Show the error: "useState is not supported in Server Components"
```

Then add `'use client'` back and show it working.

### Talking points

- Default is server in Next.js App Router — the opposite of the Vite SPA
- Server Components never ship JavaScript to the browser — smaller bundle
- The product catalog page sends zero client-side JS (it is pure HTML + CSS)
- Only add `'use client'` when you need interactivity, browser APIs, or React hooks

---

## Part 3 — Rendering Strategies Per Route (4 min)

### What to show

1. Open `app/products/page.tsx` — show `{ next: { revalidate: 3600 } }` (ISR, 1 hour)
2. Open `app/rates/page.tsx` — show `{ next: { revalidate: 60 } }` (ISR, 1 minute)
3. Open `app/apply/status/page.tsx` — show `{ cache: 'no-store' }` (SSR, every request)
4. Show the `generateStaticParams` function in `app/products/[slug]/page.tsx` — pre-rendering product pages at build time

### What to emphasize

- Next.js lets you choose the rendering strategy per route, per fetch call
- Product catalog: changes monthly → ISR with 1 hour
- Exchange rates: changes every few minutes → ISR with 60 seconds
- Application status: user-specific, must be current → SSR
- This per-route flexibility is the core reason for choosing Next.js for the public site

### Talking points

- ISR is the sweet spot for most public banking pages: CDN speed + configurable freshness
- SSR only when data is personalized or must be real-time
- SSG at build time for truly static content (branch locations, fee disclosures)

---

## Part 4 — Environment Variables and Secrets (3 min)

### What to show

1. Open `src/lib/env.ts` — show the `serverSchema` and `clientSchema` split
2. Show that `AZURE_KEY_VAULT_URL` and `API_SECRET_KEY` have no `NEXT_PUBLIC_` prefix
3. Open the browser DevTools → Sources → search for "API_SECRET_KEY"
   - It is NOT in the bundle — server-only variables never reach the client

### What to type live

```tsx
// In a Server Component — this works:
console.log(process.env.API_SECRET_KEY); // prints the key on the server

// In a Client Component — this would be undefined:
// process.env.API_SECRET_KEY → undefined (not in the bundle)
```

### Talking points

- In the Vite SPA, `VITE_*` variables are embedded in the JS bundle — anyone can read them
- In Next.js, omitting `NEXT_PUBLIC_` keeps secrets server-side
- Azure Key Vault is accessed directly from Server Components — no API proxy needed
- Zod validates both server and client schemas at startup — catches misconfigurations immediately

---

## Part 5 — Azure Deployment Architecture (4 min)

### What to show

1. Show the architecture diagram: Front Door → CDN → App Service → Redis + Key Vault
2. Open `azure-pipelines.yml` — walk through the three key differences from the Vite SPA pipeline:
   - Docker build instead of static file upload
   - Push to Azure Container Registry instead of Blob Storage
   - Deployment slot swap instead of CDN cache purge
3. Show the health endpoint at `/api/health` — Redis and Key Vault connectivity checks
4. Show the CDN caching rules: `/_next/static/*` (1 year), HTML pages (60 seconds)

### What to type live

```bash
# Deployment slot swap — instant cutover
az webapp deployment slot swap \
  --name ewb-public \
  --resource-group ewb-digital \
  --slot staging \
  --target-slot production

# Instant rollback if issues detected
az webapp deployment slot swap \
  --name ewb-public \
  --resource-group ewb-digital \
  --slot production \
  --target-slot staging
```

### Talking points

- The CDN role changes: for the Vite SPA, CDN IS the origin. For Next.js, CDN is a cache layer
- Slot swaps give zero-downtime deployments with instant rollback
- The Node.js runtime means monthly patching: Node.js updates, Docker base image, npm audit
- This maintenance cost is the price of server-side rendering — justified for the public site

---

## Key Takeaways to Reinforce

1. The Vite SPA stays for the internal portal — do not over-engineer with SSR where it is not needed
2. Next.js is for the public site where SEO, performance on 4G, and regulatory disclosures matter
3. Server Components are the default — `'use client'` is the exception for interactivity
4. ISR gives CDN speed with configurable freshness — the best of both SSG and SSR
5. Server-only environment variables are a fundamental security improvement over the `VITE_*` pattern
6. The operational cost is real: App Service + Redis + Docker patching vs static Blob Storage

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
