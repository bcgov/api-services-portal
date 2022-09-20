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

  const ns = 'refactortime';
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

  if (true) {
    const r = await recordActivityWithBlob(
      ctx,
      'delete',
      'Namespace',
      'orgcontrol',
      'Deleted orgcontrol namespace',
      'success',
      undefined,
      { access: [] }
    );
  }
  if (false) {
    const yamlExample = `
    package:
      label:
        enabled: true`;

    const r = await recordActivityWithBlob(
      ctx,
      'delete',
      'Namespace',
      'orgcontrol',
      'Deleted orgcontrol namespace',
      'success',
      undefined,
      yamlExample
    );
  }

  if (false) {
    // multi-yaml document
    const yamlExample = `package:
  label:
    enabled: true
---
package2:
  label2:
    enabled: true
    `;

    const r = await recordActivityWithBlob(
      ctx,
      'delete',
      'Namespace',
      'orgcontrol',
      'Deleted orgcontrol namespace',
      'success',
      undefined,
      yamlExample
    );
  }
  const records = await getActivity(ctx, ['refactortime'], undefined, 20);

  o(
    records
      .map((o) => removeEmpty(o))
      // .map((o) => transformAllRefID(o, ['blob']))
      .map((o) => parseJsonString(o, ['context']))
      .map((o) => parseBlobString(o))
  );

  await keystone.disconnect();
})();
