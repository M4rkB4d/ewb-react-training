// TODO: Implement Exercise 3c — Query Key Factory
// See guide B03 for requirements | Run: npm run test:exercises:05
export const accountKeys = {
  all: ['accounts'] as const,
  lists: () => [...accountKeys.all, 'list'] as const,
  details: () => [...accountKeys.all, 'detail'] as const,
  detail: (id: string) => [...accountKeys.details(), id] as const,
};
export const queryKeys = accountKeys;
