# B07 — Deployment and CI/CD

> **EastWest Bank — Digital Platforms & Innovations**
>
> Part B (Vite SPA) · Level 7 — Production · Est. 3.5 hours

---

## What You Will Learn

By the end of this guide, you will:

- Build production-optimized Docker images for Vite SPAs
- Configure Nginx for SPA routing and security headers
- Set up an Azure Pipelines CI/CD pipeline
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
| Azure DevOps project created | DevOps setup |

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
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=(), usb=()" always;
    # Vite code-splits the bundle into multiple .js files under /assets/ at build
    # time. They are all same-origin, so script-src 'self' covers them. If you ever
    # serve assets from an external CDN, add that origin to script-src.
    add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self' https://api.ewbanking.com https://*.sentry.io; font-src 'self'; frame-src 'none'; frame-ancestors 'none'; form-action 'self'; base-uri 'self'; upgrade-insecure-requests;" always;

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

### Azure Pipelines configuration

EastWest Bank uses Azure DevOps for source control and CI/CD. Azure Pipelines
integrates natively with Azure services — no third-party marketplace actions
needed for Azure login, storage, or CDN operations.

```yaml
# azure-pipelines.yml
trigger:
  branches:
    include:
      - main
      - develop

pr:
  branches:
    include:
      - main

variables:
  nodeVersion: '24'
  azureSubscription: 'ewb-azure-service-connection'
  # Variable group 'ewb-portal-vars' contains:
  # AZURE_STORAGE_ACCOUNT_STAGING, AZURE_STORAGE_ACCOUNT_PROD,
  # AZURE_RG, AZURE_CDN_PROFILE, AZURE_CDN_ENDPOINT_STAGING,
  # AZURE_CDN_ENDPOINT_PROD

stages:
  - stage: QualityGates
    displayName: 'Quality Gates'
    jobs:
      - job: LintAndTypeCheck
        displayName: 'Lint & Type Check'
        pool:
          vmImage: 'ubuntu-latest'
        steps:
          - task: NodeTool@0
            inputs:
              versionSpec: $(nodeVersion)
            displayName: 'Install Node.js'
          - script: npm ci
            displayName: 'Install dependencies'
          - script: npm run lint
            displayName: 'Lint'
          - script: npm run type-check
            displayName: 'Type check'

      - job: UnitTests
        displayName: 'Unit Tests'
        pool:
          vmImage: 'ubuntu-latest'
        steps:
          - task: NodeTool@0
            inputs:
              versionSpec: $(nodeVersion)
            displayName: 'Install Node.js'
          - script: npm ci
            displayName: 'Install dependencies'
          - script: npm run test:coverage
            displayName: 'Run unit tests with coverage'
          - task: PublishBuildArtifacts@1
            inputs:
              pathToPublish: coverage
              artifactName: coverage-report
            displayName: 'Publish coverage report'

      - job: E2ETests
        displayName: 'E2E Tests'
        pool:
          vmImage: 'ubuntu-latest'
        steps:
          - task: NodeTool@0
            inputs:
              versionSpec: $(nodeVersion)
            displayName: 'Install Node.js'
          - script: npm ci
            displayName: 'Install dependencies'
          - script: npx playwright install --with-deps chromium
            displayName: 'Install Playwright'
          - script: npm run test:e2e
            displayName: 'Run E2E tests'
          - task: PublishBuildArtifacts@1
            condition: failed()
            inputs:
              pathToPublish: playwright-report
              artifactName: playwright-report
            displayName: 'Publish Playwright report (on failure)'

  - stage: Build
    displayName: 'Build'
    dependsOn: QualityGates
    jobs:
      - job: BuildApp
        displayName: 'Build Application'
        pool:
          vmImage: 'ubuntu-latest'
        steps:
          - task: NodeTool@0
            inputs:
              versionSpec: $(nodeVersion)
            displayName: 'Install Node.js'
          - script: npm ci
            displayName: 'Install dependencies'
          - script: npm run build
            displayName: 'Build production bundle'
          - task: PublishBuildArtifacts@1
            inputs:
              pathToPublish: dist
              artifactName: dist
            displayName: 'Publish build artifacts'

  - stage: DeployStaging
    displayName: 'Deploy to Staging'
    dependsOn: Build
    condition: and(succeeded(), eq(variables['Build.SourceBranch'], 'refs/heads/develop'))
    variables:
      - group: ewb-portal-vars
    jobs:
      - deployment: DeployToStaging
        displayName: 'Deploy to Staging'
        pool:
          vmImage: 'ubuntu-latest'
        environment: 'ewb-portal-staging'
        strategy:
          runOnce:
            deploy:
              steps:
                - task: AzureCLI@2
                  displayName: 'Upload to Azure Blob Storage'
                  inputs:
                    azureSubscription: $(azureSubscription)
                    scriptType: bash
                    scriptLocation: inlineScript
                    inlineScript: |
                      az storage blob upload-batch \
                        --account-name $(AZURE_STORAGE_ACCOUNT_STAGING) \
                        --destination '$web' \
                        --source $(Pipeline.Workspace)/dist \
                        --overwrite
                - task: AzureCLI@2
                  displayName: 'Purge Azure CDN cache'
                  inputs:
                    azureSubscription: $(azureSubscription)
                    scriptType: bash
                    scriptLocation: inlineScript
                    inlineScript: |
                      az cdn endpoint purge \
                        --resource-group $(AZURE_RG) \
                        --profile-name $(AZURE_CDN_PROFILE) \
                        --name $(AZURE_CDN_ENDPOINT_STAGING) \
                        --content-paths '/*'

  - stage: DeployProduction
    displayName: 'Deploy to Production'
    dependsOn: Build
    condition: and(succeeded(), eq(variables['Build.SourceBranch'], 'refs/heads/main'))
    variables:
      - group: ewb-portal-vars
    jobs:
      - deployment: DeployToProduction
        displayName: 'Deploy to Production'
        pool:
          vmImage: 'ubuntu-latest'
        environment: 'ewb-portal-production'
        strategy:
          runOnce:
            deploy:
              steps:
                - task: AzureCLI@2
                  displayName: 'Upload to Azure Blob Storage'
                  inputs:
                    azureSubscription: $(azureSubscription)
                    scriptType: bash
                    scriptLocation: inlineScript
                    inlineScript: |
                      az storage blob upload-batch \
                        --account-name $(AZURE_STORAGE_ACCOUNT_PROD) \
                        --destination '$web' \
                        --source $(Pipeline.Workspace)/dist \
                        --overwrite
                - task: AzureCLI@2
                  displayName: 'Purge Azure CDN cache'
                  inputs:
                    azureSubscription: $(azureSubscription)
                    scriptType: bash
                    scriptLocation: inlineScript
                    inlineScript: |
                      az cdn endpoint purge \
                        --resource-group $(AZURE_RG) \
                        --profile-name $(AZURE_CDN_PROFILE) \
                        --name $(AZURE_CDN_ENDPOINT_PROD) \
                        --content-paths '/*'
```

