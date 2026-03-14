// src/components/TransactionRow.tsx
interface TransactionRowProps {
  id: string;
  description: string;
  amount: number;
  currency: string;
  type: 'credit' | 'debit';
  date: Date;
  status: 'pending' | 'completed' | 'failed';
}

function TransactionRow({
  description,
  amount,
  currency,
  type,
  date,
  status,
}: TransactionRowProps) {
  const formattedAmount = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency,
  }).format(amount / 100); // amount is in centavos

  return (
    <div className="flex items-center justify-between border-b py-3">
      <div>
        <p className="font-medium">{description}</p>
        <p className="text-sm text-muted-fg">
          {date.toLocaleDateString('en-PH')}
        </p>
      </div>
      <div className="text-right">
        <p className={type === 'credit' ? 'text-success' : 'text-destructive'}>
          {type === 'credit' ? '+' : '\u2212'}{formattedAmount}
        </p>
        <p className="text-xs text-muted-fg capitalize">{status}</p>
      </div>
    </div>
  );
}

export default TransactionRow;
