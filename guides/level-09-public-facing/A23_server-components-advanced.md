# A23 — Server-Side Auth, API Routes, and Composition

> **EastWest Bank — Digital Platforms & Innovations**
>
> Part C (Next.js) · Level 9 — Public-Facing Applications

---

## What You Will Learn

By the end of this guide, you will:

- Implement server-side authentication with `cookies()` and middleware
- Create Route Handlers to proxy external APIs with server-side secrets
- Compose a page from multiple rendering strategies (SSG, ISR, SSR, client)
- Understand the full data flow from browser request to streamed HTML response

---

## Prerequisites

| Requirement | Where |
|------------|-------|
| Completed A22 — Server Components and Data Fetching | Level 9 |

---

## Phase 1 — Server-Side Authentication

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
    approved: 'bg-ewb-lime-200 text-ewb-lime-700',
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
| Token storage | In-memory (Zustand store) | Cookie (HttpOnly, server-read) |
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
    (path) =>
      path === '/'
        ? pathname === '/'
        : pathname === path || pathname.startsWith(`${path}/`),
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

### Checkpoint 1

Why does middleware only check whether the session cookie exists, rather
than verifying the session with the auth service? Consider the performance
implications of running middleware on every request versus verifying the
session only on protected pages.

---

## Phase 2 — Route Handlers (API Routes)

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
        { error: 'Invalid request', details: error.issues },
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
pattern from A07 (Forms and Validation) applied to server-side endpoints.

### Checkpoint 2

The rates Route Handler uses `getSecret('forex-provider-api-key')` from Azure
Key Vault. In the Vite SPA, how would you handle this same requirement
(fetching data from an API that requires a secret key)? Compare the two
approaches in terms of security, architecture, and operational complexity.

---

## Phase 3 — Putting It Together

### Homepage composition

The homepage demonstrates how a single page combines multiple
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

### Checkpoint 3

The homepage uses both Server Components (products, rates) and a Client
Component (calculator). When the browser receives the HTML, which parts
are already rendered and which parts require JavaScript to function?
What happens if the user's browser has JavaScript disabled?

---

## Key Takeaways

1. **Server-side authentication eliminates flash of protected content** —
   the server reads the session cookie, verifies it, and either renders the
   page or redirects. No HTML is sent to unauthenticated users.

2. **Route Handlers provide server-side API proxying** — secrets stay in
   Azure Key Vault, API keys never reach the browser, and Zod validates
   both incoming requests and upstream responses.

3. **BSP 982 benefits compound in Next.js** — server-side secrets, auth
   before render, session cookies (HttpOnly), and no sensitive data in the
   JavaScript bundle. Every layer reduces the attack surface.

4. **Middleware handles lightweight auth checks at the edge** — check for
   session cookie existence before the page renders, but defer full
   verification to the page component where the full server runtime is
   available.

5. **Composition is the architecture** — a single page can combine static
   HTML, ISR data, SSR data, and client interactivity. Each section uses
   the rendering strategy that matches its data characteristics.

6. **The full-stack flow is the key mental model** — browser request to
   middleware to server component tree to streamed HTML. Understanding this
   flow is what separates Next.js developers from React SPA developers.

---

## Exercises

### Exercise 1 — Rate Alert Signup

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

### Exercise 2 — Protected Dashboard

Build a simple account dashboard that requires authentication:

1. Create `app/dashboard/page.tsx` as a Server Component that reads the
   session cookie, verifies it, and fetches user-specific data.
2. Add middleware protection so unauthenticated users are redirected to
   `/login` before the page component executes.
3. Include a `loading.tsx` skeleton and an `error.tsx` boundary for the
   dashboard route.

This exercises the full server-side auth pattern: middleware for fast
rejection, page component for full verification, and special files for
loading and error states.

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
