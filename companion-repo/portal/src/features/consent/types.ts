// src/features/consent/types.ts
export const consentPurposes = [
  'essential',          // Required for banking services
  'analytics',          // Usage analytics
  'marketing',          // Marketing communications
  'data-sharing',       // BSP 1122 Open Finance
  'biometric',          // Passkey/biometric auth
  'location',           // Branch finder
] as const;

export type ConsentPurpose = (typeof consentPurposes)[number];

// ConsentRecord is derived from a Zod schema in the consent-manager component
// (single source of truth pattern). This interface is kept for cross-feature imports.
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
