// src/schemas/account.ts
// Level 1 Exercise 2 — Banking Domain Type System (reference answer).
// This schema uses the full field names (accountNumber, accountName, status)
// as defined in the exercise requirements.
//
// The working feature code in features/accounts/ uses a simplified API schema
// with shorter field names (number, name, isActive) to match the mock backend.
// Both are intentional — the exercise teaches schema design, the feature code
// reflects a real API contract.
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
