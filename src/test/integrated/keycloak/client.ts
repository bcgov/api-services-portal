/*

Wire up directly with Keycloak and use the Services

To run:


npm run ts-build
export CID=""
export CSC=""
export ISSUER=""
npm run ts-watch
node dist/test/integrated/keycloak/client.js

*/

import { o } from '../util';

import { KeycloakClientService } from '../../../services/keycloak';

(async () => {
  const kc = new KeycloakClientService(process.env.ISSUER);

  await kc.login(process.env.CID, process.env.CSC);

  // await kc.regenerateSecret('6af832cb-6178-438f-a4fc-8c5e1d14d5d2');
  // console.log(await kc.listMembers('660cadef-9233-4532-ba45-5393beaddea4'));
  const res = await kc.list('42da4f15');
  o(res);
})();
