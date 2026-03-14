// src/types/transfer.ts
import type { Currency } from './account';

export type TransferState =
  | { status: 'idle' }
  | { status: 'validating'; fromAccount: string; toAccount: string; amount: number }
  | { status: 'confirming'; summary: TransferSummary }
  | { status: 'processing'; transactionId: string }
  | { status: 'completed'; transactionId: string; completedAt: string }
  | { status: 'failed'; error: TransferError };

export interface TransferSummary {
  fromAccount: string;
  toAccount: string;
  amount: number;
  currency: Currency;
  fee: number;
  total: number;
}

export interface TransferError {
  code: string;
  message: string;
  retryable: boolean;
}
