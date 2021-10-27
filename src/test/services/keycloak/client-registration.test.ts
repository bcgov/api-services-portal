import {
  getOpenidFromDiscovery,
  KeycloakClientRegistrationService,
  ClientAuthenticator,
} from '../../../services/keycloak';

import { rest } from 'msw';
import { setupServer } from 'msw/node';

describe('Keycloak Service', function () {
  const server = setupServer(
    rest.post(
      'https://provider/auth/realms/my-realm/clients-registrations/default',
      (req, res, ctx) => {
        return res(
          ctx.json({
            id: '001',
            clientId: 'cid',
            clientSecret: 'csecret',
            registrationAccessToken: 'token-123',
          })
        );
      }
    )
  );

  // Enable API mocking before tests.
  beforeAll(() => server.listen());

  // Reset any runtime request handlers we may add during the tests.
  afterEach(() => server.resetHandlers());

  // Disable API mocking after the tests are done.
  afterAll(() => server.close());

  describe('keycloak client registration', function () {
    it('it should return a successful response for Secret', async function () {
      const regsvc = new KeycloakClientRegistrationService(
        'https://provider/issuer',
        'https://provider/auth/realms/my-realm/clients-registrations/default',
        'token'
      );
      const result = await regsvc.clientRegistration(
        ClientAuthenticator.ClientSecret,
        'cid',
        'csc',
        'cert',
        'jwks',
        [],
        true
      );
      expect(result.registrationAccessToken).toBe('token-123');
      expect(result.clientSecret).toBe('csc');
    });
    it('it should return a successful response for Cert', async function () {
      const regsvc = new KeycloakClientRegistrationService(
        'https://provider/issuer',
        'https://provider/auth/realms/my-realm/clients-registrations/default',
        'token'
      );
      const result = await regsvc.clientRegistration(
        ClientAuthenticator.ClientJWTwithJWKS,
        'cid',
        'csc',
        'cert',
        'jwks',
        [],
        true
      );
      expect(result.registrationAccessToken).toBe('token-123');
      expect(result.clientSecret).toBeNull();
    });
  });
});
