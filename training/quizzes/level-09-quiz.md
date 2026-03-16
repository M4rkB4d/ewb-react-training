# Level 9 Quiz — Public-Facing Applications

> **EastWest Bank — Digital Platforms & Innovations**
>
> React Training Program · Level 9 Assessment

---

## Instructions

- Answer all 20 questions.
- For multiple choice, select the single best answer (A/B/C/D).
- For true/false, write True or False.

---

### Question 1 (Multiple Choice)

Which rendering strategy is best suited for the EWB exchange rates page that updates every few minutes and must be indexed by Google?

A. Client-Side Rendering (CSR)
B. Server-Side Rendering (SSR) on every request
C. Static Site Generation (SSG) at build time
D. Incremental Static Regeneration (ISR) with a 60-second revalidation

---

### Question 2 (True/False)

The internal banking portal at `portal.ewbanking.com` should be converted from a Vite SPA to Next.js SSR for improved security and performance.

---

### Question 3 (Multiple Choice)

Why does BSP Circular 1033 favor server-side rendering over client-side rendering for the public website?

A. Server-side rendering is required by Philippine law for all banking websites
B. Fee disclosures rendered by JavaScript may not be reliably indexed by search engines or visible in page source to regulators
C. Client-side rendering cannot display Philippine Peso currency symbols correctly
D. Server-side rendering eliminates the need for Content Security Policy headers

---

### Question 4 (Multiple Choice)

In Next.js 16 with the App Router, which file makes a URL route accessible?

A. `route.tsx`
B. `index.tsx`
C. `page.tsx`
D. `component.tsx`

---

### Question 5 (Multiple Choice)

What happens to Next.js environment variables that do NOT have the `NEXT_PUBLIC_` prefix?

A. They are available on both server and client
B. They are only available in server-side code and never included in the browser bundle
C. They cause a build error
D. They are available only during development, not in production

---

### Question 6 (True/False)

In Next.js, every component in the `app/` directory is a Client Component by default and must be explicitly marked as a Server Component.

---

### Question 7 (Multiple Choice)

In the Next.js deployment architecture for EWB, which Azure service hosts the Next.js application?

A. Azure Blob Storage with static website hosting
B. Azure Static Web Apps
C. Azure App Service (Linux, Node.js)
D. Azure Functions with serverless runtime

---

### Question 8 (Multiple Choice)

What is the purpose of `output: 'standalone'` in `next.config.ts`?

A. It enables Server Components in the application
B. It produces a minimal Node.js server without the full `node_modules` directory
C. It configures the app for static export only
D. It enables ISR caching at the CDN layer

---

### Question 9 (True/False)

In the Next.js CI/CD pipeline for EWB, production deployments use Azure App Service deployment slot swaps, enabling instant rollback if issues are detected after deploy.

---

### Question 10 (Multiple Choice)

The product detail page calls `getProduct(slug)` in both `generateMetadata` and the page component body. How does Next.js handle this?

A. It makes two separate API calls, which is a performance issue that must be fixed manually
B. It automatically deduplicates `fetch` calls with the same URL, making only one actual HTTP request
C. It caches the result in `localStorage` for the second call
D. It throws an error because duplicate fetch calls are not allowed in Server Components

---

### Question 11 (Multiple Choice)

What is the role of Redis (Azure Cache for Redis) in the Next.js deployment architecture?

A. Caching server-rendered HTML pages for CDN
B. Storing session data with sliding TTL expiration and rate limiting
C. Queuing background jobs for ISR page regeneration
D. Storing user preferences and locale settings

---

### Question 12 (Multiple Choice)

The CDN cache rule for `/_next/static/*` assets is set to 1 year. Why is this safe?

A. Next.js automatically purges the CDN cache on every deployment
B. Static assets are content-hashed — new deployments produce new filenames
C. Azure Front Door detects file changes and invalidates stale entries
D. The App Service sends `Cache-Control: must-revalidate` headers

---

### Question 13 (True/False)

In Next.js, `error.tsx` files must include `'use client'` because they use React's error boundary mechanism, which requires client-side state management.

---

### Question 14 (Multiple Choice)

A component needs to use `useState` for interactive form inputs and `onClick` event handlers. What must you do in Next.js?

A. Nothing — all components support `useState` and event handlers by default
B. Add `'use client'` as the first line of the file to make it a Client Component
C. Import `useState` from `'react/client'` instead of `'react'`
D. Wrap the component in a `<ClientBoundary>` component

---

### Question 15 (Multiple Choice)

Which fetch caching option in Next.js ensures a page is re-rendered on every request with fresh data?

A. `{ cache: 'force-cache' }`
B. `{ next: { revalidate: 3600 } }`
C. `{ cache: 'no-store' }`
D. `{ next: { revalidate: 0 } }`

---

### Question 16 (True/False)

For the EWB public site, Azure Blob Storage is recommended over Azure App Service because it is cheaper and handles SSR natively.

---

### Question 17 (Multiple Choice)

How does server-side authentication in Next.js prevent the "flash of protected content" that can occur in a Vite SPA?

A. It uses CSS to hide content until JavaScript loads
B. The server reads the session cookie and redirects unauthenticated users before any HTML is sent
C. It pre-renders a loading spinner on all protected routes
D. It uses service workers to intercept the initial page request

---

### Question 18 (Multiple Choice)

What is the session timeout duration required by BSP 982 for the Redis-backed session management?

A. 5 minutes
B. 15 minutes
C. 30 minutes
D. 1 hour

---

### Question 19 (True/False)

In Next.js, the `generateStaticParams` function runs at build time and pre-renders pages for each set of returned parameters. New slugs not in the build list are rendered on demand via SSR and cached automatically.

---

### Question 20 (Multiple Choice)

Next.js middleware runs at the edge before the page component executes. What is the recommended scope of authentication checks in middleware versus the page component?

A. Middleware performs full session verification including database lookups; the page component does not check auth
B. Middleware checks for session cookie existence (lightweight); the page component performs full session verification with the server runtime
C. Both middleware and the page component perform identical full session verification for defense in depth
D. Middleware handles all authentication; the page component never reads cookies

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
