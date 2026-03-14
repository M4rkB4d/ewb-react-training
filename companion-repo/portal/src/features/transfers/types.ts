// src/features/transfers/types.ts

/**
 * Money is a value object — always paired with currency.
 * Never pass raw numbers for financial amounts.
 */
export interface Money {
  readonly amount: number;
  readonly currency: 'PHP' | 'USD';
}

export function createMoney(amount: number, currency: 'PHP' | 'USD' = 'PHP'): Money {
  return Object.freeze({ amount, currency });
}

export function addMoney(a: Money, b: Money): Money {
  if (a.currency !== b.currency) {
    throw new Error(`Cannot add ${a.currency} and ${b.currency}`);
  }
  return createMoney(a.amount + b.amount, a.currency);
}

export function formatMoney(money: Money): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: money.currency,
  }).format(money.amount);
}
