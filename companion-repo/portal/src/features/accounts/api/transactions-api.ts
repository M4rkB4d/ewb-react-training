// src/features/accounts/api/transactions-api.ts
import { z } from 'zod';
import { apiClient } from '@/lib/api-client';

const transactionSchema = z.object({
  id: z.string(),
  date: z.string().datetime(),
  description: z.string(),
  amount: z.number(),
  type: z.enum(['credit', 'debit']),
  balance: z.number(),
  reference: z.string(),
  channel: z.string(),
});

export type Transaction = z.infer<typeof transactionSchema>;

const paginatedResponseSchema = z.object({
  data: z.array(transactionSchema),
  meta: z.object({
    page: z.number(),
    pageSize: z.number(),
    totalPages: z.number(),
    totalItems: z.number(),
  }),
});

export type PaginatedTransactions = z.infer<typeof paginatedResponseSchema>;

interface TransactionParams {
  accountId: string;
  page?: number;
  pageSize?: number;
  startDate?: string;
  endDate?: string;
}

export async function getTransactions(params: TransactionParams): Promise<PaginatedTransactions> {
  const { accountId, page = 1, pageSize = 20, startDate, endDate } = params;

  const response = await apiClient.get(`/accounts/${accountId}/transactions`, {
    params: { page, pageSize, startDate, endDate },
  });

  return paginatedResponseSchema.parse(response.data);
}
