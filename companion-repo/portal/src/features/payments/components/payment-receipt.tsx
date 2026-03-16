// src/features/payments/components/payment-receipt.tsx
import { usePaymentDraftStore } from '../stores/payment-draft-store';
import { formatPHP } from '@/lib/format';
import { Button } from '@/components/ui/button';

export function PaymentReceipt() {
  const reset = usePaymentDraftStore((s) => s.reset);
  const receipt = usePaymentDraftStore((s) => s.receipt);

  if (receipt == null) {
    return <p className="text-gray-500">No receipt available.</p>;
  }

  return (
    <div className="space-y-4 rounded border p-6">
      <h2 className="text-lg font-semibold text-ewb-lime-700">Payment Successful</h2>

      <dl className="grid grid-cols-2 gap-y-2 text-sm">
        <dt className="text-gray-500">Reference</dt>
        <dd className="font-mono">{receipt.reference}</dd>

        <dt className="text-gray-500">Biller</dt>
        <dd>{receipt.billerName}</dd>

        <dt className="text-gray-500">Amount</dt>
        <dd>{formatPHP(receipt.amount)}</dd>

        <dt className="text-gray-500">Fee</dt>
        <dd>{formatPHP(receipt.fee)}</dd>

        <dt className="text-gray-500">Total</dt>
        <dd className="font-semibold">{formatPHP(receipt.total)}</dd>

        <dt className="text-gray-500">Status</dt>
        <dd className="capitalize">{receipt.status}</dd>

        <dt className="text-gray-500">Date</dt>
        <dd>{new Date(receipt.paidAt).toLocaleString('en-PH')}</dd>
      </dl>

      <Button type="button" onClick={reset} className="mt-4">
        Make Another Payment
      </Button>
    </div>
  );
}
