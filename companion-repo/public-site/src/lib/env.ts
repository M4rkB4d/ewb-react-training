// src/lib/env.ts
import { z } from 'zod';

// Server-only variables — these NEVER reach the browser
const serverSchema = z.object({
  AZURE_KEY_VAULT_URL: z.string().url(),
  API_SECRET_KEY: z.string().min(32),
  REDIS_URL: z.string().url(),
  REDIS_TOKEN: z.string().min(1),
  INTERNAL_AUTH_URL: z.string().url(),
  INTERNAL_API_URL: z.string().url(),
  AUTH_SERVICE_KEY: z.string().min(1),
});

// Client-safe variables — embedded in the JavaScript bundle
const clientSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url(),
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
  NEXT_PUBLIC_APPINSIGHTS_CONNECTION_STRING: z.string().optional(),
});

// Server env — only import this in server-side code
// Lazy validation: parsed on first access, not at module load (allows build without env vars)
let _serverEnv: z.infer<typeof serverSchema> | null = null;
export function getServerEnv() {
  if (_serverEnv == null) {
    _serverEnv = serverSchema.parse(process.env);
  }
  return _serverEnv;
}
// Re-export as getter for backwards compatibility
export const serverEnv = new Proxy({} as z.infer<typeof serverSchema>, {
  get(_target, prop: string) {
    return getServerEnv()[prop as keyof z.infer<typeof serverSchema>];
  },
});

// Client env — safe to use anywhere
// Lazy validation for build compatibility
let _clientEnv: z.infer<typeof clientSchema> | null = null;
function getClientEnv() {
  if (_clientEnv == null) {
    _clientEnv = clientSchema.parse({
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
      NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
      NEXT_PUBLIC_APPINSIGHTS_CONNECTION_STRING:
        process.env.NEXT_PUBLIC_APPINSIGHTS_CONNECTION_STRING,
    });
  }
  return _clientEnv;
}
export const clientEnv = new Proxy({} as z.infer<typeof clientSchema>, {
  get(_target, prop: string) {
    return getClientEnv()[prop as keyof z.infer<typeof clientSchema>];
  },
});
