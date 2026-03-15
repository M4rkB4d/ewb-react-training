# A22 — Server Components and Data Fetching

> **EastWest Bank — Digital Platforms & Innovations**
>
> Part C (Next.js) · Level 9 — Public-Facing Applications

---

## What You Will Learn

By the end of this guide, you will:

- Understand the Server Component and Client Component mental model
- Fetch data with `async/await` directly in server components
- Choose the right caching strategy per page (SSG, ISR, SSR)
- Build dynamic routes with `generateStaticParams` and `generateMetadata`
- Handle errors and loading states with Next.js special files

---

## Prerequisites

| Requirement | Where |
|------------|-------|
| Completed A21 — Next.js Project Setup | Level 9 |
| Completed B03 — API Integration | Level 5 |
| Completed A13 — Error Handling | Level 6 |

---

## Phase 1 — Server vs Client Components

### The default is server

Every component in the `app/` directory is a Server Component by default.
This is the opposite of what you are used to in the Vite SPA, where every
component runs in the browser by default.

A Server Component runs on the server at request time (or build time for
static pages). Its code never ships to the browser. Its dependencies never
appear in the JavaScript bundle. This means you can:

- Access the database directly
- Read files from the filesystem
- Call internal APIs with secret keys
- Import large libraries without affecting bundle size

### The `'use client'` boundary

To make a component run in the browser, add `'use client'` as the first line
of the file. This creates a boundary — everything below it (including children
imported from that file) becomes part of the client bundle.

```tsx
// src/components/loan-calculator.tsx
'use client';

import { useState } from 'react';

export function LoanCalculator() {
  const [principal, setPrincipal] = useState(100_000);
  const [rate, setRate] = useState(8.5);
  const [term, setTerm] = useState(12);

  const monthly = rate === 0
    ? principal / term
    : (principal * (rate / 100 / 12)) /
      (1 - Math.pow(1 + rate / 100 / 12, -term));

  return (
    <div className="rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900">Loan Calculator</h3>
      <div className="mt-4 space-y-4">
        <label className="block">
          <span className="text-sm text-gray-600">Amount (₱)</span>
          <input
            type="number"
            value={principal}
            onChange={(e) => setPrincipal(Number(e.target.value))}
            className="mt-1 block w-full rounded-lg border px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="text-sm text-gray-600">Annual Rate (%)</span>
          <input
            type="number"
            step="0.1"
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="mt-1 block w-full rounded-lg border px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="text-sm text-gray-600">Term (months)</span>
          <input
            type="number"
            value={term}
            onChange={(e) => setTerm(Number(e.target.value))}
            className="mt-1 block w-full rounded-lg border px-3 py-2"
          />
        </label>
        <p className="text-lg font-semibold text-ewb-purple">
          Monthly payment: ₱{monthly.toFixed(2)}
        </p>
      </div>
    </div>
  );
}
```

This component needs `useState` for interactive inputs. It must be a Client
Component. Without `'use client'`, Next.js would throw an error because
`useState` is not available on the server.

### What you can and cannot do

| Capability | Server Component | Client Component |
|-----------|-----------------|-----------------|
| `async/await` in component body | Yes | No |
| `useState`, `useEffect` | No | Yes |
| Browser APIs (`window`, `document`) | No | Yes |
| Event handlers (`onClick`, `onChange`) | No | Yes |
| Import server-only modules | Yes | No |
| Access `cookies()`, `headers()` | Yes | No |
| Included in JS bundle | No | Yes |
| Can render Client Components | Yes | — |
| Can render Server Components | — | Only as `children` prop |

### EWB banking component mapping

| Component | Type | Why |
|-----------|------|-----|
| Product catalog page | Server | Fetches product data from API, no interactivity |
| Exchange rate table | Server | Fetches rates from API, displays static table |
| Branch locator map | Client | Uses Google Maps API, needs browser `navigator.geolocation` |
| Loan calculator | Client | Real-time calculation with `useState` |
| Product comparison tool | Client | Drag-and-drop, selection state, animations |
| PDIC deposit notice (footer) | Server | Static regulatory text, must be in initial HTML |
| Application status page | Server | Reads session cookie, fetches user-specific data |
| Rate alert signup form | Client | Form state, validation, submission handler |

The pattern: if a component needs interactivity or browser APIs, it is a Client
Component. Everything else stays as a Server Component to minimize the JavaScript
bundle sent to users on 4G connections in Philippine provinces (BSP 1105).

### Checkpoint 1

A developer adds `onClick` to a Server Component without `'use client'`. What
error will Next.js show? Explain why event handlers are not supported in Server
Components by considering where the code executes.

