# A21 — Next.js Project Setup

> **EastWest Bank — Digital Platforms & Innovations**
>
> Part C (Next.js) · Level 9 — Public-Facing Applications · Est. 3 hours

---

## What You Will Learn

By the end of this guide, you will:

- Create a Next.js 15 project with the App Router and TypeScript
- Configure the EWB design system with Tailwind CSS 4 for the public site
- Understand the `app/` directory structure and file-based routing conventions
- Build shared layouts with the EWB header, footer, and navigation
- Configure environment variables with server-side secret access
- Set up security headers via `next.config.ts`
- Know the differences between this setup and the Vite SPA from B01

---

## Prerequisites

| Requirement | Where |
|------------|-------|
| Completed A20 — SPA vs SSR Decision Framework | Level 9 |
| Completed B01 — Project Setup (Vite SPA) | Level 2 |
| Completed A06 — Design System Foundations | Level 3 |

---

## Phase 1 — Why a Separate Project

### Two applications, one design system

The EWB public site (`ewbanking.com`) and the internal portal
(`portal.ewbanking.com`) are separate applications with separate repositories
and separate deployments. They share React, TypeScript conventions, and the
EWB design system — but they serve different audiences with different
architectural needs (see A20).

### What carries over from the Vite SPA

| Concept | Carries Over? | Notes |
|---------|--------------|-------|
| Tailwind CSS 4 configuration | Yes | Same EWB color tokens, same utility classes |
| TypeScript strict mode | Yes | Same `tsconfig.json` strictness settings |
| Zod validation | Yes | Same patterns for runtime validation |
| Component architecture | Mostly | Same component patterns, different rendering model |
| Error handling patterns | Mostly | `error.tsx` replaces custom ErrorBoundary |
| Testing setup (Vitest + Playwright) | Yes | Same testing tools and patterns |
| EWB brand colors and typography | Yes | Same design tokens |

### What changes

| Vite SPA | Next.js |
|----------|---------|
| React Router (B02) | File-based routing |
| Zustand for all state | Server components reduce client state needs |
| `VITE_` env prefix | `NEXT_PUBLIC_` prefix |
| TanStack Query for data fetching | Server component `async/await` for most data |
| Nginx / Azure CDN for headers | `next.config.ts` headers |
| Static files on Blob Storage | Node.js server on App Service |
| Client-side auth guards | Server-side auth + middleware |

### Checkpoint 1

In the Vite SPA, environment variables must use the `VITE_` prefix to be
available at runtime (because Vite embeds them into the JavaScript bundle).
Next.js uses a different prefix (`NEXT_PUBLIC_`). What security benefit does
this naming convention provide, and what happens to variables that omit the
prefix?

---

## Phase 2 — Project Scaffolding

### Creating the project

```bash
npx create-next-app@latest ewb-public \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"
```

### Technology versions

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15 | React framework with App Router |
| React | 19 | UI library |
| TypeScript | 5.9 | Type safety |
| Tailwind CSS | 4 | Utility-first styling |
| Zod | 4 | Runtime validation |
| Node.js | 24 LTS | Server runtime |

### Verifying the scaffold

```bash
cd ewb-public
npm run dev
# Visit http://localhost:3000
```

The development server starts with hot module replacement, similar to Vite's
dev server. Unlike Vite, the Next.js dev server also handles server-side
rendering during development, so you see the same behavior locally as in
production.

### Checkpoint 2

After running `create-next-app`, the project starts on port 3000. The Vite SPA
dev server from B01 runs on port 5173 by default. If both need to run
simultaneously during development (the internal portal and the public site),
what configuration change ensures they do not conflict?

---

## Phase 3 — Next.js Configuration

### The central configuration file

```tsx
// next.config.ts
import type { NextConfig } from 'next';

const securityHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self'",
      // Next.js may inject inline styles for built-in components like next/image
      // and next/font. Unlike the Vite SPA (see A15), 'unsafe-inline' is needed
      // here unless you implement nonce-based CSP.
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https://cdn.ewbanking.com",
      "connect-src 'self' https://api.ewbanking.com https://*.sentry.io",
      "font-src 'self'",
      "frame-ancestors 'none'",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.ewbanking.com',
      },
    ],
  },

  headers: async () => [
    {
      source: '/:path*',
      headers: securityHeaders,
    },
  ],
};

export default nextConfig;
```

### TypeScript configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      { "name": "next" }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Comparing with the Vite configuration

