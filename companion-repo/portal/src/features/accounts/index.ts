// src/features/accounts/index.ts
// Public API — only these exports can be imported by other features

// Components
export { AccountCard } from './components/account-card';
export { AccountList } from './components/account-list';
export { AccountSelector } from './components/account-selector';

// Hooks
export { useAccounts } from './hooks/use-accounts';
export { useAccountBalance } from './hooks/use-account-balance';

// Types
export type { Account, AccountType, Transaction } from './types';
