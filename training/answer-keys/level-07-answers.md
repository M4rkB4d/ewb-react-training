# Level 7 — Production: Answer Key

> **EastWest Bank — Digital Platforms & Innovations**
>
> Quiz Answers + Exercise Solutions

---

## Quiz Answers

### Question 1 — B

`frame-ancestors 'none'` prevents any site from embedding your application in an iframe, which blocks clickjacking attacks. `X-Frame-Options: DENY` does the same thing but is the older mechanism. The CSP `frame-ancestors` directive is the modern replacement.

### Question 2 — False

React escapes content rendered via `{variable}` in JSX, but `dangerouslySetInnerHTML` bypasses this protection entirely. Content passed through `dangerouslySetInnerHTML` is inserted as raw HTML without escaping — this is exactly what makes it dangerous and why it requires DOMPurify sanitization.

### Question 3 — C

BSP 982 requires that access tokens are not persisted in browser storage mechanisms. In-memory JavaScript variables (e.g., a Zustand store variable) are cleared when the tab closes or the page is refreshed, providing the strongest protection against token theft via XSS. `localStorage` and `sessionStorage` are accessible to any JavaScript running on the page. Note: refresh tokens use a separate strategy (HttpOnly cookies set by the server).

### Question 4

Vite embeds all `VITE_*` variables directly into the JavaScript bundle at build time. Anyone inspecting the page source or the JavaScript files can read the database connection string, including the username, password, host, and database name. This exposes the internal database to the internet. Secrets must never use the `VITE_` prefix — they belong on the backend only.

### Question 5 — B

SRI computes a cryptographic hash of a file and compares it against the `integrity` attribute. If a CDN is compromised and serves a modified script, the hash will not match and the browser will block execution. This protects against supply-chain attacks on third-party dependencies.

### Question 6 — B

The `DeployStaging` stage has `dependsOn: Build`, meaning the Build stage must complete successfully first. The Build stage itself depends on `QualityGates`. So the full sequence is: QualityGates → Build → DeployStaging.

### Question 7 — False

AMLA (RA 9160) requires banks to retain customer identification records and transaction data for at least 5 years after account closure. The bank must explain this to the customer and can only delete data that is not subject to legal retention requirements. Full erasure is not possible for banking customers.

### Question 8

`navigator.sendBeacon()` sends data asynchronously and is guaranteed to complete even if the page is unloading (e.g., the user closes the tab or navigates away). A standard `fetch()` call might be cancelled by the browser during page unload, which would mean audit events are lost. For BSP 1019 compliance, every audit event must be persisted — `sendBeacon` ensures this.

### Question 9 — C

Azure Blob Storage with Azure CDN and Front Door is the recommended deployment for Vite SPAs. There is no server runtime to manage, no containers to patch, and no Nginx to configure. Azure handles HTTPS, caching, and global distribution. The WAF on Front Door satisfies BSP 808 requirements for internet-facing applications.

### Question 10

AMLA requires a minimum of 5 years of retention after account closure. This means the frontend cannot offer a "Delete All My Data" button that removes everything. The data erasure feature must explain which data is subject to legal retention and only delete data not covered by AMLA requirements. The UI should clearly communicate this to the customer per DPA transparency requirements.

### Question 11 — B

Automated compliance tests (e.g., verifying that `auth-store.ts` does not contain `localStorage` or `persist(`) run on every build. If a developer accidentally introduces a non-compliant pattern, the test fails and the build is blocked. This provides continuous verification rather than relying solely on manual review.

### Question 12 — C

The DPA data minimization principle requires displaying the minimum PII necessary. For account numbers, only the last 4 digits are shown by default (`••••7890`). The user must explicitly click "Show" to reveal the full number. This matches the masking policy in A17.

---

## Exercise Solutions

### Exercise 1 — Security Headers Middleware

```tsx
// vite-plugin-security-headers.ts
import type { Plugin } from 'vite';

export const CSP_DIRECTIVES = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data: https://cdn.ewbanking.com",
  "connect-src 'self' https://api.ewbanking.com https://*.sentry.io",
  "font-src 'self'",
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  'upgrade-insecure-requests',
].join('; ');

export function securityHeaders(): Plugin {
  return {
    name: 'security-headers',
    configureServer(server) {
      server.middlewares.use((_req, res, next) => {
        res.setHeader('Content-Security-Policy', CSP_DIRECTIVES);
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        res.setHeader(
          'Permissions-Policy',
          'camera=(), microphone=(), geolocation=()',
        );
        next();
      });
    },
  };
}
```

Register in `vite.config.ts`:

```tsx
import { securityHeaders } from './vite-plugin-security-headers';

export default defineConfig({
  plugins: [react(), securityHeaders()],
});
```

Test:

```tsx
// vite-plugin-security-headers.test.ts
import { describe, it, expect } from 'vitest';

// This would use a test server or verify the plugin output
describe('Security Headers Plugin', () => {
  it('includes CSP with frame-ancestors none', () => {
    const csp = CSP_DIRECTIVES;
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("script-src 'self'");
    expect(csp).not.toContain("script-src 'self' 'unsafe-inline'");
  });
});
```

### Exercise 2 — Consent Management Dashboard

Key implementation points:

