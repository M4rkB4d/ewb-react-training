// src/lib/navigation-tracking.ts

export function trackNavigation(from: string, to: string, durationMs: number): void {
  if (import.meta.env.PROD) {
    navigator.sendBeacon('/api/navigation', JSON.stringify({
      from,
      to,
      durationMs,
      timestamp: new Date().toISOString(),
    }));
  }
}
