import { rest } from 'msw';
import {
  KeycloakClientRegistrationService,
  ClientAuthenticator,
} from '../../../services/keycloak';
import { server } from 'test/mocks/server';

const APIGW_ISSUER = 'https://provider/auth/realms/apigw';
const APIGW_REGISTRATION =
  'https://provider/auth/realms/apigw/clients-registrations/default';
const OTHER_ISSUER = 'https://provider/auth/realms/my-realm';
const OTHER_REGISTRATION =
  'https://provider/auth/realms/my-realm/clients-registrations/default';
const ADMIN = 'https://provider/auth/admin/realms/apigw';

const REALM_SCOPES = [
  { id: 'scope-system', name: 'System.Write' },
  { id: 'scope-sa', name: 'service_account' },
  { id: 'scope-basic', name: 'basic' },
  { id: 'scope-profile', name: 'profile' },
];

describe('Keycloak Service', function () {
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

    it('posts service_account and basic when registering an apigw client', async function () {
      let body: any;
      server.use(
        rest.post(APIGW_REGISTRATION, (req, res, ctx) => {
          body = req.body;
          return res(
            ctx.json({
              id: '001',
              clientId: 'cid',
              registrationAccessToken: 'token-123',
              defaultClientScopes: ['service_account', 'basic'],
            })
          );
        })
      );

      const regsvc = new KeycloakClientRegistrationService(
        APIGW_ISSUER,
        APIGW_REGISTRATION,
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

      expect(body.defaultClientScopes).toEqual(['service_account', 'basic']);
      expect(body.optionalClientScopes).toEqual([]);
      expect(result.clientSecret).toBe('csc');
      expect(result.registrationAccessToken).toBe('token-123');
    });

    it.each([
      ['service_account', 'initial access token', 'initial-token'],
      ['basic', 'anonymous registration', undefined],
    ])(
      'rejects and deletes an apigw client when %s is missing using %s',
      async function (missing, _registrationMode, accessToken) {
        const deletes: { clientId: string; authorization: string }[] = [];
        const assigned = ['service_account', 'basic'].filter(
          (name) => name !== missing
        );
        server.use(
          rest.post(APIGW_REGISTRATION, (req, res, ctx) => {
            return res(
              ctx.json({
                id: '001',
                clientId: 'cid',
                registrationAccessToken: 'new-registration-token',
                defaultClientScopes: assigned,
              })
            );
          }),
          rest.delete(`${APIGW_REGISTRATION}/:clientId`, (req, res, ctx) => {
            deletes.push({
              clientId: req.params.clientId as string,
              authorization: req.headers.get('authorization'),
            });
            return res(ctx.status(204));
          })
        );

        const regsvc = new KeycloakClientRegistrationService(
          APIGW_ISSUER,
          APIGW_REGISTRATION,
          accessToken
        );
        await expect(
          regsvc.clientRegistration(
            ClientAuthenticator.ClientSecret,
            'cid',
            'csc',
            'cert',
            'jwks',
            [],
            true
          )
        ).rejects.toThrow(/Required default scopes missing from client/);
        expect(deletes).toEqual([
          {
            clientId: 'cid',
            authorization: 'bearer new-registration-token',
          },
        ]);
      }
    );

    it('posts an empty default scope list for a non-apigw client', async function () {
      let body: any;
      server.use(
        rest.post(OTHER_REGISTRATION, (req, res, ctx) => {
          body = req.body;
          return res(
            ctx.json({
              id: '001',
              clientId: 'cid',
              registrationAccessToken: 'token-123',
            })
          );
        })
      );

      const regsvc = new KeycloakClientRegistrationService(
        OTHER_ISSUER,
        OTHER_REGISTRATION,
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

      expect(body.defaultClientScopes).toEqual([]);
      expect(result.clientSecret).toBe('csc');
    });
  });

  describe('apigw scope sync', function () {
    function mockSync(confirmScopes: { id: string; name: string }[]) {
      const added: string[] = [];
      const removed: string[] = [];
      let defaultReads = 0;
      server.use(
        rest.get(`${ADMIN}/clients`, (req, res, ctx) => {
          return res(ctx.json([{ id: 'client-pk', clientId: 'cid' }]));
        }),
        rest.get(`${ADMIN}/client-scopes`, (req, res, ctx) => {
          return res(ctx.json(REALM_SCOPES));
        }),
        rest.get(
          `${ADMIN}/clients/:id/default-client-scopes`,
          (req, res, ctx) => {
            defaultReads += 1;
            if (defaultReads === 1) {
              return res(
                ctx.json([{ id: 'scope-profile', name: 'profile' }])
              );
            }
            return res(ctx.json(confirmScopes));
          }
        ),
        rest.get(
          `${ADMIN}/clients/:id/optional-client-scopes`,
          (req, res, ctx) => {
            return res(ctx.json([]));
          }
        ),
        rest.put(
          `${ADMIN}/clients/:id/default-client-scopes/:scopeId`,
          (req, res, ctx) => {
            added.push(req.params.scopeId as string);
            return res(ctx.status(204));
          }
        ),
        rest.delete(
          `${ADMIN}/clients/:id/default-client-scopes/:scopeId`,
          (req, res, ctx) => {
            removed.push(req.params.scopeId as string);
            return res(ctx.status(204));
          }
        )
      );
      return {
        added,
        removed,
        reads: () => defaultReads,
      };
    }

    it('adds service_account and basic for a product-only scope list and does not delete them', async function () {
      const sync = mockSync([
        { id: 'scope-system', name: 'System.Write' },
        { id: 'scope-sa', name: 'service_account' },
        { id: 'scope-basic', name: 'basic' },
      ]);
      const regsvc = new KeycloakClientRegistrationService(
        APIGW_ISSUER,
        APIGW_REGISTRATION,
        'token'
      );

      await regsvc.syncAndApply('cid', ['System.Write'], []);

      expect(sync.added).toEqual(['scope-system', 'scope-sa', 'scope-basic']);
      expect(sync.removed).toEqual(['scope-profile']);
      expect(sync.reads()).toBe(2);
    });

    it('rejects apigw sync when a required scope is still missing', async function () {
      mockSync([{ id: 'scope-system', name: 'System.Write' }]);
      const regsvc = new KeycloakClientRegistrationService(
        APIGW_ISSUER,
        APIGW_REGISTRATION,
        'token'
      );

      await expect(
        regsvc.syncAndApply('cid', ['System.Write'], [])
      ).rejects.toThrow(/Required default scopes missing from client/);
    });
  });

  describe('apigw scope backfill', function () {
    const TOKEN = `${APIGW_ISSUER.replace('/realms/apigw', '')}/realms/apigw/protocol/openid-connect/token`;

    async function loggedInService() {
      server.use(
        rest.post(TOKEN, (req, res, ctx) => {
          return res(ctx.json({ access_token: 'admin-token' }));
        })
      );
      const regsvc = new KeycloakClientRegistrationService(
        APIGW_ISSUER,
        APIGW_REGISTRATION
      );
      await regsvc.login('portal', 'secret');
      return regsvc;
    }

    it('adds a missing scope, skips a complete client, and does not delete', async function () {
      const added: { id: string; scopeId: string }[] = [];
      const deleted: string[] = [];
      const clients = [
        { id: 'c1', clientId: 'needs-basic' },
        { id: 'c2', clientId: 'complete' },
      ];
      server.use(
        rest.get(`${ADMIN}/client-scopes`, (req, res, ctx) => {
          return res(
            ctx.json([
              { id: 'scope-sa', name: 'service_account' },
              { id: 'scope-basic', name: 'basic' },
            ])
          );
        }),
        rest.get(`${ADMIN}/clients`, (req, res, ctx) => {
          const first = Number(req.url.searchParams.get('first') || 0);
          return res(ctx.json(first === 0 ? clients : []));
        }),
        rest.get(
          `${ADMIN}/clients/:id/default-client-scopes`,
          (req, res, ctx) => {
            if (req.params.id === 'c2') {
              return res(
                ctx.json([
                  { id: 'scope-sa', name: 'service_account' },
                  { id: 'scope-basic', name: 'basic' },
                ])
              );
            }
            return res(ctx.json([{ id: 'scope-sa', name: 'service_account' }]));
          }
        ),
        rest.put(
          `${ADMIN}/clients/:id/default-client-scopes/:scopeId`,
          (req, res, ctx) => {
            added.push({
              id: req.params.id as string,
              scopeId: req.params.scopeId as string,
            });
            return res(ctx.status(204));
          }
        ),
        rest.delete(
          `${ADMIN}/clients/:id/default-client-scopes/:scopeId`,
          (req, res, ctx) => {
            deleted.push(req.url.toString());
            return res(ctx.status(204));
          }
        ),
        rest.delete(`${APIGW_REGISTRATION}/:clientId`, (req, res, ctx) => {
          deleted.push(req.url.toString());
          return res(ctx.status(204));
        })
      );

      const regsvc = await loggedInService();
      const summary = await regsvc.backfillRequiredDefaultScopes();

      expect(summary).toEqual({
        updated: [{ clientId: 'needs-basic', scopesAdded: ['basic'] }],
      });
      expect(added).toEqual([{ id: 'c1', scopeId: 'scope-basic' }]);
      expect(deleted).toEqual([]);
    });

    it('continues past a full page and updates a client on the next page', async function () {
      const added: string[] = [];
      const firstPage = Array.from({ length: 100 }, (_, index) => ({
        id: `page-${index}`,
        clientId: `page-${index}`,
      }));
      server.use(
        rest.get(`${ADMIN}/client-scopes`, (req, res, ctx) => {
          return res(
            ctx.json([
              { id: 'scope-sa', name: 'service_account' },
              { id: 'scope-basic', name: 'basic' },
            ])
          );
        }),
        rest.get(`${ADMIN}/clients`, (req, res, ctx) => {
          const first = Number(req.url.searchParams.get('first') || 0);
          if (first === 0) {
            return res(ctx.json(firstPage));
          }
          if (first === 100) {
            return res(
              ctx.json([{ id: 'tail', clientId: 'needs-service-account' }])
            );
          }
          return res(ctx.json([]));
        }),
        rest.get(
          `${ADMIN}/clients/:id/default-client-scopes`,
          (req, res, ctx) => {
            if (req.params.id === 'tail') {
              return res(ctx.json([{ id: 'scope-basic', name: 'basic' }]));
            }
            return res(
              ctx.json([
                { id: 'scope-sa', name: 'service_account' },
                { id: 'scope-basic', name: 'basic' },
              ])
            );
          }
        ),
        rest.put(
          `${ADMIN}/clients/:id/default-client-scopes/:scopeId`,
          (req, res, ctx) => {
            added.push(`${req.params.id}:${req.params.scopeId}`);
            return res(ctx.status(204));
          }
        )
      );

      const regsvc = await loggedInService();
      const summary = await regsvc.backfillRequiredDefaultScopes();

      expect(summary).toEqual({
        updated: [
          {
            clientId: 'needs-service-account',
            scopesAdded: ['service_account'],
          },
        ],
      });
      expect(added).toEqual(['tail:scope-sa']);
    });

    it('fails before changing clients when a required realm scope is missing', async function () {
      let clientsCalled = false;
      server.use(
        rest.get(`${ADMIN}/client-scopes`, (req, res, ctx) => {
          return res(ctx.json([{ id: 'scope-sa', name: 'service_account' }]));
        }),
        rest.get(`${ADMIN}/clients`, (req, res, ctx) => {
          clientsCalled = true;
          return res(ctx.json([]));
        })
      );

      const regsvc = await loggedInService();
      await expect(regsvc.backfillRequiredDefaultScopes()).rejects.toThrow(
        /Required scopes missing from IdP - basic/
      );
      expect(clientsCalled).toBe(false);
    });

    it('does nothing for a non-apigw realm', async function () {
      let called = false;
      server.use(
        rest.get('https://provider/auth/admin/realms/my-realm/*', () => {
          called = true;
        })
      );
      const regsvc = new KeycloakClientRegistrationService(
        OTHER_ISSUER,
        OTHER_REGISTRATION,
        'token'
      );

      await expect(regsvc.backfillRequiredDefaultScopes()).resolves.toEqual({
        updated: [],
      });
      expect(called).toBe(false);
    });

    it('requires an admin session for apigw', async function () {
      const regsvc = new KeycloakClientRegistrationService(
        APIGW_ISSUER,
        APIGW_REGISTRATION,
        'token'
      );
      await expect(regsvc.backfillRequiredDefaultScopes()).rejects.toThrow(
        /Keycloak admin session required/
      );
    });
  });
});
