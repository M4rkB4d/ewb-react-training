// src/lib/error-logger.ts
import { AppError } from './errors';

interface ErrorLogEntry {
  timestamp: string;
  code: string;
  message: string;
  severity: string;
  context?: Record<string, unknown>;
  componentStack?: string;
  url: string;
  userId?: string;
}

export function logError(error: unknown, extra?: { componentStack?: string }): void {
  const entry: ErrorLogEntry = {
    timestamp: new Date().toISOString(),
    code: error instanceof AppError ? error.code : 'UNKNOWN',
    message: error instanceof Error ? error.message : String(error),
    severity: error instanceof AppError ? error.severity : 'high',
    context: error instanceof AppError ? error.context : undefined,
    componentStack: extra?.componentStack,
    url: window.location.href,
  };

  // In production: send to monitoring service
  // In development: log to console
  if (import.meta.env.DEV) {
    console.error('[ErrorLog]', entry);
  } else {
    // Send to Sentry / Azure App Insights (covered in B06)
    navigator.sendBeacon('/api/errors', JSON.stringify(entry));
  }
}
