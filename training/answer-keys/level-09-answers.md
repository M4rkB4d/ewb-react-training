# Level 9 — Public-Facing Applications: Answer Key

> **EastWest Bank — Digital Platforms & Innovations**
>
> Quiz Answers + Exercise Solutions

---

## Quiz Answers

> **Note:** Questions 7–9 and 11–12 cover B10 deployment content. If B10 was assigned as optional reading, facilitators may score these separately or treat them as bonus questions.

### Question 1 — D

ISR with a 60-second revalidation provides the best balance. The rates page needs SEO (Google must index it), so CSR is out. SSG would serve stale rates until the next build. SSR on every request works but wastes server resources when the data only changes every few minutes. ISR serves cached pages at CDN speed and regenerates in the background after 60 seconds — fresh enough for indicative exchange rates.

### Question 2 — False

The internal portal serves authenticated users only. There is no SEO requirement. Converting to Next.js SSR would add operational complexity (server runtime, Docker patching, significantly higher Azure costs) without providing any business benefit. The Vite SPA is the correct architecture for the internal portal.

### Question 3

BSP 1033 requires that fees, charges, and terms be clearly disclosed and accessible to the public. With CSR, the browser receives an empty HTML shell — the disclosure content only appears after JavaScript loads and executes. Search engines may not reliably index JavaScript-rendered content. Regulators checking the page source would see an empty `<div id="root"></div>`. With SSR/SSG, the disclosure text is present in the HTML response. Google indexes the full content without executing JavaScript, and auditors can verify disclosures by viewing page source.

### Question 4 — C

In Next.js App Router, `page.tsx` is the file that makes a URL route accessible. Creating `app/products/page.tsx` makes `/products` available. `route.ts` is for API endpoints (Route Handlers). `layout.tsx` defines shared UI but does not create a navigable route by itself.

### Question 5 — B

Environment variables without the `NEXT_PUBLIC_` prefix are only available in server-side code (Server Components, Route Handlers, middleware). They are never included in the JavaScript bundle sent to the browser. This is a fundamental security improvement — server-only secrets like `API_SECRET_KEY` or `DATABASE_URL` cannot leak to the client.

### Question 6

Server Components execute on the server, not in the browser. `useState` and `useEffect` are React hooks that manage browser-side state and side effects — they have no meaning on the server because there is no DOM, no event loop, and no persistent component lifecycle. If interactivity is needed, the developer must create a separate Client Component with `'use client'` at the top of the file and import it into the Server Component. The Server Component passes data as props; the Client Component handles interactivity.

### Question 7 — C

Azure App Service (Linux, Node.js) hosts the Next.js application. Unlike the Vite SPA which is purely static files on Blob Storage, Next.js requires a Node.js runtime to execute Server Components, Route Handlers, and middleware. Azure Static Web Apps has limitations (restricted API routes, deployment size limits, no deployment slots) that make it unsuitable for a production banking site.

### Question 8 — B

`output: 'standalone'` tells Next.js to produce a minimal, self-contained Node.js server in `.next/standalone/`. This directory contains only the files needed to run the application — the full `node_modules` folder (which can be hundreds of megabytes) is not needed. The Docker image runs `node server.js` directly, reducing image size and attack surface.

### Question 9 — True

Production deployments first deploy the new Docker image to the staging slot, run smoke tests, and then swap the staging slot to production. If issues are detected after the swap, the operations team executes `az webapp deployment slot swap --slot production --target-slot staging` to instantly swap back. This provides zero-downtime deployments with immediate rollback capability.

### Question 10

No, it does not result in two API calls. Next.js automatically deduplicates `fetch` calls with the same URL and options within a single render pass. When `generateMetadata` and the page component both call `getProduct(slug)` with the same slug, Next.js recognizes the duplicate and makes only one actual HTTP request. The response is shared between both callers. This deduplication applies to the native `fetch` API during server rendering.

### Question 11 — B

