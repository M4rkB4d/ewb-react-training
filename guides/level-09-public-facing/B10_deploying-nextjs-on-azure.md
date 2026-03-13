# B10 — Deploying Next.js on Azure

> **EastWest Bank — Digital Platforms & Innovations**
>
> Part C (Next.js) · Level 9 — Public-Facing Applications · Est. 3 hours

---

## What You Will Learn

By the end of this guide, you will:

- Understand the deployment architecture differences between a Vite SPA and a Next.js application
- Build a production Docker image using Next.js standalone output
- Set up a GitHub Actions CI/CD pipeline for Azure App Service
- Configure Azure Front Door with CDN caching rules for Next.js
- Instrument server-side monitoring with Azure Application Insights
- Implement Redis-backed session management with TTL enforcement
- Build a production-ready SOX checklist for Next.js deployments

---

## Prerequisites

| Requirement | Where |
|------------|-------|
| Completed A22 — Server Components and Data Fetching | Level 9 |
| Completed B07 — Deployment and CI/CD (Vite SPA) | Level 7 |
| Completed B06 — Monitoring and Observability | Level 6 |
| Docker installed | Local setup |

---

## Phase 1 — Deployment Architecture

### SPA vs Next.js — what changes

The Vite SPA (B07) is a set of static files. You upload them to Azure Blob
Storage and serve them through a CDN. There is no server.

Next.js has Server Components, Route Handlers, and middleware. It needs a
Node.js runtime to render pages on demand. This changes the deployment model
fundamentally.

| Concern | Vite SPA (B07) | Next.js |
|---------|---------------|---------|
| Hosting | Azure Blob Storage (`$web` container) | Azure App Service (Linux, Node.js) |
| Runtime | None (static files) | Node.js 24 LTS |
| Server | Nginx (for Docker) or CDN (for Blob) | Next.js standalone server |
| Container | Nginx Alpine (if containerized) | Node.js Alpine |
| CDN role | Origin (serves the app) | Cache layer (in front of App Service) |
| SPA routing | `404 → index.html` | Server-side routing (file-based) |
| Cost (Azure) | ~₱280/mo (Blob + CDN) | ~₱3,900/mo (App Service B1 + CDN) |
| Security patching | None (no runtime) | Node.js + Docker base image updates |
| ISR/SSR | Not possible | Server renders on demand |

The cost increase is justified for public-facing pages. The public site
generates revenue (loan applications, new accounts). The internal portal
does not need SSR and stays on Blob Storage.

### Architecture diagram

```
                    ┌──────────────────────────────┐
                    │     Azure Front Door (WAF)    │
                    │   ewbanking.com               │
                    └──────────┬───────────────────┘
                               │
                    ┌──────────┴───────────────────┐
                    │       Azure CDN               │
                    │  /_next/static/* → 1yr cache  │
                    │  HTML pages → 60s cache        │
                    └──────────┬───────────────────┘
                               │
              ┌────────────────┴────────────────┐
              │                                 │
    ┌─────────┴──────────┐           ┌─────────┴──────────┐
    │  App Service        │           │  App Service        │
    │  (Staging Slot)     │           │  (Production Slot)  │
    │  Docker: Next.js    │           │  Docker: Next.js    │
    └─────────┬──────────┘           └─────────┬──────────┘
              │                                 │
              └────────────────┬────────────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
    ┌─────────┴───┐  ┌────────┴────┐  ┌────────┴────┐
    │ Azure Key   │  │ Azure Cache │  │ App Insights│
    │ Vault       │  │ for Redis   │  │ (Monitoring)│
    │ (secrets)   │  │ (sessions)  │  │             │
    └─────────────┘  └─────────────┘  └─────────────┘
```

### Why App Service, not Static Web Apps

Azure Static Web Apps (SWA) supports Next.js, but with limitations that
matter for banking:

- SWA does not support the full Node.js runtime (restricted API routes)
- SWA has a 250 MB deployment size limit
- SWA does not support custom Docker images
- SWA does not support deployment slots for blue-green deployments
- SWA managed functions have cold-start latency

