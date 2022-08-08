// Polyfill "window.fetch" used in the React component.
import 'whatwg-fetch';
import { setLogger } from 'react-query';
import '@testing-library/jest-dom/extend-expect';

//import { queryClient } from './test/wrapper';
import { resetAll } from './mocks/handlers';
import { server } from './test/mocks/server';
import { context } from './test/mocks/handlers/keystone';

const originalError = console.error;

setLogger({
  log: console.log,
  warn: console.warn,
  error: () => {},
});

beforeAll(() => {
  server.listen();
  console.error = jest.fn();
});

afterEach(() => {
  // queryClient.clear();
  server.resetHandlers();
  server.restoreHandlers();
  // resetAll();
});

afterAll(() => {
  server.close();
  console.error = originalError;
});
