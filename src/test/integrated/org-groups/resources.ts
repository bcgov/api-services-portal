/*

Wire up directly with Keycloak and use the Services

To run:


npm run ts-build
export CID=""
export CSC=""
export ISSUER=""
npm run ts-watch
node dist/test/integrated/org-groups/resources.js

*/

import { o } from '../util';
import { OrgGroupService } from '../../../services/org-groups';
import {
  KeycloakGroupService,
  Uma2WellKnown,
} from '../../../services/keycloak';
import fetch from 'node-fetch';

(async () => {
  const kc = new OrgGroupService(process.env.ISSUER);

  await (await kc.login(process.env.CID, process.env.CSC)).backfillGroups();

  o(
    await kc.getGroupPermissionsByResource(
      'b444a5a1-8e14-4f92-9005-8b476b977e25'
    )
  );

  // o(await kc.getGroupPermissionsByResource('platform'));
})();
