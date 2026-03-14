// src/features/accounts/hooks/use-accounts.ts
import { useQuery } from '@tanstack/react-query';
import { getAccounts } from '../api/accounts-api';
import { accountKeys } from '../queries';

export function useAccounts() {
  return useQuery({
    queryKey: accountKeys.lists(),
    queryFn: getAccounts,
  });
}
