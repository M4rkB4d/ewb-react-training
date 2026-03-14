// src/features/payments/index.ts (facade)
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentApi } from './api/payment-api';
import { paymentKeys } from './api/query-keys';
import type { PaymentRequest, Biller, PaymentReceipt } from './types';

// -- Hooks facade --

export function useBillers() {
  return useQuery({
    queryKey: paymentKeys.billers(),
    queryFn: paymentApi.getBillers,
  });
}

export function usePaymentHistory(accountId: string) {
  return useQuery({
    queryKey: paymentKeys.history(accountId),
    queryFn: () => paymentApi.getHistory(accountId),
  });
}

export function useSubmitPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: PaymentRequest) => paymentApi.submit(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.all });
    },
  });
}

// -- Component facade --
export { PaymentWizard } from './components/payment-wizard';
export { PaymentReceipt } from './components/payment-receipt';
export { BillerSearch } from './components/biller-search';

// -- Type facade --
export type { PaymentRequest, Biller, PaymentReceipt as PaymentReceiptData } from './types';
