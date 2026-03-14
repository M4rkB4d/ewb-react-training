// src/features/accounts/types.ts
export type AccountType = 'savings' | 'checking' | 'time-deposit';

export interface Account {
  id: string;
  name: string;
  number: string;
  type: AccountType;
  balance: number;
  currency: string;
  isActive: boolean;
}

export type TransactionType = 'debit' | 'credit';

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  balance: number;
  reference: string;
  channel: string;
}
