// src/lib/navigation-tracking.ts
import { env } from './env';

export function trackNavigation(from: string, to: string, durationMs: number): void {
  if (import.meta.env.PROD) {
    navigator.sendBeacon(`${env.VITE_API_BASE_URL}/navigation`, JSON.stringify({
      from,
      to,
      durationMs,
      timestamp: new Date().toISOString(),
    }));
  }
}
