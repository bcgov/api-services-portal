import fetch from 'node-fetch';
import { rest } from 'msw';

import { setupServer } from 'msw/node';

const counter = { v: 0 };
jest.mock('uuid', () => {
  counter.v = counter.v + 1;
  return { v4: () => `ID${counter.v}` };
});

const setup = () => {
  process.env.FEEDER_URL = 'http://feeder.local';
  process.env.KONG_URL = 'http://kong-admin.local';

  const context = {
    authedItem: {
      userId: 'auser',
      namespace: 'ns-1',
    },
    Activity: [],
    IN: {},
    OUTPUTS: [],
    executeGraphQL: (q) => {
      for (const inMatch of Object.keys(context.IN)) {
        if (q.query.indexOf(inMatch) != -1) {
          return context.IN[inMatch];
        }
      }
      if (q.query.indexOf('CreateNewConsumer') != -1) {
        context.Consumer = q.variables;
        return { data: { createGatewayConsumer: { id: 'CONSUMER-001' } } };
      } else if (q.query.indexOf('CreateServiceAccess') != -1) {
        context.ServiceAccess = q.variables;
        return { data: { createServiceAccess: { id: 'SVC-ACCESS-002' } } };
      } else if (q.query.indexOf('UpdateConsumerInServiceAccess') != -1) {
        Object.assign(context.ServiceAccess, q.variables);
        return { data: { updateServiceAccess: { id: 'SVC-ACCESS-001' } } };
      } else if (q.query.indexOf('createActivity') != -1) {
        context.Activity.push(q.variables);
        return { data: { createActivity: { id: 'ACTIVITY-001' } } };
      } else {
        console.log('WARNING NO RESPONSE!' + q.query);
      }
    },
  };

  const server = setupServer(
    rest.get(
      'https://provider/auth/realms/my-realm/.well-known/openid-configuration',
      (req, res, ctx) => {
        return res(
          ctx.json({
            issuer: 'https://provider/auth/realms/my-realm',
            token_introspection_endpoint:
              'https://provider/auth/realms/my-realm/protocol/openid-connect/token/introspect',
          })
        );
      }
    ),
    rest.post(
      'https://provider/auth/realms/my-realm/clients-registrations/default',
      (req, res, ctx) => {
        context.OUTPUTS.push({ source: 'keycloak', content: req.body });
        return res(
          ctx.json({
            id: '001',
            clientId: req.body.clientId,
            clientSecret: 'csecret',
            registrationAccessToken: 'token-123',
          })
        );
      }
    ),
    rest.put(
      'http://feeder.local/forceSync/:source/:scope/:scopeKey',
      (req, res, ctx) => {
        context.OUTPUTS.push({
          source: 'feeder',
          path: req.params,
          content: req.body,
        });
        return res(
          ctx.json({
            state: 'synced',
          })
        );
      }
    ),
    rest.post(
      'http://kong-admin.local/consumers/:consumer/key-auth',
      (req, res, ctx) => {
        context.OUTPUTS.push({
          source: 'kong',
          type: 'POST consumer/key-auth',
          content: req.body,
        });
        return res(
          ctx.json({
            id: '001',
            tags: [],
            key: 'e57ef06295cb4118b496e8bd6a413c68',
            consumer: { id: 'CONSUMER-111' },
          })
        );
      }
    ),
    rest.get(
      'http://kong-admin.local/consumers/:consumer/key-auth',
      (req, res, ctx) => {
        return res(
          ctx.json([
            {
              id: '001',
              tags: [],
              key: 'e57ef06295cb4118b496e8bd6a413c68',
              consumer: { id: 'CONSUMER-111' },
            },
          ])
        );
      }
    ),
    rest.get('http://kong-admin.local/consumers', (req, res, ctx) => {
      return res(
        ctx.json([
          {
            id: 'KONG-CONSUMER-001',
            tags: [],
            username: 'user1',
            custom_id: 'custom1',
          },
        ])
      );
    }),
    rest.get('http://kong-admin.local/consumers/:consumer', (req, res, ctx) => {
      if (req.params.consumer == 'APP-01') {
        return res(
          ctx.json({
            id: 'KONG-CONSUMER-001',
            tags: [],
            username: 'user1',
            custom_id: 'custom1',
          })
        );
      } else {
        return res(ctx.status(404));
      }
    }),
    rest.post('http://kong-admin.local/consumers', (req, res, ctx) => {
      context.OUTPUTS.push({
        source: 'kong',
        type: 'POST consumer',
        content: req.body,
      });
      return res(
        ctx.json({
          id: 'KONG-CONSUMER-002',
          tags: [],
          username: 'user2',
          custom_id: 'custom2',
        })
      );
    }),
    // rest.get(
    //   'http://kong-admin.local/consumers/:consumer/acls?tags=:tags',
    //   (req, res, ctx) => {
    //       return res(
    //       ctx.json({data:[{
    //         id: '001',
    //         tags: [],
    //         group: 'group-001',
    //         consumer: { id: "CONSUMER-111"},
    //       }]})
    //     );
    //     }
    // ),
    rest.post(
      'http://kong-admin.local/consumers/:consumer/acls',
      (req, res, ctx) => {
        context.OUTPUTS.push({
          source: 'kong',
          type: 'POST consumer/acls',
          content: req.body,
        });
        return res(
          ctx.json({
            id: '002',
            tags: [],
            group: 'group-002',
            consumer: { id: 'CONSUMER-111' },
          })
        );
      }
    ),
    rest.delete(
      'http://kong-admin.local/consumers/:consumer/acls/:aclid',
      (req, res, ctx) => {
        context.OUTPUTS.push({
          source: 'kong',
          path: req.params,
          type: 'DELETE consumer/acls',
        });
        return res(ctx.json({}));
      }
    ),
    rest.post(
      'http://kong-admin.local/consumers/:consumer/plugins',
      (req, res, ctx) => {
        context.OUTPUTS.push({
          source: 'kong',
          type: 'POST consumer/plugins',
          content: req.body,
        });
        return res(ctx.json(Object.assign({}, req.body, { id: 'plugin-1' })));
      }
    ),
    rest.get(
      'http://kong-admin.local/consumers/:consumer/plugins',
      (req, res, ctx) => {
        return res(
          ctx.json({
            data: [
              {
                id: '001',
                tags: [],
                name: 'rate-limiting',
                service: { id: 'SERVICE-111' },
              },
            ],
          })
        );
      }
    )
  );

  return {
    context: context,
    server: server,
    addValidationError: (err) =>
      context.OUTPUTS.push({ source: 'validation', content: err }),
  };
};

module.exports = setup;
