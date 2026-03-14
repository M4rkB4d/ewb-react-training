// src/lib/sanitize.ts
import { z } from 'zod';

// Strict schemas for all user input
export const usernameSchema = z
  .string()
  .min(3)
  .max(50)
  .regex(/^[a-zA-Z0-9._-]+$/, 'Username contains invalid characters');

export const searchQuerySchema = z
  .string()
  .max(200)
  .transform((val) => val.trim());

// User enters pesos; transform converts to integer centavos for storage/API
export const amountSchema = z
  .number()
  .positive('Amount must be positive')
  .max(1_000_000, 'Amount exceeds maximum limit (₱1,000,000)')
  .transform((pesos) => Math.round(pesos * 100)); // Convert pesos → centavos (integer)
