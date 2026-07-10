import { expect, afterEach, beforeAll, afterAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import { server } from './mocks/server';

// Extends Vitest's expect with Testing Library's matchers
expect.extend(matchers);

// Start MSW server before all tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

// Reset handlers after each individual test to keep them clean
afterEach(() => {
  cleanup();
  server.resetHandlers();
});

// Close MSW server when testing suite runs are complete
afterAll(() => {
  server.close();
});
