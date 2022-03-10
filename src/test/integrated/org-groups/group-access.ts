/*

Wire up directly with Keycloak and use the Services

To run:


npm run ts-build
export CID=""
export CSC=""
export ISSUER=""
npm run ts-watch
node dist/test/integrated/org-groups/group-access.js

*/

import fetch from 'node-fetch';
import { GroupAccessService } from '../../../services/org-groups';
import {
  KeycloakGroupService,
  Uma2WellKnown,
} from '../../../services/keycloak';

(async () => {
  const uma2: Uma2WellKnown = await (
    await fetch(process.env.ISSUER + '/.well-known/uma2-configuration')
  ).json();

  const kc = new GroupAccessService(uma2);

  await kc.login(process.env.CID, process.env.CSC);

  const access = await kc.getGroupAccess('databc');
  console.log(JSON.stringify(access, null, 4));

  //await kc.createOrUpdateGroupAccess(access);
})();