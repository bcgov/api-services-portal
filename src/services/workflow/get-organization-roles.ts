import { lookupProductEnvironmentServicesBySlug } from '../keystone';
import { getEnvironmentContext } from './get-namespaces';

import { Logger } from '../../logger';
import { GroupAccessService } from '../org-groups';
import type { GroupMember } from '../org-groups/types';
import { removeKeys } from '../../batch/feed-worker';

const logger = Logger('get-organization-roles');

/**
 * Reads organization-level RBAC role membership (organization-admin,
 * system-admin, ...) directly from Keycloak, using the portal's own service
 * credentials - not the caller's token. Mirrors `getSubsystemRoles`, which
 * already reads subsystem role membership the same way for the SDX catalog.
 */
export async function getOrganizationRoles(
  context: any,
  orgName: string
): Promise<GroupMember[] | undefined> {
  logger.debug('Getting organization roles for %s', orgName);

  const prodEnv = await lookupProductEnvironmentServicesBySlug(
    context,
    process.env.GWA_PROD_ENV_SLUG!
  );
  const envCtx = await getEnvironmentContext(context, prodEnv.id, {}, false);

  const kc = new GroupAccessService(envCtx.uma2);

  await kc.login(
    envCtx.issuerEnvConfig.clientId!,
    envCtx.issuerEnvConfig.clientSecret!
  );

  const result = await kc.getGroupMembership(orgName);
  if (result) {
    return removeKeys(result.members as GroupMember[], [
      'id',
      'username',
    ]) as GroupMember[];
  }

  logger.debug('Group membership not found for %s', orgName);

  return undefined;
}
