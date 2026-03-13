# A22 — Server Components and Data Fetching

> **EastWest Bank — Digital Platforms & Innovations**
>
> Part C (Next.js) · Level 9 — Public-Facing Applications · Est. 3.5 hours

---

## What You Will Learn

By the end of this guide, you will:

- Understand the Server Component and Client Component mental model
- Fetch data with `async/await` directly in server components
- Choose the right caching strategy per page (SSG, ISR, SSR)
- Build dynamic routes with `generateStaticParams` and `generateMetadata`
- Handle errors and loading states with Next.js special files
- Implement server-side authentication with `cookies()` and middleware
- Create Route Handlers to proxy external APIs with server-side secrets
- Compose a page from multiple rendering strategies

---

## Prerequisites

| Requirement | Where |
|------------|-------|
| Completed A21 — Next.js Project Setup | Level 9 |
| Completed B03 — Data Fetching with TanStack Query | Level 3 |
| Completed A13 — Error Handling Patterns | Level 5 |

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

  const monthly = (principal * (rate / 100 / 12)) /
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
  interestRate: z.number().optional(),
});

const ProductListSchema = z.array(ProductSchema);

type Product = z.infer<typeof ProductSchema>;

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
                {product.interestRate && (
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
  interestRate: z.number().optional(),
  features: z.array(z.string()),
  requirements: z.array(z.string()),
  minDeposit: z.number().optional(),
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

          {product.interestRate && (
            <p className="mt-4 text-2xl font-bold text-ewb-purple">
              {product.interestRate}% p.a.
            </p>
          )}

          {product.minDeposit && (
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

## Phase 5 — Server-Side Authentication

### Reading cookies in Server Components

The Vite SPA (B04) handles authentication entirely in the browser — store a
token, attach it to API requests, redirect on 401. The problem: the browser
briefly renders protected content before JavaScript runs and checks the token.
This is the "flash of protected content" that BSP 982 auditors flag as a
security concern.

In Next.js, authentication happens on the server before any HTML is sent:

```tsx
// app/apply/status/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { serverEnv } from '@/lib/env';

const ApplicationSchema = z.object({
  id: z.string(),
  type: z.enum(['personal-loan', 'credit-card', 'mortgage']),
  status: z.enum(['submitted', 'under-review', 'approved', 'rejected']),
  submittedAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  referenceNumber: z.string(),
});

const ApplicationListSchema = z.array(ApplicationSchema);

async function verifySession(sessionToken: string) {
  const res = await fetch(`${serverEnv.INTERNAL_AUTH_URL}/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${serverEnv.AUTH_SERVICE_KEY}`,
    },
    body: JSON.stringify({ token: sessionToken }),
    cache: 'no-store',
  });

  if (!res.ok) return null;
  return z.object({ userId: z.string(), email: z.string() }).parse(await res.json());
}

async function getApplications(userId: string) {
  const res = await fetch(
    `${serverEnv.INTERNAL_API_URL}/users/${userId}/applications`,
    {
      headers: { Authorization: `Bearer ${serverEnv.AUTH_SERVICE_KEY}` },
      cache: 'no-store',
    },
  );

  if (!res.ok) throw new Error('Failed to fetch applications');
  return ApplicationListSchema.parse(await res.json());
}

export default async function ApplicationStatusPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('ewb_session')?.value;

  if (!sessionToken) {
    redirect('/login?returnTo=/apply/status');
  }

  const session = await verifySession(sessionToken);

  if (!session) {
    redirect('/login?returnTo=/apply/status');
  }

  const applications = await getApplications(session.userId);

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900">Application Status</h1>
      <p className="mt-2 text-gray-600">
        Track the progress of your loan and credit card applications.
      </p>

      {applications.length === 0 ? (
        <p className="mt-8 text-gray-500">You have no active applications.</p>
      ) : (
        <div className="mt-8 space-y-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className="rounded-xl border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">
                  {app.type.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                </h2>
                <StatusBadge status={app.status} />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Ref: {app.referenceNumber} · Submitted{' '}
                {new Date(app.submittedAt).toLocaleDateString('en-PH')}
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    submitted: 'bg-blue-100 text-blue-800',
    'under-review': 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${styles[status] ?? 'bg-gray-100 text-gray-800'}`}>
      {status.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
    </span>
  );
}
```

Key differences from the Vite SPA approach (B04):

| Concern | Vite SPA (B04) | Next.js Server Component |
|---------|---------------|-------------------------|
| Where auth runs | Browser (after JS loads) | Server (before HTML sent) |
| Flash of content | Possible (mitigated with guards) | Impossible (redirect before render) |
| Token storage | `localStorage` or cookie | Cookie (HttpOnly, server-read) |
| API secret keys | Not available (client-side) | Available via `serverEnv` |
| Auth verification | Client calls auth endpoint | Server calls auth endpoint with service key |
| BSP 982 risk | Token in browser memory | Session in HttpOnly cookie only |

### Middleware for route protection

For routes that always require authentication, middleware runs before the
page component. It intercepts the request and redirects unauthenticated
users without executing any page code.

```tsx
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get('ewb_session')?.value;
  const { pathname } = request.nextUrl;

  // Public routes — no auth required
  const publicPaths = ['/', '/products', '/rates', '/branches', '/about',
    '/contact', '/faq', '/privacy', '/terms', '/login', '/register'];

  const isPublic = publicPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  if (isPublic) {
    return NextResponse.next();
  }

  // Protected routes — redirect to login if no session
  if (!sessionToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('returnTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except static files and API routes
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
};
```

Middleware runs at the edge (before the server renders the page). It does not
have access to `serverEnv` or the database — only to cookies and headers. For
lightweight checks like "does a session cookie exist?", middleware is ideal.
For full session verification (is the session valid?), the page component
handles it because it has access to the full server runtime.

### Checkpoint 5

Why does middleware only check whether the session cookie exists, rather
than verifying the session with the auth service? Consider the performance
implications of running middleware on every request versus verifying the
session only on protected pages.

---

## Phase 6 — Route Handlers (API Routes)

### When you need a server endpoint

Server Components can fetch data directly from APIs. But sometimes you need
a dedicated endpoint:

- The client needs to send data (form submissions, real-time updates)
- You need to proxy an external API that requires secret credentials
- You want a public API for third-party consumers
- WebSocket connections or streaming responses

### Proxying external APIs with server-side secrets

```tsx
// app/api/rates/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSecret } from '@/lib/keyvault';

const RateSchema = z.object({
  currency: z.string(),
  currencyName: z.string(),
  buyRate: z.number(),
  sellRate: z.number(),
  updatedAt: z.string(),
});

export async function GET() {
  try {
    const apiKey = await getSecret('forex-provider-api-key');

    const res = await fetch('https://api.forexprovider.com/v2/rates/PHP', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
      },
      next: { revalidate: 30 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: 'Upstream rate service unavailable' },
        { status: 502 },
      );
    }

    const data = await res.json();
    const rates = z.array(RateSchema).parse(data.rates);

    return NextResponse.json(rates, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('Rate fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
```

The Route Handler imports `getSecret` from the Key Vault module created in
A21. The forex provider's API key is stored in Azure Key Vault, retrieved
server-side, and never exposed to the browser. The response is cached for
30 seconds with a stale-while-revalidate window of 60 seconds.

### When to use Route Handlers vs direct server fetch

| Approach | Use When |
|----------|---------|
| Direct `fetch` in Server Component | You control both the data source and the page rendering |
| Route Handler (`app/api/`) | Client Components need to fetch data, or external APIs require secret credentials |
| Route Handler as proxy | The upstream API requires authentication you cannot expose to the browser |

In the rates example above, the Server Component on the rates page could
fetch directly from the forex provider (using `serverEnv` for the API key).
But exposing the rates as a Route Handler also allows:

- Client Components to poll for rate updates
- Third-party tools to consume the rates
- CDN caching at the API level (separate from page caching)

### Handling POST requests

```tsx
// app/api/rate-alerts/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { serverEnv } from '@/lib/env';

const RateAlertSchema = z.object({
  email: z.string().email(),
  currency: z.string().length(3),
  targetRate: z.number().positive(),
  direction: z.enum(['above', 'below']),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const alert = RateAlertSchema.parse(body);

    // Forward to internal API with service key
    const res = await fetch(`${serverEnv.INTERNAL_API_URL}/rate-alerts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${serverEnv.AUTH_SERVICE_KEY}`,
      },
      body: JSON.stringify(alert),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: 'Failed to create rate alert' },
        { status: res.status },
      );
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 },
      );
    }

    console.error('Rate alert creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
```

Zod validates the request body before processing. Invalid requests return a
400 with structured error details. The internal API call uses a service key
from `serverEnv` that never reaches the browser. This is the same validation
pattern from A12 (Zod and form validation) applied to server-side endpoints.

### Checkpoint 6

The rates Route Handler uses `getSecret('forex-provider-api-key')` from Azure
Key Vault. In the Vite SPA, how would you handle this same requirement
(fetching data from an API that requires a secret key)? Compare the two
approaches in terms of security, architecture, and operational complexity.

---

## Phase 7 — Putting It Together

### Homepage composition

The homepage from Phase 4 demonstrates how a single page combines multiple
rendering strategies:

```
ewbanking.com/
├── Hero section          → Server Component (static HTML, no fetch)
├── Product highlights    → Server Component (ISR, revalidate: 3600)
│   └── Suspense boundary with skeleton
├── Exchange rates card   → Server Component (ISR, revalidate: 60)
│   └── Suspense boundary with skeleton
└── Loan calculator       → Client Component ('use client', useState)
```

Each section uses the strategy that matches its data characteristics:

- **Hero**: Static promotional content. Renders instantly.
- **Products**: Changes hourly. ISR with 1-hour revalidation.
- **Rates**: Changes every minute. ISR with 60-second revalidation.
- **Calculator**: Interactive. Client Component with no server data.

The `<Suspense>` boundaries let each section stream independently. If the
rates API is slow, the hero and products still appear instantly. The
calculator is interactive immediately because it loads as part of the client
bundle with no server dependency.

### Performance verification

After building the homepage, verify performance with Lighthouse:

```bash
npm run build
npm run start

# In another terminal:
npx lighthouse http://localhost:3000 --view
```

Target metrics (from A20, BSP 1105 compliance):

| Metric | Desktop Target | Mobile (4G) Target |
|--------|---------------|-------------------|
| LCP | < 1.5s | < 2.5s |
| FID / INP | < 100ms | < 200ms |
| CLS | < 0.05 | < 0.1 |
| TTFB | < 200ms | < 800ms |

If LCP exceeds targets, check:

1. Are images using `next/image` with `priority` on the hero?
2. Are fonts preloaded in `app/layout.tsx`?
3. Is the server fetch for products/rates taking too long?
4. Is the client JavaScript bundle too large? (Check with `next build` output)

### The full data flow

```
Browser request → Next.js server
                    │
                    ├── Middleware (check session cookie)
                    │
                    ├── Server Component tree
                    │     ├── Layout (renders header/footer)
                    │     ├── Page component (async fetch)
                    │     │     ├── fetch() with revalidate
                    │     │     ├── Zod validation
                    │     │     └── JSX with data
                    │     └── Suspense boundaries (stream)
                    │
                    ├── Client Components
                    │     └── Hydrated on the browser
                    │
                    └── HTML response → Browser
                          ├── Initial HTML (full content)
                          ├── Streaming chunks (Suspense)
                          └── Client JS bundle (hydration)
```

Compare this to the Vite SPA flow:

```
Browser request → CDN
                    │
                    └── index.html (empty shell)
                          │
                          └── Browser loads JS bundle
                                │
                                ├── React mounts
                                ├── React Router matches route
                                ├── useEffect triggers data fetch
                                ├── Loading spinner shown
                                ├── Data arrives
                                └── Content renders
```

The SSR flow sends content immediately. The SPA flow sends an empty shell
and relies on JavaScript to build the page. For public-facing banking pages
where first-time visitors arrive from Google or a BSP link, the SSR flow
is measurably faster and more accessible.

### Checkpoint 7

The homepage uses both Server Components (products, rates) and a Client
Component (calculator). When the browser receives the HTML, which parts
are already rendered and which parts require JavaScript to function?
What happens if the user's browser has JavaScript disabled?

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

5. **Server-side authentication eliminates flash of protected content** —
   the server reads the session cookie, verifies it, and either renders the
   page or redirects. No HTML is sent to unauthenticated users.

6. **Route Handlers provide server-side API proxying** — secrets stay in
   Azure Key Vault, API keys never reach the browser, and Zod validates
   both incoming requests and upstream responses.

7. **BSP 982 benefits compound in Next.js** — server-side secrets, auth
   before render, session cookies (HttpOnly), and no sensitive data in the
   JavaScript bundle. Every layer reduces the attack surface.

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

### Exercise 3 — Rate Alert Signup

Build a complete rate alert signup flow:

1. A Client Component form with fields for email, currency (select), target
   rate (number), and direction (above/below). Validate with Zod on the
   client before submission.
2. A Route Handler at `app/api/rate-alerts/route.ts` that receives the
   form data, validates with the same Zod schema, and stores the alert.
3. Handle all error states: validation errors (show field-level messages),
   server errors (show retry option), and success (show confirmation).

This exercises Zod validation on both client and server — the shared schema
pattern from A12 applied to the Next.js architecture.

---

## What Comes Next

You can now build data-driven pages with Server Components, handle errors
gracefully, protect routes with server-side authentication, and proxy
external APIs through Route Handlers. The application works locally.

**Next guide:** [B10 — Deploying Next.js on Azure](B10_deploying-nextjs-on-azure.md) —
where you containerize the Next.js application with a standalone Docker build,
set up CI/CD with Azure Pipelines, configure Azure Front Door with CDN caching,
add server-side monitoring with Application Insights, and implement Redis-backed
session management.

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
