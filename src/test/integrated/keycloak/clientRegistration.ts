/*

Wire up directly with Keycloak and use the Services

To run:


npm run ts-build
export CID=""
export CSC=""
export ISSUER=""
npm run ts-watch
node dist/test/integrated/keycloak/clientRegistration.js

*/

import { o } from '../util';
import { logger } from '../../../logger';

import {
  KeycloakClientRegistrationService,
  KeycloakClientService,
} from '../../../services/keycloak';
import { checkStatus } from '../../../services/checkStatus';

(async () => {
  const kc = new KeycloakClientRegistrationService(
    process.env.ISSUER,
    process.env.ISSUER + '/clients-registrations/openid-connect',
    process.env.TOK
  );

  await kc.login(process.env.CID, process.env.CSC);

  const clientId = '0473BEB795B14EE9-CA853245'; //8ca2bf80-e98b-485b-9ef8-2f6e5fbbde09

  //const res = await kc.syncAndApply(clientId, ['read'], []);

  // const res = await kc.updateClientRegistration(clientId, {
  //   clientId,
  //   enabled: true,
  // });

  // await kc.regenerateSecret('6af832cb-6178-438f-a4fc-8c5e1d14d5d2');
  // console.log(await kc.listMembers('660cadef-9233-4532-ba45-5393beaddea4'));
  //const res = await kc.list('42da4f15');
  //o(res);
})();
