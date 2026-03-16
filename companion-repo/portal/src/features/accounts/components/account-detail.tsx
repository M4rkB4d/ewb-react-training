// src/features/accounts/components/account-detail.tsx
import { useTransactionAlerts } from '../hooks/use-transaction-alerts';

export function AccountDetail({ accountId }: { accountId: string }) {
  const { connectionState } = useTransactionAlerts(accountId);

  return (
    <div>
      {/* Connection indicator */}
      <div className="flex items-center gap-1 text-xs text-gray-500">
        <span
          aria-hidden="true"
          className={`h-2 w-2 rounded-full ${
            connectionState === 'connected' ? 'bg-emerald-500' : 'bg-gray-300'
          }`}
        />
        {connectionState === 'connected' ? 'Live' : 'Connecting...'}
      </div>

      {/* TODO: Exercise — Add account balance, recent transactions, and account info */}
      {/* The useTransactionAlerts hook above provides SSE-based invalidation; */}
      {/* pair it with useQuery hooks to fetch account data (see A19). */}
    </div>
  );
}
