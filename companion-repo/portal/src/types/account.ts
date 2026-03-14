// src/types/account.ts
// NOTE: Prefer the Zod-derived type from schemas/account.ts for runtime validation.
// This plain interface mirrors the same shape for contexts that don't need Zod.
export interface Account {
  id: string;
  accountNumber: string;
  accountName: string;
  type: AccountType;
  /** Balance in centavos (integer). */
  balance: number;
  /** Available balance in centavos (integer). */
  availableBalance: number;
  currency: Currency;
  status: AccountStatus;
  openedDate: string;
  lastActivityDate: string;
}

export type AccountType = 'savings' | 'checking' | 'time-deposit' | 'current';
export type AccountStatus = 'active' | 'dormant' | 'frozen' | 'closed';
export type Currency = 'PHP' | 'USD' | 'EUR' | 'JPY' | 'CNY';
