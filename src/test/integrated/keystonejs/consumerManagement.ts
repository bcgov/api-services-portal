/*
Wire up directly with Keycloak and use the Services
export TOK="<token from portal>"
To run:
npm run ts-build
npm run ts-watch
node dist/test/integrated/keystonejs/consumerManagement.js
*/

import InitKeystone from './init';
import { o } from '../util';
import {
  getConsumerProdEnvAccess,
  getFilteredNamespaceConsumers,
  getNamespaceConsumerAccess,
  grantAccessToConsumer,
  revokeAccessFromConsumer,
  updateConsumerAccess,
  saveConsumerLabels,
  allConsumerGroupLabels,
  allScopesAndRoles,
  revokeAllConsumerAccess,
} from '../../../services/workflow';
import {
  RequestControls,
  ConsumerLabel,
  ConsumerQueryFilter,
  ConsumerPlugin,
} from '../../../services/workflow/types';
import { doFiltering } from '../../../services/workflow/consumer-filters';
import { syncPlugins } from '../../../services/workflow/consumer-plugins';
import { lookupConsumerPlugins } from '../../../services/keystone';
import { Logger } from '../../../logger';
import { Environment } from '../../../services/keystone/types';

const logger = Logger('test.intg');

(async () => {
  const keystone = await InitKeystone();
  console.log('K = ' + keystone);

  const ns = 'refactortime';
  const skipAccessControl = false;

  const identity = {
    id: null,
    name: 'Sample User',
    username: 'sample_username',
    namespace: ns,
    roles: JSON.stringify(['access-manager']),
    scopes: [],
    //userId: '60c9124f3518951bb519084d',
    userId: '60c9124f3518951bb519084d', // acope@idir
  } as any;

  const ctx = keystone.createContext({
    skipAccessControl,
    authentication: { item: identity },
  });
  ctx.req = {
    headers: {
      'x-forwarded-access-token': process.env.TOK,
    },
  };

  const labels = await allConsumerGroupLabels(ctx, ns);
  o(labels);

  const scopesRoles = await allScopesAndRoles(ctx, ns);
  o(scopesRoles);

  if (false) {
    const id = '62a1848991c56de2f62d31a6';
    const consumerAccess = await getNamespaceConsumerAccess(ctx, ns, id);
    //o(consumerAccess);

    const res = await getConsumerProdEnvAccess(
      ctx,
      ns,
      id,
      consumerAccess.prodEnvAccess[0].environment.id
    );
    o(res);

    const controls: RequestControls = {
      roles: ['r1', ' r2'],
    };
    await updateConsumerAccess(
      ctx,
      ns,
      consumerAccess.consumer.id,
      consumerAccess.prodEnvAccess[0].environment.id,
      controls
    );
  }
  if (false) {
    const id = '62a1848991c56de2f62d31a5';
    const consumer = await lookupConsumerPlugins(ctx, id);
    o(consumer);
  }

  if (false) {
    const cid = '62f55c9cc56563de1c514e1b';
    const id = '629fccaf76e9e65444ca6a43';
    const res = await getConsumerProdEnvAccess(ctx, ns, cid, id).catch((e) => {
      logger.error('Caught error: %s', e.message);
    });
    o(res);
  }
  if (false) {
    const id = '62a18b772da3cdea467b10fd';
    const consumerAccess = await getNamespaceConsumerAccess(ctx, ns, id);
    o(consumerAccess);

    // only enriches with Authorization and Access Request details
    const envPromises = consumerAccess.prodEnvAccess
      .filter((a) => a.plugins.length > 0)
      .map(async (p: any) => {
        const res = await getConsumerProdEnvAccess(
          ctx,
          ns,
          consumerAccess.consumer.id,
          p.environment.id
        );
        o(res);
      });
    await Promise.all(envPromises);
  }
  if (true) {
    const id = '62a18b772da3cdea467b10fd';
    const consumer = await lookupConsumerPlugins(ctx, id);

    const plugins: ConsumerPlugin[] = [
      {
        // id: '6328bc1806c62b1bcf848d63',
        name: 'ip-restriction',
        config: { deny: null, allow: ['3.1.1.1'] },
        service: {
          id: '61816208655ef5aad5968c5c',
          name: 'a-service-for-refactortime-2',
        },
      },
      // {
      //   // id: '62e30200b16aa6aa9e87ea57',
      //   name: 'rate-limiting',
      //   config: { second: 20, minute: null, policy: 'redis' },
      //   route: null,
      //   service: {
      //     id: '61816208655ef5aad5968c5c',
      //     name: 'a-service-for-refactortime-2',
      //   },
      // },
    ];

    const prodEnv = {
      name: 'dev',
      product: { name: 'abc' },
    } as Environment;
    await syncPlugins(ctx, ns, consumer, prodEnv, plugins);
  }
  if (false) {
    const cids = await doFiltering(ctx, ns, {
      products: ['6180d1328a98e36cae8d0621'],
      environments: ['dev'],
    } as ConsumerQueryFilter);
    o(cids);
  }

  if (false) {
    const cids = await doFiltering(ctx, ns, {
      labels: [{ labelGroup: 'Facility', value: 'abc' }],
    } as ConsumerQueryFilter);
    o(cids);
  }

  if (false) {
    const cids = await doFiltering(ctx, ns, {
      scopes: ['read'],
    } as ConsumerQueryFilter);
    o(cids);
  }

  // const consumers = await getFilteredNamespaceConsumers(ctx, ns, {
  //   labels: [{ labelGroup: 'Facility', value: 'abc' }],
  // } as ConsumerQueryFilter);
  // o(consumers);

  if (false) {
    const consumers = await getFilteredNamespaceConsumers(
      ctx,
      ns,
      {} as ConsumerQueryFilter
    );
    o(consumers);
  }

  if (false) {
    const id = '62b40afce12d4941e6f4088b';

    await revokeAllConsumerAccess(ctx, ns, id);
  }
  if (false) {
    const id = '62a184cc91c56de2f62d31b1';
    const consumerAccess = await getNamespaceConsumerAccess(ctx, ns, id);
    o(consumerAccess);
    const envId = '629fccaf76e9e65444ca6a43';

    const controls: RequestControls = {
      //plugins: [
      // {
      //   name: 'rate-limiting',
      //   config: { second: 20, policy: 'local' },
      //   route: null,
      //   service: {
      //     id: '61816208655ef5aad5968c5c',
      //     name: 'a-service-for-refactortime-2',
      //   },
      // },
      //],
      defaultClientScopes: ['read'],
    };

    await updateConsumerAccess(
      ctx,
      ns,
      consumerAccess.consumer.id,
      envId,
      controls
    );

    //await revokeAccessFromConsumer(ctx, ns, consumerAccess.consumer.id, envId);
    // await grantAccessToConsumer(
    //   ctx,
    //   ns,
    //   consumerAccess.consumer.id,
    //   envId,
    //   controls
    // );
  }

  if (false) {
    const consumers = await getFilteredNamespaceConsumers(
      ctx,
      ns,
      {} as ConsumerQueryFilter
    );
    o(consumers);

    // testing plugins
    if (true) {
      const promises = consumers
        .filter((c) => c.id === '62a18b772da3cdea467b10fd')
        .map(async (c) => {
          const consumerAccess = await getNamespaceConsumerAccess(
            ctx,
            ns,
            c.id
          );

          const envPromises = consumerAccess.prodEnvAccess
            .filter((a) => a.plugins.length > 0)
            .map(async (p: any) => {
              const res = await getConsumerProdEnvAccess(
                ctx,
                ns,
                c.id,
                p.environment.id
              );
              o(res);

              // const controls: RequestControls = {
              //   plugins: [
              //     {
              //       id: '62a18c362da3cdea467b1103',
              //       name: 'ip-restriction',
              //       config:
              //         '{"status":null,"allow":["2.2.2.2"],"message":null,"deny":null}',
              //       service: {
              //         id: '61816208655ef5aad5968c5c',
              //         name: 'a-service-for-refactortime-2',
              //       },
              //       route: {},
              //     },
              //     {
              //       name: 'ip-restriction',
              //       config: '{"allow":"[\\"1.1.1.1\\"]"}',
              //       tags: '["consumer"]',
              //       route: {
              //         connect: {
              //           id: '84733df3-cf00-4a00-9c21-d8db460f5d5b',
              //         },
              //       },
              //     },
              //     {
              //       id: '62a18c3a2da3cdea467b1105',
              //       name: 'rate-limiting',
              //       config:
              //         '{"redis_timeout":2000,"limit_by":"consumer","redis_ssl":false,"redis_ssl_verify":false,"redis_server_name":null,"second":null,"minute":4,"hour":null,"day":null,"month":null,"policy":"local","fault_tolerant":true,"hide_client_headers":false,"header_name":null,"path":null,"redis_port":6379,"redis_password":"****","redis_host":"****","year":null,"redis_database":0}',
              //       service: {
              //         id: '61816208655ef5aad5968c5c',
              //         name: 'a-service-for-refactortime-2',
              //       },
              //       route: {},
              //     },
              //   ],
              // };
              // await updateConsumerAccess(
              //   ctx,
              //   ns,
              //   consumerAccess.consumer.id,
              //   p.environment.id,
              //   controls
              // );
            });
          await Promise.all(envPromises);
        });
      await Promise.all(promises);
    }

    if (false) {
      const promises = consumers
        .filter(
          (c) =>
            c.id === '62a18b772da3cdea467b10fe' ||
            c.id === '62a1848991c56de2f62d31a6'
        )
        .map(async (c) => {
          const consumerAccess = await getNamespaceConsumerAccess(
            ctx,
            ns,
            c.id
          );
          o(consumerAccess);

          o(consumerAccess.prodEnvAccess.filter((a) => a.plugins.length > 0));

          if (false) {
            const envPromises = consumerAccess.prodEnvAccess.map(
              async (p: any) => {
                const res = await getConsumerProdEnvAccess(
                  ctx,
                  ns,
                  c.id,
                  p.environment.id
                );
                o(res);

                if (c.id === '62a18b772da3cdea467b10fe') {
                  await revokeAccessFromConsumer(
                    ctx,
                    ns,
                    consumerAccess.consumer.id,
                    p.environment.id
                  );

                  await grantAccessToConsumer(
                    ctx,
                    ns,
                    consumerAccess.consumer.id,
                    p.environment.id,
                    {}
                  );

                  //const controls : RequestControls = {}
                  //await updateConsumerProdEnvAccess(ctx, ns, c.id, p.environment.id, controls);
                  const labels: ConsumerLabel[] = [
                    { labelGroup: 'Fullname', values: ['Joe Smith'] },
                  ];
                  await saveConsumerLabels(
                    ctx,
                    ns,
                    consumerAccess.consumer.id,
                    labels
                  );
                }
              }
            );

            await Promise.all(envPromises);
          }
        });
      await Promise.all(promises);
    }
  }

  await keystone.disconnect();
})();

/**
 * Test Setup
 *
 * 5A9141AA171 (Test 1) Consumer with access to a kong-api-key-with-acl flow (Test)
 * 0C3800AF434 (Test 2) Consumer with access to a IdP flow (Sandbox) (Scope=write,Role=r1)
 * 2BEE51EA0DB (Test 3) Consumer with access to a IdP flow that was granted ACL access (Dev + Test)
 * no-namespace-user Consumer added to namespace and granted ACL access (Test)
 * blahuser Consumer added to namespace
 *
 * CA98C72D3F1 (Test 4) Consumer with access to a kong-api-key-with-acl flow with plugins (AA - Sandbox)
 *
 * 3E715D71F83 (Test 6) Consumer with plugins (to services that are linked to an unrelated Product)
 *
 * a-service-for-refactortime-2 is associated with "AA - Sandbox"
 */
