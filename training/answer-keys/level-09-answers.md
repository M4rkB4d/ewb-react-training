# Level 9 Answer Key — Public-Facing Applications

> **EastWest Bank — Digital Platforms & Innovations**
>
> React Training Program · Level 9 Instructor Reference

---

## Quiz Answers

### Question 1 — Answer: D

ISR with a 60-second revalidation provides the best balance. The rates page needs SEO (Google must index it), so CSR is out. SSG would serve stale rates until the next build. SSR on every request wastes server resources when the data only changes every few minutes. ISR serves cached pages at CDN speed and regenerates in the background after 60 seconds.

### Question 2 — Answer: False

The internal portal serves authenticated users only with no SEO requirement. Converting to Next.js SSR would add operational complexity (server runtime, Docker patching, ~₱3,900/mo vs ~₱280/mo) without business benefit. The Vite SPA is the correct architecture for the internal portal.

### Question 3 — Answer: B

BSP 1033 requires that fees, charges, and terms be clearly disclosed and publicly accessible. With CSR, the browser receives an empty HTML shell and disclosure content only appears after JavaScript executes. Search engines may not reliably index it, and regulators checking page source would see an empty `<div id="root"></div>`. Server rendering ensures the text is present in the HTML response.

### Question 4 — Answer: C

In Next.js App Router, `page.tsx` is the file that makes a URL route accessible. Creating `app/products/page.tsx` makes `/products` available. `route.ts` is for API Route Handlers, `layout.tsx` defines shared UI, and `index.tsx` has no special meaning in the App Router.

### Question 5 — Answer: B

Environment variables without the `NEXT_PUBLIC_` prefix are only available in server-side code (Server Components, Route Handlers, middleware) and are never included in the JavaScript bundle sent to the browser. This is a fundamental security improvement over the Vite SPA where all `VITE_*` variables are embedded in the client bundle.

### Question 6 — Answer: False

The opposite is true. Every component in the `app/` directory is a Server Component by default. To make a component run in the browser, you must add `'use client'` as the first line of the file. This is the inverse of the Vite SPA where every component runs in the browser by default.

### Question 7 — Answer: C

Azure App Service (Linux, Node.js) hosts the Next.js application. Unlike the Vite SPA which is static files on Blob Storage, Next.js requires a Node.js runtime for Server Components, Route Handlers, and middleware. Azure Static Web Apps has limitations (restricted API routes, no deployment slots) unsuitable for production banking.

### Question 8 — Answer: B

`output: 'standalone'` tells Next.js to produce a minimal, self-contained Node.js server in `.next/standalone/`. This directory contains only the files needed to run the application — the full `node_modules` folder is not needed. The Docker image runs `node server.js` directly, reducing image size and attack surface.

### Question 9 — Answer: True

Production deployments first deploy the Docker image to the staging slot, run smoke tests, then swap the staging slot to production. If issues are detected, `az webapp deployment slot swap --slot production --target-slot staging` instantly swaps back, providing zero-downtime deployments with immediate rollback.

### Question 10 — Answer: B

Next.js automatically deduplicates `fetch` calls with the same URL and options within a single render pass. When `generateMetadata` and the page component both call `getProduct(slug)`, Next.js makes only one actual HTTP request and shares the response. This deduplication applies to the native `fetch` API during server rendering.

### Question 11 — Answer: B

Redis stores server-side session data with a sliding 15-minute TTL (BSP 982 compliance) and provides rate limiting for public API routes. Session data uses `setex` for expiration, and each request refreshes the TTL. Rate limiting uses sorted sets to track request counts per IP within a time window.

### Question 12 — Answer: B

Static assets under `/_next/static/` are content-hashed by Next.js. Every build produces new hashes in filenames (e.g., `main-abc123.js` becomes `main-def456.js`). Since filenames change with every build, old cached files are never served for new deployments, making aggressive 1-year caching completely safe.

### Question 13 — Answer: True

`error.tsx` must include `'use client'` because it uses React's error boundary mechanism, which requires client-side state management for the `reset` function that re-renders the route segment. Without the directive, Next.js would attempt to run it as a Server Component and fail because error boundaries need client-side lifecycle.

### Question 14 — Answer: B

`useState`, `useEffect`, event handlers, and browser APIs are only available in Client Components. You must add `'use client'` as the first line of the file. Without it, Next.js treats the component as a Server Component running on the server where these APIs do not exist.

### Question 15 — Answer: C

`{ cache: 'no-store' }` tells Next.js to fetch fresh data on every request (SSR behavior). `force-cache` is SSG (never refetches), `revalidate: 3600` is ISR (regenerates after 3600 seconds). Since Next.js 15, `fetch` is not cached by default, so explicit caching intent should always be specified.

### Question 16 — Answer: False

Azure Blob Storage cannot handle SSR because it only serves static files — there is no server runtime. Next.js requires Azure App Service (with Node.js) to execute Server Components, Route Handlers, and middleware. The higher cost is justified for public-facing pages that need SEO, server-side secrets, and compliance benefits.

### Question 17 — Answer: B

In Next.js, the server reads the session cookie via `cookies()`, verifies the session, and either renders the page or calls `redirect('/login')` — all before any HTML is sent to the browser. An unauthenticated user never sees protected content, not even briefly. In a Vite SPA, JavaScript must load and execute before auth checks run, creating a potential flash.

### Question 18 — Answer: B

BSP 982 requires sessions to timeout after 15 minutes of inactivity. The Redis session implementation uses a sliding TTL of 15 minutes (`SESSION_TTL = 15 * 60`), refreshing on each request. This is combined with BSP 1105's 8-hour absolute maximum session duration.

### Question 19 — Answer: True

`generateStaticParams` runs at build time, returning parameter objects for which Next.js pre-renders static pages. For slugs not in the build list, Next.js falls back to server-side rendering on the first request and caches the result, so subsequent visitors see the cached page without a rebuild.

### Question 20 — Answer: B

Middleware runs at the edge with limited runtime capabilities — it can read cookies and headers but cannot access databases or the full server runtime. It performs a lightweight check (does the session cookie exist?) for fast rejection. The page component, which has the full Node.js runtime, performs the heavyweight verification (is the session valid?) by calling the auth service or checking Redis.

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
