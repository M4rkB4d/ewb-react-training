// src/features/transfers/api/transfers-api.ts
import { z } from 'zod';
import { apiClient } from '@/lib/api-client';

const transferRequestSchema = z.object({
  fromAccount: z.string(),
  toAccount: z.string(),
  amount: z.number().positive(),
  notes: z.string().optional(),
});

export type TransferRequest = z.infer<typeof transferRequestSchema>;

const transferResponseSchema = z.object({
  id: z.string(),
  status: z.enum(['completed', 'pending', 'failed']),
  referenceNumber: z.string(),
  timestamp: z.string().datetime(),
});

export type TransferResponse = z.infer<typeof transferResponseSchema>;

export async function createTransfer(payload: TransferRequest): Promise<TransferResponse> {
  // Validate outgoing payload too — defense in depth
  const validated = transferRequestSchema.parse(payload);
  const response = await apiClient.post('/transfers', validated);
  return transferResponseSchema.parse(response.data);
}
