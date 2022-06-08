/*
Wire up directly with Keycloak and use the Services
To run:
npm run ts-build
npm run ts-watch
node dist/test/integrated/keystonejs/dataset.js
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

  const records = await getRecords(
    ctx,
    'Dataset',
    undefined,
    ['organization', 'organizationUnit'],
    {
      query: '$name: String!',
      clause: '{ name: $name }',
      variables: { name: 'open511-drivebc-api' },
    }
  );

  const data = records
    .map((o) => removeEmpty(o))
    .map((o) => transformAllRefID(o, []))
    .map((o) => parseJsonString(o, ['tags', 'contacts', 'resources']))
    .map((o) =>
      removeKeys(o, [
        'id',
        'namespace',
        'extSource',
        'extForeignKey',
        'extRecordHash',
        'orgUnits',
      ])
    )
    .map((o) => transformContacts(o))
    .map((o) => transformResources(o));

  o(data);

  await keystone.disconnect();
})();

function transformResources(o: any) {
  o.resources = o.resources?.map((res: any) => ({
    name: res.name,
    url: res.url,
    bcdc_type: res.bcdc_type,
    format: res.format,
  }));
  return o;
}

function transformContacts(o: any) {
  o.contacts = o.contacts?.map((con: any) => ({
    role: con.role,
    name: con.name,
    email: con.email,
  }));
  return o;
}