> **Azure DevOps Environments:** The `environment` field in each deployment job
> connects to an Azure DevOps Environment. Configure approval gates in
> **Project Settings → Environments → ewb-portal-production → Approvals and
> checks**. This provides the manual approval gate required by SOX — no code
> reaches production without explicit approval.

> **Variable Groups:** Secrets and configuration values are stored in Azure
> DevOps variable groups (Pipelines → Library). The `ewb-portal-vars` group
> contains storage account names, resource group names, and CDN profile details.
> Mark secrets as "secret" in the variable group — they will be masked in logs.

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
Azure Pipelines → Build → Upload to Azure Blob Storage ($web container)
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
  --image ewb-portal:$(Build.SourceVersion) .

# Deploy to Azure Container Apps
az containerapp update \
  --name ewb-portal-staging \
  --resource-group ewb-digital \
  --image ewbregistry.azurecr.io/ewb-portal:$(Build.SourceVersion)
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
Write an Azure Pipelines configuration that can be manually triggered to
rollback to the previous production version. It should re-deploy the previous
build artifacts to Azure Blob Storage.

### Exercise 3 — Deployment Notifications
Add a step to the CI/CD pipeline that posts a message to a Slack channel
when a deployment starts and when it completes (with success/failure status).

---

## What Comes Next

**Next guide:** [A16 — BSP Compliance Framework](A16_bsp-compliance-framework.md) —
where you map BSP circulars to frontend controls, build audit trail systems,
and prepare for BSP on-site examinations.

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
