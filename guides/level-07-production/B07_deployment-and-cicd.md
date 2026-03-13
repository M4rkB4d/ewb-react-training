# B07 — Deployment and CI/CD

> **EastWest Bank — Digital Platforms & Innovations**
>
> Part B (Vite SPA) · Level 7 — Production · Est. 3.5 hours

---

## What You Will Learn

By the end of this guide, you will:

- Build production-optimized Docker images for Vite SPAs
- Configure Nginx for SPA routing and security headers
- Set up a GitHub Actions CI/CD pipeline
- Implement environment-specific configuration
- Deploy to Azure Blob Storage with Azure CDN and Front Door
- Deploy with blue-green strategy for zero-downtime releases
- Build SOX-compliant change management checklists
- Understand the release approval process

---

## Prerequisites

| Requirement | Where |
|------------|-------|
| Completed B06 — Monitoring and Observability | Level 6 |
| Docker installed | Local setup |
| GitHub repository created | Git setup |

---

## Phase 1 — Production Build

### Build optimization

```bash
npm run build
```

Vite produces optimized output in `dist/`:
- JavaScript is minified and tree-shaken
- CSS is extracted and minified
- Assets are content-hashed for cache-busting
- Source maps are generated (for Sentry)

### Environment configuration

```tsx
// src/lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  VITE_API_BASE_URL: z.string().url(),
  VITE_SENTRY_DSN: z.string().optional(),
  VITE_APPINSIGHTS_CONNECTION_STRING: z.string().optional(),
  VITE_APP_VERSION: z.string().default('0.0.0'),
  MODE: z.enum(['development', 'staging', 'production']),
  DEV: z.boolean(),
  PROD: z.boolean(),
});

export const env = envSchema.parse({
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  VITE_SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
  VITE_APPINSIGHTS_CONNECTION_STRING: import.meta.env.VITE_APPINSIGHTS_CONNECTION_STRING,
  VITE_APP_VERSION: import.meta.env.VITE_APP_VERSION,
  MODE: import.meta.env.MODE,
  DEV: import.meta.env.DEV,
  PROD: import.meta.env.PROD,
});
```

Environment files per stage:

```
.env                  # Shared defaults
.env.development      # Local development
.env.staging          # Staging deployment
.env.production       # Production deployment
```

> **Security:** `.env.production` must never contain secrets. Vite embeds
> `VITE_*` variables into the JavaScript bundle — anyone can read them.
> API keys and secrets belong on the backend only.

### Checkpoint 1

A developer adds `VITE_DATABASE_URL` to `.env.production`. Explain why this
is a critical security vulnerability and what would happen in production.

---

## Phase 2 — Docker Configuration

### Multi-stage Dockerfile

```dockerfile
# Dockerfile
# Stage 1: Build
FROM node:24-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

COPY . .
RUN npm run build

# Stage 2: Serve
FROM nginx:1.27-alpine AS production
WORKDIR /usr/share/nginx/html

# Remove default nginx content
RUN rm -rf ./*

# Copy built assets
COPY --from=builder /app/dist .

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Non-root user for security
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d

USER nginx

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
```

### Nginx configuration

```nginx
# nginx.conf
server {
    listen 8080;
    root /usr/share/nginx/html;
    index index.html;

    # SPA routing — all routes serve index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets aggressively (content-hashed)
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers (BSP 982, BSP 1105)
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://api.ewbanking.com https://*.sentry.io; font-src 'self';" always;

    # Disable server version disclosure
    server_tokens off;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;
    gzip_min_length 1000;
}
```

### Checkpoint 2

Explain each security header in the Nginx configuration. What attack does each
one prevent?

---

## Phase 3 — CI/CD Pipeline