---

## Phase 2 — Data Fetching in Server Components

### Fetching with `async/await`

In the Vite SPA (B03), you fetch data with TanStack Query inside `useEffect`
or custom hooks. The data is fetched in the browser after the page loads.

In a Server Component, you fetch data directly in the component body using
`async/await`. The data is fetched on the server, and the rendered HTML is
sent to the browser with the data already embedded.

```tsx
// app/products/page.tsx
import { z } from 'zod';
import Image from 'next/image';
import Link from 'next/link';
import { clientEnv } from '@/lib/env';

const ProductSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  summary: z.string(),
  category: z.enum(['savings', 'loans', 'credit-cards', 'investments']),
  interestRate: z.number().nonnegative().optional(),
});

const ProductListSchema = z.array(ProductSchema);

type Product = z.infer<typeof ProductSchema>;

// For production, consider using serverEnv.INTERNAL_API_URL for server-side
// fetches to avoid the public internet round-trip. We use NEXT_PUBLIC_API_URL
// here because the same URL works in both server and client contexts.
async function getProducts(): Promise<Product[]> {
  const res = await fetch(`${clientEnv.NEXT_PUBLIC_API_URL}/products`, {
    next: { revalidate: 3600 }, // Revalidate every hour (ISR)
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch products: ${res.status}`);
  }

  const data = await res.json();
  return ProductListSchema.parse(data);
}

