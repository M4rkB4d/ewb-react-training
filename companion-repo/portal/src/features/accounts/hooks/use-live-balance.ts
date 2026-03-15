// src/features/accounts/hooks/use-live-balance.ts
import { usePolling } from '@/hooks/use-polling';
import { accountsApi } from '../api/accounts-api';
import { accountKeys } from '../queries';

export function useLiveBalance(accountId: string) {
  return usePolling({
    queryKey: accountKeys.balance(accountId),
    queryFn: () => accountsApi.getBalance(accountId),
    interval: 30_000, // 30 seconds base
    adaptive: true,   // Slow down if balance is unchanged
    pauseWhenHidden: true,
  });
}
