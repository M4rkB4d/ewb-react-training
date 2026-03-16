// src/lib/web-vitals.ts
import { onCLS, onINP, onLCP, onFCP, onTTFB } from 'web-vitals';
import { env } from './env';

export function initWebVitals(): void {
  const report = (metric: { name: string; value: number; rating: string }) => {
    // Dev mode — colored console output for immediate feedback
    if (import.meta.env.DEV) {
      const color = metric.rating === 'good' ? 'green' : metric.rating === 'poor' ? 'red' : 'orange';
      console.log(
        `%c[WebVital] ${metric.name}: ${metric.value.toFixed(1)}ms (${metric.rating})`,
        `color: ${color}`,
      );
    }

    // Production — send to monitoring endpoint
    if (import.meta.env.PROD) {
      navigator.sendBeacon(`${env.VITE_API_BASE_URL}/vitals`, JSON.stringify({
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
