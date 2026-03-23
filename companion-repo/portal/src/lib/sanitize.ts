// TODO: Implement Exercise 2 — Input Sanitization
// See guide A15 for requirements | Run: npm run test:exercises:07
import { z } from 'zod';
export const usernameSchema = z.string().min(3).max(50);
export const searchQuerySchema = z.string().max(200);
export const amountSchema = z.number().int().positive();
export function sanitizeHtml(input: string): string { return input; }
export { sanitizeHtml as sanitize };
