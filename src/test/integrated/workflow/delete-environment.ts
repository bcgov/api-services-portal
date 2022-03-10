/*
Wire up directly with Keycloak and use the Services
To run:
npm run ts-build
npm run ts-watch
node dist/test/integrated/workflow/delete-environment.js
*/

import InitKeystone from '../keystonejs/init';
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
import { DeleteEnvironment } from '../../../services/workflow';

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
    o(
      await DeleteEnvironment(
        ctx,
        'orgcontrol',
        '62270cb8120e2144a8773ed3',
        true
      )
    );
    await new Promise((r) => setTimeout(r, 10000));
  }

  await keystone.disconnect();
})();
