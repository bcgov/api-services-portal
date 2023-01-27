/*

Wire up directly with Keycloak and use the Services

To run:


npm run ts-build
export CID=""
export CSC=""
export ISSUER=""
npm run ts-watch
node dist/test/integrated/uma2/permissionTicket.js

*/

import {
  KeycloakPermissionTicketService,
  KeycloakTokenService,
  PermissionTicket,
  PermissionTicketQuery,
} from '../../../services/keycloak';
import { o } from '../util';

(async () => {
  const tok = new KeycloakTokenService(
    process.env.ISSUER + '/protocol/openid-connect/token'
  );
  const token = await tok.getKeycloakSession(process.env.CID, process.env.CSC);

  const permissionApi = new KeycloakPermissionTicketService(
    process.env.ISSUER,
    token
  );

  const oldUser = 'acope@idir';
  const newUser = 'acope2@idir';

  const oldUserId = '15a3cbbe-95b5-49f0-84ee-434a9b92d04a';
  const newUserId = '6a97baf4-0cef-4e57-a3c2-d2f84c41f07c';

  const query: PermissionTicketQuery = {
    requester: oldUserId,
    returnNames: true,
  };

  const resPermsOld = await permissionApi.listPermissions({
    requester: oldUserId,
    returnNames: true,
  });
  const resPermsNew = await permissionApi.listPermissions({
    requester: newUserId,
    returnNames: true,
  });

  const createPermission = async (perm: PermissionTicket) => {
    await permissionApi.createPermission(
      perm.resource,
      newUserId,
      true,
      perm.scopeName
    );
  };

  function filterOutAlreadyExisting(p: PermissionTicket): boolean {
    return (
      resPermsNew.filter(
        (newp) => p.resource === newp.resource && p.scope === newp.scope
      ).length == 0
    );
  }
  const updates = await Promise.all(
    resPermsOld.filter(filterOutAlreadyExisting).map(createPermission)
  );
  console.log('Updates ' + updates.length);

  const deletePermission = async (perm: PermissionTicket) => {
    await permissionApi.deletePermission(perm.id);
  };
  //await Promise.all(resPermsNew.map(deletePermission));
})();
