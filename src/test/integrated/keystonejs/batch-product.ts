/*
Wire up directly with Keycloak and use the Services
To run:
npm run ts-build
npm run ts-watch
node dist/test/integrated/keystonejs/batch-product.js
*/

import InitKeystone from './init';
import {
  getRecords,
  deleteRecord,
  parseJsonString,
  transformAllRefID,
  removeEmpty,
  removeKeys,
  syncRecords,
} from '../../../batch/feed-worker';
import { o } from '../util';
import { lookupServiceAccessesByEnvironment } from '../../../services/keystone';

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

  if (true) {
    //o(await deleteRecord(ctx, 'Product', '000000000000'));
    // o(await deleteRecord(ctx, 'Product', '000000000002'));
  }

  if (false) {
    // scenario 1: Product tries to highjack another Environment

    const product1 = {
      name: 'my-new-product',
      appId: '000000000000',
      environments: [
        {
          name: 'dev',
          approval: false,
          flow: 'public',
          appId: '00000000',
        },
      ],
    };

    const result = await syncRecords(ctx, 'Product', '000000000000', product1);
    o(result);
  }

  if (false) {
    const product2 = {
      name: 'my-new-product-2',
      appId: '000000000002',
      environments: [
        {
          name: 'dev',
          approval: false,
          flow: 'public',
          appId: '00000000',
        },
      ],
    };

    const result2 = await syncRecords(ctx, 'Product', '000000000002', product2);
    o(result2);
  }
  if (true) {
    o(
      await lookupServiceAccessesByEnvironment(ctx, 'platform', [
        '6227a8f2778cbf71626ca628',
      ])
    );
  }

  await keystone.disconnect();
})();
