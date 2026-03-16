// src/pages/dashboard.tsx
import { useAuthStore } from '@/stores/auth-store';
import { useAccounts } from '@/features/accounts/hooks/use-accounts';
import { Card, CardBody } from '@/components/ui/card';
import { formatPHP } from '@/lib/format';

export function Component() {
  const user = useAuthStore((s) => s.user);
  const { data: accounts, isLoading } = useAccounts();

  const totalBalance = accounts?.reduce((sum, a) => sum + a.balance, 0) ?? 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-ewb-navy">
          Welcome back, {user?.name ?? 'User'}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Here is your account overview.
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-400">Loading accounts...</p>
      ) : (
        <>
          <Card className="bg-ewb-purple-900 text-white">
            <CardBody>
              <p className="text-sm text-ewb-purple-200">Total Balance</p>
              <p className="mt-1 text-3xl font-bold text-ewb-gold-300">
                {formatPHP(totalBalance)}
              </p>
              <p className="mt-2 text-xs text-ewb-purple-300">
                Across {accounts?.length ?? 0} accounts
              </p>
            </CardBody>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {accounts?.map((account) => (
              <Card key={account.id}>
                <CardBody>
                  <p className="text-sm font-medium text-gray-500 capitalize">
                    {account.type.replace('-', ' ')}
                  </p>
                  <p className="mt-1 font-semibold text-ewb-navy">
                    {account.name}
                  </p>
                  <p className="mt-2 text-2xl font-bold text-ewb-purple">
                    {formatPHP(account.balance)}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    ••••{account.number.slice(-4)}
                  </p>
                </CardBody>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
