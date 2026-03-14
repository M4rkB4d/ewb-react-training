// src/lib/format.ts
// Input is centavos (integer). ₱100.50 = 10050.
export function formatPHP(centavos: number, locale: string = 'en-PH'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(centavos / 100);
}
