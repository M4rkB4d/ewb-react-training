// src/test/factories/transaction-factory.ts
import type { Transaction } from '@/features/accounts/types';

let txnCounter = 0;

export function createTransaction(overrides: Partial<Transaction> = {}): Transaction {
  txnCounter += 1;
  return {
    id: `txn-${txnCounter}`,
    date: new Date().toISOString(),
    description: 'POS Purchase — SM Megamall',
    amount: -2500,
    type: 'debit',
    balance: 147500,
    reference: `REF-${txnCounter.toString().padStart(4, '0')}`,
    channel: 'POS',
    ...overrides,
  };
}

export function createTransactions(count: number): Transaction[] {
  return Array.from({ length: count }, (_, i) =>
    createTransaction({
      amount: -(Math.floor(Math.random() * 10000) + 100),
      description: `Transaction ${i + 1}`,
    }),
  );
}