Azure App Service gives full control: custom Docker images, deployment slots,
managed identity for Key Vault, and no runtime restrictions.

### Checkpoint 1

The Vite SPA costs approximately ₱280/month on Azure (Blob Storage + CDN).
The Next.js application costs approximately ₱3,900/month (App Service B1 +
CDN + Redis). Justify this cost difference to a non-technical stakeholder.
What business value does server-side rendering provide that static hosting
cannot?

---

## Phase 2 — Docker Configuration

### Three-stage Dockerfile

The Vite SPA Dockerfile (B07) has two stages: build and serve (Nginx). The
Next.js Dockerfile has three stages: dependencies, build, and runner.

```dockerfile
# Dockerfile

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

# Non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy only the standalone output
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

### Standalone output

The `output: 'standalone'` option in `next.config.ts` (from A21) tells
Next.js to produce a minimal Node.js server in `.next/standalone/`. This
directory contains only the files needed to run the application — no
`node_modules` folder with thousands of packages.

Add this to the `next.config.ts` from A21:

```tsx
// next.config.ts (addition)
const nextConfig: NextConfig = {
  output: 'standalone',
  // ... existing config from A21
};
```

The standalone output produces a `server.js` file that is a self-contained
Node.js server. The Docker image runs `node server.js` instead of
`npx next start`. This reduces the image size significantly.

### Comparison with B07 Dockerfile

| Stage | Vite SPA (B07) | Next.js |
|-------|---------------|---------|
| Dependencies | `npm ci` | `npm ci` (separate stage for caching) |
| Build | `npm run build` → `dist/` | `npm run build` → `.next/standalone/` |
| Runtime | Nginx Alpine (~30 MB) | Node.js Alpine (~120 MB) |
| Serve | `nginx -g 'daemon off;'` | `node server.js` |
| Static assets | All in Nginx root | Copied to `.next/static/` |
| Server code | None | `server.js` + server chunks |

The Next.js image is larger because it includes the Node.js runtime. This is
the trade-off: server-side rendering requires a server.

### .dockerignore

```
# .dockerignore
node_modules
.next
.git
.gitignore
*.md
.env*
.vscode
coverage
playwright-report
```

### Checkpoint 2

The Dockerfile uses three stages instead of two. Explain why the dependencies
stage is separated from the build stage. What happens to Docker layer caching
when you change a source file but not `package.json`?

---

## Phase 3 — CI/CD Pipeline

### GitHub Actions workflow

This workflow extends the B07 pattern with Docker build and Azure App Service
deployment.

```yaml
# .github/workflows/deploy-nextjs.yml
name: Next.js CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '24'
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}-public

