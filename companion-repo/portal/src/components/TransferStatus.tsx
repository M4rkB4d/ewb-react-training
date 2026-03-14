// src/components/TransferStatus.tsx
import type { TransferState } from '../types/transfer';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(amount);
}

function TransferStatus({ state }: { state: TransferState }) {
  switch (state.status) {
    case 'idle':
      return <p>Ready to transfer</p>;

    case 'validating':
      // TypeScript knows state has fromAccount, toAccount, amount
      return <p>Validating transfer of {formatCurrency(state.amount)}...</p>;

    case 'confirming':
      // TypeScript knows state has summary
      return (
        <div>
          <p>Total: {formatCurrency(state.summary.total)}</p>
          <p>Fee: {formatCurrency(state.summary.fee)}</p>
        </div>
      );

    case 'processing':
      // TypeScript knows state has transactionId
      return <p>Processing... Ref: {state.transactionId}</p>;

    case 'completed':
      // TypeScript knows state has transactionId and completedAt
      return <p>Completed at {state.completedAt}</p>;

    case 'failed':
      // TypeScript knows state has error
      return (
        <div className="text-destructive">
          <p>{state.error.message}</p>
          {state.error.retryable && <button>Retry</button>}
        </div>
      );
  }
}

export default TransferStatus;
