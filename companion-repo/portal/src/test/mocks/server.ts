// TODO: Implement Exercise 2b — MSW Test Server
// See guide A12 for requirements | Run: npm run test:exercises:06
import { setupServer } from 'msw/node';
import { handlers } from './handlers';
export const server = setupServer(...handlers);