jobs:
  quality-gates:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test:coverage
      - uses: actions/upload-artifact@v4
        with:
          name: coverage-report
          path: coverage/

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  build-and-push:
    if: github.event_name == 'push'
    needs: [quality-gates, e2e-tests]
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4

      - name: Log in to Azure Container Registry
        uses: azure/login@v2
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}

      - name: Build and push to ACR
        run: |
          az acr build \
            --registry ${{ vars.AZURE_ACR_NAME }} \
            --image ${{ env.IMAGE_NAME }}:${{ github.sha }} \
            --image ${{ env.IMAGE_NAME }}:latest \
            .

  deploy-staging:
    if: github.ref == 'refs/heads/develop'
    needs: build-and-push
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - name: Azure Login
        uses: azure/login@v2
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}

      - name: Deploy to staging slot
        run: |
          az webapp config container set \
            --name ${{ vars.AZURE_APP_NAME }} \
            --resource-group ${{ vars.AZURE_RG }} \
            --slot staging \
            --container-image-name ${{ vars.AZURE_ACR_NAME }}.azurecr.io/${{ env.IMAGE_NAME }}:${{ github.sha }}

      - name: Wait for deployment
        run: |
          az webapp deployment slot wait \
            --name ${{ vars.AZURE_APP_NAME }} \
            --resource-group ${{ vars.AZURE_RG }} \
            --slot staging \
            --created

      - name: Smoke test staging
        run: |
          STAGING_URL="https://${{ vars.AZURE_APP_NAME }}-staging.azurewebsites.net"
          STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$STAGING_URL/api/health")
          if [ "$STATUS" != "200" ]; then
            echo "Health check failed with status $STATUS"
            exit 1
          fi

  deploy-production:
    if: github.ref == 'refs/heads/main'
    needs: build-and-push
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Azure Login
        uses: azure/login@v2
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}

      - name: Deploy to staging slot
        run: |
          az webapp config container set \
            --name ${{ vars.AZURE_APP_NAME }} \
            --resource-group ${{ vars.AZURE_RG }} \
            --slot staging \
            --container-image-name ${{ vars.AZURE_ACR_NAME }}.azurecr.io/${{ env.IMAGE_NAME }}:${{ github.sha }}

      - name: Wait for deployment
        run: |
          az webapp deployment slot wait \
            --name ${{ vars.AZURE_APP_NAME }} \
            --resource-group ${{ vars.AZURE_RG }} \
            --slot staging \
            --created

      - name: Smoke test staging slot
        run: |
          STAGING_URL="https://${{ vars.AZURE_APP_NAME }}-staging.azurewebsites.net"
          STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$STAGING_URL/api/health")
          if [ "$STATUS" != "200" ]; then
            echo "Health check failed with status $STATUS"
            exit 1
          fi

      - name: Swap staging to production
        run: |
          az webapp deployment slot swap \
            --name ${{ vars.AZURE_APP_NAME }} \
            --resource-group ${{ vars.AZURE_RG }} \
            --slot staging \
            --target-slot production
```

### Key differences from B07 pipeline

| Step | Vite SPA (B07) | Next.js (B10) |
|------|---------------|---------------|
| Build output | `dist/` folder (static files) | Docker image (Node.js + app) |
| Registry | None (files uploaded directly) | Azure Container Registry |
| Deploy target | Azure Blob Storage | Azure App Service |
| Deploy method | `az storage blob upload-batch` | `az webapp config container set` |
| Cache invalidation | `az cdn endpoint purge` | Slot swap (instant) |
| Rollback | Re-upload previous files | Swap slots back |
| Smoke test | HTTP GET to CDN URL | HTTP GET to `/api/health` endpoint |

### Staging vs production flow

```
develop branch → quality gates → Docker build → staging slot (auto)
main branch    → quality gates → Docker build → staging slot → smoke test → swap to production
```

Production deploys use GitHub Environments with required reviewers. The
`environment: production` setting in the workflow triggers a manual approval
gate. No code reaches production without explicit approval — a SOX
requirement (BSP 808).

### Checkpoint 3

The production deployment first deploys to the staging slot, runs smoke tests,
then swaps to production. If the swap fails, what is the state of the
application? Can users still access the site? What is the rollback procedure?

---

## Phase 4 — Azure CDN and Front Door

### CDN caching for Next.js

CDN caching for a Next.js application differs from a Vite SPA. The SPA is
entirely static — everything can be cached aggressively. Next.js has both
static and dynamic content.

```
CDN cache rules:

