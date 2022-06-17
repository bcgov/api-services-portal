/*
Wire up directly with Keycloak and use the Services
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
} from '../../../services/workflow';

(async () => {
  const keystone = await InitKeystone();
  console.log('K = ' + keystone);

  const ns = 'refactortime';
  const skipAccessControl = false;

  const identity = {
    id: null,
    username: 'sample_username',
    namespace: ns,
    roles: JSON.stringify(['access-manager']),
    scopes: [],
    userId: '60c9124f3518951bb519084d',
  } as any;

  const ctx = keystone.createContext({
    skipAccessControl,
    authentication: { item: identity },
  });

  const consumers = await getFilteredNamespaceConsumers(ctx, ns);
  o(consumers);

  const promises = consumers
    .filter(
      (c) =>
        c.id === '62a18b772da3cdea467b10fe' ||
        c.id === '62a1848991c56de2f62d31a6'
    )
    .map(async (c) => {
      const consumer = await getNamespaceConsumerAccess(ctx, ns, c.id);
      o(consumer);
      const envPromises = consumer.prodEnvAccess.map(async (p: any) => {
        const res = await getConsumerProdEnvAccess(
          ctx,
          ns,
          c.id,
          p.environment.id
        );
        o(res);
      });
      await Promise.all(envPromises);
    });
  await Promise.all(promises);

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
