// src/services/accountService.ts
import axios from 'axios';
import { z } from 'zod';
import { accountSchema, type Account } from '../schemas/account';

const accountListSchema = z.array(accountSchema);

export async function fetchAccounts(): Promise<Account[]> {
  const response = await axios.get('/api/accounts');

  // Validate the response data at runtime
  const result = accountListSchema.safeParse(response.data);

  if (!result.success) {
    // Log the validation error for debugging (never log PII)
    console.error('API response validation failed:', result.error.issues);
    throw new Error('Invalid account data received from server');
  }

  return result.data; // Fully validated and typed
}
