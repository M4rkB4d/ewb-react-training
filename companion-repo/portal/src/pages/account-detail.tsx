// src/pages/account-detail.tsx
import { useParams, Link } from 'react-router';
import { useAccount } from '@/features/accounts/hooks/use-account';
import { useTransactions } from '@/features/accounts/hooks/use-transactions';
import { TransactionList } from '@/features/accounts/components/transaction-list';
import { Card, CardBody } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatPHP } from '@/lib/format';

export function Component() {
  const { id = '' } = useParams();
  const { data: account, isLoading: loadingAccount } = useAccount(id);
  const { data: txnData, isLoading: loadingTxns } = useTransactions({
    accountId: id,
  });

  if (loadingAccount) {
    return <p className="text-sm text-gray-400">Loading account...</p>;
  }

  if (account == null) {
    return <p className="text-gray-500">Account not found.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/accounts">
          <Button variant="ghost" size="sm">&larr; Back</Button>
        </Link>
        <h1 className="text-2xl font-bold text-ewb-navy">{account.name}</h1>
      </div>

      <Card className="bg-ewb-navy text-white">
        <CardBody>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm text-ewb-navy-200 capitalize">
                {account.type.replace('-', ' ')} &middot; ••••{account.number.slice(-4)}
              </p>
              <p className="mt-1 text-3xl font-bold text-ewb-gold-300">
                {formatPHP(account.balance)}
              </p>
            </div>
            <span className="rounded-full bg-emerald-500 px-3 py-0.5 text-xs font-medium text-white">
              {account.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </CardBody>
      </Card>

      <h2 className="text-lg font-semibold text-ewb-navy">Transaction History</h2>
      {loadingTxns ? (
        <p className="text-sm text-gray-400">Loading transactions...</p>
      ) : (
        <Card padding="none">
          <TransactionList transactions={txnData?.data ?? []} />
        </Card>
      )}
    </div>
  );
}
