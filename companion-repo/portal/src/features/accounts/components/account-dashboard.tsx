// src/features/accounts/components/account-dashboard.tsx
// Level 2 Exercise 2 — Account Summary Dashboard

interface AccountSummary {
  id: string;
  accountName: string;
  accountNumber: string;
  balance: number;
  type: 'savings' | 'checking' | 'time-deposit' | 'current';
  status: 'active' | 'dormant' | 'frozen' | 'closed';
}

interface AccountDashboardProps {
  accounts: AccountSummary[];
}

function maskAccountNumber(num: string): string {
  if (num.length <= 4) return num;
  return '••••••' + num.slice(-4);
}

export function AccountDashboard({ accounts }: AccountDashboardProps) {
  return (
    <section aria-label="Account Dashboard">
      <h2 className="text-xl font-semibold mb-4">Your Accounts</h2>

      {accounts.length === 0 ? (
        <p className="text-gray-500">No accounts found.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="rounded-lg border p-4 shadow-sm"
            >
              <h3 className="font-medium">{account.accountName}</h3>
              <p className="text-sm text-gray-500 mt-1">
                {maskAccountNumber(account.accountNumber)}
              </p>
              <p className="text-lg font-semibold mt-2">
                {new Intl.NumberFormat('en-PH', {
                  style: 'currency',
                  currency: 'PHP',
                }).format(account.balance / 100)}
              </p>
              <span className="text-xs text-gray-400 capitalize">{account.type}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
