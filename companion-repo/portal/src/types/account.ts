// src/types/account.ts
export interface Account {
  id: string;
  accountNumber: string;
  accountName: string;
  type: AccountType;
  balance: number;
  availableBalance: number;
  currency: Currency;
  status: AccountStatus;
  openedDate: string;
  lastActivityDate: string;
}

export type AccountType = 'savings' | 'checking' | 'time-deposit' | 'current';
export type AccountStatus = 'active' | 'dormant' | 'frozen' | 'closed';
export type Currency = 'PHP' | 'USD' | 'EUR' | 'JPY' | 'CNY';
