// src/features/accounts/types.ts
export type AccountType = 'savings' | 'checking' | 'time-deposit';

export interface Account {
  id: string;
  name: string;
  number: string;
  type: AccountType;
  /** Balance in centavos (integer). ₱1,500.00 = 150000. */
  balance: number;
  currency: string;
  isActive: boolean;
}

export type TransactionType = 'debit' | 'credit';

export interface Transaction {
  id: string;
  date: string;
  description: string;
  /** Amount in centavos (integer). */
  amount: number;
  type: TransactionType;
  /** Running balance in centavos (integer). */
  balance: number;
  reference: string;
  channel: string;
}