### GitHub Actions workflow

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '24'
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  lint-and-type-check:
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

  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
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

  build:
    needs: [lint-and-type-check, unit-tests, e2e-tests]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/

  deploy-staging:
    if: github.ref == 'refs/heads/develop'
    needs: build
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: dist
          path: dist/
      - name: Azure Login
        uses: azure/login@v2
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS_STAGING }}
      - name: Upload to Azure Blob Storage
        run: |
          az storage blob upload-batch \
            --account-name ${{ vars.AZURE_STORAGE_ACCOUNT_STAGING }} \
            --destination '$web' \
            --source dist/ \
            --overwrite
      - name: Purge Azure CDN cache
        run: |
          az cdn endpoint purge \
            --resource-group ${{ vars.AZURE_RG }} \
            --profile-name ${{ vars.AZURE_CDN_PROFILE }} \
            --name ${{ vars.AZURE_CDN_ENDPOINT_STAGING }} \
            --content-paths '/*'

  deploy-production:
    if: github.ref == 'refs/heads/main'
    needs: build
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: dist
          path: dist/
      - name: Azure Login
        uses: azure/login@v2
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS_PRODUCTION }}
      - name: Upload to Azure Blob Storage
        run: |
          az storage blob upload-batch \
            --account-name ${{ vars.AZURE_STORAGE_ACCOUNT_PROD }} \
            --destination '$web' \
            --source dist/ \
            --overwrite
      - name: Purge Azure CDN cache
        run: |
          az cdn endpoint purge \
            --resource-group ${{ vars.AZURE_RG }} \
            --profile-name ${{ vars.AZURE_CDN_PROFILE }} \
            --name ${{ vars.AZURE_CDN_ENDPOINT_PROD }} \
            --content-paths '/*'
```

### Branch strategy

```
main ──────────────────────────────────────→ Production
  │
  ├── develop ──────────────────────────→ Staging
  │     │
  │     ├── feature/transfer-wizard ──→ PR → develop
  │     ├── feature/passkey-login ────→ PR → develop
  │     └── fix/session-timeout ──────→ PR → develop
  │
  └── hotfix/security-patch ──────────→ PR → main
```

---

## Phase 4 — SOX Change Management

### Release checklist

For every production deployment, the following SOX-compliant checklist must be
completed:

```markdown
## Production Release Checklist

### Pre-Release
- [ ] All tests passing (unit, integration, E2E)
- [ ] Code review approved by 2+ reviewers
- [ ] Security scan completed (no critical/high findings)
- [ ] Performance baseline verified (LCP < 2.5s)
- [ ] Staging environment tested by QA
- [ ] Change request ticket approved
- [ ] Rollback plan documented

### Release
- [ ] Deploy to production via CI/CD (no manual steps)
- [ ] Verify deployment health checks
- [ ] Monitor error rates for 15 minutes post-deploy
- [ ] Verify critical user flows (login, transfer, balance)

### Post-Release
- [ ] Update release notes
- [ ] Close change request ticket
- [ ] Archive deployment artifacts
- [ ] Notify stakeholders
```

### Blue-green deployment with Azure Front Door

```
                  Azure Front Door (WAF)
                    ┌──────────┐
                    │  Router   │
                    └────┬─────┘
                         │
              ┌──────────┴──────────┐
              │                     │
        ┌─────┴─────┐        ┌─────┴─────┐
        │  Blue     │        │  Green    │
        │  Storage  │        │  Storage  │
        │  (v1.2.0) │        │  (v1.3.0) │
        │  ACTIVE   │        │  STANDBY  │
        └───────────┘        └───────────┘
```

1. **Blue** is the current Azure Blob Storage account serving production
2. **Green** is a second storage account deployed with the new version
3. Smoke tests run against Green via its direct URL
4. Azure Front Door switches the backend origin to Green
5. Blue becomes the rollback target

If issues are detected, Front Door switches the origin back to Blue instantly.
Azure Front Door also provides WAF (Web Application Firewall) protection —
a BSP 808 requirement for all internet-facing banking applications.

---

## Phase 5 — Azure Infrastructure for Vite SPAs

EastWest Bank runs on Azure. A Vite SPA is a set of static files — HTML, JS,
CSS, and assets. Azure offers two deployment models:

### Option A — Azure Blob Storage + CDN (recommended for SPAs)

```
GitHub Actions → Build → Upload to Azure Blob Storage ($web container)
                            ↓
                     Azure CDN (caching, HTTPS)
                            ↓
                     Azure Front Door (WAF, global routing)
                            ↓
                         Users
