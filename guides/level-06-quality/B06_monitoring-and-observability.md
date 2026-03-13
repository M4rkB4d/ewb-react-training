# B06 — Monitoring and Observability

> **EastWest Bank — Digital Platforms & Innovations**
>
> Part B (Vite SPA) · Level 6 — Quality · Est. 2.5 hours

---

## What You Will Learn

By the end of this guide, you will:

- Integrate Sentry for frontend error tracking
- Set up structured logging for BSP audit compliance
- Report Web Vitals to a monitoring endpoint
- Track user sessions and feature usage
- Build an audit trail for financial operations
- Configure alerting for critical errors
- Understand BSP 1019 monitoring requirements

---

## Prerequisites

| Requirement | Where |
|------------|-------|
| Completed A13 — Error Handling | Level 6 |
| Completed B05 — Performance Optimization | Level 6 |

---

## Phase 1 — Error Tracking with Sentry

### Sentry setup

```tsx
// src/lib/monitoring.ts
import * as Sentry from '@sentry/react';
import { env } from './env';

export function initMonitoring(): void {
  if (import.meta.env.PROD) {
    Sentry.init({
      dsn: env.VITE_SENTRY_DSN,
      environment: import.meta.env.MODE,
      release: env.VITE_APP_VERSION,

      // Performance monitoring
      tracesSampleRate: 0.1, // 10% of transactions

      // Session replay for error reproduction
      replaysSessionSampleRate: 0,    // No general sessions
      replaysOnErrorSampleRate: 1.0,  // Replay on every error

      // Filtering
      beforeSend(event) {
        // BSP 982 — Never send PII to external monitoring
        if (event.user != null) {
          delete event.user.email;
          delete event.user.ip_address;
        }
        return event;
      },

      // Ignore noisy errors
      ignoreErrors: [
        'ResizeObserver loop limit exceeded',
        'ResizeObserver loop completed with undelivered notifications',
        'Non-Error promise rejection captured',
      ],
    });
  }
}
```

> **BSP 982 Critical:** The `beforeSend` hook strips PII (email, IP address)
> before sending to Sentry. Monitoring services are external — PII must not
> leave the bank's controlled systems.

### Setting user context

```tsx
// src/features/auth/hooks/use-login.ts (updated)
import * as Sentry from '@sentry/react';

// After successful login:
Sentry.setUser({
  id: user.id,
  // DO NOT include email, name, or other PII
});

// On logout:
Sentry.setUser(null);
```

### Sentry error boundary

```tsx
// src/app.tsx
import * as Sentry from '@sentry/react';

function App() {
  return (
    <Sentry.ErrorBoundary
      fallback={<FullPageError />}
      showDialog={false} // No Sentry feedback dialog in banking apps
    >
      <RouterProvider router={router} />
    </Sentry.ErrorBoundary>
  );
}
```

### Checkpoint 1

Why does the Sentry configuration set `replaysSessionSampleRate: 0` but
`replaysOnErrorSampleRate: 1.0`? What privacy consideration makes full
session replay inappropriate for a banking app?

---

## Phase 2 — Structured Logging

### Log levels and structure

```tsx
// src/lib/logger.ts

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  requestId?: string;
  userId?: string;
  action?: string;
}

function createLog(level: LogLevel, message: string, context?: Record<string, unknown>): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    context,
  };
}

export const logger = {
  debug: (message: string, context?: Record<string, unknown>) => {
    if (import.meta.env.DEV) {
      console.debug('[DEBUG]', message, context);
    }
  },

  info: (message: string, context?: Record<string, unknown>) => {
    const entry = createLog('info', message, context);
    if (import.meta.env.DEV) {
      console.info('[INFO]', message, context);
    } else {
      navigator.sendBeacon('/api/logs', JSON.stringify(entry));
    }
  },

  warn: (message: string, context?: Record<string, unknown>) => {
    const entry = createLog('warn', message, context);
    console.warn('[WARN]', message, context);
    if (import.meta.env.PROD) {
      navigator.sendBeacon('/api/logs', JSON.stringify(entry));
    }
  },

  error: (message: string, context?: Record<string, unknown>) => {
    const entry = createLog('error', message, context);
    console.error('[ERROR]', message, context);
    if (import.meta.env.PROD) {
      navigator.sendBeacon('/api/logs', JSON.stringify(entry));
    }
  },
};
```

### Audit logging for financial operations

