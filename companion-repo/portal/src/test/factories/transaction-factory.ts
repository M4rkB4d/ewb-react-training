// src/test/factories/transaction-factory.ts
import type { Transaction } from '@/features/accounts/types';

let txnCounter = 0;

export function createTransaction(overrides: Partial<Transaction> = {}): Transaction {
  txnCounter += 1;
  return {
    id: `txn-${txnCounter}`,
    date: new Date().toISOString(),
    description: 'POS Purchase — SM Megamall',
    amount: -250_000, // centavos — ₱2,500.00
    type: 'debit',
    balance: 14_750_000, // centavos — ₱147,500.00
    reference: `REF-${txnCounter.toString().padStart(4, '0')}`,
    channel: 'POS',
    ...overrides,
  };
}

export function createTransactions(count: number): Transaction[] {
  return Array.from({ length: count }, (_, i) =>
    createTransaction({
      amount: -(Math.floor(Math.random() * 1_000_000) + 10_000), // centavos — ₱100–₱10,100
      description: `Transaction ${i + 1}`,
    }),
  );
}
