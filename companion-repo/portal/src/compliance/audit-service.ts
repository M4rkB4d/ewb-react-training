// src/compliance/audit-service.ts
import { useAuthStore } from '@/stores/auth-store';
import type { AuditEventType } from './audit-types';

let sessionId: string | null = null;

function getSessionId(): string {
  if (sessionId == null) {
    sessionId = crypto.randomUUID();
  }
  return sessionId;
}

export function emitAuditEvent(
  type: AuditEventType,
  metadata: Record<string, unknown> = {},
): void {
  const userId = useAuthStore.getState().user?.id ?? null;
  const requestId = crypto.randomUUID();

  const event = {
    type,
    timestamp: new Date().toISOString(),
    userId,
    sessionId: getSessionId(),
    requestId,
    metadata,
  };

  // BSP 1019 — All audit events must be persisted
  if (import.meta.env.PROD) {
    navigator.sendBeacon('/api/audit', JSON.stringify(event));
  }

  if (import.meta.env.DEV) {
    console.info('[AUDIT]', type, metadata);
  }
}

// Reset session ID on logout
export function resetAuditSession(): void {
  sessionId = null;
}
