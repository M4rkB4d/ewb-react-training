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
