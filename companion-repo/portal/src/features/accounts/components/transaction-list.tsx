// src/features/accounts/components/transaction-list.tsx
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';
import { formatPHP } from '@/lib/format';
import type { Transaction } from '../types';

interface TransactionRowProps {
  transaction: Transaction;
}

function TransactionRow({ transaction }: TransactionRowProps) {
  const isDebit = transaction.type === 'debit';

  return (
    <div className="flex items-center justify-between border-b px-4 py-3">
      <div>
        <p className="font-medium">{transaction.description}</p>
        <p className="text-sm text-gray-500">
          {new Date(transaction.date).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })} · {transaction.channel}
        </p>
      </div>
      <div className="text-right">
        <p className={isDebit ? 'text-red-600' : 'text-emerald-600'}>
          {isDebit ? '-' : '+'}{formatPHP(Math.abs(transaction.amount))}
        </p>
        <p className="text-xs text-gray-400">{transaction.reference}</p>
      </div>
    </div>
  );
}

interface TransactionListProps {
  transactions: Transaction[];
}

export function TransactionList({ transactions }: TransactionListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: transactions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 72, // Estimated row height in pixels
    overscan: 10, // Render 10 extra items above/below viewport
  });

  return (
    <div
      ref={parentRef}
      className="h-[600px] overflow-auto"
      role="list"
      aria-label="Transaction history"
    >
      <div
        style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const transaction = transactions[virtualRow.index];
          if (transaction == null) return null;

          return (
            <div
              key={transaction.id}
              role="listitem"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <TransactionRow transaction={transaction} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
