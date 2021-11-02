import {
  getOpenidFromDiscovery,
  KeycloakClientRegistrationService,
  ClientAuthenticator,
} from '../../../services/keycloak';

import { rest } from 'msw';
import { setupServer } from 'msw/node';

describe('Keycloak Service', function () {
  const server = setupServer(
    rest.get(
      'https://provider/auth/realms/my-realm/.well-known/openid-configuration',
      (req, res, ctx) => {
        return res(
          ctx.json({ issuer: 'https://provider/auth/realms/my-realm' })
        );
      }
    ),
    rest.get(
      'https://elsewhere/auth/realms/my-realm/.well-known/openid-configuration',
      (req, res, ctx) => {
        return res(ctx.status(404));
      }
    ),
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
    ),
    rest.post(
      'https://provider/auth/realms/my-realm/protocol/openid-connect/token',
      (req, res, ctx) => {
        return res(
          ctx.json({
            access_token: 'TOKEN-123',
            expires_in: 300,
            refresh_token: 'REFRESH-123',
            token_type: 'bearer',
            scope: 'profile',
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

  describe('keycloak ', function () {
    it('it should getOpenidFromDiscovery', async function () {
      const openid = await getOpenidFromDiscovery(
        'https://provider/auth/realms/my-realm/.well-known/openid-configuration'
      );
      expect(openid.issuer).toBe('https://provider/auth/realms/my-realm');
    });
    it('it should return null due to bad url', async function () {
      expect(
        await getOpenidFromDiscovery(
          'https://elsewhere/auth/realms/my-realm/.well-known/openid-configuration'
        )
      ).toBe(null);
    });
  });

  // describe('keycloak get session', function () {
  //   it('it should return a successful response', async function () {
  //     const result = await getKeycloakSession(
  //       'https://provider/auth/realms/my-realm',
  //       'cid',
  //       'csecret'
  //     );
  //     expect(result.token).toBe('TOKEN-123');
  //   });
  // });
});
