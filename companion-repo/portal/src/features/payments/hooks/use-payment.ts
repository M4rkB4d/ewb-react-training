import { useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentApi } from '../api/payment-api';
import { paymentKeys } from '../api/query-keys';
import { usePaymentDraftStore } from '../stores/payment-draft-store';
import { emitAuditEvent } from '@/compliance/audit-service';
import { emit } from '@/lib/event-bus';
import type { PaymentRequest, PaymentReceipt } from '../types';

export function usePayment() {
  const queryClient = useQueryClient();
  const setStep = usePaymentDraftStore((s) => s.setStep);

  const mutation = useMutation({
    mutationFn: (request: PaymentRequest) => paymentApi.submitPayment(request),
    onSuccess: (receipt: PaymentReceipt) => {
      // 1. Move wizard to receipt step
      setStep('receipt');

      // 2. Invalidate related queries
      queryClient.invalidateQueries({ queryKey: paymentKeys.all });

      // 3. BSP compliance — audit trail
      emitAuditEvent('PAYMENT_SUBMITTED', {
        paymentId: receipt.id,
        billerId: receipt.billerId,
        amount: receipt.amount,
        reference: receipt.reference,
      });

      // 4. Notify other features (accounts should refresh balance)
      emit('payment:completed', {
        accountId: receipt.accountId,
        amount: receipt.total,
      });
    },
    onError: (error) => {
      emitAuditEvent('PAYMENT_FAILED', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    },
  });

  return {
    submitPayment: mutation.mutate,
    isPending: mutation.isPending,
    error: mutation.error,
    receipt: mutation.data,
  };
}
