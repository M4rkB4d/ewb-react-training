// src/lib/web-vitals.ts (production version)
import { onCLS, onINP, onLCP, onFCP, onTTFB } from 'web-vitals';

export function initWebVitals(): void {
  const report = (metric: { name: string; value: number; rating: string }) => {
    if (import.meta.env.PROD) {
      navigator.sendBeacon('/api/vitals', JSON.stringify({
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        url: window.location.pathname,
        timestamp: new Date().toISOString(),
      }));
    }
  };

  onCLS(report);
  onINP(report);
  onLCP(report);
  onFCP(report);
  onTTFB(report);
}