```

This is the recommended approach for Vite SPAs. No servers to manage, no
containers to patch, no Nginx to configure. Azure handles HTTPS, caching, and
global distribution.

#### Setting up static hosting

```bash
# Enable static website hosting on storage account
az storage blob service-properties update \
  --account-name ewbportalstaging \
  --static-website \
  --index-document index.html \
  --404-document index.html

# Upload built assets
az storage blob upload-batch \
  --account-name ewbportalstaging \
  --destination '$web' \
  --source dist/ \
  --overwrite
```

> **SPA routing:** Setting `--404-document index.html` ensures all routes
> serve the SPA entry point, just like the `try_files` directive in Nginx.

### Option B — Azure Container Apps (when you need more control)

The Docker/Nginx setup from Phase 2 deploys to Azure Container Apps when you
need custom server-side logic, complex routing rules, or server-side security
headers that Azure CDN rules cannot express.

```bash
# Build and push to Azure Container Registry
az acr build \
  --registry ewbregistry \
  --image ewb-portal:${{ github.sha }} .

# Deploy to Azure Container Apps
az containerapp update \
  --name ewb-portal-staging \
  --resource-group ewb-digital \
  --image ewbregistry.azurecr.io/ewb-portal:${{ github.sha }}
```

### Which option to choose

| Concern | Blob Storage + CDN | Container Apps |
|---------|-------------------|----------------|
| Complexity | Low — static files only | Medium — containers |
| Cost | Very low | Higher (compute) |
| Security patching | None (no runtime) | Must patch Node/Nginx |
| Custom headers | Azure CDN rules | Full Nginx control |
| WAF | Azure Front Door | Azure Front Door |
| SPA routing | 404 → index.html | Nginx try_files |

For the EWB internal banking portal (a Vite SPA), **Option A is recommended**.
No runtime means no runtime vulnerabilities to patch.

### Checkpoint 5

Why is "no runtime" a security advantage for deploying a Vite SPA? What
class of vulnerabilities does static hosting eliminate compared to running
a Node.js or Nginx server?

---

## Key Takeaways

1. **Multi-stage Docker builds** — build stage compiles, serve stage only
   contains static files and Nginx. Useful for containerized deployments to
   Azure Container Apps.

2. **Security headers** are mandatory. CSP, X-Frame-Options, and others prevent
   XSS, clickjacking, and MIME-type attacks.

3. **CI/CD pipeline** — lint, type-check, unit test, E2E test, build, deploy.
   All automated, no manual steps in production deploys.

4. **SOX compliance** requires documented change management. Every production
   release needs approval, testing evidence, and a rollback plan.

5. **Blue-green deployment** via Azure Front Door enables zero-downtime
   releases with instant rollback capability.

6. **Azure Blob Storage + CDN** is the recommended deployment for Vite SPAs —
   no servers to manage, no runtime vulnerabilities to patch.

---

## Exercises

### Exercise 1 — CSP Refinement
Review the Content-Security-Policy header. Add directives for WebSocket
connections to the real-time balance endpoint and for loading Google Fonts.

### Exercise 2 — Rollback Automation
Write a GitHub Actions workflow that can be manually triggered to rollback
to the previous production version. It should re-deploy the previous Docker
image tag.

### Exercise 3 — Deployment Notifications
Add a step to the CI/CD pipeline that posts a message to a Slack channel
when a deployment starts and when it completes (with success/failure status).

---

## What Comes Next

**Next guide:** [A15 — Security Hardening](A15_security-hardening.md) —
where you implement CSP, SRI, Trusted Types, and other browser-level security
mechanisms.

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
