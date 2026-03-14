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
