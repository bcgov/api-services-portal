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
  transformArrayKeyToString,
} from '../../../batch/feed-worker';
import { o } from '../util';
import { lookupServiceAccessesByEnvironment } from '../../../services/keystone';

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
      appId: '100000000000',
      environments: [
        {
          name: 'dev',
          approval: false,
          flow: 'public',
          appId: '10000000',
        },
      ],
    };

    const result = await syncRecords(ctx, 'Product', product1.appId, product1);
    o(result);
  }

  if (true) {
    const product2 = {
      name: 'refactortime prod tes2',
      appId: '122000000002',
      environments: [
        {
          name: 'dev',
          approval: false,
          flow: 'public',
          appId: '12200000',
        },
      ],
    };

    const result2 = await syncRecords(ctx, 'Product', product2.appId, product2);
    o(result2);
  }
  if (false) {
    o(
      await lookupServiceAccessesByEnvironment(ctx, 'refactortime', [
        '6180f94c39761d93ba662af0',
      ])
    );
  }

  const records = await getRecords(ctx, 'Product', 'allProductsByNamespace', [
    'environments',
  ]);

  const out = records
    .map((o) => removeEmpty(o))
    .map((o) => transformAllRefID(o, ['credentialIssuer', 'dataset', 'legal']))
    .map((o) => transformArrayKeyToString(o, 'services', 'name'))
    .map((o) =>
      removeKeys(o, [
        'id',
        'namespace',
        'product',
        'extSource',
        'extRecordHash',
        'extForeignKey',
      ])
    );
  o(out);
  await keystone.disconnect();
})();
