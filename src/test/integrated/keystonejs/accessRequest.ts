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
import { addAccessRequest, collectCredentials, getOpenAccessRequestsByConsumer } from '../../../services/keystone/access-request';
import { add } from 'lodash';
import { AccessRequestCreateInput } from 'apis/shared/types/query.types';
import { createApplication } from '../../../services/keystone/application';

(async () => {
  const keystone = await InitKeystone();

  const ns = 'gw-0a524';
  const skipAccessControl = true;

  const userId = '12';

  const identity = {
    id: null,
    username: 'sample_username',
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
    additionalDetails: '',
    //applicationId: '5', // App2
    controls: '{"clientGenCertificate":false,"jwksUrl":"","clientCertificate":""}',
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
  o(creds);
  
  // const serviceAccess = await getOpenAccessRequestsByConsumer(
  //   ctx,
  //   ns,
  //   '653860ee26683257394cfe3c'
  // );
  // o(serviceAccess);


  await keystone.disconnect();
})();