| Concern | Vite (`vite.config.ts`) | Next.js (`next.config.ts`) |
|---------|------------------------|---------------------------|
| Bundler | Rollup (via Vite) | Turbopack (dev) / Webpack (prod) |
| Dev server | Vite dev server (port 5173) | Next.js dev server (port 3000) |
| Security headers | Nginx config / Azure CDN rules | `headers()` function in config |
| Image optimization | Manual (via plugins) | Built-in `next/image` |
| Environment variables | `VITE_` prefix in `import.meta.env` | `NEXT_PUBLIC_` prefix in `process.env` |
| Path aliases | `resolve.alias` in Vite config | `paths` in `tsconfig.json` |

### Checkpoint 3

In the Vite SPA (B07), security headers are configured in `nginx.conf` or
Azure CDN rules — separate from the application code. In Next.js, they are
defined in `next.config.ts`. What advantage does co-locating security headers
with application code provide for SOX compliance audits?

---

## Phase 4 — App Directory Structure

### File-based routing

Next.js uses the filesystem to define routes. Each folder inside `app/`
corresponds to a URL segment. The `page.tsx` file inside each folder makes
that route accessible.

```
app/
├── page.tsx                    → /
├── layout.tsx                  → Shared layout (header + footer)
├── loading.tsx                 → Loading fallback for /
├── error.tsx                   → Error boundary for /
├── not-found.tsx               → Custom 404 page
├── products/
│   ├── page.tsx                → /products
│   └── [slug]/
│       └── page.tsx            → /products/personal-loan
├── rates/
│   ├── page.tsx                → /rates
│   ├── loading.tsx             → Loading state for /rates
│   └── error.tsx               → Error boundary for /rates
├── branches/
│   └── page.tsx                → /branches
├── apply/
│   ├── page.tsx                → /apply
│   ├── personal-loan/
│   │   └── page.tsx            → /apply/personal-loan
│   ├── savings-account/
│   │   └── page.tsx            → /apply/savings-account
│   └── status/
│       └── page.tsx            → /apply/status (authenticated)
└── api/
    ├── rates/
    │   └── route.ts            → GET /api/rates
    └── health/
        └── route.ts            → GET /api/health
```

Compare this with the React Router configuration from B02:

```tsx
// B02 — React Router approach (Vite SPA)
const router = createBrowserRouter([
  { path: '/', element: <Dashboard /> },
  { path: '/products', element: <Products /> },
  { path: '/products/:slug', element: <ProductDetail /> },
  { path: '/rates', element: <Rates /> },
]);
```

In Next.js, routes are implicit. Creating `app/products/page.tsx` makes
`/products` accessible — no router configuration needed.

### Special files

Next.js reserves certain filenames for specific purposes:

| File | Purpose | React Equivalent |
|------|---------|------------------|
| `page.tsx` | Route content | Route component |
| `layout.tsx` | Shared UI that persists across navigation | None (manual in SPA) |
| `loading.tsx` | Loading state (Suspense fallback) | `<Suspense fallback={...}>` |
| `error.tsx` | Error boundary (must be `'use client'`) | `<ErrorBoundary>` from A13 |
| `not-found.tsx` | Custom 404 page | Catch-all route in React Router |
| `route.ts` | API endpoint (Route Handler) | None (backend responsibility in SPA) |

### Root layout

