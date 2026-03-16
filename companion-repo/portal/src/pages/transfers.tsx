// src/pages/transfers.tsx
import { useState } from 'react';
import { TransferWizard } from '@/features/transfers/components/transfer-wizard';
import { useAccounts } from '@/features/accounts/hooks/use-accounts';
import { useCreateTransfer } from '@/features/transfers/hooks/use-create-transfer';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export function Component() {
  const { data: accounts, isLoading } = useAccounts();
  const createTransfer = useCreateTransfer();
  const [success, setSuccess] = useState<{ reference: string } | null>(null);

  if (isLoading) {
    return <p className="text-sm text-gray-400">Loading accounts...</p>;
  }

  if (success != null) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-ewb-navy">Transfers</h1>
        <Alert variant="success" title="Transfer Completed">
          Your transfer has been processed. Reference: {success.reference}
        </Alert>
        <Button onClick={() => { setSuccess(null); }}>Make Another Transfer</Button>
      </div>
    );
  }

  const accountList = (accounts ?? []).map((a) => ({
    number: a.number,
    name: a.name,
    balance: a.balance,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-ewb-navy">Transfers</h1>
      <div className="max-w-lg">
        <TransferWizard
          accounts={accountList}
          onSubmit={async (data) => {
            const result = await createTransfer.mutateAsync({
              fromAccount: data.fromAccount,
              toAccount: data.toAccount,
              amount: data.amount,
              notes: data.notes,
            });
            setSuccess({ reference: result.referenceNumber });
          }}
        />
      </div>
    </div>
  );
}
