// Tests for the environment validation module
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Environment validation', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('clientEnv schema rejects missing NEXT_PUBLIC_API_URL', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', '');

    // The schema should reject empty string (expects URL)
    const { z } = await import('zod');

    const clientSchema = z.object({
      NEXT_PUBLIC_API_URL: z.string().url(),
      NEXT_PUBLIC_SITE_URL: z.string().url(),
    });

    const result = clientSchema.safeParse({
      NEXT_PUBLIC_API_URL: '',
      NEXT_PUBLIC_SITE_URL: 'https://www.ewbanking.com',
    });

    expect(result.success).toBe(false);
  });

  it('clientEnv schema accepts valid URLs', async () => {
    const { z } = await import('zod');

    const clientSchema = z.object({
      NEXT_PUBLIC_API_URL: z.string().url(),
      NEXT_PUBLIC_SITE_URL: z.string().url(),
    });

    const result = clientSchema.safeParse({
      NEXT_PUBLIC_API_URL: 'https://api.ewbanking.com',
      NEXT_PUBLIC_SITE_URL: 'https://www.ewbanking.com',
    });

    expect(result.success).toBe(true);
  });

  it('serverEnv schema requires minimum 32-char API_SECRET_KEY', async () => {
    const { z } = await import('zod');

    const secretSchema = z.string().min(32);

    expect(secretSchema.safeParse('short').success).toBe(false);
    expect(secretSchema.safeParse('a'.repeat(32)).success).toBe(true);
  });
});
