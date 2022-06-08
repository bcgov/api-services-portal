/*

Wire up directly with Keycloak and use the Services

To run:


npm run ts-build
export CID=""
export CSC=""
export ISSUER=""
npm run ts-watch
node dist/test/integrated/org-groups/sync-members.js

*/

import { OrgGroupService } from '../../../services/org-groups';
import { KeycloakGroupService } from '../../../services/keycloak';

(async () => {
  const kc = new OrgGroupService(process.env.ISSUER);

  await (await kc.login(process.env.CID, process.env.CSC)).backfillGroups();

  const org = {
    name: 'databc',
    parent: '/data-custodian/ca.bc.gov/ministry-of-citizens-services',
  };

  await kc.syncMembers(org, [
    { username: 'acope@idir' },
    { username: 'someone_doesnt_exist' },
    { username: 'platform' },
  ]);

  // await kc.syncMembers(org, [{ username: 'acope@idir' }]);

  // await kc.syncMembers(org, []);

  // await kc.syncMembers(org, []);

  // await kc.syncMembers(org, [
  //   { username: 'acope@idir' },
  //   { username: 'platform' },
  // ]);
})();
