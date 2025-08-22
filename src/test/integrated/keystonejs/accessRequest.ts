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
import { addAccessRequest, collectCredentials, getAccessRequest } from '../../../services/keystone/access-request';
import { createApplication } from '../../../services/keystone/application';
import { revokeAllConsumerAccess } from '../../../services/workflow';

(async () => {
  const keystone = await InitKeystone();

  const ns = 'gw-0a524';
  const skipAccessControl = true;

  const userId = '12';

  const identity = {
    id: null,
    username: 'sample_username',
    name: "SampleF UserL",
    namespace: ns,
    roles: JSON.stringify(['api-owner']),
    scopes: [],
    userId,
  } as any;

  const ctx = keystone.createContext({
    skipAccessControl,
    authentication: { item: identity },
  });

  // o(await getOrganizations(ctx));

  const accessRequestData = {
    acceptLegal: false,
    additionalDetails: 'here is some additional details',
    //applicationId: '5', // App2
    //controls: '{"clientGenCertificate":false,"jwksUrl":"","clientCertificate":""}',
    controls: JSON.stringify({ "jwksUrl":"",subjectDn: "CN=my-site"}),
    name: 'Sample API FOR Cope, Aidan CITZ:EX',
    productEnvironmentId: '13',
    requestor: userId,
  } as any;


  // userId is needed for Legal

  const app = await createApplication(ctx, { name: 'App', description: 'App Desc', ownerId: userId });

  accessRequestData.applicationId = app.id;

  const result = await addAccessRequest(ctx, accessRequestData);
  o(result);

  const creds = await collectCredentials(ctx, result.id);
  o(JSON.parse(creds.credential));
  
//   query
// : 
// "\n  mutation SaveConsumerLabels($consumerId: ID!, $labels: [JSON]) {\n    saveConsumerLabels(consumerId: $consumerId, labels: $labels)\n  }\n"
// variables
// : 
// {consumerId: "27",…}
// consumerId
// : 
// "27"
// labels
// : 
// [{labelGroup: "Priority", values: ["Mister"]}, {labelGroup: "", values: []}]


  const request = await getAccessRequest(ctx, result.id);
  o(request);

  const revoke = await revokeAllConsumerAccess(ctx, ns, request.serviceAccess.id);
  o(revoke);
  
  // const revoke = await deleteServiceAccess(ctx, request.serviceAccess.id);
  // o(revoke);
  
// flow: client-credentials
// clientId: 50C1D755-945C1E80ABB
// clientSecret: null
// issuer: null
// tokenEndpoint: >-
//   https://sdx-authz-apps-gov-bc-ca-lab.apps.gov.bc.ca/auth/realms/sdx/protocol/openid-connect/token
// clientPublicKey: null
// clientPrivateKey: null

  // const serviceAccess = await getOpenAccessRequestsByConsumer(
  //   ctx,
  //   ns,
  //   '653860ee26683257394cfe3c'
  // );
  // o(serviceAccess);


  await keystone.disconnect();
})();
