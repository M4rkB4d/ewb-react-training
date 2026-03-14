// src/features/transfers/types.ts

/**
 * Money is a value object — always paired with currency.
 * Amount is stored as integer centavos to avoid floating-point errors.
 * Never pass raw numbers for financial amounts.
 */
export interface Money {
  /** Amount in centavos (integer). ₱1,500.00 = 150000. */
  readonly amount: number;
  readonly currency: 'PHP' | 'USD';
}

export function createMoney(centavos: number, currency: 'PHP' | 'USD' = 'PHP'): Money {
  return Object.freeze({ amount: centavos, currency });
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
  }).format(money.amount / 100); // centavos → pesos for display
}