```tsx
// src/lib/audit.ts
import { logger } from './logger';
import { useAuthStore } from '@/stores/auth-store';

type AuditAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'VIEW_ACCOUNT'
  | 'VIEW_BALANCE'
  | 'INITIATE_TRANSFER'
  | 'CONFIRM_TRANSFER'
  | 'CANCEL_TRANSFER'
  | 'CHANGE_SETTINGS'
  | 'EXPORT_DATA';

export function auditLog(action: AuditAction, details?: Record<string, unknown>): void {
  const userId = useAuthStore.getState().user?.id;

  // BSP 1019 — All financial actions must be logged
  logger.info(`AUDIT: ${action}`, {
    action,
    userId: userId ?? 'anonymous',
    ...details,
    // Never log PII or sensitive financial details
    // Log reference IDs, not account numbers
  });
}
```

Usage in components:

```tsx
// In transfer confirmation handler
const handleConfirm = async () => {
  auditLog('INITIATE_TRANSFER', {
    fromAccountId: formData.fromAccount,
    toAccountId: formData.toAccount,
    amount: formData.amount,
    currency: 'PHP',
  });

  await createTransfer(formData);

  auditLog('CONFIRM_TRANSFER', {
    referenceNumber: result.referenceNumber,
  });
};
```

### Checkpoint 2

Why does the audit log record `fromAccountId` (an internal ID) instead of the
actual account number? What BSP regulation drives this decision?

---

## Phase 3 — Performance Monitoring

### Web Vitals reporting

```tsx
// src/lib/web-vitals.ts (production version)
import { onCLS, onINP, onLCP, onFCP, onTTFB } from 'web-vitals';

export function initWebVitals(): void {
  const report = (metric: { name: string; value: number; rating: string }) => {
    if (import.meta.env.PROD) {
      navigator.sendBeacon('/api/vitals', JSON.stringify({
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        url: window.location.pathname,
        timestamp: new Date().toISOString(),
      }));
    }
  };

  onCLS(report);
  onINP(report);
  onLCP(report);
  onFCP(report);
  onTTFB(report);
}
```

### Navigation timing

```tsx
// src/lib/navigation-tracking.ts

export function trackNavigation(from: string, to: string, durationMs: number): void {
  if (import.meta.env.PROD) {
    navigator.sendBeacon('/api/navigation', JSON.stringify({
      from,
      to,
      durationMs,
      timestamp: new Date().toISOString(),
    }));
  }
}
```

---

## Phase 4 — BSP 1019 Compliance

### What BSP 1019 requires for frontend monitoring

| Requirement | Implementation |
|------------|---------------|
| Error detection and logging | Sentry + structured logger |
| Incident correlation | X-Request-ID on every API call |
| Audit trail for financial ops | `auditLog()` for all financial actions |
| Performance baseline | Web Vitals reporting |
| Anomaly detection | Alert on error rate spikes |
| PII protection in logs | Strip PII in `beforeSend` hooks |

### Alerting strategy

| Severity | Trigger | Response |
|----------|---------|----------|
| **Critical** | Auth service down, payment failures > 5% | Immediate page (on-call) |
| **High** | Error rate > 1%, LCP > 4s | Alert within 15 minutes |
| **Medium** | New error type, CLS > 0.25 | Daily review |
| **Low** | Deprecation warnings, slow queries | Weekly review |

---

## Key Takeaways

1. **Sentry for errors, structured logs for audit.** Sentry catches and groups
   errors automatically. Structured logs create the BSP-required audit trail.

2. **Never send PII to external monitoring.** Strip emails, names, account
   numbers from Sentry events. Use internal IDs only.

3. **Audit every financial operation** — view balance, initiate transfer,
   confirm transfer, export data. BSP 1019 requires a complete trail.

4. **`navigator.sendBeacon`** for all production telemetry. It is fire-and-forget
   and works even during page unload.

5. **Alert on what matters** — error rate spikes, auth failures, performance
   degradation. Not every warning needs a page.

---

## Exercises

### Exercise 1 — Feature Usage Tracking
Build a `useTrackFeature` hook that logs when a user interacts with a specific
feature (e.g., opens the transfer wizard, uses the search filter). Ensure no
PII is included in the tracking data.

### Exercise 2 — Error Rate Dashboard
Build a development-only dashboard that shows the error rate over the last
hour, grouped by error code. Include a mini chart.

### Exercise 3 — Compliance Report
Design the data model for a monthly BSP compliance report that summarizes:
total logins, failed login attempts, transfers by channel, error rates, and
average session duration. Show what data the frontend must collect.

---

## What Comes Next

Level 6 is complete. You have error handling, performance optimization, advanced
testing, and monitoring. Level 7 takes you to production — deployment, security,
and compliance.

**Next guide:** [B07 — Deployment and CI/CD](../level-07-production/B07_deployment-and-cicd.md)

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
