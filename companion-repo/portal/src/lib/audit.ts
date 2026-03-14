// src/lib/audit.ts
import { logger } from './logger';
import { useAuthStore } from '@/stores/auth-store';

type AuditAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'VIEW_ACCOUNT'
  | 'VIEW_BALANCE'
  | 'INITIATE_TRANSFER'
  | 'CONFIRM_TRANSFER'
  | 'CANCEL_TRANSFER'
  | 'CHANGE_SETTINGS'
  | 'EXPORT_DATA';

export function auditLog(action: AuditAction, details?: Record<string, unknown>): void {
  const userId = useAuthStore.getState().user?.id;

  // BSP 1019 — All financial actions must be logged
  logger.info(`AUDIT: ${action}`, {
    action,
    userId: userId ?? 'anonymous',
    ...details,
    // Never log PII or sensitive financial details
    // Log reference IDs, not account numbers
  });
}
