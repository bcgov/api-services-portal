/*
Wire up directly with Keycloak and use the Services
To run:
npm run ts-build
npm run ts-watch
node dist/test/integrated/workflow/namespace-activity.js
*/

import InitKeystone from '../keystonejs/init';
import { o } from '../util';
import { getFilteredNamespaceActivity } from '../../../services/workflow';
import { ActivityQueryFilter } from '@/services/workflow/types';

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
    roles: JSON.stringify(['api-owner']),
    scopes: [],
    userId: '60c9124f3518951bb519084d',
  } as any;

  const ctx = keystone.createContext({
    skipAccessControl,
    authentication: { item: identity },
  });

  const filter: ActivityQueryFilter = {
    consumers: ['A94884A1-974424B14EB84CC4'],
  };
  const a = await getFilteredNamespaceActivity(ctx, ns, 20, 0, filter);
  o(a);

  await keystone.disconnect();
})();