export const metadata = {
  title: 'Banking Products | EastWest Bank',
  description: 'Explore savings accounts, personal loans, credit cards, and investment products from EastWest Bank.',
};

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <main className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900">Our Products</h1>
      <p className="mt-2 text-gray-600">
        Find the right banking product for your needs.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <Link key={product.id} href={`/products/${product.slug}`}>
            <div className="overflow-hidden rounded-xl border border-gray-200 transition-shadow hover:shadow-md">
              <Image
                src={`https://cdn.ewbanking.com/products/${product.slug}.jpg`}
                alt={product.name}
                width={400}
                height={240}
                className="h-48 w-full object-cover"
              />
              <div className="p-4">
                <h2 className="font-semibold text-gray-900">{product.name}</h2>
                <p className="mt-1 text-sm text-gray-600">{product.summary}</p>
                {product.interestRate != null && (
                  <p className="mt-2 text-sm font-medium text-ewb-purple">
                    From {product.interestRate}% p.a.
                  </p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
```

Notice: no `useEffect`, no `useState`, no loading spinners. The page fetches
data on the server and renders complete HTML. Users on slow connections in
Visayas or Mindanao see content immediately — no blank screen while JavaScript
loads and then fetches data.

### Caching strategies

The `next` option in `fetch` controls how Next.js caches the response:

```tsx
// SSG — built at build time, never refetches
await fetch(url, { cache: 'force-cache' });

// ISR — revalidates after the specified number of seconds
await fetch(url, { next: { revalidate: 60 } });

// SSR — fetches fresh data on every request
await fetch(url, { cache: 'no-store' });
```

> **Since Next.js 15:** `fetch` calls are NOT cached by default (unlike Next.js 14 where `force-cache` was the default). This behavior continues in Next.js 16. Always specify your caching intent explicitly with `cache` or `next.revalidate`.

With ISR (`revalidate: 60`), cached content is served to all users during the revalidation window. At T+60s, the first request triggers a **background revalidation** — users continue seeing the cached version until the fresh data is ready. If the revalidation fetch fails, Next.js keeps serving the stale cache (stale-while-revalidate behavior).

> **Banking safety:** Never use ISR for user-specific data. If you accidentally cache an application status page with ISR, one user's approval status could be served to another user. User-specific data must always use `cache: 'no-store'`.

Applied to EWB pages:

| Page | Strategy | Revalidation | Why |
|------|----------|-------------|-----|
| Product catalog | ISR | 3600s (1 hour) | Products change rarely, hourly refresh is sufficient |
| Exchange rates | ISR | 60s (1 minute) | Rates update frequently, 1-min staleness is acceptable |
| Loan terms | SSR | Every request | Terms may include personalized pre-qualification data |
| Branch list | SSG | Build time | Branch locations change quarterly at most |
| Regulatory disclosures | SSG | Build time | Legal text changes only with BSP circular updates |
| Application status | SSR | Every request | User-specific data, must be current |

This is the power A20 described — Next.js lets you choose the rendering
strategy per route, per fetch call.

### Exchange rates with ISR

```tsx
// app/rates/page.tsx
import { z } from 'zod';
import { clientEnv } from '@/lib/env';

const RateSchema = z.object({
  currency: z.string(),
  currencyName: z.string(),
  buyRate: z.number(),
  sellRate: z.number(),
  updatedAt: z.string().datetime(),
});

const RateListSchema = z.array(RateSchema);

async function getRates() {
  const res = await fetch(`${clientEnv.NEXT_PUBLIC_API_URL}/rates/forex`, {
    next: { revalidate: 60 }, // Refresh every 60 seconds
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch rates: ${res.status}`);
  }

  return RateListSchema.parse(await res.json());
}

export const metadata = {
  title: 'Exchange Rates | EastWest Bank',
  description: 'Current foreign exchange rates for USD, EUR, JPY, and more.',
};

export default async function RatesPage() {
  const rates = await getRates();

  return (
    <main className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900">Exchange Rates</h1>
      <p className="mt-2 text-sm text-gray-500">
        Rates are indicative and updated every minute. Last update:{' '}
        {new Date(rates[0]?.updatedAt ?? '').toLocaleString('en-PH', {
          timeZone: 'Asia/Manila',
        })}
      </p>

      <table className="mt-8 w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-200 text-left text-sm text-gray-500">
            <th className="pb-3 font-medium">Currency</th>
            <th className="pb-3 font-medium">Buy (₱)</th>
            <th className="pb-3 font-medium">Sell (₱)</th>
          </tr>
        </thead>
        <tbody>
          {rates.map((rate) => (
            <tr key={rate.currency} className="border-b border-gray-100">
              <td className="py-3">
                <span className="font-medium text-gray-900">{rate.currency}</span>
                <span className="ml-2 text-sm text-gray-500">{rate.currencyName}</span>
              </td>
              <td className="py-3 text-gray-900">₱{rate.buyRate.toFixed(4)}</td>
              <td className="py-3 text-gray-900">₱{rate.sellRate.toFixed(4)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
```

With `revalidate: 60`, the first visitor after 60 seconds triggers a
background regeneration. While the new page is being built, all visitors
continue to see the cached version. Once the new page is ready, it replaces
the cache. No downtime, no stale data beyond 60 seconds.

### Checkpoint 2

The exchange rates page uses `revalidate: 60`. A user visits at T+0, and
the page is cached. At T+45, another user visits and sees the cached page.
At T+65, a third user visits. Explain exactly what happens for the third
user: do they see stale data? When does the new data appear? What does the
fourth user at T+70 see?

---

## Phase 3 — Dynamic Routes and Static Params

### Route parameters with `[slug]`

A file named `app/products/[slug]/page.tsx` matches any URL like
`/products/savings`, `/products/personal-loans`, or `/products/credit-cards`.
The slug is passed as a parameter.

```tsx
// app/products/[slug]/page.tsx
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { z } from 'zod';
import { clientEnv } from '@/lib/env';

const ProductDetailSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.string(),
  interestRate: z.number().nonnegative().optional(),
  features: z.array(z.string()),
  requirements: z.array(z.string()),
  minDeposit: z.number().int().nonnegative().optional(), // centavos
});

type ProductDetail = z.infer<typeof ProductDetailSchema>;

async function getProduct(slug: string): Promise<ProductDetail | null> {
  const res = await fetch(
    `${clientEnv.NEXT_PUBLIC_API_URL}/products/${slug}`,
    { next: { revalidate: 3600 } },
  );

  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to fetch product: ${res.status}`);

  return ProductDetailSchema.parse(await res.json());
}

export async function generateStaticParams() {
  const res = await fetch(`${clientEnv.NEXT_PUBLIC_API_URL}/products`);
  const products = z.array(z.object({ slug: z.string() })).parse(await res.json());

  return products.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return { title: 'Product Not Found | EastWest Bank' };
  }

  return {
    title: `${product.name} | EastWest Bank`,
    description: product.description.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.description.slice(0, 160),
      images: [`https://cdn.ewbanking.com/products/${product.slug}.jpg`],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-12">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        <Image
          src={`https://cdn.ewbanking.com/products/${product.slug}.jpg`}
          alt={product.name}
          width={600}
          height={400}
          className="rounded-xl"
          priority
        />

        <div>
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          <p className="mt-4 text-gray-600">{product.description}</p>

          {product.interestRate != null && (
            <p className="mt-4 text-2xl font-bold text-ewb-purple">
              {product.interestRate}% p.a.
            </p>
          )}

          {product.minDeposit != null && (
            <p className="mt-2 text-sm text-gray-500">
              Minimum deposit: ₱{product.minDeposit.toLocaleString('en-PH')}
            </p>
          )}

          <h2 className="mt-8 text-xl font-semibold text-gray-900">Features</h2>
          <ul className="mt-4 space-y-2">
            {product.features.map((feature, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1 text-ewb-lime">✓</span>
                <span className="text-gray-600">{feature}</span>
              </li>
            ))}
          </ul>

          <h2 className="mt-8 text-xl font-semibold text-gray-900">Requirements</h2>
          <ul className="mt-4 space-y-2">
            {product.requirements.map((req, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1 text-gray-400">•</span>
                <span className="text-gray-600">{req}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
```

### How `generateStaticParams` works

`generateStaticParams` runs at build time and returns an array of parameter
objects. Next.js pre-renders a page for each set of parameters. In the example
above, if the API returns products with slugs `savings`, `personal-loans`, and
`credit-cards`, Next.js generates three static HTML pages.

When a user visits `/products/time-deposit` (a slug that was not in the build
list), Next.js falls back to server-side rendering for that request and caches
the result. Subsequent visitors see the cached page. This means new products
are available immediately without a rebuild.

### Dynamic metadata for SEO

`generateMetadata` receives the same params as the page component. It fetches
the product data (deduplicated by Next.js — the same fetch URL is only called
once) and returns metadata for search engines and social media.

This is critical for BSP 1033 compliance. Regulatory disclosures for each
product (interest rates, fees, terms) must be discoverable by search engines.
With SSG/ISR and `generateMetadata`, Google indexes each product page with
the correct title, description, and Open Graph images — without executing
JavaScript.

### Checkpoint 3

The product detail page calls `getProduct(slug)` in both `generateMetadata`
and the page component. Does this result in two API calls? Explain how Next.js
deduplicates `fetch` calls and under what conditions deduplication applies.

---

## Phase 4 — Error Handling and Loading States

### `error.tsx` — route-level error boundary

```tsx
// app/rates/error.tsx
'use client'; // error.tsx MUST be a Client Component

import { useEffect } from 'react';

export default function RatesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to Application Insights (from B06)
    console.error('Rates page error:', error);
  }, [error]);

  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <h2 className="text-2xl font-bold text-gray-900">
        Unable to Load Exchange Rates
      </h2>
      <p className="mt-4 text-gray-600">
        We could not retrieve the latest exchange rates. This may be a temporary
        issue — please try again in a moment.
      </p>
      <button
        onClick={() => reset()}
        className="mt-6 rounded-lg bg-ewb-purple px-6 py-2 text-white hover:bg-ewb-purple/90"
      >
        Try Again
      </button>
      {error.digest && (
        <p className="mt-4 text-xs text-gray-400">
          Error reference: {error.digest}
        </p>
      )}
    </div>
  );
}
```

`error.tsx` **must** include `'use client'` because it uses React's error
boundary mechanism, which requires client-side state management. The `reset`
function re-renders the route segment, attempting the server-side data fetch
again.

The `digest` property is a server-generated hash that identifies the error
without exposing stack traces to the browser. The user sees a reference code;
the full error is in the server logs (BSP 1019 compliance for incident
tracing).

This replaces the React `ErrorBoundary` pattern from A13. In the Vite SPA,
you wrap components in `<ErrorBoundary>` manually. In Next.js, placing an
`error.tsx` file in a route segment automatically creates a boundary for that
segment and all its children.

### `not-found.tsx` — 404 handling

```tsx
// app/products/[slug]/not-found.tsx
import Link from 'next/link';

export default function ProductNotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <h2 className="text-2xl font-bold text-gray-900">Product Not Found</h2>
      <p className="mt-4 text-gray-600">
        The product you are looking for does not exist or may have been
        discontinued.
      </p>
      <Link
        href="/products"
        className="mt-6 inline-block rounded-lg bg-ewb-purple px-6 py-2 text-white hover:bg-ewb-purple/90"
      >
        Browse All Products
      </Link>
    </div>
  );
}
```

When a Server Component calls `notFound()` (imported from `next/navigation`),
Next.js renders the nearest `not-found.tsx` file. If no segment-level
`not-found.tsx` exists, the root `app/not-found.tsx` is used.

### `loading.tsx` — streaming with Suspense

```tsx
// app/rates/loading.tsx
export default function RatesLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
      <div className="mt-2 h-4 w-64 animate-pulse rounded bg-gray-100" />

      <div className="mt-8 space-y-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="h-5 w-12 animate-pulse rounded bg-gray-200" />
            <div className="h-5 w-24 animate-pulse rounded bg-gray-100" />
            <div className="h-5 w-24 animate-pulse rounded bg-gray-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
```

`loading.tsx` is rendered immediately while the page's async data fetching
completes. It is automatically wrapped in a `<Suspense>` boundary by Next.js.
Users see the skeleton immediately, then the real content streams in when
ready. This improves perceived performance — the user sees structure
instantly rather than a blank page.

### Nested Suspense for independent data

When a page fetches from multiple data sources with different latencies, you
can nest `<Suspense>` boundaries to stream each section independently:

```tsx
// app/page.tsx (homepage)
import { Suspense } from 'react';
import { HeroSection } from '@/components/hero-section';
import { ProductHighlights } from '@/components/product-highlights';
import { RatesSummary } from '@/components/rates-summary';
import { LoanCalculator } from '@/components/loan-calculator';

export default function HomePage() {
  return (
    <main>
      {/* Static — renders immediately */}
      <HeroSection />

      {/* Server Component — fetches products (ISR 1hr) */}
      <Suspense fallback={<ProductHighlightsSkeleton />}>
        <ProductHighlights />
      </Suspense>

      {/* Server Component — fetches rates (ISR 60s) */}
      <Suspense fallback={<RatesSummarySkeleton />}>
        <RatesSummary />
      </Suspense>

      {/* Client Component — no server fetch needed */}
      <LoanCalculator />
    </main>
  );
}

function ProductHighlightsSkeleton() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-64 animate-pulse rounded-xl bg-gray-100" />
        ))}
      </div>
    </section>
  );
}

