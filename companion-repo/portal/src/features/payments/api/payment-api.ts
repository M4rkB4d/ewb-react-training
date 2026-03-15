import { z } from 'zod';
import { apiClient } from '@/lib/api-client';
import type { PaymentRequest } from '../types';

// BSP 1122 — Zod schemas for runtime validation of all API responses

const billerFieldSchema = z.object({
  name: z.string(),
  label: z.string(),
  type: z.enum(['text', 'number']),
  required: z.boolean(),
  placeholder: z.string(),
  validation: z.object({
    pattern: z.string(),
    message: z.string(),
  }).optional(),
});

const billerSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.enum([
    'utilities', 'telecommunications', 'government',
    'insurance', 'credit-card', 'loans',
  ]),
  logoUrl: z.string(),
  fields: z.array(billerFieldSchema),
});

export const paymentSchema = z.object({
  id: z.string(),
  reference: z.string(),
  billerId: z.string(),
  billerName: z.string(),
  accountId: z.string(),
  amount: z.number().int().nonnegative(), // centavos
  fee: z.number().int().nonnegative(), // centavos
  total: z.number().int().nonnegative(), // centavos
  status: z.enum(['completed', 'pending', 'failed']),
  paidAt: z.string(),
});

export const paymentApi = {
  searchBillers: async (query: string) => {
    const response = await apiClient.get('/billers', { params: { q: query } });
    return z.array(billerSchema).parse(response.data);
  },

  getBillers: async () => {
    const response = await apiClient.get('/billers');
    return z.array(billerSchema).parse(response.data);
  },

  getBiller: async (id: string) => {
    const response = await apiClient.get(`/billers/${id}`);
    return billerSchema.parse(response.data);
  },

  submit: async (request: PaymentRequest) => {
    const response = await apiClient.post('/payments', request);
    return paymentSchema.parse(response.data);
  },

  getHistory: async (accountId: string) => {
    const response = await apiClient.get(`/payments/history/${accountId}`);
    return z.array(paymentSchema).parse(response.data);
  },

  getReceipt: async (paymentId: string) => {
    const response = await apiClient.get(`/payments/${paymentId}`);
    return paymentSchema.parse(response.data);
  },
};
