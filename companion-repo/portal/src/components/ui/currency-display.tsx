// src/components/ui/currency-display.tsx
interface CurrencyDisplayProps {
  /** Amount in centavos (integer). */
  amount: number;
  currency?: string;
}

export function CurrencyDisplay({ amount, currency = 'PHP' }: CurrencyDisplayProps) {
  // Amount is in centavos — divide by 100 for display
  const formatted = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount / 100);

  return (
    <span className="text-gray-900 font-medium">
      {formatted}
    </span>
  );
}
