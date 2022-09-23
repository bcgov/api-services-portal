import { Logger } from '../../logger';
import {
  KeycloakPermissionTicketService,
  KeycloakTokenService,
  KeycloakUserService,
  PermissionTicket,
} from '../keycloak';
import { lookupProductEnvironmentServicesBySlug } from '../keystone';
import { changeUsername, lookupUserByUsername } from '../keystone/user';
import { getEnvironmentContext } from './get-namespaces';

const logger = Logger('wf.MigrateUser');

export const MigrateAuthzUser = async (
  context: any,
  oldUser: string,
  newUser: string,
  deleteOldPermissions: boolean
): Promise<void> => {
  logger.info(
    'MigrateAuthzUser %s to %s (delete old? %s)',
    oldUser,
    newUser,
    deleteOldPermissions
  );

  const productEnvironmentSlug = process.env.GWA_PROD_ENV_SLUG;
  const productEnvironment = await lookupProductEnvironmentServicesBySlug(
    context,
    productEnvironmentSlug
  );

  const envCtx = await getEnvironmentContext(
    context,
    productEnvironment.id,
    {},
    false
  );

  const tok = new KeycloakTokenService(envCtx.openid.token_endpoint);
  const token = await tok.getKeycloakSession(
    envCtx.issuerEnvConfig.clientId,
    envCtx.issuerEnvConfig.clientSecret
  );

  const permissionApi = new KeycloakPermissionTicketService(
    process.env.ISSUER,
    token
  );

  const userApi = new KeycloakUserService(process.env.ISSUER);
  await userApi.login(
    envCtx.issuerEnvConfig.clientId,
    envCtx.issuerEnvConfig.clientSecret
  );

  const oldUserId = await userApi.lookupUserByUsername(oldUser);
  const newUserId = await userApi.lookupUserByUsername(newUser);

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
  logger.info(
    'MigrateAuthzUser %s to %s : Copied %d Permissions',
    oldUser,
    newUser,
    updates.length
  );

  if (deleteOldPermissions) {
    const deletePermission = async (perm: PermissionTicket) => {
      await permissionApi.deletePermission(perm.id);
    };
    const deletes = await Promise.all(resPermsOld.map(deletePermission));
    logger.info(
      'MigrateAuthzUser %s to %s : Deleted %d Permissions',
      oldUser,
      newUser,
      deletes.length
    );

    // disable oldUser in authz
    userApi.disableUser(oldUserId);
  }
};

export const MigratePortalUser = async (
  context: any,
  oldUsername: string,
  newUsername: string
) => {
  logger.info('MigratePortalUser %s to %s', oldUsername, newUsername);

  // update the `username` for the user from oldUser and newUsername
  const oldUser = (await lookupUserByUsername(context, oldUsername))[0];

  // change username
  await changeUsername(context, oldUser.id, newUsername);

  logger.info('MigratePortalUser %s to %s DONE', oldUsername, newUsername);
};
