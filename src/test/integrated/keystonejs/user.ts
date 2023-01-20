/*
Wire up directly with Keycloak and use the Services
To run:
npm run ts-build
npm run ts-watch
node dist/test/integrated/keystonejs/user.js
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
  getRecord,
} from '../../../batch/feed-worker';
import { o } from '../util';
import { lookupServiceAccessesByEnvironment } from '../../../services/keystone';
import {
  getActivity,
  recordActivity,
  recordActivityWithBlob,
} from '../../../services/keystone/activity';
import { lookupProviderUserByEmail } from '../../../services/keystone/user';

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

  // const record = await getRecord(ctx, 'User', 'acope@idir');

  // o([record].map((o) => removeEmpty(o)));

  const result = await lookupProviderUserByEmail(ctx, 'aidan.cope@gmail.com');
  o(result);
  await keystone.disconnect();
})();
