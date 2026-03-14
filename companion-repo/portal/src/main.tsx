// src/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { setupGlobalErrorHandlers } from '@/lib/global-error-handlers';
import { initMonitoring } from './lib/monitoring';
import { initAzureInsights } from './lib/azure-insights';
import { initWebVitals } from './lib/web-vitals';
import './index.css';

// Initialize error and monitoring infrastructure
setupGlobalErrorHandlers();
initMonitoring();
initAzureInsights();
initWebVitals();

const root = document.getElementById('root');
if (root == null) throw new Error('Root element not found');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
