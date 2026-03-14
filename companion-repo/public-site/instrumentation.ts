// instrumentation.ts
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { useAzureMonitor } = await import('@azure/monitor-opentelemetry');

    useAzureMonitor({
      azureMonitorExporterOptions: {
        connectionString: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING,
      },
    });
  }
}
