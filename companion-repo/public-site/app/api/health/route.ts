// app/api/health/route.ts
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const checks: Record<string, 'ok' | 'error'> = {};

  // Check Redis connectivity
  try {
    const { redis } = await import('@/lib/redis');
    await redis.ping();
    checks.redis = 'ok';
  } catch {
    checks.redis = 'error';
  }

  // Check Key Vault access
  try {
    const { getSecret } = await import('@/lib/keyvault');
    await getSecret('health-check-secret');
    checks.keyvault = 'ok';
  } catch {
    checks.keyvault = 'error';
  }

  const healthy = Object.values(checks).every((v) => v === 'ok');

  return NextResponse.json(
    {
      status: healthy ? 'healthy' : 'degraded',
      checks,
      version: process.env.APP_VERSION ?? 'unknown',
      timestamp: new Date().toISOString(),
    },
    { status: healthy ? 200 : 503 },
  );
}
