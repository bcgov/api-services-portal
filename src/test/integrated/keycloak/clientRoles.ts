/*

Wire up directly with Keycloak and use the Services

To run:


npm run ts-build
export CID=""
export CSC=""
export ISSUER=""
npm run ts-watch
node dist/test/integrated/keycloak/clientRoles.js

*/
import { KeycloakClientRolesService } from '../../../services/keycloak/client-roles';
import { o } from '../util';

(async () => {
  const clientRolesService = new KeycloakClientRolesService(process.env.ISSUER);
  await clientRolesService.login(process.env.CID, process.env.CSC);

  const username = '84280EBD-287149E4F9884407';
  const roleNames = ['role-1', 'role-2'];
  const changes = await clientRolesService.syncRoles(
    'aps-pharmanet',
    roleNames,
    username
  );
  o(changes);

  await clientRolesService.addClientScopeMappings(username, 'aps-pharmanet');
})();
