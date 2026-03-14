// src/lib/rate-limit.ts
import { redis } from './redis';

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  const redisKey = `rate:${key}`;
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - windowSeconds;

  // Remove old entries
  await redis.zremrangebyscore(redisKey, 0, windowStart);

  // Count current entries
  const count = await redis.zcard(redisKey);

  if (count >= limit) {
    const oldestEntry = await redis.zrange(redisKey, 0, 0, 'WITHSCORES');
    const resetAt = new Date((Number(oldestEntry[1]) + windowSeconds) * 1000);

    return { allowed: false, remaining: 0, resetAt };
  }

  // Add current request
  await redis.zadd(redisKey, now, `${now}:${crypto.randomUUID()}`);
  await redis.expire(redisKey, windowSeconds);

  return {
    allowed: true,
    remaining: limit - count - 1,
    resetAt: new Date((now + windowSeconds) * 1000),
  };
}
