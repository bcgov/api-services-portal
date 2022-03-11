import fetch from 'node-fetch';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { updateEnvironmentDetails } from '../../../services/keystone';

describe('updateEnvironmentDetails', function () {
  const server = setupServer(
    rest.get('http://hello', (req, res, ctx) => {
      return res(
        ctx.json({
          message: 'hello',
        })
      );
    })
  );

  // Enable API mocking before tests.
  beforeAll(() => server.listen());

  // Reset any runtime request handlers we may add during the tests.
  afterEach(() => server.resetHandlers());

  // Disable API mocking after the tests are done.
  afterAll(() => server.close());

  describe('empty lists', function () {
    it('should match', async function () {
      const orig = JSON.stringify([]);
      const updates = JSON.stringify([]);
      const result = updateEnvironmentDetails(orig, updates);
      expect(result).toBe('[]');
    });
  });

  describe('merge json list for creation', function () {
    it('should match', async function () {
      const orig = JSON.stringify([]);
      const updates = JSON.stringify([
        {
          issuerUrl: 'http://url',
          clientRegistration: 'anonymous',
        },
      ]);
      const result = updateEnvironmentDetails(orig, updates);
      expect(result).toBe(
        '[{"issuerUrl":"http://url","clientRegistration":"anonymous"}]'
      );
    });
  });

  describe('merge json list - add to', function () {
    it('should match', async function () {
      const orig = JSON.stringify([
        {
          environment: 'dev',
          issuerUrl: 'http://dev-url',
          clientRegistration: 'anonymous',
          clientSecret: '111-222-333-444',
        },
      ]);
      const updates = JSON.stringify([
        {
          exists: true,
          environment: 'dev',
          issuerUrl: 'http://dev-url',
          clientRegistration: 'anonymous',
          clientSecret: '****',
        },
        {
          environment: 'test',
          issuerUrl: 'http://test-url',
          clientRegistration: 'anonymous',
        },
      ]);
      const result = updateEnvironmentDetails(orig, updates);
      expect(result).toBe(
        '[{"environment":"test","issuerUrl":"http://test-url","clientRegistration":"anonymous"},{"environment":"dev","issuerUrl":"http://dev-url","clientRegistration":"anonymous","clientSecret":"111-222-333-444"}]'
      );
    });
  });
  describe('merge json list - remove', function () {
    it('should match', async function () {
      const orig = JSON.stringify([
        {
          environment: 'dev',
          issuerUrl: 'http://dev-url',
          clientRegistration: 'anonymous',
          clientSecret: '111-222-333-444',
        },
        {
          environment: 'test',
          issuerUrl: 'http://test-url',
          clientRegistration: 'anonymous',
        },
      ]);
      const updates = JSON.stringify([
        {
          exists: true,
          environment: 'dev',
          issuerUrl: 'http://dev-url',
          clientRegistration: 'anonymous',
          clientSecret: '****',
        },
        {
          environment: 'test',
          issuerUrl: 'http://test-url',
          clientRegistration: 'anonymous',
          clientSecret: '444-555-666-777',
        },
      ]);
      const result = updateEnvironmentDetails(orig, updates);
      expect(result).toBe(
        '[{"environment":"test","issuerUrl":"http://test-url","clientRegistration":"anonymous","clientSecret":"444-555-666-777"},{"environment":"dev","issuerUrl":"http://dev-url","clientRegistration":"anonymous","clientSecret":"111-222-333-444"}]'
      );
    });
  });

  describe('merge json list - replace', function () {
    it('should match', async function () {
      const orig = JSON.stringify([
        {
          environment: 'dev',
          issuerUrl: 'http://dev-url',
          clientRegistration: 'anonymous',
          clientSecret: '111-222-333-444',
        },
        {
          environment: 'test',
          issuerUrl: 'http://test-url',
          clientRegistration: 'anonymous',
          clientSecret: '444-555-666-777',
        },
      ]);
      const updates = JSON.stringify([
        {
          exists: true,
          environment: 'dev',
        },
        {
          environment: 'test',
          issuerUrl: 'http://test-url-2',
          clientRegistration: 'anonymous',
          clientSecret: '888-999-000',
        },
      ]);
      const result = updateEnvironmentDetails(orig, updates);
      expect(result).toBe(
        '[{"environment":"test","issuerUrl":"http://test-url-2","clientRegistration":"anonymous","clientSecret":"888-999-000"},{"environment":"dev","issuerUrl":"http://dev-url","clientRegistration":"anonymous","clientSecret":"111-222-333-444"}]'
      );
    });
  });
});
