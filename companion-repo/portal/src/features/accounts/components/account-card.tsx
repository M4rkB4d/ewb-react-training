// src/features/accounts/components/account-card.tsx

interface AccountCardProps {
  accountName: string;
  accountNumber: string;
  accountType: 'savings' | 'checking' | 'time-deposit';
  balance: number;
  currency?: string;
  isActive: boolean;
  onTransfer?: (accountNumber: string) => void;
  onViewDetails?: (accountNumber: string) => void;
}

export function AccountCard({
  accountName,
  accountNumber,
  accountType,
  balance,
  currency = 'PHP',
  isActive,
  onTransfer,
  onViewDetails,
}: AccountCardProps) {
  // DPA compliance: mask account number (show last 4 only)
  const maskedNumber = `\u2022\u2022\u2022\u2022${accountNumber.slice(-4)}`;

  // Format currency
  const formattedBalance = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(balance);

  // Account type display
  const typeLabels: Record<AccountCardProps['accountType'], string> = {
    savings: 'Savings',
    checking: 'Checking',
    'time-deposit': 'Time Deposit',
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {accountName}
          </h3>
          <p className="text-sm text-gray-500">{maskedNumber}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-ewb-purple-100 px-3 py-1 text-xs font-medium text-ewb-purple-700">
            {typeLabels[accountType]}
          </span>
          <span
            role="img"
            className={`inline-block h-2 w-2 rounded-full ${
              isActive ? 'bg-green-500' : 'bg-red-500'
            }`}
            aria-label={isActive ? 'Active account' : 'Inactive account'}
          />
        </div>
      </div>

      {/* Balance */}
      <div className="mt-4">
        <p className="text-sm text-gray-500">Available Balance</p>
        <p className="text-2xl font-bold text-gray-900">
          {formattedBalance}
        </p>
      </div>

      {/* Actions */}
      {isActive && (onTransfer != null || onViewDetails != null) && (
        <div className="mt-4 flex gap-2 border-t border-gray-100 pt-4">
          {onTransfer != null && (
            <button
              type="button"
              onClick={() => onTransfer(accountNumber)}
              className="rounded-lg bg-ewb-purple px-4 py-2 text-sm text-white hover:bg-ewb-purple-700"
            >
              Transfer
            </button>
          )}
          {onViewDetails != null && (
            <button
              type="button"
              onClick={() => onViewDetails(accountNumber)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              View Details
            </button>
          )}
        </div>
      )}
    </div>
  );
}
