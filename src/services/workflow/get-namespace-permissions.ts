import {
  KeycloakPermissionTicketService,
  KeycloakTokenService,
  KeycloakUserService,
} from '../keycloak';
import { lookupProductEnvironmentServicesBySlug } from '../keystone';
import { UMAResourceRegistrationService } from '../uma2';
import { getEnvironmentContext } from './get-namespaces';

import { Logger } from '../../logger';

const logger = Logger('get-namespace-permissions');

export interface NamespaceUser {
  email: string;
  name: string;
}

export interface NamespaceUserPermissions {
  user: NamespaceUser;
  scopes: string[];
}

export async function getNamespacePermissions(
  context: any,
  namespace: string
): Promise<NamespaceUserPermissions[]> {
  const prodEnv = await lookupProductEnvironmentServicesBySlug(
    context,
    process.env.GWA_PROD_ENV_SLUG!
  );
  const envCtx = await getEnvironmentContext(context, prodEnv.id, {}, false);

  const issuer = envCtx.issuerEnvConfig.issuerUrl;

  const kcUserService = new KeycloakUserService(issuer);
  await kcUserService.login(
    envCtx.issuerEnvConfig.clientId!,
    envCtx.issuerEnvConfig.clientSecret!
  );

  const tok = new KeycloakTokenService(
    `${issuer}/protocol/openid-connect/token`
  );
  const token = await tok.getKeycloakSession(
    envCtx.issuerEnvConfig.clientId!,
    envCtx.issuerEnvConfig.clientSecret!
  );

  const permissionApi = new KeycloakPermissionTicketService(issuer, token);

  const svc = new UMAResourceRegistrationService(
    issuer + '/authz/protection/resource_set',
    token
  );

  const rsList = await svc.listResources({
    name: namespace,
    exactName: true,
  } as any);

  if (rsList.length === 0) {
    logger.warn(
      `This is ok - subsystem has not created its namespace.  No resource set found for namespace ${namespace}`
    );
    return [];
  }

  const resourceId = rsList[0];

  // get all the permissions for this resource
  const perms = await permissionApi.listPermissions({
    resourceId: resourceId,
    returnNames: true,
    granted: true,
  });

  // reduce to list of unique user ids
  const uniqueUsers = perms
    .map((p) => p.requester)
    .filter((v, i, a) => a.indexOf(v) === i);

  // create a map of user details (get the detail once)
  const userMap = new Map<string, NamespaceUser>();
  for (const userId of uniqueUsers) {
    const userDetails = await kcUserService.lookupUserById(userId);
    userMap.set(userId, {
      email: userDetails.email,
      name: userDetails.attributes?.displayName?.[0] || userDetails.firstName,
    } as NamespaceUser);
  }

  return uniqueUsers.map(
    (k) =>
      ({
        user: userMap.get(k),
        scopes: perms.filter((p) => p.requester === k).map((p) => p.scopeName),
      } as NamespaceUserPermissions)
  );
}
