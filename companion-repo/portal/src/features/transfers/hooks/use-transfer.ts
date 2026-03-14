// src/features/transfers/hooks/use-transfer.ts
import { useState } from 'react';

interface TransferError {
  code: string;
  message: string;
  field?: string;
}

type TransferStatus = 'idle' | 'submitting' | 'success' | 'error';

export function useTransfer() {
  const [status, setStatus] = useState<TransferStatus>('idle');
  const [error, setError] = useState<TransferError | null>(null);

  const submitTransfer = async (data: {
    fromAccount: string;
    toAccount: string;
    amount: number;
  }) => {
    setStatus('submitting');
    setError(null);

    try {
      // API call will be implemented in B03
      // For now, simulate a network request
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setStatus('success');
    } catch (_err) {
      setStatus('error');
      setError({
        code: 'TRANSFER_FAILED',
        message: 'The transfer could not be completed. Please try again.',
      });
    }
  };

  const reset = () => {
    setStatus('idle');
    setError(null);
  };

  return { status, error, submitTransfer, reset };
}
