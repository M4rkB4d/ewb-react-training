// src/features/accounts/hooks/use-account-with-live-updates.ts
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { accountsApi } from '../api/accounts-api';
import { accountKeys } from '../api/query-keys';
import { useWebSocket } from '@/hooks/use-websocket';

export function useAccountWithLiveUpdates(accountId: string) {
  const queryClient = useQueryClient();
  const { subscribe } = useWebSocket('/ws/accounts');

  // Standard query — TanStack Query manages caching, loading, error states
  const query = useQuery({
    queryKey: accountKeys.detail(accountId),
    queryFn: () => accountsApi.getById(accountId),
  });

  // Subscribe to real-time updates — invalidate instead of directly setting data
  useEffect(() => {
    const unsubscribe = subscribe('account:updated', (data: unknown) => {
      const update = data as { accountId: string };
      if (update.accountId === accountId) {
        // Invalidate triggers a fresh fetch — ensures data consistency
        queryClient.invalidateQueries({
          queryKey: accountKeys.detail(accountId),
        });
      }
    });
    return unsubscribe;
  }, [accountId, subscribe, queryClient]);

  return query;
}
