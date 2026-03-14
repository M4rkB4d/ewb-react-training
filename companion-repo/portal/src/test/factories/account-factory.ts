// src/test/factories/account-factory.ts
import type { Account } from '@/features/accounts/types';

let accountCounter = 0;

function nextAccountId(): string {
  accountCounter += 1;
  return `acc-${accountCounter}`;
}

export function createAccount(overrides: Partial<Account> = {}): Account {
  return {
    id: nextAccountId(),
    name: 'Personal Savings',
    number: `${1000000000 + accountCounter}`,
    type: 'savings',
    balance: 150000,
    currency: 'PHP',
    isActive: true,
    ...overrides,
  };
}

export function createCheckingAccount(overrides: Partial<Account> = {}): Account {
  return createAccount({ type: 'checking', name: 'Payroll Checking', ...overrides });
}
