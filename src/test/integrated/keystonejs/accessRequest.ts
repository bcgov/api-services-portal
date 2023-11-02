/*
Wire up directly with Keycloak and use the Services
To run:
npm run ts-build
npm run ts-watch
node dist/test/integrated/keystonejs/accessRequest.js
*/

import InitKeystone from './init';
import { o } from '../util';
import { getOpenAccessRequestsByConsumer } from '../../../services/keystone/access-request';

(async () => {
  const keystone = await InitKeystone();

  const ns = 'gw-0dcd7';
  const skipAccessControl = false;

  const identity = {
    id: null,
    username: 'sample_username',
    namespace: ns,
    roles: JSON.stringify(['api-owner']),
    scopes: [],
    userId: null,
  } as any;

  const ctx = keystone.createContext({
    skipAccessControl,
    authentication: { item: identity },
  });

  // o(await getOrganizations(ctx));

  const serviceAccess = await getOpenAccessRequestsByConsumer(
    ctx,
    ns,
    '653860ee26683257394cfe3c'
  );
  o(serviceAccess);

  await keystone.disconnect();
})();
