// src/lib/format.ts
export function formatPHP(amount: number, locale: string = 'en-PH'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
