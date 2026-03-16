// src/schemas/transferForm.ts
import { z } from 'zod';

export const transferFormSchema = z.object({
  fromAccount: z.string().min(1, 'Select a source account'),
  toAccount: z.string().min(1, 'Select a destination account'),
  amount: z
    .number({ error: 'Amount must be a number' })
    .positive('Amount must be greater than zero')
    .max(1_000_000, 'Maximum transfer amount is \u20B11,000,000'),
  note: z.string().max(200, 'Note must be 200 characters or less').optional(),
}).refine(
  (data) => data.fromAccount !== data.toAccount,
  {
    message: 'Source and destination accounts must be different',
    path: ['toAccount'],
  }
);

export type TransferFormData = z.infer<typeof transferFormSchema>;
