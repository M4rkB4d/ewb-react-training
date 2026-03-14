import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usePaymentDraftStore } from '../stores/payment-draft-store';
import { useAccounts } from '@/features/accounts';
import { maskAccountNumber } from '@/lib/masking';
import { Button } from '@/components/ui/button';

const paymentSchema = z.object({
  accountId: z.string().min(1, 'Please select an account'),
  amount: z.coerce
    .number()
    .positive('Amount must be greater than 0')
    .max(500000, 'Maximum payment amount is ₱500,000'),
  notes: z.string().max(100, 'Notes must be 100 characters or less').optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

export function PaymentForm() {
  const draft = usePaymentDraftStore();
  const { data: accounts } = useAccounts();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      accountId: draft.accountId,
      amount: draft.amount || undefined,
      notes: draft.notes,
    },
  });

  const onSubmit = (data: PaymentFormData) => {
    draft.setAccountId(data.accountId);
    draft.setAmount(data.amount);
    draft.setNotes(data.notes ?? '');
    draft.setStep('review');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h2 className="text-lg font-semibold">Payment Details</h2>
      <p className="text-sm text-gray-600">
        Paying: <strong>{draft.biller?.name}</strong>
      </p>

      {/* Biller-specific fields */}
      {draft.biller?.fields.map((field) => (
        <div key={field.name}>
          <label className="block text-sm font-medium">{field.label}</label>
          <input
            type={field.type}
            placeholder={field.placeholder}
            value={draft.fields[field.name] ?? ''}
            onChange={(e) => draft.setField(field.name, e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
            required={field.required}
          />
        </div>
      ))}

      {/* From account */}
      <div>
        <label htmlFor="accountId" className="block text-sm font-medium">
          Pay from Account
        </label>
        <select
          id="accountId"
          {...register('accountId')}
          className="mt-1 w-full rounded border px-3 py-2"
        >
          <option value="">Select account</option>
          {accounts?.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name} ({maskAccountNumber(account.number)}) — ₱
              {account.balance.toLocaleString()}
            </option>
          ))}
        </select>
        {errors.accountId != null && (
          <p className="mt-1 text-sm text-red-600">{errors.accountId.message}</p>
        )}
      </div>

      {/* Amount */}
      <div>
        <label htmlFor="amount" className="block text-sm font-medium">
          Amount (PHP)
        </label>
        <input
          id="amount"
          type="number"
          step="0.01"
          {...register('amount')}
          className="mt-1 w-full rounded border px-3 py-2"
          inputMode="decimal"
        />
        {errors.amount != null && (
          <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
        )}
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium">
          Notes (optional)
        </label>
        <input
          id="notes"
          type="text"
          {...register('notes')}
          className="mt-1 w-full rounded border px-3 py-2"
        />
      </div>

      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={() => draft.setStep('biller')}>
          Back
        </Button>
        <Button type="submit">Review Payment</Button>
      </div>
    </form>
  );
}
