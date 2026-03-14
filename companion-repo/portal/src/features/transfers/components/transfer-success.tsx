// src/features/transfers/components/transfer-success.tsx
import { useIntl } from 'react-intl';

export function TransferSuccess({ amount, reference }: { amount: number; reference: string }) {
  const intl = useIntl();

  const formattedAmount = intl.formatNumber(amount, {
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
