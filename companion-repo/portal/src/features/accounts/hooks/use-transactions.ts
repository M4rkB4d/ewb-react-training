// src/features/accounts/hooks/use-transactions.ts
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getTransactions } from '../api/transactions-api';
import { accountKeys } from '../queries';

interface UseTransactionsOptions {
  accountId: string;
  page?: number;
  pageSize?: number;
  startDate?: string;
  endDate?: string;
}

export function useTransactions(options: UseTransactionsOptions) {
  const { accountId, page = 1, pageSize = 20, startDate, endDate } = options;

  return useQuery({
    queryKey: accountKeys.transactions(accountId, { page, pageSize, startDate, endDate }),
    queryFn: () => getTransactions({ accountId, page, pageSize, startDate, endDate }),
    enabled: accountId !== '',
    placeholderData: keepPreviousData, // Smooth pagination transitions
  });
}
