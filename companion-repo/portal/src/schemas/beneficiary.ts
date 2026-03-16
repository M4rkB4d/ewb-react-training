// src/schemas/beneficiary.ts
// Level 3 Exercise 1 — Beneficiary Registration Schema
import { z } from 'zod';

export const BeneficiarySchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  accountNumber: z.string().regex(/^\d{10}$/, 'Account number must be 10 digits'),
  bankName: z.string().min(1, 'Bank name is required'),
  mobileNumber: z
    .string()
    .regex(
      /^(\+63|0)(9\d{9})$/,
      'Enter a valid Philippine mobile number (e.g., +639171234567 or 09171234567)',
    ),
  email: z.string().email('Invalid email address').optional(),
  relationship: z.enum(['family', 'friend', 'business', 'other']),
});

export type Beneficiary = z.infer<typeof BeneficiarySchema>;
