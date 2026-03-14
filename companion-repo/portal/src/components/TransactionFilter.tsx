// src/components/TransactionFilter.tsx
import { useState } from 'react';

type TransactionType = 'all' | 'credit' | 'debit';

function TransactionFilter() {
  const [filter, setFilter] = useState<TransactionType>('all');

  return (
    <div className="flex gap-2">
      <button
        className={filter === 'all' ? 'bg-primary text-primary-fg' : 'bg-muted'}
        onClick={() => setFilter('all')}
      >
        All
      </button>
      <button
        className={filter === 'credit' ? 'bg-success text-success-fg' : 'bg-muted'}
        onClick={() => setFilter('credit')}
      >
        Credits
      </button>
      <button
        className={filter === 'debit' ? 'bg-destructive text-destructive-fg' : 'bg-muted'}
        onClick={() => setFilter('debit')}
      >
        Debits
      </button>
    </div>
  );
}

export default TransactionFilter;
