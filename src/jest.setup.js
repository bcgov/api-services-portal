// Polyfill Web APIs for keycloak-admin-client
// Jest's node environment doesn't expose Node 22 globals (FormData, Headers, fetch, etc.)
import { FormData } from 'formdata-node';
import nodeFetch, { Headers, Request, Response } from 'node-fetch';

global.FormData = global.FormData || FormData;
global.Headers = global.Headers || Headers;
global.Request = global.Request || Request;
global.Response = global.Response || Response;
global.fetch = global.fetch || nodeFetch;
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
