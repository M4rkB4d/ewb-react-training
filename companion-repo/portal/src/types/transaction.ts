// src/types/transaction.ts
import type { Currency } from './account';

export interface Transaction {
  id: string;
  accountId: string;
  type: TransactionType;
  amount: number;
  currency: Currency;
  description: string;
  referenceNumber: string;
  status: TransactionStatus;
  createdAt: string;
  processedAt: string | null;
  metadata: TransactionMetadata;
}

export type TransactionType = 'credit' | 'debit' | 'transfer' | 'payment' | 'fee';

export type TransactionStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'reversed'
  | 'cancelled';

export interface TransactionMetadata {
  channel: 'web' | 'mobile' | 'atm' | 'branch';
  ipAddress?: string;
  deviceId?: string;
}
