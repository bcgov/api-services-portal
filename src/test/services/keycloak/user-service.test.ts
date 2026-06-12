import { KeycloakUserService } from '../../../services/keycloak/user-service';

describe('KeycloakUserService', function () {
  describe('lookupUserByEmail', function () {
    it('prefers legacy account when multiple idir users share an email (test fixture)', async function () {
      const kc = new KeycloakUserService('https://provider/realms/abc');
      kc.useAdminClient({
        users: {
          find: jest.fn().mockResolvedValue([
            {
              id: 'new-user-id',
              username: '220469e037c84a7abdfab15204a60701@olduser',
              email: 'olduser@testmail.com',
              enabled: true,
              attributes: {
                identity_provider: ['idir'],
                provider_username: ['olduser'],
              },
            },
            {
              id: 'legacy-user-id',
              username: 'olduser@idir',
              email: 'olduser@testmail.com',
              enabled: true,
              attributes: {
                identity_provider: ['idir'],
                provider_username: ['olduser@idir'],
              },
            },
          ]),
        },
      } as any);

      const user = await kc.lookupUserByEmail(
        'olduser@testmail.com',
        false,
        ['idir']
      );

      expect(user.id).toBe('legacy-user-id');
    });

    it('prefers legacy account when both users use @idir usernames (production)', async function () {
      const kc = new KeycloakUserService('https://provider/realms/abc');
      kc.useAdminClient({
        users: {
          find: jest.fn().mockResolvedValue([
            {
              id: 'federated-user-id',
              username: 'af8b80da00934b11b7f0485d9066609a@idir',
              email: 'jdoe@gov.bc.ca',
              enabled: true,
              attributes: {
                identity_provider: ['idir'],
                provider_username: ['jdoe'],
              },
            },
            {
              id: 'legacy-user-id',
              username: 'jdoe@idir',
              email: 'jdoe@gov.bc.ca',
              enabled: true,
              attributes: {
                identity_provider: ['idir'],
                provider_username: ['jdoe'],
              },
            },
          ]),
        },
      } as any);

      const user = await kc.lookupUserByEmail(
        'jdoe@gov.bc.ca',
        false,
        ['idir']
      );

      expect(user.id).toBe('legacy-user-id');
    });

    it('returns the only match when email is unique', async function () {
      const kc = new KeycloakUserService('https://provider/realms/abc');
      kc.useAdminClient({
        users: {
          find: jest.fn().mockResolvedValue([
            {
              id: 'user-id',
              username: 'wendy@idir',
              email: 'wendy@idir',
              enabled: true,
              attributes: { identity_provider: ['idir'] },
            },
          ]),
        },
      } as any);

      const user = await kc.lookupUserByEmail('wendy@idir', false, ['idir']);

      expect(user.id).toBe('user-id');
    });
  });

  describe('isLegacyIdirUser', function () {
    it('identifies legacy and federated idir accounts', function () {
      const kc = new KeycloakUserService('https://provider/realms/abc');

      expect(
        kc.isLegacyIdirUser({
          username: 'jdoe@idir',
          attributes: {
            identity_provider: ['idir'],
            provider_username: ['jdoe'],
          },
        })
      ).toBe(true);

      expect(
        kc.isLegacyIdirUser({
          username: 'af8b80da00934b11b7f0485d9066609a@idir',
          attributes: {
            identity_provider: ['idir'],
            provider_username: ['jdoe'],
          },
        })
      ).toBe(false);
    });
  });
});