```tsx
// app/layout.tsx
import type { Metadata } from 'next';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import './globals.css';

export const metadata: Metadata = {
  title: {
    template: '%s | EastWest Bank',
    default: 'EastWest Bank — Banking Made Easy',
  },
  description:
    'Personal and business banking services from EastWest Bank. ' +
    'Savings accounts, loans, credit cards, and more.',
  metadataBase: new URL('https://ewbanking.com'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

The layout renders once. When a user navigates from `/products` to `/rates`,
only the `{children}` portion re-renders. The header and footer persist without
re-mounting — faster navigation and no layout shift.

### Metadata API for SEO

Static metadata is exported as a `metadata` object:

```tsx
// app/products/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Banking Products',
  description:
    'Explore savings accounts, personal loans, credit cards, and more.',
};
```

Dynamic metadata uses the `generateMetadata` function:

```tsx
// app/products/[slug]/page.tsx
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  return {
    title: product?.name ?? 'Product Not Found',
    description: product?.summary,
  };
}
```

In the Vite SPA, setting the page title requires a client-side solution
(`react-helmet` or a custom `useDocumentTitle` hook). The title is set after
JavaScript executes — search engines may not see it. Next.js generates the
`<title>` and `<meta>` tags in the server-rendered HTML, ensuring search
engines always see the correct metadata.

### Checkpoint 4

The Metadata API generates `<title>` and `<meta>` tags on the server. In the
Vite SPA, you set titles with a `useDocumentTitle` hook (client-side). What
concrete SEO advantage does server-rendered metadata provide for a banking
product page that Google should index?

---

## Phase 5 — EWB Design System

### Tailwind CSS 4 for Next.js

```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  /* EWB Brand Colors */
  --color-ewb-purple: #500778;
  --color-ewb-magenta: #b1006f;
  --color-ewb-gold: #dba464;
  --color-ewb-lime: #d5e04d;
  --color-ewb-navy: #06357A;

  /* Semantic Colors */
  --color-primary: #500778;
  --color-secondary: #b1006f;
  --color-accent: #dba464;
  --color-success: #16a34a;
  --color-warning: #d97706;
  --color-danger: #dc2626;

  /* Typography */
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
}
```

This is the same Tailwind 4 configuration from the Vite SPA (A06). The design
tokens are identical — `bg-ewb-purple`, `text-ewb-gold`, and all semantic
utilities work exactly the same way across both projects.

### Shared UI components

```tsx
// src/components/ui/header.tsx
import Link from 'next/link';
import Image from 'next/image';

const navigation = [
  { label: 'Products', href: '/products' },
  { label: 'Rates', href: '/rates' },
  { label: 'Branches', href: '/branches' },
  { label: 'Apply', href: '/apply' },
];

export function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/ewb-logo.svg"
            alt="EastWest Bank"
            width={140}
            height={32}
            priority
          />
        </Link>

        <ul className="hidden items-center gap-6 md:flex">
          {navigation.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="text-sm font-medium text-gray-700 hover:text-ewb-purple"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href="https://portal.ewbanking.com"
          className="rounded-lg bg-ewb-purple px-4 py-2 text-sm font-medium text-white hover:bg-ewb-purple/90"
        >
          Log In
        </Link>
      </nav>
    </header>
  );
}
```

```tsx
// src/components/ui/footer.tsx
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Products</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="/products/savings" className="text-sm text-gray-600 hover:text-ewb-purple">Savings Accounts</Link></li>
              <li><Link href="/products/loans" className="text-sm text-gray-600 hover:text-ewb-purple">Personal Loans</Link></li>
              <li><Link href="/products/credit-cards" className="text-sm text-gray-600 hover:text-ewb-purple">Credit Cards</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Company</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="/about" className="text-sm text-gray-600 hover:text-ewb-purple">About Us</Link></li>
              <li><Link href="/branches" className="text-sm text-gray-600 hover:text-ewb-purple">Branches &amp; ATMs</Link></li>
              <li><Link href="/careers" className="text-sm text-gray-600 hover:text-ewb-purple">Careers</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Support</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="/contact" className="text-sm text-gray-600 hover:text-ewb-purple">Contact Us</Link></li>
              <li><Link href="/faq" className="text-sm text-gray-600 hover:text-ewb-purple">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Legal</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="/privacy" className="text-sm text-gray-600 hover:text-ewb-purple">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-sm text-gray-600 hover:text-ewb-purple">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-6">
          <p className="text-xs text-gray-500">
            EastWest Banking Corporation is regulated by the Bangko Sentral ng
            Pilipinas (BSP). Deposits are insured by the Philippine Deposit
            Insurance Corporation (PDIC) up to ₱500,000 per depositor.
          </p>
          <p className="mt-2 text-xs text-gray-400">
            &copy; {new Date().getFullYear()} EastWest Banking Corporation. All
            rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
```

The footer includes the PDIC deposit insurance notice. This is a BSP 1033
requirement — it must be present on every page and must be visible without
JavaScript. Because the footer is a Server Component rendered in the layout,
it is always present in the initial HTML response.

### Image optimization with `next/image`

```tsx
// Usage example in a product card
import Image from 'next/image';

