// src/features/accounts/components/account-list.tsx
import { useAccounts } from '../hooks/use-accounts';
import { ApiError } from '@/lib/api-error';

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
        {/* TODO: Exercise — Replace with AccountCard component (see Level 3) */}
        <li key={account.id}>{account.name}</li>
      ))}
    </ul>
  );
}
