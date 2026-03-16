// src/features/transfers/components/transfer-wizard.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardBody, CardFooter } from '@/components/ui/card';

// ── Schema ──────────────────────────────────────────
// Amount is in pesos (user input) — converted to centavos (* 100) in the submit handler
const transferSchema = z.object({
  fromAccount: z.string().regex(/^\d{10}$/, 'Select a source account'),
  toAccount: z.string().regex(/^\d{10}$/, 'Enter a valid account number'),
  recipientName: z.string().min(2, 'Recipient name is required'),
  amount: z.coerce
    .number()
    .positive('Amount must be greater than zero')
    .max(1_000_000, 'Maximum transfer is ₱1,000,000'),
  notes: z.string().max(100, 'Notes cannot exceed 100 characters').optional(),
}).refine(
  (data) => data.fromAccount !== data.toAccount,
  { message: 'Cannot transfer to the same account', path: ['toAccount'] },
);

type TransferData = z.infer<typeof transferSchema>;

// ── Component ───────────────────────────────────────
type Step = 'details' | 'amount' | 'review';

interface TransferWizardProps {
  accounts: Array<{ number: string; name: string; balance: number }>;
  onSubmit: (data: TransferData) => Promise<void>;
}

export function TransferWizard({ accounts, onSubmit }: TransferWizardProps) {
  const [step, setStep] = useState<Step>('details');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    trigger,
  } = useForm<TransferData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- z.coerce widens input type; safe at runtime
    resolver: zodResolver(transferSchema) as any,
    mode: 'onBlur',
  });

  const formValues = watch();

  // Validate current step before advancing
  const goToNextStep = async () => {
    let fieldsToValidate: (keyof TransferData)[] = [];

    if (step === 'details') {
      fieldsToValidate = ['fromAccount', 'toAccount', 'recipientName'];
    } else if (step === 'amount') {
      fieldsToValidate = ['amount'];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      if (step === 'details') setStep('amount');
      else if (step === 'amount') setStep('review');
    }
  };

  const goToPreviousStep = () => {
    if (step === 'amount') setStep('details');
    else if (step === 'review') setStep('amount');
  };

  // ── Step: Details ─────────────────────────────────
  if (step === 'details') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Step 1: Transfer Details</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="fromAccount" className="block text-sm font-medium text-gray-700">
                From Account
              </label>
              <select
                id="fromAccount"
                {...register('fromAccount')}
                className="block w-full rounded-lg border border-gray-300 px-4 py-2"
              >
                <option value="">Select an account</option>
                {accounts.map((acc) => (
                  <option key={acc.number} value={acc.number}>
                    {acc.name} (••••{acc.number.slice(-4)}) — ₱{(acc.balance / 100).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </option>
                ))}
              </select>
              {errors.fromAccount != null && (
                <p className="text-sm text-error">{errors.fromAccount.message}</p>
              )}
            </div>

            <Input
              label="Recipient Account Number"
              {...register('toAccount')}
              error={errors.toAccount?.message}
              placeholder="Enter 10-digit account number"
              inputMode="numeric"
            />

            <Input
              label="Recipient Name"
              {...register('recipientName')}
              error={errors.recipientName?.message}
            />
          </div>
        </CardBody>
        <CardFooter>
          <Button type="button" onClick={goToNextStep}>
            Continue
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // ── Step: Amount ──────────────────────────────────
  if (step === 'amount') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Step 2: Amount</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <Input
              label="Transfer Amount (₱)"
              type="number"
              {...register('amount', { valueAsNumber: true })}
              error={errors.amount?.message}
              placeholder="0.00"
              step="0.01"
              min="0"
            />

            <Input
              label="Notes (optional)"
              {...register('notes')}
              error={errors.notes?.message}
              placeholder="Payment for..."
            />
          </div>
        </CardBody>
        <CardFooter>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={goToPreviousStep}>
              Back
            </Button>
            <Button type="button" onClick={goToNextStep}>
              Review
            </Button>
          </div>
        </CardFooter>
      </Card>
    );
  }

  // ── Step: Review ──────────────────────────────────
  return (
    <form onSubmit={handleSubmit((data) => onSubmit({ ...data, amount: Math.round(data.amount * 100) }))}>
      <Card>
        <CardHeader>
          <CardTitle>Step 3: Review Transfer</CardTitle>
        </CardHeader>
        <CardBody>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">From</dt>
              <dd className="text-sm font-medium">
                ••••{formValues.fromAccount?.slice(-4)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">To</dt>
              <dd className="text-sm font-medium">
                {formValues.recipientName} (••••{formValues.toAccount?.slice(-4)})
              </dd>
            </div>
            <div className="flex justify-between border-t pt-3">
              <dt className="text-sm text-gray-500">Amount</dt>
              <dd className="text-lg font-bold">
                ₱{Number(formValues.amount).toLocaleString('en-PH', {
                  minimumFractionDigits: 2,
                })}
              </dd>
            </div>
            {formValues.notes != null && formValues.notes !== '' && (
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Notes</dt>
                <dd className="text-sm">{formValues.notes}</dd>
              </div>
            )}
          </dl>
        </CardBody>
        <CardFooter>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={goToPreviousStep}>
              Back
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Confirm Transfer
            </Button>
          </div>
        </CardFooter>
      </Card>
    </form>
  );
}
