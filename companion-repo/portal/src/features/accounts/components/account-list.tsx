// src/features/accounts/components/account-list.tsx
import { Link } from 'react-router';
import { useAccounts } from '../hooks/use-accounts';
import { ApiError } from '@/lib/api-error';
import { Card, CardBody } from '@/components/ui/card';
import { formatPHP } from '@/lib/format';

export function AccountList() {
  const { data: accounts, isLoading, error } = useAccounts();

  if (isLoading) {
    return <div aria-busy="true">Loading accounts...</div>;
  }

  if (error != null) {
    const apiError = error instanceof ApiError ? error : new ApiError(error);
    if (apiError.isNetworkError) {
      return (
        <div role="alert">
          Unable to connect. Please check your internet connection.
        </div>
      );
    }
    return (
      <div role="alert">
        Failed to load accounts. Please try again.
        {apiError.requestId != null && (
          <p className="text-xs text-gray-500">Reference: {apiError.requestId}</p>
        )}
      </div>
    );
  }

  if (accounts == null || accounts.length === 0) {
    return <p>No accounts found.</p>;
  }

  return (
    <ul className="space-y-4">
      {accounts.map((account) => (
        <li key={account.id}>
          <Link to={`/accounts/${account.id}`} className="block">
            <Card className="transition-shadow hover:shadow-md">
              <CardBody>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 capitalize">
                      {account.type.replace('-', ' ')}
                    </p>
                    <p className="font-semibold text-ewb-navy">{account.name}</p>
                    <p className="text-xs text-gray-400">••••{account.number.slice(-4)}</p>
                  </div>
                  <p className="text-lg font-bold text-ewb-navy">
                    {formatPHP(account.balance)}
                  </p>
                </div>
              </CardBody>
            </Card>
          </Link>
        </li>
      ))}
    </ul>
  );
}
