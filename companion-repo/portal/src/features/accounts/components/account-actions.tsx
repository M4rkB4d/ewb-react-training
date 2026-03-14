// src/features/accounts/components/account-actions.tsx
interface AccountActionsProps {
  accountId: string;
  onTransfer: (accountId: string) => void;
  onViewHistory: (accountId: string) => void;
}

export function AccountActions({
  accountId,
  onTransfer,
  onViewHistory,
}: AccountActionsProps) {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => onTransfer(accountId)}
        className="rounded-lg bg-ewb-purple px-4 py-2 text-sm text-white hover:bg-ewb-purple-700"
      >
        Transfer
      </button>
      <button
        type="button"
        onClick={() => onViewHistory(accountId)}
        className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
      >
        History
      </button>
    </div>
  );
}
