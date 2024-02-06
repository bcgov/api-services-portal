/*
Wire up directly with Keycloak and use the Services
To run:
npm run ts-build
npm run ts-watch
node dist/test/integrated/batchworker/product.js
*/

import InitKeystone from '../keystonejs/init';
import {
  getRecords,
  parseJsonString,
  transformAllRefID,
  removeEmpty,
  removeKeys,
  syncRecords,
} from '../../../batch/feed-worker';
import { o } from '../util';
import { BatchService } from '../../../services/keystone/batch-service';

(async () => {
  const keystone = await InitKeystone();
  console.log('K = ' + keystone);

  const ns = 'refactortime';
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

  const json = {
    name: 'Refactor Time Test',
    namespace: ns,
    environments: [
      {
        name: 'stage',
        appId: '0A021EB0',
        //services: [] as any,
        services: ['a-service-for-refactortime'],
        // services: ['a-service-for-refactortime', 'a-service-for-aps-moh-proto'],
      },
    ] as any,
  };
  const res = await syncRecords(ctx, 'Product', null, json);
  o(res);

  await keystone.disconnect();
})();
