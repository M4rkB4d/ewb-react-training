// TODO: Implement Exercise 3b — Server-Sent Events Hook
// See guide A19 for requirements | Run: npm run test:exercises:08
export function useEventSource({ url }: { url: string; onMessage?: (d: unknown) => void; onError?: (e: Event) => void }) {
  return { data: null, isConnected: false, error: null };
}
