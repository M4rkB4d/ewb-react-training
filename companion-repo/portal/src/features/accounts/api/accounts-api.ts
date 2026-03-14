// src/features/accounts/api/accounts-api.ts
import { z } from 'zod';
import { apiClient } from '@/lib/api-client';

// 1. Define the schema
const accountSchema = z.object({
  id: z.string(),
  name: z.string(),
  number: z.string(),
  type: z.enum(['savings', 'checking', 'time-deposit']),
  balance: z.number().int(), // centavos
  currency: z.string().default('PHP'),
  isActive: z.boolean(),
});

export type Account = z.infer<typeof accountSchema>;

// 2. Define the API function with Zod validation
export async function getAccounts(): Promise<Account[]> {
  const response = await apiClient.get('/accounts');
  // BSP 1122 — Validate all external data
  return z.array(accountSchema).parse(response.data);
}

export async function getAccount(id: string): Promise<Account> {
  const response = await apiClient.get(`/accounts/${id}`);
  return accountSchema.parse(response.data);
}

async function getBalance(id: string): Promise<number> {
  const account = await getAccount(id);
  return account.balance;
}

// Object-style API for hooks that prefer method syntax
export const accountsApi = {
  getAll: getAccounts,
  getById: getAccount,
  getBalance,
};
