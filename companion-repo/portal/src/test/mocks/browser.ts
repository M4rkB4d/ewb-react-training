// src/test/mocks/browser.ts
// MSW browser worker — used in development mode only.
// This provides realistic mock API responses so the portal works
// without a live backend server.
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);