export function ProductCard({ product }: { product: Product }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200">
      <Image
        src={`https://cdn.ewbanking.com/products/${product.slug}.jpg`}
        alt={product.name}
        width={400}
        height={240}
        className="h-48 w-full object-cover"
      />
      <div className="p-4">
        <h3 className="font-semibold text-gray-900">{product.name}</h3>
        <p className="mt-1 text-sm text-gray-600">{product.summary}</p>
      </div>
    </div>
  );
}
```

The `next/image` component automatically generates responsive `srcSet`
attributes, serves WebP when supported, and lazy-loads images below the fold.
The Vite SPA has no built-in image optimization — this is a significant
improvement for LCP on the public site.

### Checkpoint 5

The footer includes the PDIC deposit insurance notice: "Deposits are insured
by PDIC up to ₱500,000 per depositor." Why must this notice be rendered
server-side (in the HTML) rather than injected by JavaScript? Consider both
BSP compliance and SEO implications.

---

## Phase 6 — Environment Variables and Secrets

### `NEXT_PUBLIC_` vs server-only variables

| Prefix | Where Available | Bundled in JS? | Example |
|--------|----------------|----------------|---------|
| `NEXT_PUBLIC_` | Server + Client | Yes | `NEXT_PUBLIC_API_URL` |
| (no prefix) | Server only | No | `DATABASE_URL`, `API_SECRET_KEY` |
| `VITE_` (Vite SPA) | Client only | Yes | `VITE_API_BASE_URL` |

In the Vite SPA, all environment variables must use `VITE_` to be accessible.
There is no way to have server-only variables because there is no server — the
SPA is entirely client-side.

In Next.js, environment variables without the `NEXT_PUBLIC_` prefix are only
available in server-side code (Server Components, Route Handlers, middleware).
They are never included in the JavaScript bundle sent to the browser. This is
a fundamental security improvement.

### Zod validation with server/client split

```tsx
// src/lib/env.ts
import { z } from 'zod';

// Server-only variables — these NEVER reach the browser
const serverSchema = z.object({
  AZURE_KEY_VAULT_URL: z.string().url(),
  API_SECRET_KEY: z.string().min(32),
  REDIS_URL: z.string().url(),
  REDIS_TOKEN: z.string().min(1),
  INTERNAL_AUTH_URL: z.string().url(),
  INTERNAL_API_URL: z.string().url(),
  AUTH_SERVICE_KEY: z.string().min(1),
});

// Client-safe variables — embedded in the JavaScript bundle
const clientSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url(),
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
  NEXT_PUBLIC_APPINSIGHTS_CONNECTION_STRING: z.string().optional(),
});

// Server env — only import this in server-side code
export const serverEnv = serverSchema.parse(process.env);

// Client env — safe to use anywhere
export const clientEnv = clientSchema.parse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  NEXT_PUBLIC_APPINSIGHTS_CONNECTION_STRING:
    process.env.NEXT_PUBLIC_APPINSIGHTS_CONNECTION_STRING,
});
```

This pattern reuses the Zod validation approach from B07's `src/lib/env.ts` but
adds the server/client split. If a developer accidentally imports `serverEnv`
in a Client Component, the build will fail because `process.env.API_SECRET_KEY`
is `undefined` in the browser — Zod's validation catches the error at runtime.

### Azure Key Vault integration

```tsx
// src/lib/keyvault.ts
import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';
import { serverEnv } from './env';

const credential = new DefaultAzureCredential();
const client = new SecretClient(serverEnv.AZURE_KEY_VAULT_URL, credential);

