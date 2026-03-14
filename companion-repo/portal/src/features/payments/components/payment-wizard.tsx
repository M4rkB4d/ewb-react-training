import { usePaymentDraftStore } from '../stores/payment-draft-store';
import { BillerSearch } from './biller-search';
import { PaymentForm } from './payment-form';
import { PaymentReview } from './payment-review';
import { PaymentReceipt } from './payment-receipt';

const steps = [
  { key: 'biller', label: '1. Select Biller' },
  { key: 'details', label: '2. Payment Details' },
  { key: 'review', label: '3. Review' },
  { key: 'receipt', label: '4. Receipt' },
] as const;

export function PaymentWizard() {
  const step = usePaymentDraftStore((s) => s.step);

  return (
    <div className="mx-auto max-w-2xl">
      {/* Step indicator */}
      <nav aria-label="Payment progress" className="mb-6">
        <ol className="flex gap-2">
          {steps.map((s) => (
            <li
              key={s.key}
              className={`flex-1 rounded px-3 py-2 text-center text-sm ${
                s.key === step
                  ? 'bg-ewb-purple text-white'
                  : 'bg-gray-100 text-gray-500'
              }`}
              aria-current={s.key === step ? 'step' : undefined}
            >
              {s.label}
            </li>
          ))}
        </ol>
      </nav>

      {/* Step content */}
      {step === 'biller' && <BillerSearch />}
      {step === 'details' && <PaymentForm />}
      {step === 'review' && <PaymentReview />}
      {step === 'receipt' && <PaymentReceipt />}
    </div>
  );
}
