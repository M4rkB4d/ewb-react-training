// src/pages/DashboardPage.tsx
import AccountCard from '../components/AccountCard';

function DashboardPage() {
  return (
    <div className="space-y-4 p-6">
      <h1 className="text-2xl font-bold">My Accounts</h1>
      <AccountCard
        accountName="Savings Account"
        accountNumber="1234567890"
        balance={125430.5}
        currency="PHP"
      />
      <AccountCard
        accountName="Checking Account"
        accountNumber="0987654321"
        balance={45200.0}
        currency="PHP"
      />
    </div>
  );
}

export default DashboardPage;
