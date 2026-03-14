// src/features/consent/types.ts
export interface ConsentRecord {
  id: string;
  userId: string;
  purpose: ConsentPurpose;
  granted: boolean;
  grantedAt: string | null;
  revokedAt: string | null;
  version: string;
  ipAddress: string; // Set by backend
}

export type ConsentPurpose =
  | 'essential'          // Required for banking services
  | 'analytics'          // Usage analytics
  | 'marketing'          // Marketing communications
  | 'data-sharing'       // BSP 1122 Open Finance
  | 'biometric'          // Passkey/biometric auth
  | 'location';          // Branch finder
