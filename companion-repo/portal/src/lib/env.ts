// src/lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  VITE_API_BASE_URL: z.string().url(),
  VITE_API_TIMEOUT: z.coerce.number().positive().default(30000),
  VITE_SENTRY_DSN: z.string().optional(),
  VITE_APPINSIGHTS_CONNECTION_STRING: z.string().optional(),
  VITE_APP_VERSION: z.string().default('0.0.0'),
  VITE_ENABLE_PASSKEYS: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .default(false),
  VITE_ENABLE_BIOMETRICS: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .default(false),
  VITE_APP_ENV: z
    .enum(['development', 'staging', 'production'])
    .default('development'),
});

function validateEnv() {
  const result = envSchema.safeParse(import.meta.env);

  if (!result.success) {
    const formatted = result.error.issues
      .map((issue) => `  ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');

    throw new Error(
      `Invalid environment variables:\n${formatted}\n\nCheck .env.local against .env.example`,
    );
  }

  return result.data;
}

export const env = validateEnv();
