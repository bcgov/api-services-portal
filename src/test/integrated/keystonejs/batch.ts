/*
Wire up directly with Keycloak and use the Services
To run:
npm run ts-build
npm run ts-watch
node dist/test/integrated/keystonejs/batch.js
*/

import InitKeystone from './init';
import {
  getRecords,
  parseJsonString,
  transformAllRefID,
  removeEmpty,
  removeKeys,
  syncRecordsThrowErrors,
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

  // const records = await getRecords(ctx, 'DraftDataset', undefined, [], {
  //   query: '$org: String',
  //   clause: '{ organization: { name: $org } }',
  //   variables: { org: 'ministry-of-citizens-services' },
  // });

  // const records = await getRecords(
  //   ctx,
  //   'Content',
  //   'allContentsByNamespace',
  //   []
  // );

  // const records = await getRecords(ctx, 'Product', 'allProductsByNamespace', [
  //   'environments',
  // ]);

  // const records = await getRecords(
  //   ctx,
  //   'GatewayRoute',
  //   'allGatewayRoutesByNamespace',
  //   ['service', 'plugins', 'plugins']
  // );

  // const records = await getRecords(
  //   ctx,
  //   'CredentialIssuer',
  //   'allCredentialIssuersByNamespace',
  //   []
  // );

  // const data = records
  //   .map((o) => removeEmpty(o))
  //   .map((o) => transformAllRefID(o, ['organization', 'organizationUnit']))
  //   .map((o) =>
  //     parseJsonString(o, [
  //       'tags',
  //       'availableScopes',
  //       'resourceScopes',
  //       'clientRoles',
  //       'environmentDetails',
  //     ])
  //   )
  //   .map((o) =>
  //     removeKeys(o, [
  //       'id',
  //       'namespace',
  //       'extSource',
  //       'extForeignKey',
  //       'extRecordHash',
  //     ])
  //   );

  //  o(data);

  const bapi = new BatchService(ctx);

  const res = await bapi.lookup(
    'allOrganizations',
    'name',
    'ministry-of-citizens-services',
    ['extForeignKey'] 
  );
  const id = res.extForeignKey;
  const out = await syncRecordsThrowErrors(
    ctx,
    'Organization',
    id,
      {
        description: 'Updated desc 2',
        extForeignKey: id,
        orgUnits: [
          {
            name: 'new-unit',
            title: 'New Unity',
            extForeignKey: '00001-new-unit',
            // extSource: 'custom',
            // extRecordHash: '1234',
            // description: 'Newly created unit',
            // tags: ['tag1', 'tag2'],
          }
        ]
      }
    ,
    true
  )
    

  o(out);
  await keystone.disconnect();
})();
