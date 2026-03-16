// src/pages/payments.tsx
import { PaymentWizard } from "@/features/payments/components/payment-wizard";

export function Component() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-ewb-navy">Bill Payments</h1>
      <PaymentWizard />
    </div>
  );
}

