import {
  EnvironmentContext,
  getResourceSets,
} from '../../lists/extensions/Common';
import { strict as assert } from 'assert';
import { Logger } from '../../logger';
import {
  KeycloakPermissionTicketService,
  KeycloakUserService,
  PermissionTicket,
} from '../keycloak';
import { StructuredActivityService } from './namespace-activity';

const logger = Logger('wf.nsumaperm');

export async function updatePermissions(
  context: any,
  envCtx: EnvironmentContext,
  email: string,
  scopes: string[],
  resourceId: string,
  grant: 'grant' | 'update' = 'update'
): Promise<{ userId: string; result: { id: string }[] }> {
  logger.debug('[updatePermissions] %s : %s %s', email, resourceId, scopes);

  await enforceAccessToResource(envCtx, resourceId);

  const userApi = new KeycloakUserService(envCtx.openid.issuer);
  await userApi.login(
    envCtx.issuerEnvConfig.clientId,
    envCtx.issuerEnvConfig.clientSecret
  );
  const user = await userApi.lookupUserByEmail(email, false, ['idir']);
  const displayName =
    userApi.getOneAttributeValue(user, 'display_name') || user.email;

  const result = [] as any[];
  const permissionApi = new KeycloakPermissionTicketService(
    envCtx.openid.issuer,
    envCtx.accessToken
  );

  const currentPermissions = await getCurrentUserPermissions(
    permissionApi,
    resourceId,
    user.id
  );

  assert.strictEqual(
    grant === 'update' || currentPermissions.length === 0,
    true,
    'User already granted permissions.  Use edit access.'
  );

  const deletedScopes = await revokeUserPermissions(
    permissionApi,
    currentPermissions.filter((perm) => !scopes.includes(perm.scopeName))
  );

  const addedScopes = scopes.filter(
    (scope) =>
      currentPermissions.filter((perm) => perm.scopeName === scope).length == 0
  );

  for (const scope of addedScopes) {
    const permission = await permissionApi.createOrUpdatePermission(
      resourceId,
      user.id,
      true,
      scope
    );
    result.push({ id: permission.id });
  }

  if (addedScopes.length + deletedScopes.length > 0) {
    await new StructuredActivityService(
      context.sudo(),
      context.authedItem['namespace']
    ).logNamespaceAccess(
      true,
      grant == 'grant' ? 'granted' : 'updated',
      'namespace access',
      'user',
      displayName,
      [
        ...addedScopes.map((s) => `[+] ${s}`),
        ...deletedScopes.map((s) => `[-] ${s}`),
      ]
    );
  }

  return { userId: user.id, result };
}

export async function revokePermissions(
  context: any,
  envCtx: EnvironmentContext,
  resourceId: string,
  ids: string[]
): Promise<{ userId: string }> {
  logger.debug(
    '[revokePermissions] permissions resource %s : perms %s',
    resourceId,
    ids
  );

  await enforceAccessToResource(envCtx, resourceId);

  const permissionApi = new KeycloakPermissionTicketService(
    envCtx.openid.issuer,
    envCtx.accessToken
  );

  const perms = await permissionApi.listPermissions({
    resourceId: resourceId,
    returnNames: true,
  });

  const requesterIds = [] as any[];
  const deletedScopes = [] as any[];
  for (const permId of ids) {
    const foundPerms = perms.filter((perm) => perm.id === permId);
    assert.strictEqual(foundPerms.length, 1, 'Invalid Permission');
    deletedScopes.push(foundPerms[0].scopeName);
    requesterIds.push(foundPerms[0].requester);
    await permissionApi.deletePermission(permId);
  }

  const userApi = new KeycloakUserService(envCtx.openid.issuer);
  await userApi.login(
    envCtx.issuerEnvConfig.clientId,
    envCtx.issuerEnvConfig.clientSecret
  );
  const user = await userApi.lookupUserById(requesterIds.pop());
  const displayName = user.attributes.display_name || user.email;

  await new StructuredActivityService(
    context.sudo(),
    context.authedItem['namespace']
  ).logNamespaceAccess(
    true,
    'revoked',
    'namespace access',
    'user',
    displayName,
    deletedScopes
  );

  return { userId: user.id };
}

export async function enforceAccessToResource(
  envCtx: EnvironmentContext,
  resourceId: string
) {
  const resourceIds = await getResourceSets(envCtx);
  assert.strictEqual(
    resourceIds.filter((rid) => rid === resourceId).length,
    1,
    'Invalid Resource'
  );
}

/**
 *
 * @param permissionApi The Keycloak Permission Ticket service
 * @param resourceId The namespace resource that these permissions relate to
 * @param userId The user that these permissions must belong to
 * @param desiredScopes All scopes for this user and resource that you want
 * @returns An array of deleted resource scopes
 */
async function revokeUserPermissions(
  permissionApi: KeycloakPermissionTicketService,
  perms: PermissionTicket[]
): Promise<string[]> {
  const deletedScopes = [] as any[];
  // delete any scopes that are not in the desiredScopes list
  for (const perm of perms) {
    deletedScopes.push(perm.scopeName);
    await permissionApi.deletePermission(perm.id);
  }
  return deletedScopes;
}

async function getCurrentUserPermissions(
  permissionApi: KeycloakPermissionTicketService,
  resourceId: string,
  userId: string
): Promise<PermissionTicket[]> {
  const perms = await permissionApi.listPermissions({
    resourceId,
    returnNames: true,
  });
  return perms.filter((perm) => perm.requester === userId);
}
