// src/features/kyc/types.ts
export interface KYCData {
  // Tier 1 — Basic
  fullName: string;
  dateOfBirth: string;
  nationality: string;
  idType: 'passport' | 'drivers-license' | 'national-id' | 'voters-id';
  idNumber: string;

  // Tier 2 — Enhanced
  sourceOfFunds: string;
  occupation: string;
  employer: string;
  annualIncome: string;

  // Tier 3 — High-Risk
  purposeOfAccount: string;
  expectedTransactionVolume: string;
  politicallyExposed: boolean;
}
