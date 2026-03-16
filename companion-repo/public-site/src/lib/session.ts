// src/lib/session.ts
import { getRedis } from './redis';
import { z } from 'zod';
import crypto from 'node:crypto';

const SESSION_TTL = 15 * 60; // 15 minutes (BSP 982)

const SessionSchema = z.object({
  userId: z.string(),
  email: z.string().email(),
  role: z.enum(['customer', 'staff', 'admin']),
  createdAt: z.string().datetime(),
  lastActivity: z.string().datetime(),
});

type Session = z.infer<typeof SessionSchema>;

export async function createSession(data: Omit<Session, 'createdAt' | 'lastActivity'>): Promise<string> {
  const sessionId = crypto.randomUUID();
  const now = new Date().toISOString();

  const session: Session = {
    ...data,
    createdAt: now,
    lastActivity: now,
  };

  await getRedis().setex(
    `session:${sessionId}`,
    SESSION_TTL,
    JSON.stringify(session),
  );

  return sessionId;
}

export async function getSession(sessionId: string): Promise<Session | null> {
  const data = await getRedis().get(`session:${sessionId}`);
  if (!data) return null;

  const session = SessionSchema.parse(JSON.parse(data));

  // Refresh TTL on activity (sliding expiration)
  await getRedis().expire(`session:${sessionId}`, SESSION_TTL);

  // Update last activity
  session.lastActivity = new Date().toISOString();
  await getRedis().setex(
    `session:${sessionId}`,
    SESSION_TTL,
    JSON.stringify(session),
  );

  return session;
}

export async function destroySession(sessionId: string): Promise<void> {
  await getRedis().del(`session:${sessionId}`);
}
