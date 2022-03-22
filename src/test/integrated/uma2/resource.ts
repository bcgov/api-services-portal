/*

Wire up directly with Keycloak and use the Services

To run:


npm run ts-build
export CID=""
export CSC=""
export ISSUER=""
npm run ts-watch
node dist/test/integrated/uma2/resource.js

*/

import { KeycloakTokenService } from '../../../services/keycloak';
import { KeycloakClientPolicyService } from '../../../services/keycloak';
import {
  ResourceSet,
  UMAResourceRegistrationService,
} from '../../../services/uma2';

(async () => {
  const tok = new KeycloakTokenService(
    process.env.ISSUER + '/protocol/openid-connect/token'
  );
  const token = await tok.getKeycloakSession(process.env.CID, process.env.CSC);

  const svc = new UMAResourceRegistrationService(
    process.env.ISSUER + '/authz/protection/resource_set',
    token
  );

  if (false) {
    await svc.createResourceSet({
      name: 'sample2',
      type: 'organization',
      resource_scopes: ['Organization.Manage'],
      ownerManagedAccess: true,
    });
  }
  console.log(await svc.listResources({ type: 'organization' }));

  console.log(await svc.findResourceByName('sample33'));
})();
