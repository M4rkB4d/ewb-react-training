// src/lib/global-error-handlers.ts
import { logError } from './error-logger';

export function setupGlobalErrorHandlers(): void {
  // Catch unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    logError(event.reason);
    event.preventDefault(); // Prevent console noise
  });

  // Catch uncaught errors
  window.addEventListener('error', (event) => {
    logError(event.error ?? event.message);
  });
}
