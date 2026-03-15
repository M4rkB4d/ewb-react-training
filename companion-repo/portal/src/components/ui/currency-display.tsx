// src/components/ui/currency-display.tsx
import { useIntl } from 'react-intl';

interface CurrencyDisplayProps {
  amount: number;
  currency?: string;
}

export function CurrencyDisplay({ amount, currency = 'PHP' }: CurrencyDisplayProps) {
  const intl = useIntl();

  // Amount is in centavos — divide by 100 for display
  const formatted = intl.formatNumber(amount / 100, {
    style: 'currency',
    currency,
  });

  return (
    <span
      className={amount < 0 ? 'text-red-600' : 'text-green-700'}
    >
      {formatted}
    </span>
  );
}