function RatesSummarySkeleton() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="h-32 animate-pulse rounded-xl bg-gray-100" />
    </section>
  );
}
```

The hero renders instantly (static HTML). Products and rates stream in as
their data arrives, independently of each other. The loan calculator is a
Client Component that renders its UI immediately (no data fetch). This
composition pattern delivers the fastest possible LCP for the homepage
(BSP 1105: LCP < 2.5s target).

### Checkpoint 4

Explain why `error.tsx` must be a Client Component (`'use client'`) even
though it handles errors from Server Components. What happens if you omit
the `'use client'` directive?

---

## Key Takeaways

1. **Server Components are the default** — only add `'use client'` when a
   component needs interactivity (state, effects, event handlers, browser
   APIs). Everything else stays on the server.

2. **Data fetching is `async/await`** — no `useEffect`, no TanStack Query
   for server-rendered data. The component itself is an `async function` that
   fetches and renders directly.

3. **Caching strategy is per-fetch** — `revalidate: 3600` for products,
   `revalidate: 60` for rates, `cache: 'no-store'` for user-specific data.
   Each fetch call declares its own caching behavior.

4. **`error.tsx` and `not-found.tsx` replace manual error boundaries** —
   place them in route segments and Next.js creates the boundary
   automatically. `error.tsx` must be `'use client'`.

5. **`generateStaticParams` pre-renders dynamic routes** — known slugs are
   built at build time, unknown slugs fall back to SSR and get cached
   automatically.

6. **Nested `<Suspense>` boundaries stream independent sections** — each
   section loads as its data arrives, delivering the fastest possible LCP
   for composite pages.

---

## Exercises

### Exercise 1 — Branch Locator

Build a branch locator with three layers:

1. `app/branches/page.tsx` — Server Component that fetches all EWB branches
   (SSG with `generateStaticParams`). Display as a list with branch name,
   address, and hours.
2. `app/branches/[branchId]/page.tsx` — Dynamic route with individual branch
   details, SEO metadata, and a hero image.
3. A `BranchMap` Client Component that embeds a Google Maps view and uses
   `navigator.geolocation` to show the nearest branch.

Consider which parts must be Client Components and which should remain
Server Components. The branch list should be indexable by search engines.

### Exercise 2 — Product Comparison

Build a product comparison tool that combines server data with client
interaction:

1. Create a Server Component that fetches all savings account products
   with their features and rates.
2. Pass the data to a Client Component (`'use client'`) that lets users
   select 2–3 products and displays them side by side.
3. The comparison state (selected products) lives in the client. The product
   data comes from the server. No additional API calls should be needed
   after the initial page load.

This exercises the composition pattern — server fetches data, client manages
interaction.

---

## What Comes Next

You now understand the Server Component model, server-side data fetching with
caching strategies, dynamic routes, and error handling in Next.js.

**Next guide:** [A23 — Server-Side Auth, API Routes, and Composition](A23_server-components-advanced.md) —
where you implement server-side authentication with cookies and middleware,
create Route Handlers to proxy external APIs with server-side secrets, and
compose a full page from multiple rendering strategies.

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
