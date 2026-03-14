// src/features/accounts/hooks/use-transaction-alerts.ts
import { useEventSource } from '@/hooks/use-event-source';
import { useQueryClient } from '@tanstack/react-query';
import { env } from '@/lib/env';
import { accountKeys } from '../api/query-keys';

interface TransactionAlert {
  type: 'credit' | 'debit';
  accountId: string;
  amount: number;
  description: string;
  timestamp: string;
}

export function useTransactionAlerts(accountId: string) {
  const queryClient = useQueryClient();

  function handleMessage(event: MessageEvent) {
    const alert: TransactionAlert = JSON.parse(event.data);

    // Invalidate account balance — TanStack Query will refetch
    queryClient.invalidateQueries({
      queryKey: accountKeys.balance(alert.accountId),
    });

    // Invalidate transaction list
    queryClient.invalidateQueries({
      queryKey: accountKeys.transactions(alert.accountId),
    });
  }

  return useEventSource({
    url: `${env.VITE_API_BASE_URL}/accounts/${accountId}/events`,
    onMessage: handleMessage,
    enabled: accountId.length > 0,
  });
}
