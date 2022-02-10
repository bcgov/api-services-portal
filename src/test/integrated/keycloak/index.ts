/*

Wire up directly with Keycloak and use the Services

To run:


npm run ts-build
export CID=""
export CSC=""
export ISSUER=""
npm run ts-watch
node dist/test/integrated/keycloak/index.js

*/

import { KeycloakGroupService } from '../../../services/keycloak';

(async () => {
  const kc = new KeycloakGroupService(process.env.ISSUER);

  await kc.login(process.env.CID, process.env.CSC);

  const groups = await kc.search('data-custodians');
  console.log(JSON.stringify(groups, null, 4));

  console.log(await kc.listMembers('660cadef-9233-4532-ba45-5393beaddea4'));
})();
