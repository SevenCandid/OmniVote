import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Setup Mock Service Worker node server for testing
export const server = setupServer(...handlers);
