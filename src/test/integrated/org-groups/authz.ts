/*

Wire up directly with Keycloak and use the Services

To run:


npm run ts-build
export CID=$GWA_RES_SVR_CLIENT_ID
export CSC=$GWA_RES_SVR_CLIENT_SECRET
export ISSUER=$OIDC_ISSUER
npm run ts-watch
node dist/test/integrated/org-groups/authz.js

*/

import { OrgAuthzService } from '../../../services/org-groups';
import {
  KeycloakGroupService,
  Uma2WellKnown,
} from '../../../services/keycloak';
import fetch from 'node-fetch';
import { o } from '../util';
import { UMAResourceRegistrationService } from '../../../services/uma2/resource-registration-service';

(async () => {
  const uma2: Uma2WellKnown = await (
    await fetch(process.env.ISSUER + '/.well-known/uma2-configuration')
  ).json();

  const kc = new OrgAuthzService(uma2);

  await kc.login(process.env.CID, process.env.CSC);

  //  await kc.createIfMissingResource('databc');
  o(await kc.findResourceByUri('/org/user-janis'));
})();
