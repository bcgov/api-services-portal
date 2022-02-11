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

import { GroupAccessService } from '../../../services/org-groups';
import { KeycloakGroupService } from '../../../services/keycloak';

(async () => {
  const kc = new GroupAccessService(process.env.ISSUER);

  await kc.login(process.env.CID, process.env.CSC);

  const access = await kc.getGroupAccess('databc');
  console.log(JSON.stringify(access, null, 4));

  await kc.createOrUpdateGroupAccess(access);
})();
