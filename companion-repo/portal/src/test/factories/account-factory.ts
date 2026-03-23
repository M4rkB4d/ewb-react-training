// TODO: Implement Exercise 3b — Account Test Factory
// See guide A12 for requirements | Run: npm run test:exercises:06
interface Account { id: string; accountName: string; accountNumber: string; balance: number; availableBalance: number; type: 'savings' | 'checking' | 'time-deposit'; status: 'active' | 'inactive'; }
export function createAccount(overrides: Partial<Account> = {}): Account {
  return { id: '1', accountName: 'Personal Savings', accountNumber: '1234567890', balance: 10_000_00, availableBalance: 10_000_00, type: 'savings', status: 'active', ...overrides };
}
