/*
Wire up directly with Keycloak and use the Services
To run:
npm run ts-build
npm run ts-watch
node dist/test/integrated/batchworker/org.js
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

  const ns = 'platform';
  const skipAccessControl = true;

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
    const json = {
      id: '7a66db63-26f4-4052-9cd5-3272b63910f8',
      type: 'organization',
      name: 'ministry-of-health-7',
      title: 'Ministry of Health',
      extSource: '',
      extRecordHash: '',
      orgUnits: [
        {
          id: '719b3297-846d-4b97-8095-ceb3ec505fb8',
          name: 'planning-and-innovation-division-7',
          title: 'Planning and Innovation',
          extSource: '',
          extRecordHash: '',
        },
        {
          id: '700b3297-846d-4b97-8095-ceb3ec505fb8',
          name: 'health-dev-7',
          title: 'Planning and Innovation',
          extSource: '',
          extRecordHash: '',
        },
      ],
    };
    const res = await syncRecords(ctx, 'Organization', json.id, json);
    o(res);
  }
  await keystone.disconnect();
})();