Redis (Azure Cache for Redis) stores server-side session data with a sliding 15-minute TTL (BSP 982 compliance) and provides rate limiting for public API routes. Session data is stored in Redis with `setex` (set with expiration), and each request refreshes the TTL. Rate limiting uses Redis sorted sets to track request counts per IP within a time window.

### Question 12 — B

Static assets under `/_next/static/` are content-hashed by Next.js. Every time the application is built, files get new hashes in their filenames (e.g., `main-abc123.js` becomes `main-def456.js`). Since the filename changes with every build, old cached files are never served for new deployments. This makes aggressive caching (1 year) completely safe — the browser always requests the new filename.

---

## Exercise Solutions

### Exercise 1 — SSR Product Comparison Page

**Server Component:**

```tsx
// app/products/compare/page.tsx
import { z } from 'zod';
import { clientEnv } from '@/lib/env';
import { ProductComparisonTool } from './comparison-tool';
import type { Metadata } from 'next';

const ProductSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  category: z.string(),
  interestRate: z.number().optional(),
  minimumDeposit: z.number().int().optional(), // centavos
  monthlyFee: z.number().int(), // centavos
  features: z.array(z.string()),
});

type Product = z.infer<typeof ProductSchema>;

async function getProducts(): Promise<Product[]> {
  const res = await fetch(`${clientEnv.NEXT_PUBLIC_API_URL}/products`, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) throw new Error(`Failed to fetch products: ${res.status}`);
  return z.array(ProductSchema).parse(await res.json());
}

export const metadata: Metadata = {
  title: 'Compare Banking Products | EastWest Bank',
  description:
    'Compare savings accounts, personal loans, credit cards, and more. Find the right EastWest Bank product for your needs.',
  openGraph: {
    title: 'Compare Banking Products',
    description: 'Side-by-side comparison of EastWest Bank products.',
  },
};

export default async function ComparePage() {
  const products = await getProducts();

  return (
    <main className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900">Compare Products</h1>
      <p className="mt-2 text-gray-600">
        Select up to 3 products to compare features, rates, and fees.
      </p>

      <ProductComparisonTool products={products} />

      {/* SSR fallback: products listed for SEO even without JS */}
      <noscript>
        <div className="mt-8 space-y-4">
          {products.map((p) => (
            <div key={p.id} className="rounded border p-4">
              <h2 className="font-semibold">{p.name}</h2>
              {p.interestRate != null && <p>Interest Rate: {p.interestRate}% p.a.</p>}
              {p.minimumDeposit != null && <p>Min. Deposit: PHP {p.minimumDeposit.toLocaleString()}</p>}
              <p>Monthly Fee: PHP {p.monthlyFee}</p>
            </div>
          ))}
        </div>
      </noscript>
    </main>
  );
}
```

**Client Component:**

