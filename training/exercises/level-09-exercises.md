# Level 9 — Public-Facing Applications: Exercises

> **EastWest Bank — Digital Platforms & Innovations**
>
> SPA vs SSR, Next.js Setup, Server Components & Data Fetching, Deploying Next.js on Azure

---

## Exercise 1 — SSR Product Comparison Page

**Difficulty:** Intermediate

### Learning Objectives

- Build a page mixing Server Components and Client Components in Next.js 16
- Implement `generateStaticParams` for pre-rendering known product pages
- Use the `'use client'` boundary correctly for interactive sections

### Requirements

Build a Product Comparison page at `/products/compare` that allows visitors to compare up to 3 EWB banking products side by side. The page has two distinct sections:

**Server Component (static):**
- Fetches the full product catalog from the API at build time (SSG)
- Renders SEO metadata (`generateMetadata`) with title "Compare Banking Products | EastWest Bank"
- Displays the PDIC deposit insurance notice (BSP 1033 compliance)

**Client Component (interactive):**
- Allows users to select up to 3 products from a dropdown
- Displays a comparison table: interest rate, minimum deposit, fees, features
- Highlights differences between selected products
- Includes a "Apply Now" CTA linking to `/apply/{product-slug}`

### Starter Code

```tsx
// app/products/compare/page.tsx
import { z } from 'zod';
import { ProductComparisonTool } from './comparison-tool';

const ProductSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  category: z.string(),
  interestRate: z.number().optional(),
  minimumDeposit: z.number().optional(),
  monthlyFee: z.number(),
  features: z.array(z.string()),
});

type Product = z.infer<typeof ProductSchema>;

async function getProducts(): Promise<Product[]> {
  // TODO: Fetch products with ISR (revalidate: 3600)
  // Validate with Zod
}

export const metadata = {
  // TODO: SEO metadata for the comparison page
};

export default async function ComparePage() {
  const products = await getProducts();

  return (
    <main className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900">Compare Products</h1>
      <p className="mt-2 text-gray-600">
        Select up to 3 products to compare features, rates, and fees.
      </p>

      {/* Client Component receives server-fetched data as props */}
      <ProductComparisonTool products={products} />
    </main>
  );
}
```

```tsx
// app/products/compare/comparison-tool.tsx
'use client';

// TODO: Build the interactive comparison tool
// Accept products as props from the Server Component
// Manage selection state with useState
// Render comparison table
```

### Acceptance Criteria

- [ ] Product data is fetched server-side with ISR (1 hour revalidation)
- [ ] The page has correct SEO metadata (title, description, Open Graph)
- [ ] The comparison tool is a Client Component with `'use client'`
- [ ] Users can select and deselect up to 3 products
- [ ] The comparison table shows interest rate, minimum deposit, monthly fee, and features
- [ ] "Apply Now" buttons link to the correct product application page
- [ ] The page works without JavaScript (products are listed in the HTML)
- [ ] PDIC deposit notice is visible in the server-rendered HTML

---

## Exercise 2 — Server-Side Authenticated Application Status

**Difficulty:** Challenge

### Learning Objectives

- Implement server-side authentication with cookies and middleware in Next.js
- Fetch user-specific data in Server Components using session tokens
- Handle authentication redirects and error states

### Requirements

Build a Loan Application Status page at `/apply/status` that:

1. **Middleware** (`middleware.ts`): Checks for a session cookie on `/apply/status`. Redirects to `/login` if not present.

2. **Server Component** (`app/apply/status/page.tsx`): Reads the session cookie, validates it server-side against Redis, fetches the user's loan applications from an internal API using server-only credentials, and renders the status list.

3. **Status display**: Shows each application with reference number, product name, submission date, current status (submitted/under-review/approved/rejected), and next steps.

4. **Error handling**: `error.tsx` catches API failures. `loading.tsx` shows a skeleton while data loads.

### Starter Code

```tsx
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const sessionId = request.cookies.get('ewb_session')?.value;

  // TODO: Check if session cookie exists
  // If not, redirect to login page with return URL
  // If yes, allow the request to continue
}

export const config = {
  matcher: ['/apply/status/:path*'],
};
```

```tsx
// app/apply/status/page.tsx
import { cookies } from 'next/headers';
import { z } from 'zod';

const ApplicationSchema = z.object({
  referenceNumber: z.string(),
  productName: z.string(),
  submittedAt: z.string().datetime(),
  status: z.enum(['submitted', 'under-review', 'approved', 'rejected']),
  nextSteps: z.string(),
});

// TODO: Read session cookie, validate session, fetch applications
// Render the status list as a Server Component
// Use server-only environment variables for API authentication
```

### Acceptance Criteria

- [ ] Middleware redirects unauthenticated users to `/login?returnTo=/apply/status`
- [ ] Session cookie is read and validated server-side (no client-side token handling)
- [ ] Loan applications are fetched using server-only API credentials from Key Vault
- [ ] API responses are validated with Zod
- [ ] Each application shows: reference number, product, date, status badge, next steps
- [ ] `error.tsx` provides a meaningful error message with retry option
- [ ] `loading.tsx` shows a skeleton placeholder during data fetch
- [ ] No sensitive data (API keys, session secrets) appears in the client bundle

---

## Exercise 3 — Next.js Azure Deployment with CDN Verification

**Difficulty:** Challenge

### Learning Objectives

- Configure a three-stage Dockerfile for Next.js standalone output
- Write Azure CDN caching rules for mixed static/dynamic content
- Build a verification script for post-deployment health and cache checks

### Requirements

1. **Dockerfile**: Write a production Dockerfile for the EWB public site following the three-stage pattern from B10 (deps, build, runner). The final image must:
   - Use `node:24-alpine` as the base
   - Run as a non-root user
   - Include only the standalone output (no `node_modules`)
   - Expose port 3000

2. **CDN cache verification script**: Write a bash script that verifies correct `Cache-Control` headers for each content type after deployment:

   | Path Pattern | Expected Cache Behavior |
   |-------------|------------------------|
   | `/_next/static/chunks/main-abc123.js` | `max-age=31536000, immutable` |
   | `/_next/image?url=...` | `max-age=86400` |
   | `/api/health` | `no-cache` or `no-store` |
   | `/products` (HTML) | `s-maxage=60` or similar short TTL |

3. **Health check endpoint**: Build a Route Handler at `/api/health` that checks Redis connectivity and Key Vault access, returns 200 if healthy or 503 if degraded.

### Acceptance Criteria

- [ ] Dockerfile builds successfully with `docker build -t ewb-public .`
- [ ] Final Docker image is under 200MB
- [ ] Container runs as non-root user (`nextjs:nodejs`)
- [ ] Health endpoint returns `{ status: 'healthy', checks: { redis: 'ok', keyvault: 'ok' } }`
- [ ] Health endpoint returns 503 with degraded status if Redis or Key Vault is unreachable
- [ ] CDN verification script checks at least 4 different path patterns
- [ ] Script exits with code 1 if any cache header is incorrect
- [ ] `output: 'standalone'` is configured in `next.config.ts`

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
