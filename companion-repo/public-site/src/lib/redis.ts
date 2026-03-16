// src/lib/redis.ts
import { Redis } from 'ioredis';
import { serverEnv } from './env';

// Lazy singleton — avoids ZodError crash at module load if env vars are missing.
// Redis connection is created on first call to getRedis(), not on import.
let instance: Redis | null = null;

export function getRedis(): Redis {
  if (instance == null) {
    instance = new Redis(serverEnv.REDIS_URL, {
      password: serverEnv.REDIS_TOKEN,
      tls: { rejectUnauthorized: true },
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 3) return null; // Stop retrying after 3 attempts
        return Math.min(times * 200, 2000); // Exponential backoff
      },
    });
  }
  return instance;
}
