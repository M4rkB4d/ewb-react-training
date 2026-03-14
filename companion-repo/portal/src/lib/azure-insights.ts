// src/lib/azure-insights.ts
import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { env } from './env';

let appInsights: ApplicationInsights | null = null;

export function initAzureInsights(): void {
  if (!import.meta.env.PROD) return;

  appInsights = new ApplicationInsights({
    config: {
      connectionString: env.VITE_APPINSIGHTS_CONNECTION_STRING,
      enableAutoRouteTracking: true,
      disableCookiesUsage: true, // BSP 982 — minimize tracking cookies
      autoTrackPageVisitTime: true,
    },
  });

  appInsights.loadAppInsights();

  // BSP 982 — Strip PII from all telemetry
  appInsights.addTelemetryInitializer((item) => {
    if (item.baseData) {
      delete item.baseData.name; // Remove page titles (may contain PII)
    }
    return true;
  });
}

export function trackAzureEvent(
  name: string,
  properties?: Record<string, string>,
): void {
  appInsights?.trackEvent({ name }, properties);
}
