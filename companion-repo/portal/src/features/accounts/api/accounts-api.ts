// TODO: Implement Exercise 3b — Account API Functions
// See guide B03 for requirements | Run: npm run test:exercises:05
import { z } from 'zod';
const accountSchema = z.object({
  id: z.string(), accountName: z.string(), accountNumber: z.string(),
  balance: z.number(), availableBalance: z.number(),
  type: z.enum(['savings', 'checking', 'time-deposit']),
  status: z.enum(['active', 'inactive', 'frozen']),
});
export type Account = z.infer<typeof accountSchema>;
// TODO: Implement API calls with Zod validation
export async function getAccounts(): Promise<Account[]> { return []; }
export async function getAccount(id: string): Promise<Account> { return {} as Account; }
export const accountsApi = { getAccounts, getAccount };
