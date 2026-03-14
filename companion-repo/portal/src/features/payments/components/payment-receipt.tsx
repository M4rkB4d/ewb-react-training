// src/features/payments/components/payment-receipt.tsx
import { usePaymentDraftStore } from '../stores/payment-draft-store';
import type { PaymentReceipt as PaymentReceiptType } from '../types';

interface PaymentReceiptProps {
  receipt?: PaymentReceiptType;
}

export function PaymentReceipt({ receipt }: PaymentReceiptProps) {
  const reset = usePaymentDraftStore((s) => s.reset);

  if (receipt == null) {
    return <p className="text-gray-500">No receipt available.</p>;
  }

  return (
    <div className="space-y-4 rounded border p-6">
      <h2 className="text-lg font-semibold text-green-700">Payment Successful</h2>

      <dl className="grid grid-cols-2 gap-y-2 text-sm">
        <dt className="text-gray-500">Reference</dt>
        <dd className="font-mono">{receipt.reference}</dd>

        <dt className="text-gray-500">Biller</dt>
        <dd>{receipt.billerName}</dd>

        <dt className="text-gray-500">Amount</dt>
        <dd>₱{(receipt.amount / 100).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</dd>

        <dt className="text-gray-500">Fee</dt>
        <dd>₱{(receipt.fee / 100).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</dd>

        <dt className="text-gray-500">Total</dt>
        <dd className="font-semibold">₱{(receipt.total / 100).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</dd>

        <dt className="text-gray-500">Status</dt>
        <dd className="capitalize">{receipt.status}</dd>

        <dt className="text-gray-500">Date</dt>
        <dd>{new Date(receipt.paidAt).toLocaleString()}</dd>
      </dl>

      <button
        type="button"
        onClick={reset}
        className="mt-4 rounded bg-ewb-purple px-4 py-2 text-white hover:bg-ewb-purple/90"
      >
        Make Another Payment
      </button>
    </div>
  );
}
