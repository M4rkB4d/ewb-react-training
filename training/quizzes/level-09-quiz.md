# Level 9 — Public-Facing Applications: Quiz

> **EastWest Bank — Digital Platforms & Innovations**
>
> SPA vs SSR, Next.js Setup, Server Components & Data Fetching, Deploying Next.js on Azure

---

## Instructions

Answer all 12 questions. For multiple choice, select the single best answer. For short answer, keep responses to 2-3 sentences.

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

### Question 3 (Short Answer)

Explain why BSP Circular 1033 (fee disclosures) favors server-side rendering over client-side rendering for the public website. Consider what search engines and regulators see.

---

### Question 4 (Multiple Choice)

In Next.js 15 with the App Router, which file makes a URL route accessible?

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

### Question 6 (Short Answer)

A Server Component in Next.js fetches product data using `async/await`. Explain why this component cannot use `useState` or `useEffect`, and what a developer must do if interactivity is needed.

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

### Question 10 (Short Answer)

The product detail page calls `getProduct(slug)` in both `generateMetadata` and the page component body. Does this result in two separate API calls? Explain how Next.js handles this.

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

*EastWest Bank Digital Platforms & Innovations | Confidential*
