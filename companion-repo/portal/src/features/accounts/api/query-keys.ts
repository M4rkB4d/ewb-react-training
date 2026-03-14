// src/features/accounts/api/query-keys.ts
export const accountKeys = {
  all: ['accounts'] as const,
  details: () => [...accountKeys.all, 'detail'] as const,
  detail: (id: string) => [...accountKeys.details(), id] as const,
  balance: (id: string) => [...accountKeys.detail(id), 'balance'] as const,
  transactions: (id: string) => [...accountKeys.detail(id), 'transactions'] as const,
};
