// src/features/transfers/components/transfer-success.tsx
// Requires AppIntlProvider ancestor in the component tree (see src/app/intl-provider.tsx)
import { useIntl } from 'react-intl';

export function TransferSuccess({ amount, reference }: { amount: number; reference: string }) {
  const intl = useIntl();

  // amount is in centavos — divide by 100 for display
  const formattedAmount = intl.formatNumber(amount / 100, {
    style: 'currency',
    currency: 'PHP',
  });

  return (
    <div role="status">
      <p>
        {intl.formatMessage(
          { id: 'transfer.success' },
          { amount: formattedAmount },
        )}
      </p>
      <p className="text-sm text-gray-600">
        {intl.formatMessage(
          { id: 'transfer.reference' },
          { reference },
        )}
      </p>
    </div>
  );
}
