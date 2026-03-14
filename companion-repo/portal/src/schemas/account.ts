// src/schemas/account.ts
import { z } from 'zod';

export const accountSchema = z.object({
  id: z.string().min(1),
  accountNumber: z.string().regex(/^\d{10}$/, 'Account number must be 10 digits'),
  accountName: z.string().min(1).max(100),
  type: z.enum(['savings', 'checking', 'time-deposit', 'current']),
  balance: z.number().int().nonnegative(), // centavos (integer)
  availableBalance: z.number().int().nonnegative(), // centavos (integer)
  currency: z.enum(['PHP', 'USD', 'EUR', 'JPY', 'CNY']),
  status: z.enum(['active', 'dormant', 'frozen', 'closed']),
  openedDate: z.string().datetime(),
  lastActivityDate: z.string().datetime(),
});

// Extract the TypeScript type FROM the Zod schema
export type Account = z.infer<typeof accountSchema>;
