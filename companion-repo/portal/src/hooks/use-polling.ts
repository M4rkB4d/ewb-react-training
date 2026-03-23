// TODO: Implement Exercise 3c — Polling Hook
// See guide A19 for requirements | Run: npm run test:exercises:08
export function usePolling<TData = unknown, TSelected = TData>({ queryKey, queryFn, interval }: { queryKey: readonly unknown[]; queryFn: () => Promise<TData>; interval?: number; enabled?: boolean; select?: (data: TData) => TSelected }) {
  return { data: undefined as TSelected | undefined, isLoading: true, error: null };
}
