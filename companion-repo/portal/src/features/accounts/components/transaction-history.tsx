// src/features/accounts/components/transaction-history.tsx
// Level 2 Exercise 1 — Transaction History Component

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

interface TransactionHistoryProps {
  transactions: Transaction[];
  title?: string;
}

export function TransactionHistory({
  transactions,
  title = 'Recent Transactions',
}: TransactionHistoryProps) {
  return (
    <section aria-label={title}>
      <h2 className="text-lg font-semibold mb-4">{title}</h2>

      {transactions.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No transactions found.</p>
      ) : (
        <ul className="divide-y divide-gray-200" role="list">
          {transactions.map((txn) => (
            <li key={txn.id} className="flex items-center justify-between py-3 px-2">
              <div>
                <p className="font-medium">{txn.description}</p>
                <p className="text-sm text-gray-500">
                  {new Date(txn.date).toLocaleDateString('en-PH')}
                </p>
              </div>
              <span
                className={txn.type === 'debit' ? 'text-red-600' : 'text-green-600'}
              >
                {txn.type === 'debit' ? '-' : '+'}
                {new Intl.NumberFormat('en-PH', {
                  style: 'currency',
                  currency: 'PHP',
                }).format(txn.amount / 100)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
