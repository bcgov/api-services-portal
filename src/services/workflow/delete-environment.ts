import { strict as assert } from 'assert';
import {
  deleteRecords,
  lookupEnvironmentAndIssuerById,
  lookupServiceAccessesByEnvironment,
  recordActivityWithBlob,
} from '../keystone';
import { Logger } from '../../logger';
import { Environment, ServiceAccess } from '../keystone/types';
import { updateActivity } from '../keystone/activity';
import { Keystone } from '@keystonejs/keystone';

const logger = Logger('wf.DeleteEnvironment');

export const DeleteEnvironmentValidate = async (
  context: any,
  ns: string,
  prodEnvId: string
): Promise<void> => {
  logger.debug('Validate Deleting Environment %s', prodEnvId);

  const accessList = await lookupServiceAccessesByEnvironment(context, ns, [
    prodEnvId,
  ]);

  const messages = [] as any[];
  if (accessList.length > 0) {
    messages.push(
      `${accessList.length} ${
        accessList.length == 1 ? 'consumer has' : 'consumers have'
      } access to this environment.`
    );
  }

  assert.strictEqual(accessList.length == 0, true, messages.join('  '));
};

export const DeleteEnvironmentRecordActivity = async (
  context: any,
  ns: string,
  env: Environment,
  accessList: ServiceAccess[]
): Promise<{ id: string }> => {
  logger.debug('Record Activity for Deleting Environment ns=%s', ns);

  return await recordActivityWithBlob(
    context.sudo(),
    'delete',
    'Environment',
    env.id,
    `Deleted Environment in ${ns}`,
    'pending',
    JSON.stringify({
      message: '{actor} deleted {environment} environment',
      params: { actor: context.authedItem.name, environment: env.name },
    }),
    { access: accessList },
    [`environment:${env.id}`, `actor:${context.authedItem.name}`]
  );
};

export const DeleteEnvironment = async (
  context: any,
  ns: string,
  prodEnvId: string,
  force: boolean = false
) => {
  logger.debug(
    'Deleting Service Accesses for Environment ns=%s, id=%s',
    ns,
    prodEnvId
  );

  // no longer doing a cascade delete of service access / consumer data
  assert.strictEqual(
    force,
    false,
    'Force delete environment no longer supported'
  );

  const envDetail = await lookupEnvironmentAndIssuerById(context, prodEnvId);

  const accessList = await lookupServiceAccessesByEnvironment(context, ns, [
    prodEnvId,
  ]);

  assert.strictEqual(
    accessList.length == 0,
    true,
    `${accessList.length} ${
      accessList.length == 1 ? 'consumer has' : 'consumers have'
    } access to this environment.`
  );

  const activity = await DeleteEnvironmentRecordActivity(
    context,
    ns,
    envDetail,
    accessList
  );

  await CascadeDeleteEnvironment(context, ns, prodEnvId);

  await updateActivity(context.sudo(), activity.id, 'success', undefined);
};

export const CascadeDeleteEnvironment = async (
  context: Keystone,
  ns: string,
  prodEnvId: string
): Promise<void> => {
  // await deleteRecords(
  //   context,
  //   'ServiceAccess',
  //   { productEnvironment: { id: prodEnvId } },
  //   true,
  //   ['id']
  // );

  // await deleteRecords(
  //   context,
  //   'AccessRequest',
  //   { productEnvironment: { id: prodEnvId } },
  //   true,
  //   ['id']
  // );

  await deleteRecords(context, 'Environment', { id: prodEnvId }, false, ['id']);
};