const secretCache = new Map<string, { value: string; expiresAt: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function getSecret(name: string): Promise<string> {
  const cached = secretCache.get(name);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  const secret = await client.getSecret(name);
  const value = secret.value ?? '';

  secretCache.set(name, {
    value,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });

  return value;
}
```

This module can only be imported in server-side code. It accesses Azure Key
Vault using `DefaultAzureCredential`, which works automatically in Azure App
Service via managed identity — no credentials stored in environment variables
or code.

The secret cache prevents hitting Key Vault on every request. Secrets are
cached for 5 minutes, reducing latency and API costs.

### Environment files

```
.env.local             # Local development (git-ignored)
.env.development       # Development defaults
.env.production        # Production defaults (NEXT_PUBLIC_ only)
```

> **Security:** `.env.production` must only contain `NEXT_PUBLIC_` variables.
> Server-only secrets (Key Vault URL, Redis credentials) are set via Azure
> App Service configuration — never committed to the repository.

### Checkpoint 6

A developer imports `serverEnv` inside a Client Component (`'use client'`).
What happens at build time, what happens at runtime, and how does the Zod
schema help catch this mistake?

---

## Phase 7 — Security Headers

### Headers in `next.config.ts`

The security headers defined in Phase 3's `next.config.ts` are the same headers
from A15 and B07's `nginx.conf`. The difference is where they are configured:

| SPA (Vite) | Next.js |
|------------|---------|
| `nginx.conf` on the web server | `next.config.ts` in the application |
| Azure CDN rules (for Blob Storage) | `headers()` function in config |
| Changes require Nginx reload or CDN rule update | Changes deploy with the application |
| Versioned separately from app code | Versioned in the same repository |

Co-locating security headers with the application code means they are:

- **Version-controlled** — every header change is in the commit history
- **Reviewed in PRs** — the security team sees header changes in code review
- **Tested before deploy** — integration tests can verify headers
- **Auditable for SOX** — the change management trail includes header changes

### Content-Security-Policy differences

The CSP for the Next.js site differs from the Vite SPA:

```
# Vite SPA (from B07)
script-src 'self';

# Next.js (may need nonce for inline scripts)
script-src 'self' 'nonce-{random}';
```

Next.js may inject inline scripts for data serialization between server and
client. The CSP needs to account for this with either a nonce or `unsafe-inline`
(nonce is preferred for security).

To implement nonces, generate a random value per request in `middleware.ts` and
inject it into the CSP header. Next.js 15+ supports this via the `nonce` prop on
`<Script>` components and the `headers()` API. The full nonce implementation
pattern is covered in A15's CSP section — the key difference for Next.js is that
nonce generation happens in middleware (server-side, per-request) rather than in
a meta tag (which would be static and insecure).

### Checkpoint 7

The security headers in `next.config.ts` include both `X-Frame-Options: DENY`
and a CSP `frame-ancestors 'none'` directive. These do the same thing — prevent
the site from being embedded in iframes. Why include both, and which one takes
precedence in modern browsers?

---

## Key Takeaways

1. **Next.js is for the public site, Vite stays for the internal portal** — two
   tools, two purposes, both React 19, same design system.

2. **File-based routing replaces React Router** — `app/products/page.tsx` maps
   to `/products`. No `createBrowserRouter` configuration needed.

3. **Layouts persist across navigation** — the header and footer render once in
   `layout.tsx`. Only the page content changes during navigation.

4. **Server-only environment variables never reach the browser** — omitting
   `NEXT_PUBLIC_` keeps secrets server-side. This is a fundamental security
   improvement over the `VITE_` pattern.

5. **Azure Key Vault is accessed directly from server components** — no API
   proxy needed for secrets. `DefaultAzureCredential` works via managed
   identity in App Service.

6. **Metadata API handles SEO** — static and dynamic `metadata` exports replace
   client-side `document.title` management. Search engines see correct metadata
   without executing JavaScript.

7. **Security headers live in `next.config.ts`** — deployed with the code,
   version-controlled, reviewed in PRs, auditable for SOX compliance.

---

## Exercises

### Exercise 1 — About Page

Create an `app/about/page.tsx` with static metadata including a title and
description suitable for SEO. Include the EWB history (founded 1994), mission
statement, and BSP license information (BSP License #213). Use the shared
layout with header and footer. Ensure the PDIC notice is visible.

### Exercise 2 — Careers Section

Create a nested route structure: `/careers`, `/careers/[department]`, and
`/careers/[department]/[jobId]`. Each level should have its own `layout.tsx`
with breadcrumb navigation appropriate to that level. Use `generateMetadata`
for dynamic page titles (e.g., "Software Engineer — Engineering | EastWest
Bank Careers").

### Exercise 3 — Environment Audit

Review the Vite SPA's `.env.production` file from B07. For each environment
variable (`VITE_API_BASE_URL`, `VITE_SENTRY_DSN`, `VITE_APPINSIGHTS_CONNECTION_STRING`,
`VITE_APP_VERSION`), determine whether it should be `NEXT_PUBLIC_` (client-safe)
or server-only in the Next.js project. For each server-only variable, explain
how a Server Component would access it instead.

---

## What Comes Next

The project is scaffolded, the design system is configured, and environment
management is in place. The next guide dives into the core differentiator —
Server Components and data fetching.

**Next guide:** [A22 — Server Components and Data Fetching](A22_server-components-data-fetching.md) —
where you learn the server/client component mental model, fetch data with
`async/await` in server components, and build the EWB product catalog, exchange
rates page, and authenticated loan application status.

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
