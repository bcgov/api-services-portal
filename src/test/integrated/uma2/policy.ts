/*

Wire up directly with Keycloak and use the Services

To run:


npm run ts-build
export CID=""
export CSC=""
export ISSUER=""
npm run ts-watch
node dist/test/integrated/uma2/policy.js

*/

import { KeycloakTokenService } from '../../../services/keycloak';
import { KeycloakClientPolicyService } from '../../../services/keycloak';
import { Policy, UMAPolicyService } from '../../../services/uma2';

(async () => {
  const tok = new KeycloakTokenService(
    process.env.ISSUER + '/protocol/openid-connect/token'
  );
  const token = await tok.getKeycloakSession(process.env.CID, process.env.CSC);

  const policy = new UMAPolicyService(
    process.env.ISSUER + '/authz/protection/uma-policy',
    token
  );

  console.log(await policy.listPolicies({}));

  const rid = 'b444a5a1-8e14-4f92-9005-8b476b977e25'; // orgcontrol
  const body: Policy = {
    name: 'min-citizens-services-databc-group-permission',
    description: 'Ministry of Citizens Services Data Custodians',
    scopes: ['Namespace.View'],
    // roles: ['gwa-api/data-custodian'],
    groups: [
      '/data-custodians',
      '/data-custodians/ministry-citizens-services',
      '/data-custodians/ministry-citizens-services/databc',
    ],
  };

  //
  //await policy.deleteUmaPolicy('1c301038-db59-47f4-8640-12a6887c7385');
  //await policy.deleteUmaPolicy('fb3483de-5731-4bf7-9e62-8736329f73f5');
  //await policy.createUmaPolicy(rid, body);

  // const kc = new KeycloakClientPolicyService(process.env.ISSUER);

  // await kc.login(process.env.CID, process.env.CSC);

  // console.log(await kc.listPolicies('c03230c1-ace3-471e-80c4-b221f0746a24'));
})();

// Group policy does not work when there are multiple groups specified
// But it does when it is created via the admin APIs

// Role policy doesn't seem to work
