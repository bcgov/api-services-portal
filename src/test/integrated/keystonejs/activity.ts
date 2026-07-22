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

  if (false) {
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
  //const records = await getActivity(ctx, ['refactortime'], undefined, 20);

  const records = [
    {
      id: '8',
      clientId: 'LAB.MIN.FOOD.MY-FOOD-API',
      serviceId: 'LAB.MIN.FOOD.FABRIC.v1',
      isApproved: false,
      isActive: true,
      policyVersion: 'SDX.R0.00',
      environment: 'dev',
      requesterDetails:
        '{"submissionId":"submission-1780532868201-i7430pqniml","requestor":"Joe","scopes":[],"client":{"integrationId":"000123","clientId":"client-123","privacyZone":"citizen"},"service":{"clientId":" client-456","privacyZone":"health"}}',
      clientResources: '{}',
      serviceResources:
        '{"subsystemId":"LAB.MIN.FOOD.MY-FOOD-API","gatewayResources":{}}',
      provisionerStatus: '{}',
    },
  ];
  o(
    records
      .map((o) => removeEmpty(o))
      // .map((o) => transformAllRefID(o, ['blob']))
      .map((o) =>
        parseJsonString(o, [
          'requesterDetails',
          'clientResources',
          'serviceResources',
          'provisionerStatus',
        ])
      )
  );

  await keystone.disconnect();
})();
