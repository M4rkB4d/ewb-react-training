// src/features/accounts/components/account-detail.tsx
import { useTransactionAlerts } from '../hooks/use-transaction-alerts';

export function AccountDetail({ accountId }: { accountId: string }) {
  const { connectionState } = useTransactionAlerts(accountId);

  return (
    <div>
      {/* Connection indicator */}
      <div className="flex items-center gap-1 text-xs text-gray-500">
        <span
          className={`h-2 w-2 rounded-full ${
            connectionState === 'connected' ? 'bg-green-500' : 'bg-gray-300'
          }`}
        />
        {connectionState === 'connected' ? 'Live' : 'Connecting...'}
      </div>

      {/* Account details and transactions use standard TanStack Query hooks */}
      {/* SSE invalidates the queries when new transactions arrive */}
    </div>
  );
}
