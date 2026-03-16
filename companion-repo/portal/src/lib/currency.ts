// src/lib/currency.ts
// Level 1 Exercise 1 — Currency Formatter
// Works in whole peso amounts (not centavos).
// See src/lib/format.ts for the centavos-based formatter used in production features.

/**
 * Format a peso amount with the ₱ symbol and proper grouping.
 * Input is in PESOS (not centavos).
 */
export function formatPHP(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format an amount in any supported currency.
 */
export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Parse a currency string back to a number.
 * Strips currency symbols, commas, and whitespace.
 * Returns null for invalid input.
 */
export function parseCurrencyInput(input: string): number | null {
  // Strip currency symbols, commas, spaces
  const cleaned = input.replace(/[₱$€¥,\s]/g, '');
  const num = Number(cleaned);
  return Number.isNaN(num) || cleaned === '' ? null : num;
}
