/*

Wire up directly with Keycloak and use the Services

To run:


npm run ts-build
export CID=""
export CSC=""
export ISSUER=""
npm run ts-watch
node dist/test/integrated/org-groups/namespace.js

*/

import { NamespaceService } from '../../../services/org-groups';
import { KeycloakGroupService } from '../../../services/keycloak';

(async () => {
  const kc = new NamespaceService(process.env.ISSUER);

  await await kc.login(process.env.CID, process.env.CSC);

  await kc.assignNamespaceToOrganization(
    'refactortime',
    'ministry-citizens-services',
    'databc'
  );

  // await kc.unassignNamespaceFromOrganization(
  //   'refactortime',
  //   'ministry-citizens-services',
  //   'databc'
  // );

  console.log(
    await kc.listAssignedNamespacesByOrg('ministry-citizens-services')
  );
})();
