/*
Wire up directly with Keycloak and use the Services
To run:
npm run ts-build
npm run ts-watch
node dist/test/integrated/keystonejs/organization.js
*/

import InitKeystone from './init';
import { o } from '../util';
import {
  getOrganizations,
  getOrganizationUnit,
} from '../../../services/keystone';

(async () => {
  const keystone = await InitKeystone();
  console.log('K = ' + keystone);

  const ns = 'platform';
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

  o(await getOrganizationUnit(ctx, 'databc'));

  await keystone.disconnect();
})();
