import { Logger } from '../../logger';
import { lookupProductEnvironmentServicesBySlug } from '../keystone';
import { getEnvironmentContext } from './get-namespaces';
import { SysGroupAccessService } from '../org-groups/sys-group-access';
import type { GroupMember } from '../org-groups/types';

const logger = Logger('wf.put-subsystem-access');

/**
 * Grants/revokes subsystem RBAC role membership (system-owner, tech-lead,
 * access-manager) by syncing the supplied member list against Keycloak.
 *
 * This is the same write primitive `create-namespace-sdx.ts`'s
 * `prepareRoleAssignments` already uses once, internally, to bootstrap a
 * subsystem's creator with all three roles at registration time - exposed
 * here so RBAC membership can be changed afterward too.
 */
export async function putSubsystemAccess(
  context: any,
  subsystemId: string,
  members: GroupMember[]
): Promise<{
  granted: Record<string, string[]>;
  revoked: Record<string, string[]>;
}> {
  const noauthContext = context.createContext({ skipAccessControl: true });
  const prodEnv = await lookupProductEnvironmentServicesBySlug(
    noauthContext,
    process.env.GWA_PROD_ENV_SLUG!
  );
  const envCtx = await getEnvironmentContext(context, prodEnv.id, {}, true);

  const sga = new SysGroupAccessService(envCtx.uma2);
  await sga.login(
    envCtx.issuerEnvConfig.clientId!,
    envCtx.issuerEnvConfig.clientSecret!
  );

  logger.debug(
    'Updating subsystem access for %s: %o',
    subsystemId,
    members
  );

  return sga.createOrUpdateGroupAccess(
    'subsystem',
    { name: subsystemId, parent: '/systems', members },
    ['idir']
  );
}
