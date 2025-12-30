/*
Wire up directly with Keycloak and use the Services
To run:
npm run ts-build
npm run ts-watch
node dist/test/integrated/batchworker/subsystem.js
*/

import InitKeystone from '../keystonejs/init';
import {
  getRecords,
  syncRecords,
  deleteRecordByInternalId,
} from '../../../batch/feed-worker';
import { o } from '../util';

(async () => {
  const keystone = await InitKeystone();
  console.log('K = ' + keystone);

  const ns = 'platform';
  const skipAccessControl = false;

  const identity = {
    id: null,
    username: 'sample_username',
    namespace: ns,
    roles: JSON.stringify(['api-owner', 'portal-user']),
    scopes: [],
    userId: null,
  } as any;

  const ctx = keystone.createContext({
    skipAccessControl,
    authentication: { item: identity },
  });

  if (false) {
    const json = {
      name: 'Refactor Time Test2',
      namespace: ns,
      environments: [
        {
          name: 'stage',
          appId: '0A021EB0',
          //services: [] as any,
          //services: ['a-service-for-refactortime'],
          // services: ['a-service-for-refactortime', 'a-service-for-aps-moh-proto'],
        },
      ] as any,
    };
    const res = await syncRecords(ctx, 'Product', null, json);
    o(res);
  }
  if (true) {
    const json = {
      name: 'MY-svc',
      organization: 'ministry-of-citizens-services',
    };
    //new SubsystemService().validateSubsystem(null, json.name);

    const res = await syncRecords(ctx, 'Subsystem', null, json);
    o(res);
  }

  if (true) {
    const json = {
      name: 'MY-SVC-2',
      organization: 'ministry-of-citizens-services',
    };
    const res = await syncRecords(ctx, 'Subsystem', null, json);
    o(res);

    const all = await getRecords(ctx, 'Subsystem', 'allSubsystems', []);
    o(all);

    const r = await deleteRecordByInternalId(ctx, 'Subsystem', res.id);
    o(r);

    const all2 = await getRecords(ctx, 'Subsystem', 'allSubsystems', []);
    o(all2);
  }
  await keystone.disconnect();
})();
