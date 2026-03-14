// src/features/accounts/hooks/use-account-balance.ts
import { useQuery } from '@tanstack/react-query';
import { accountsApi } from '../api/accounts-api';
import { accountKeys } from '../queries';

export function useAccountBalance(accountId: string) {
  return useQuery({
    queryKey: accountKeys.detail(accountId),
    queryFn: () => accountsApi.getById(accountId),
    select: (account) => account.balance,
    enabled: accountId !== '',
  });
}
