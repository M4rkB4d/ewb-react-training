export const paymentKeys = {
  all: ['payments'] as const,
  billers: () => [...paymentKeys.all, 'billers'] as const,
  billerSearch: (query: string) => [...paymentKeys.billers(), query] as const,
  history: (accountId: string) => [...paymentKeys.all, 'history', accountId] as const,
  receipt: (paymentId: string) => [...paymentKeys.all, 'receipt', paymentId] as const,
};
