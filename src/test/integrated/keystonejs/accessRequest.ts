/*
Wire up directly with Keycloak and use the Services
To run:
npm run ts-build
npm run ts-watch
node dist/test/integrated/keystonejs/accessRequest.js


NEEDS:

kubectl port-forward -n 1d4461-prod service/patroni-spilo 15432:5432 &

export ADAPTER=knex
export KNEX_DATABASE=keystonejs
export KNEX_HOST=localhost
export KNEX_PORT=15432
export KNEX_USER=keystonejsuser
export KNEX_PASSWORD=


export KONG_URL="https://kong-admin-api-1d4461-prod.apps.silver.devops.gov.bc.ca"

kubectl port-forward -n 1d4461-prod service/bcgov-aps-portal-feeder-generic-api 6767:80 &

export FEEDER_URL=http://localhost:6767


// userId is needed for Legal
// namespace has to match requesting product if not published

*/

import InitKeystone from './init';
import { o } from '../util';
import {
  addAccessRequest,
  collectCredentials,
  getAccessRequest,
  getAccessRequestsByNamespace,
} from '../../../services/keystone/access-request';
import { createApplication } from '../../../services/keystone/application';
import {
  revokeAllConsumerAccess,
  saveConsumerLabels,
} from '../../../services/workflow';

(async () => {
  const keystone = await InitKeystone();

  const ns = 'gw-0a524';
  const skipAccessControl = true;

  const userId = '12';

  const identity = {
    id: null,
    username: 'sample_username',
    name: 'SampleF UserL',
    namespace: ns,
    roles: JSON.stringify(['api-owner']),
    scopes: [],
    userId,
  } as any;

  const ctx = keystone.createContext({
    skipAccessControl,
    authentication: { item: identity },
  });

  if (false) {
    // o(await getOrganizations(ctx));
    const app = await createApplication(ctx, {
      name: 'App ' + new Date().toISOString(),
      description: 'App Desc',
      ownerId: userId,
    });

    const controls = {
      clientName: app.name,
      subjectDn: 'CN=my-site',
      //defaultClientScopes: [],
      optionalClientScopes: ['user/Test1'],
    };

    const accessRequestData = {
      acceptLegal: false,
      additionalDetails: 'here is some additional details',
      controls: JSON.stringify(controls),
      name: 'Sample API FOR Cope, Aidan CITZ:EX',
      productEnvironmentId: '13',
      requestor: userId,
    } as any;

    accessRequestData.applicationId = app.id;

    const result = await addAccessRequest(ctx, accessRequestData);
    o(result);

    const creds = await collectCredentials(ctx, result.id);
    const credDetails = JSON.parse(creds.credential);
    o(credDetails);

    const request = await getAccessRequest(ctx, result.id);
    o(request);

    const labels = [
      { labelGroup: 'sdx-member', values: ['/MIN/CITZ'] },
      { labelGroup: 'sdx-res-locator', values: ['/LAB/MIN/CITZ/MYSVC-API'] },
      { labelGroup: 'application', values: [app.name] },
    ];

    await saveConsumerLabels(
      ctx,
      ns,
      request.serviceAccess.consumer.id,
      labels
    );

    // const revoke = await revokeAllConsumerAccess(ctx, ns, request.serviceAccess.id);
    // o(revoke);

    // const revoke = await deleteServiceAccess(ctx, request.serviceAccess.id);
    // o(revoke);
  }

  if (true) {
    const result = await getAccessRequestsByNamespace(ctx, [ns]);
    o(result);
  }

  // const serviceAccess = await getOpenAccessRequestsByConsumer(
  //   ctx,
  //   ns,
  //   '653860ee26683257394cfe3c'
  // );
  // o(serviceAccess);

  await keystone.disconnect();
})();
