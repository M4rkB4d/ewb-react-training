// src/components/AccountList.tsx
import { useState, useEffect } from 'react';

interface Account {
  id: string;
  name: string;
  balance: number;
  currency: string;
}

function AccountList() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAccounts() {
      try {
        const response = await fetch('/api/accounts');
        if (!response.ok) throw new Error('Failed to fetch accounts');
        const data = (await response.json()) as Account[];
        setAccounts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    }

    fetchAccounts();
  }, []);

  if (isLoading) return <p>Loading accounts...</p>;
  if (error) return <p className="text-destructive">Error: {error}</p>;

  return (
    <ul className="space-y-2">
      {accounts.map((account) => (
        <li key={account.id} className="rounded border p-3">
          <span className="font-medium">{account.name}</span>
          <span className="ml-auto">
            {new Intl.NumberFormat('en-PH', {
              style: 'currency',
              currency: account.currency,
            }).format(account.balance / 100)}
          </span>
        </li>
      ))}
    </ul>
  );
}

export default AccountList;
