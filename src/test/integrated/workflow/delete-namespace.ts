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
import { DeleteNamespaceRecordActivity } from '../../../services/workflow/delete-namespace';
import { updateActivity } from '../../../services/keystone/activity';

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
    userId: '60c9124f3518951bb519084d',
  } as any;

  const ctx = keystone.createContext({
    skipAccessControl,
    authentication: { item: identity },
  });

  if (true) {
    const a = await DeleteNamespaceRecordActivity(ctx, 'orgcontrol');
    o(a);
    await updateActivity(ctx.sudo(), a.id, 'success', undefined);
  }

  await keystone.disconnect();
})();
