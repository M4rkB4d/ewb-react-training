// src/compliance/audit-types.ts

export type AuditEventType =
  | 'AUTH_LOGIN_SUCCESS'
  | 'AUTH_LOGIN_FAILURE'
  | 'AUTH_LOGOUT'
  | 'AUTH_SESSION_TIMEOUT'
  | 'AUTH_TOKEN_REFRESH'
  | 'AUTH_MFA_CHALLENGE'
  | 'AUTH_MFA_SUCCESS'
  | 'AUTH_MFA_FAILURE'
  | 'AUTH_PASSKEY_REGISTER'
  | 'AUTH_PASSKEY_LOGIN'
  | 'ACCOUNT_VIEW'
  | 'ACCOUNT_BALANCE_VIEW'
  | 'TRANSFER_INITIATE'
  | 'TRANSFER_CONFIRM'
  | 'TRANSFER_CANCEL'
  | 'TRANSFER_FAILURE'
  | 'PAYMENT_INITIATE'
  | 'PAYMENT_CONFIRM'
  | 'PAYMENT_SUBMITTED'
  | 'PAYMENT_FAILED'
  | 'SETTINGS_CHANGE'
  | 'DATA_EXPORT'
  | 'CONSENT_GRANTED'
  | 'CONSENT_REVOKED';

export interface AuditEvent {
  type: AuditEventType;
  timestamp: string;
  userId: string | null;
  sessionId: string;
  requestId: string;
  metadata: Record<string, unknown>;
  ipAddress?: string; // Set by backend
  userAgent?: string; // Set by backend
}
