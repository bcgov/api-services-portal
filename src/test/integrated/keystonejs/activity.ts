/*
Wire up directly with Keycloak and use the Services
To run:
npm run ts-build
npm run ts-watch
node dist/test/integrated/keystonejs/activity.js
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
  parseBlobString,
} from '../../../batch/feed-worker';
import { o } from '../util';
import { lookupServiceAccessesByEnvironment } from '../../../services/keystone';
import {
  getActivity,
  recordActivity,
  recordActivityWithBlob,
} from '../../../services/keystone/activity';

(async () => {
  const keystone = await InitKeystone();
  console.log('K = ' + keystone);

  const ns = 'orgcontrol';
  const skipAccessControl = true;

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

  if (false) {
    const r = await recordActivityWithBlob(
      ctx,
      'delete',
      'Namespace',
      'orgcontrol',
      'Deleted orgcontrol namespace',
      'success',
      undefined,
      { name: 'Joe' }
    );
  }

  const records = await getActivity(ctx, ['orgcontrol'], 1);

  o(
    records
      .map((o) => removeEmpty(o))
      // .map((o) => transformAllRefID(o, ['blob']))
      .map((o) => parseBlobString(o))
  );

  await keystone.disconnect();
})();
