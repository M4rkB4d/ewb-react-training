// TODO: Implement Exercise 4 — Payment API Schema
// See guide B09 for requirements | Run: npm run test:exercises:08
import { z } from 'zod';
export const paymentSchema = z.object({
  id: z.string(), reference: z.string(), billerId: z.string(), billerName: z.string(),
  accountId: z.string(), amount: z.number().int(), fee: z.number().int(),
  total: z.number().int(), status: z.enum(['pending', 'processing', 'completed', 'failed']),
  paidAt: z.string().nullable(),
});
export type Payment = z.infer<typeof paymentSchema>;
export const PaymentSchema = paymentSchema;
export const paymentApi = { getPayments: async () => [] as Payment[], createPayment: async (_d: unknown) => ({}) as Payment };
