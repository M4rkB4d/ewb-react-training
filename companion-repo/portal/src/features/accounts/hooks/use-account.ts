// src/features/accounts/hooks/use-account.ts
import { useQuery } from '@tanstack/react-query';
import { getAccount } from '../api/accounts-api';
import { accountKeys } from '../queries';

export function useAccount(id: string) {
  return useQuery({
    queryKey: accountKeys.detail(id),
    queryFn: () => getAccount(id),
    enabled: id !== '',
  });
}
