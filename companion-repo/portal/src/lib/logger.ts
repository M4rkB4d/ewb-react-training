// src/lib/logger.ts
import { env } from './env';

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
      navigator.sendBeacon(`${env.VITE_API_BASE_URL}/logs`, JSON.stringify(entry));
    }
  },

  warn: (message: string, context?: Record<string, unknown>) => {
    const entry = createLog('warn', message, context);
    console.warn('[WARN]', message, context);
    if (import.meta.env.PROD) {
      navigator.sendBeacon(`${env.VITE_API_BASE_URL}/logs`, JSON.stringify(entry));
    }
  },

  error: (message: string, context?: Record<string, unknown>) => {
    const entry = createLog('error', message, context);
    console.error('[ERROR]', message, context);
    if (import.meta.env.PROD) {
      navigator.sendBeacon(`${env.VITE_API_BASE_URL}/logs`, JSON.stringify(entry));
    }
  },
};
