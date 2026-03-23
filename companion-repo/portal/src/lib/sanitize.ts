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

// Input is centavos (integer). Max ₱1,000,000.00 = 100_000_000 centavos.
export const amountSchema = z
  .number()
  .int('Amount must be in centavos (integer)')
  .positive('Amount must be positive')
  .max(100_000_000, 'Amount exceeds maximum limit'); // Max ₱1,000,000.00 in centavos

/**
 * Strip dangerous HTML: script tags, event handlers, and other XSS vectors.
 * For display-only sanitization — not a substitute for server-side sanitization.
 */
export function sanitizeHtml(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\s*on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, '')
    .replace(/<iframe\b[^>]*>.*?<\/iframe>/gi, '')
    .replace(/javascript\s*:/gi, '');
}

export { sanitizeHtml as sanitize };