/_next/static/*     → Cache 1 year (content-hashed, immutable)
/_next/image/*      → Cache 1 day (optimized images)
/api/*              → No cache (dynamic API responses)
/*.html             → Cache 60s (aligned with ISR revalidation)
/                   → Cache 60s (homepage with ISR sections)
```

### Azure Front Door configuration

```bash
# Create Front Door profile
az afd profile create \
  --profile-name ewb-public-fd \
  --resource-group ewb-digital \
  --sku Standard_AzureFrontDoor

# Add custom domain
az afd custom-domain create \
  --custom-domain-name ewbanking-com \
  --profile-name ewb-public-fd \
  --resource-group ewb-digital \
  --host-name ewbanking.com \
  --certificate-type ManagedCertificate

# Create origin group pointing to App Service
az afd origin-group create \
  --origin-group-name ewb-appservice-origin \
  --profile-name ewb-public-fd \
  --resource-group ewb-digital \
  --probe-request-type GET \
  --probe-protocol Https \
  --probe-path /api/health \
  --probe-interval-in-seconds 30

# Add App Service as origin
az afd origin create \
  --origin-name ewb-production \
  --origin-group-name ewb-appservice-origin \
  --profile-name ewb-public-fd \
  --resource-group ewb-digital \
  --host-name ${{ vars.AZURE_APP_NAME }}.azurewebsites.net \
  --origin-host-header ${{ vars.AZURE_APP_NAME }}.azurewebsites.net \
  --http-port 80 \
  --https-port 443 \
  --priority 1

# Create caching rule for static assets
az afd rule create \
  --rule-name CacheStaticAssets \
  --rule-set-name CachingRules \
  --profile-name ewb-public-fd \
  --resource-group ewb-digital \
  --order 1 \
  --match-variable RequestUri \
  --operator BeginsWith \
  --match-values "/_next/static/" \
  --action-name CacheExpiration \
  --cache-behavior Override \
  --cache-duration "365.00:00:00"
```

### CDN role comparison

| Role | Vite SPA | Next.js |
|------|---------|---------|
| CDN serves | The entire application | Cached copies of server-rendered pages |
| Origin | Azure Blob Storage (static files) | Azure App Service (Node.js server) |
| Cache miss | Never (all files are static) | App Service renders the page |
| ISR support | Not possible | CDN caches page, revalidates per TTL |
| WAF | Front Door WAF | Front Door WAF (same) |

For the Vite SPA, the CDN is the origin. For Next.js, the CDN is a cache
layer. This is a fundamental difference. If the CDN cache is empty, the
request hits the App Service, which renders the page and returns it. The
CDN caches the response for subsequent requests.

### Checkpoint 4

The homepage uses ISR with `revalidate: 60` for the rates section. The CDN
caches HTML pages for 60 seconds. Explain how these two cache layers
interact. What happens if the CDN TTL is longer than the ISR revalidation
period?

---

## Phase 5 — Server-Side Monitoring

### Instrumentation with Azure Application Insights

In the Vite SPA (B06), monitoring is entirely client-side. The browser
sends telemetry to Application Insights via the JavaScript SDK. In Next.js,
server-side rendering adds a new dimension — you can monitor server render
times, API latencies, and errors before they reach the browser.

```tsx
// instrumentation.ts
import { registerOTel } from '@vercel/otel';

export function register() {
  registerOTel({
    serviceName: 'ewb-public-site',
  });
}
```

For Azure-native instrumentation using `@azure/monitor-opentelemetry`:

```tsx
// instrumentation.ts
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { useAzureMonitor } = await import('@azure/monitor-opentelemetry');

    useAzureMonitor({
      azureMonitorExporterOptions: {
        connectionString: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING,
      },
    });
  }
}
```

The `NEXT_RUNTIME` check ensures the Azure Monitor SDK only loads in the
Node.js runtime, not in the Edge runtime or during client-side rendering.

### Server vs client monitoring

| Metric | Vite SPA (B06) | Next.js Server | Next.js Client |
|--------|---------------|----------------|----------------|
| Page load time | Client JS SDK | TTFB from server | Client JS SDK |
| API latency | Client observes response time | Server measures actual API call | N/A |
| Error tracking | Client error boundary | Server-side `error.tsx` + console | Client error boundary |
| User sessions | Client-side session ID | Server-side session (Redis) | Client cookie |
| Route transitions | Client router events | Server access log | Client router events |
| Bundle size | N/A (no server) | N/A | Client JS SDK |
| Server render time | N/A | OpenTelemetry spans | N/A |

### Health endpoint

```tsx
// app/api/health/route.ts
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const checks: Record<string, 'ok' | 'error'> = {};

  // Check Redis connectivity
  try {
    const { redis } = await import('@/lib/redis');
    await redis.ping();
    checks.redis = 'ok';
  } catch {
    checks.redis = 'error';
  }

  // Check Key Vault access
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
    { status: healthy ? 200 : 503 },
  );
}
```

The health endpoint is used by:

- Azure Front Door health probes (every 30 seconds)
- The CI/CD pipeline smoke tests (after deployment)
- The monitoring dashboard (availability alerts)

`export const dynamic = 'force-dynamic'` ensures this route is never cached.
Health checks must always reflect the current state of the application.

### BSP 1019 — Server-side request logging

Server-side monitoring captures request patterns that client-side monitoring
cannot see:

- Requests that fail before any JavaScript loads (server errors)
- Bot traffic and web scraping patterns
- Authentication failures at the middleware level
- API proxy call latencies to upstream services

Application Insights on the server provides these logs automatically through
OpenTelemetry. No additional code is needed beyond the `instrumentation.ts`
setup — all HTTP requests, database calls, and external API calls are traced.

### Checkpoint 5

The Vite SPA (B06) uses client-side Application Insights only. The Next.js
application uses both server-side and client-side monitoring. Give two
examples of issues that server-side monitoring would catch but client-side
monitoring would miss.

---

## Phase 6 — Azure Cache for Redis

### Session management

In the Vite SPA (B04), authentication tokens are stored in the browser
(`localStorage` or cookies). In Next.js, sessions can be managed server-side
with Redis, providing stronger security guarantees.

```tsx
// src/lib/redis.ts
import { Redis } from 'ioredis';
import { serverEnv } from './env';

export const redis = new Redis(serverEnv.REDIS_URL, {
  password: serverEnv.REDIS_TOKEN,
  tls: { rejectUnauthorized: true },
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    if (times > 3) return null; // Stop retrying after 3 attempts
    return Math.min(times * 200, 2000); // Exponential backoff
  },
});
```

```tsx
// src/lib/session.ts
import { redis } from './redis';
import { z } from 'zod';
import crypto from 'node:crypto';

const SESSION_TTL = 15 * 60; // 15 minutes (BSP 982)

const SessionSchema = z.object({
  userId: z.string(),
  email: z.string().email(),
  role: z.enum(['customer', 'staff', 'admin']),
  createdAt: z.string().datetime(),
  lastActivity: z.string().datetime(),
});

type Session = z.infer<typeof SessionSchema>;

export async function createSession(data: Omit<Session, 'createdAt' | 'lastActivity'>): Promise<string> {
  const sessionId = crypto.randomUUID();
  const now = new Date().toISOString();

  const session: Session = {
    ...data,
    createdAt: now,
    lastActivity: now,
  };

  await redis.setex(
    `session:${sessionId}`,
    SESSION_TTL,
    JSON.stringify(session),
  );

  return sessionId;
}

export async function getSession(sessionId: string): Promise<Session | null> {
  const data = await redis.get(`session:${sessionId}`);
  if (!data) return null;

  const session = SessionSchema.parse(JSON.parse(data));

  // Refresh TTL on activity (sliding expiration)
  await redis.expire(`session:${sessionId}`, SESSION_TTL);

  // Update last activity
  session.lastActivity = new Date().toISOString();
  await redis.setex(
    `session:${sessionId}`,
    SESSION_TTL,
    JSON.stringify(session),
  );

  return session;
}

export async function destroySession(sessionId: string): Promise<void> {
  await redis.del(`session:${sessionId}`);
}
```

### BSP 982 session requirements

| Requirement | Implementation |
|------------|---------------|
| Session timeout after 15 minutes of inactivity | Redis TTL with sliding expiration |
| Session data not accessible from browser JavaScript | HttpOnly cookie stores only session ID |
| Session invalidation on logout | `destroySession` deletes the Redis key |
| Session data encrypted in transit | TLS connection to Azure Cache for Redis |
| Single active session per user (optional) | Store user→session mapping, delete old session on new login |

### Rate limiting for public API routes

```tsx
// src/lib/rate-limit.ts
import { redis } from './redis';

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  const redisKey = `rate:${key}`;
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - windowSeconds;

  // Remove old entries
  await redis.zremrangebyscore(redisKey, 0, windowStart);

  // Count current entries
  const count = await redis.zcard(redisKey);

  if (count >= limit) {
    const oldestEntry = await redis.zrange(redisKey, 0, 0, 'WITHSCORES');
    const resetAt = new Date((Number(oldestEntry[1]) + windowSeconds) * 1000);

    return { allowed: false, remaining: 0, resetAt };
  }

  // Add current request
  await redis.zadd(redisKey, now, `${now}:${crypto.randomUUID()}`);
  await redis.expire(redisKey, windowSeconds);

  return {
    allowed: true,
    remaining: limit - count - 1,
    resetAt: new Date((now + windowSeconds) * 1000),
  };
}
```

Usage in a Route Handler:

```tsx
// app/api/rates/route.ts (addition from A22)
import { rateLimit } from '@/lib/rate-limit';
import { headers } from 'next/headers';

export async function GET() {
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for') ?? 'unknown';

  const limit = await rateLimit(`rates:${ip}`, 60, 60); // 60 req/min

  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      {
        status: 429,
        headers: {
          'Retry-After': Math.ceil((limit.resetAt.getTime() - Date.now()) / 1000).toString(),
          'X-RateLimit-Remaining': '0',
        },
      },
    );
  }

  // ... existing rate fetching logic
}
```

Rate limiting protects public API routes from abuse. Without rate limiting,
an attacker could flood the `/api/rates` endpoint, exhausting upstream API
quotas and potentially incurring costs.

### Checkpoint 6

The session uses a sliding 15-minute TTL. Every time the user makes a request,
the TTL resets to 15 minutes. Explain why this is preferable to a fixed
expiration (e.g., session expires exactly 15 minutes after login). What
user experience problem does sliding expiration solve?

---

## Phase 7 — Production Checklist

### SOX-compliant release checklist for Next.js

This extends the B07 release checklist with Next.js-specific items.

```markdown
## Production Release Checklist — Next.js Public Site

### Pre-Release
- [ ] All tests passing (unit, integration, E2E)
- [ ] Code review approved by 2+ reviewers
- [ ] Security scan completed (no critical/high findings)
- [ ] Docker image vulnerability scan passed
- [ ] Node.js version is current LTS (24.x)
- [ ] Performance baseline verified (LCP < 2.5s on 4G)
- [ ] Staging environment tested by QA
- [ ] Change request ticket approved
- [ ] Rollback plan documented (slot swap back)

### Build Verification
- [ ] `output: 'standalone'` enabled in next.config.ts
- [ ] Docker image builds successfully
- [ ] Docker image size is reasonable (< 200 MB)
- [ ] Health endpoint returns 200 on staging
- [ ] Key Vault connectivity verified on staging
- [ ] Redis connectivity verified on staging

### Security
- [ ] CSP header includes nonce for inline scripts
- [ ] HSTS header present with includeSubDomains
- [ ] No server-only secrets in NEXT_PUBLIC_ variables
- [ ] Azure Key Vault managed identity configured
- [ ] Redis TLS enabled
- [ ] Session TTL set to 15 minutes (BSP 982)
- [ ] Rate limiting active on public API routes

### Release
- [ ] Deploy Docker image to staging slot
- [ ] Run smoke tests against staging slot
- [ ] SOX approval received for production swap
- [ ] Swap staging slot to production
- [ ] Verify health endpoint on production
- [ ] Monitor error rates for 30 minutes post-deploy

### Post-Release
- [ ] Verify CDN caching headers (static assets: 1yr, HTML: 60s)
- [ ] Verify Lighthouse scores meet targets
- [ ] Update release notes
- [ ] Close change request ticket
- [ ] Archive deployment artifacts
- [ ] Notify stakeholders
```

### Go-live sequence

```
1. Deploy to staging slot
   az webapp config container set --slot staging ...

2. Wait for container to start
   az webapp deployment slot wait --slot staging --created

3. Smoke tests
   curl https://app-staging.azurewebsites.net/api/health

4. QA verification on staging URL
   (Manual step — verify critical flows)

5. SOX approval
   (Change request approved in ticketing system)

6. Swap to production
   az webapp deployment slot swap --slot staging --target-slot production

7. Post-swap verification
   curl https://ewbanking.com/api/health

8. Monitor for 30 minutes
   (Watch Application Insights for error spikes)

9. If issues detected
   az webapp deployment slot swap --slot production --target-slot staging
   (Instant rollback — swap back)
```

### Ongoing maintenance

Unlike the Vite SPA (which has no runtime to maintain), the Next.js
application requires ongoing patching:

| Item | Frequency | Why |
|------|-----------|-----|
| Node.js LTS updates | Monthly (security patches) | BSP 808: patch known vulnerabilities |
| Docker base image updates | Monthly | Alpine security patches |
| npm dependency audit | Weekly | `npm audit` for known CVEs |
| Next.js version updates | Quarterly | Framework security and performance fixes |
| Redis version monitoring | Quarterly | Azure manages, verify version is supported |
| SSL certificate renewal | Automatic | Azure Front Door managed certificates |

This is the maintenance cost of server-side rendering. The Vite SPA on Blob
Storage has none of these concerns. BSP 808 requires that all internet-facing
systems are patched within defined SLAs — typically 30 days for critical
vulnerabilities and 90 days for high-severity issues.

### Checkpoint 7

The ongoing maintenance table shows that the Next.js application requires
monthly Node.js and Docker updates. The Vite SPA requires none. A developer
argues that this means the Vite SPA is more secure. Explain why "no runtime"
eliminates entire vulnerability classes, but also explain what security
capabilities the Vite SPA loses by not having a server.

---

## Key Takeaways

1. **App Service replaces Blob Storage** — Next.js needs a Node.js runtime.
   Static hosting is not sufficient for server-side rendering, Route Handlers,
   or middleware.

2. **`output: 'standalone'` produces a minimal Node.js server** — the
   three-stage Dockerfile copies only the standalone output, reducing image
   size and attack surface.

3. **CI/CD extends the B07 pattern** — same quality gates (lint, type-check,
   test, E2E), but the build produces a Docker image pushed to Azure Container
   Registry, and deployment uses App Service slot swaps.

4. **CDN caching differs fundamentally** — the CDN caches server-rendered
   pages with short TTLs (60s for HTML), not static files with infinite TTLs.
   Cache misses hit the App Service origin.

5. **Server-side monitoring captures what client-side cannot** — render times,
   upstream API latency, authentication failures, and bot traffic are all
   visible through OpenTelemetry instrumentation.

6. **Redis handles sessions and rate limiting** — server-side sessions with
   sliding TTL are more secure than browser-stored tokens. Rate limiting
   protects public APIs from abuse.

7. **Node.js runtime means ongoing patching** — monthly security updates for
   Node.js, Docker, and dependencies. This is the operational cost of
   server-side rendering (BSP 808 compliance).

---

## Exercises

### Exercise 1 — Blue-Green with Deployment Slots

Extend the CI/CD workflow to implement a full blue-green deployment:

1. Deploy the new version to the staging slot
2. Run automated smoke tests (health check, critical page loads, login flow)
3. Add a manual approval gate using GitHub Environments
4. Swap the staging slot to production
5. If smoke tests fail on production after swap, automatically swap back

Document the rollback procedure as a runbook with step-by-step commands.

### Exercise 2 — CDN Cache Optimization

Create Azure CDN rules for each content type:

1. `/_next/static/*` — 1 year (content-hashed, immutable)
2. `/_next/image/*` — 1 day (optimized images, may change)
3. `/api/*` — no cache
4. HTML pages — 60 seconds (aligned with ISR)
5. Fonts and favicons — 30 days

Write a test script that verifies the `Cache-Control` header for each content
type using `curl -I`.

### Exercise 3 — Multi-Region Architecture

Design (diagram only — no implementation) a multi-region deployment for
`ewbanking.com` with:

1. Azure Front Door as the global load balancer
2. Two App Service instances (Southeast Asia and East Asia)
3. Redis with geo-replication for session sharing
4. Azure Traffic Manager for DNS-level failover

Identify which data needs to be replicated between regions and which can
remain region-local.

---

## What Comes Next

You have deployed the Next.js public site to Azure App Service with CI/CD,
CDN caching, server-side monitoring, and Redis session management. The EWB
public-facing application stack is complete.

This concludes Level 9 — Public-Facing Applications. Return to the main
curriculum to continue with the companion exercises or review previous
levels.

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
