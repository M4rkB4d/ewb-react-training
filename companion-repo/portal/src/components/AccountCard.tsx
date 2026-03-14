// src/components/AccountCard.tsx
interface AccountCardProps {
  accountName: string;
  accountNumber: string;
  balance: number;
  currency: string;
}

function AccountCard({ accountName, accountNumber, balance, currency }: AccountCardProps) {
  return (
    <div className="rounded-lg border p-4">
      <h3 className="text-lg font-semibold">{accountName}</h3>
      <p className="text-sm text-muted-fg">
        ****{accountNumber.slice(-4)}
      </p>
      <p className="text-2xl font-bold">
        {new Intl.NumberFormat('en-PH', {
          style: 'currency',
          currency,
        }).format(balance)}
      </p>
    </div>
  );
}

export default AccountCard;