```tsx
// app/products/compare/comparison-tool.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  interestRate?: number;
  minimumDeposit?: number;
  monthlyFee: number;
  features: string[];
}

export function ProductComparisonTool({ products }: { products: Product[] }) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggleProduct = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((s) => s !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const selectedProducts = products.filter((p) => selected.includes(p.id));

  return (
    <div className="mt-8">
      {/* Product selector */}
      <div className="flex flex-wrap gap-2">
        {products.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => toggleProduct(p.id)}
            className={`rounded-lg border px-4 py-2 text-sm ${
              selected.includes(p.id)
                ? 'border-ewb-purple bg-ewb-purple text-white'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
            } ${selected.length >= 3 && !selected.includes(p.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={selected.length >= 3 && !selected.includes(p.id)}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Comparison table */}
      {selectedProducts.length > 0 && (
        <table className="mt-6 w-full border-collapse text-sm">
          <thead>
            <tr className="border-b">
              <th className="p-3 text-left text-gray-500">Feature</th>
              {selectedProducts.map((p) => (
                <th key={p.id} className="p-3 text-left font-semibold">{p.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="p-3 text-gray-600">Interest Rate</td>
              {selectedProducts.map((p) => (
                <td key={p.id} className="p-3">
                  {p.interestRate != null ? `${p.interestRate}% p.a.` : 'N/A'}
                </td>
              ))}
            </tr>
            <tr className="border-b">
              <td className="p-3 text-gray-600">Min. Deposit</td>
              {selectedProducts.map((p) => (
                <td key={p.id} className="p-3">
                  {p.minimumDeposit != null ? `₱${p.minimumDeposit.toLocaleString()}` : 'N/A'}
                </td>
              ))}
            </tr>
            <tr className="border-b">
              <td className="p-3 text-gray-600">Monthly Fee</td>
              {selectedProducts.map((p) => (
                <td key={p.id} className="p-3">₱{p.monthlyFee}</td>
              ))}
            </tr>
            <tr className="border-b">
              <td className="p-3 text-gray-600">Features</td>
              {selectedProducts.map((p) => (
                <td key={p.id} className="p-3">
                  <ul className="list-disc pl-4 space-y-1">
                    {p.features.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-3" />
              {selectedProducts.map((p) => (
                <td key={p.id} className="p-3">
                  <Link
                    href={`/apply/${p.slug}`}
                    className="inline-block rounded-lg bg-ewb-purple px-4 py-2 text-sm font-medium text-white hover:bg-ewb-purple/90"
                  >
                    Apply Now
                  </Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
}
```

### Exercise 2 — Server-Side Authenticated Application Status

**Middleware:**

```tsx
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const sessionId = request.cookies.get('ewb_session')?.value;

  if (!sessionId) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('returnTo', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Session ID exists — server component will validate it against Redis
  return NextResponse.next();
}

export const config = {
  matcher: ['/apply/status/:path*'],
};
```

**Page:**

```tsx
// app/apply/status/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { getSession } from '@/lib/session';
import { serverEnv } from '@/lib/env';

const ApplicationSchema = z.object({
  referenceNumber: z.string(),
  productName: z.string(),
  submittedAt: z.string().datetime(),
  status: z.enum(['submitted', 'under-review', 'approved', 'rejected']),
  nextSteps: z.string(),
});

const statusColors: Record<string, string> = {
  submitted: 'bg-blue-100 text-blue-700',
  'under-review': 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

async function getApplications(sessionToken: string) {
  const res = await fetch(`${serverEnv.INTERNAL_API_URL}/applications`, {
    headers: {
      Authorization: `Bearer ${sessionToken}`,
      'X-Service-Key': serverEnv.AUTH_SERVICE_KEY,
    },
    cache: 'no-store',
  });

  if (!res.ok) throw new Error(`Failed to fetch applications: ${res.status}`);
  return z.array(ApplicationSchema).parse(await res.json());
}

export default async function ApplicationStatusPage() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('ewb_session')?.value;

  if (!sessionId) redirect('/login?returnTo=/apply/status');

  const session = await getSession(sessionId);
  if (!session) redirect('/login?returnTo=/apply/status');

  const applications = await getApplications(sessionId);

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-bold text-gray-900">Application Status</h1>
      <p className="mt-1 text-sm text-gray-600">
        Track the progress of your loan and account applications.
      </p>

      {applications.length === 0 ? (
        <p className="mt-8 text-gray-500">You have no active applications.</p>
      ) : (
        <div className="mt-8 space-y-4">
          {applications.map((app) => (
            <div key={app.referenceNumber} className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">{app.productName}</h2>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[app.status]}`}>
                  {app.status.replace('-', ' ')}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Ref: {app.referenceNumber} | Submitted:{' '}
                {new Date(app.submittedAt).toLocaleDateString('en-PH')}
              </p>
              <p className="mt-2 text-sm text-gray-600">{app.nextSteps}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
```

**Loading state:**

```tsx
// app/apply/status/loading.tsx
export default function Loading() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
      <div className="mt-2 h-4 w-72 animate-pulse rounded bg-gray-100" />
      <div className="mt-8 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg border bg-gray-50" />
        ))}
      </div>
    </main>
  );
}
```

**Error boundary:**

```tsx
// app/apply/status/error.tsx
'use client';

export default function StatusError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-bold text-gray-900">Something went wrong</h1>
      <p className="mt-2 text-gray-600">
        We could not load your application status. This may be a temporary issue.
      </p>
      <button
        onClick={reset}
        className="mt-4 rounded-lg bg-ewb-purple px-4 py-2 text-sm text-white hover:bg-ewb-purple/90"
      >
        Try Again
      </button>
    </main>
  );
}
```

### Exercise 3 — Next.js Azure Deployment with CDN Verification

**Dockerfile:**

```dockerfile
# Stage 1: Dependencies
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# Stage 2: Build
FROM node:24-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 3: Runner
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
```

**CDN verification script:**

```bash
#!/usr/bin/env bash
# verify-cdn-headers.sh
# Usage: ./verify-cdn-headers.sh https://ewbanking.com

BASE_URL="${1:?Usage: verify-cdn-headers.sh <base-url>}"
FAILED=0

check_cache() {
  local path="$1"
  local expected="$2"
  local label="$3"

  local headers
  headers=$(curl -sI "${BASE_URL}${path}" 2>/dev/null)
  local cache_control
  cache_control=$(echo "$headers" | grep -i "cache-control" | tr -d '\r')

  if echo "$cache_control" | grep -qi "$expected"; then
    echo "PASS: ${label} — ${cache_control}"
  else
    echo "FAIL: ${label}"
    echo "  Expected: ${expected}"
    echo "  Got: ${cache_control}"
    FAILED=1
  fi
}

echo "Verifying CDN cache headers for ${BASE_URL}"
echo "---"

# Static JS assets — should be cached for 1 year
STATIC_PATH=$(curl -s "${BASE_URL}" | grep -oP '/_next/static/[^"]+\.js' | head -1)
if [ -n "$STATIC_PATH" ]; then
  check_cache "$STATIC_PATH" "immutable" "Static JS asset"
else
  echo "WARN: Could not find a static JS asset to test"
fi

# API health endpoint — should not be cached
check_cache "/api/health" "no" "Health API (no-cache)"

# HTML page — should have short TTL
check_cache "/products" "s-maxage" "HTML page (short TTL)"

# Check security headers
echo ""
echo "Verifying security headers..."
SEC_HEADERS=$(curl -sI "${BASE_URL}/products" 2>/dev/null)

for header in "X-Frame-Options" "X-Content-Type-Options" "Content-Security-Policy" "Strict-Transport-Security"; do
  if echo "$SEC_HEADERS" | grep -qi "$header"; then
    echo "PASS: ${header} present"
  else
    echo "FAIL: ${header} missing"
    FAILED=1
  fi
done

echo ""
if [ "$FAILED" -eq 0 ]; then
  echo "All checks passed."
  exit 0
else
  echo "Some checks failed."
  exit 1
fi
```

**Health endpoint:**

```tsx
// app/api/health/route.ts
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const checks: Record<string, 'ok' | 'error'> = {};

  try {
    const { redis } = await import('@/lib/redis');
    await redis.ping();
    checks.redis = 'ok';
  } catch {
    checks.redis = 'error';
  }

  try {
    const { getSecret } = await import('@/lib/keyvault');
    await getSecret('health-check-secret');
    checks.keyvault = 'ok';
  } catch {
    checks.keyvault = 'error';
  }

  const healthy = Object.values(checks).every((v) => v === 'ok');

  return NextResponse.json(
    {
      status: healthy ? 'healthy' : 'degraded',
      checks,
      version: process.env.APP_VERSION ?? 'unknown',
      timestamp: new Date().toISOString(),
    },
    {
      status: healthy ? 200 : 503,
      headers: { 'Cache-Control': 'no-store' },
    },
  );
}
```

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
