import { usePaymentDraftStore } from '../stores/payment-draft-store';
import { usePayment } from '../hooks/use-payment';
import { formatPHP } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { ErrorAlert } from '@/components/error/error-alert';

export function PaymentReview() {
  const draft = usePaymentDraftStore();
  const { submitPayment, isPending, error } = usePayment();

  const fee = 15_00; // ₱15 processing fee in centavos
  // draft.amount is raw user input in pesos — multiply by 100 to convert to centavos
  const amountCentavos = Math.round(draft.amount * 100);
  const total = amountCentavos + fee;

  const handleConfirm = () => {
    if (draft.biller == null) return;
    submitPayment({
      billerId: draft.biller.id,
      accountId: draft.accountId,
      amount: amountCentavos, // Converted from pesos input
      fields: draft.fields,
      notes: draft.notes,
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Review Payment</h2>

      <div className="rounded border p-4 space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600">Biller</span>
          <span className="font-medium">{draft.biller?.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Account</span>
          <span>••••{draft.accountId.slice(-4)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Amount</span>
          <span>{formatPHP(amountCentavos)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Processing Fee</span>
          <span>{formatPHP(fee)}</span>
        </div>
        <div className="flex justify-between border-t pt-2 font-bold">
          <span>Total</span>
          <span>{formatPHP(total)}</span>
        </div>
      </div>

      {error != null && <ErrorAlert error={error} />}

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => draft.setStep('details')}
          disabled={isPending}
        >
          Back
        </Button>
        <Button onClick={handleConfirm} disabled={isPending}>
          {isPending ? 'Processing...' : 'Confirm Payment'}
        </Button>
      </div>
    </div>
  );
}