```tsx
// src/features/consent/components/consent-dashboard.tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { apiClient } from '@/lib/api-client';
import { emitAuditEvent } from '@/compliance/audit-service';
import type { ConsentPurpose } from '../types';

const consentSchema = z.object({
  id: z.string(),
  purpose: z.string(),
  granted: z.boolean(),
  grantedAt: z.string().nullable(),
  revokedAt: z.string().nullable(),
});

const purposes = [
  { key: 'essential' as const, label: 'Essential Banking Services', required: true },
  { key: 'analytics' as const, label: 'Usage Analytics', required: false },
  { key: 'marketing' as const, label: 'Marketing Communications', required: false },
  { key: 'biometric' as const, label: 'Biometric Authentication', required: false },
  { key: 'data-sharing' as const, label: 'Data Sharing — Open Finance', required: false },
  { key: 'location' as const, label: 'Location Services', required: false },
];

export function ConsentDashboard() {
  const queryClient = useQueryClient();

  const { data: consents, isLoading, error } = useQuery({
    queryKey: ['consents'],
    queryFn: async () => {
      const res = await apiClient.get('/user/consents');
      return z.array(consentSchema).parse(res.data);
    },
  });

  const toggleConsent = useMutation({
    mutationFn: async ({ purpose, granted }: { purpose: ConsentPurpose; granted: boolean }) => {
      await apiClient.post('/user/consents', { purpose, granted });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['consents'] });
      emitAuditEvent(
        variables.granted ? 'CONSENT_GRANTED' : 'CONSENT_REVOKED',
        { purpose: variables.purpose },
      );
    },
  });

  const isGranted = (purpose: string) =>
    consents?.some((c) => c.purpose === purpose && c.granted) ?? false;

  const getTimestamp = (purpose: string) => {
    const consent = consents?.find((c) => c.purpose === purpose);
    if (!consent) return null;
    return consent.granted ? consent.grantedAt : consent.revokedAt;
  };

  if (isLoading) return <p>Loading preferences...</p>;
  if (error) return <p>Failed to load consent preferences.</p>;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Privacy Preferences</h2>
      {purposes.map((p) => (
        <div key={p.key} className="flex items-center justify-between border-b pb-4">
          <div>
            <h3 className="font-medium">{p.label}</h3>
            {getTimestamp(p.key) && (
              <p className="text-xs text-gray-500">
                Last updated: {new Date(getTimestamp(p.key)!).toLocaleDateString('en-PH')}
              </p>
            )}
          </div>
          <input
            type="checkbox"
            role="switch"
            checked={p.required || isGranted(p.key)}
            disabled={p.required || toggleConsent.isPending}
            onChange={(e) =>
              toggleConsent.mutate({ purpose: p.key, granted: e.target.checked })
            }
            aria-label={`${p.label} consent toggle`}
          />
        </div>
      ))}
    </div>
  );
}
```

### Exercise 3 — CI/CD Pipeline with Security Scanning

```yaml
- stage: SecurityAudit
  displayName: 'Security Audit'
  dependsOn: QualityGates
  jobs:
    - job: DependencyAudit
      displayName: 'Dependency Vulnerability Scan'
      pool:
        vmImage: 'ubuntu-latest'
      steps:
        - task: NodeTool@1
          inputs:
            versionSpec: '24.x'
        - script: npm ci
          displayName: 'Install dependencies'
        - script: |
            AUDIT_RESULT=$(npm audit --json 2>/dev/null || true)
            CRITICAL=$(echo "$AUDIT_RESULT" | node -e "
              const data = require('fs').readFileSync('/dev/stdin','utf8');
              const parsed = JSON.parse(data);
              const vuln = parsed.metadata?.vulnerabilities || {};
              console.log(vuln.critical || 0);
            ")
            HIGH=$(echo "$AUDIT_RESULT" | node -e "
              const data = require('fs').readFileSync('/dev/stdin','utf8');
              const parsed = JSON.parse(data);
              const vuln = parsed.metadata?.vulnerabilities || {};
              console.log(vuln.high || 0);
            ")
            echo "Critical: $CRITICAL, High: $HIGH"
            if [ "$CRITICAL" -gt 0 ] || [ "$HIGH" -gt 0 ]; then
              echo "##vso[task.logissue type=error]Found $CRITICAL critical and $HIGH high vulnerabilities"
              exit 1
            fi
          displayName: 'Check for critical/high vulnerabilities'

- stage: VerifyHeaders
  displayName: 'Verify Security Headers'
  dependsOn: DeployStaging
  jobs:
    - job: HeaderCheck
      pool:
        vmImage: 'ubuntu-latest'
      steps:
        - script: |
            STAGING_URL="https://ewb-portal-staging.azurewebsites.net"
            HEADERS=$(curl -sI "$STAGING_URL")
            FAILED=0

            check_header() {
              if echo "$HEADERS" | grep -qi "$1"; then
                echo "PASS: $1"
              else
                echo "FAIL: $1 not found"
                FAILED=1
              fi
            }

            check_header "X-Frame-Options: DENY"
            check_header "X-Content-Type-Options: nosniff"
            check_header "Content-Security-Policy"
            check_header "Referrer-Policy"
            check_header "Permissions-Policy"

            if [ "$FAILED" -eq 1 ]; then
              echo "##vso[task.logissue type=error]Missing security headers"
              exit 1
            fi
          displayName: 'Verify all security headers present'
```

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
