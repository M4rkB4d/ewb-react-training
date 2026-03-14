// src/lib/redis.ts
import { Redis } from 'ioredis';
import { serverEnv } from './env';

export const redis = new Redis(serverEnv.REDIS_URL, {
  password: serverEnv.REDIS_TOKEN,
  tls: { rejectUnauthorized: true },
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    if (times > 3) return null; // Stop retrying after 3 attempts
    return Math.min(times * 200, 2000); // Exponential backoff
  },
});
