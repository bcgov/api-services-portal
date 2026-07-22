import { lookupProductEnvironmentServicesBySlug } from '../keystone';
import { getEnvironmentContext } from './get-namespaces';

import { Logger } from '../../logger';
import { GroupAccessService } from '../org-groups';
import type { GroupMember } from '../org-groups/types';
import { removeKeys } from '../../batch/feed-worker';

const logger = Logger('get-subsystem-roles');

export async function getSubsystemRoles(
  context: any,
  subsystemId: string
): Promise<GroupMember[] | undefined> {
  logger.debug('Getting subsystem roles for %s', subsystemId);

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

  const result = await kc.getGroupMembership(subsystemId);
  if (result) {
    return removeKeys(result.members as GroupMember[], [
      'id',
      'username',
    ]) as GroupMember[];
  }

  logger.debug('Group membership not found for %s', subsystemId);

  return undefined;
}
