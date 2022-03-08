/*

Wire up directly with Keycloak and use the Services

To run:


npm run ts-build
export CID=""
export CSC=""
export ISSUER=""
npm run ts-watch
node dist/test/integrated/keycloak/groups.js

*/

import { KeycloakGroupService } from '../../../services/keycloak';

(async () => {
  const kc = new KeycloakGroupService(process.env.ISSUER);

  await kc.login(process.env.CID, process.env.CSC);
  // const group = await kc.getGroup('ns', 'platform');
  // console.log(JSON.stringify(group, null, 4));

  const groups = await kc.search('orgcontrol');
  console.log(JSON.stringify(groups, null, 4));

  const groupByName = await kc.findByName('ns', 'orgcontrol');
  console.log(JSON.stringify(groupByName, null, 4));

  // console.log(await kc.listMembers('660cadef-9233-4532-ba45-5393beaddea4'));
})();
