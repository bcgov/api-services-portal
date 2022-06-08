import { strict as assert } from 'assert';
import {
  deleteRecords,
  lookupServiceAccessesByEnvironment,
  recordActivityWithBlob,
} from '../keystone';
import { Logger } from '../../logger';
import { ServiceAccess } from '../keystone/types';
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

  const messages = [];
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
  accessList: ServiceAccess[]
): Promise<{ id: string }> => {
  logger.debug('Record Activity for Deleting Environment ns=%s', ns);

  return await recordActivityWithBlob(
    context.sudo(),
    'delete',
    'Environment',
    ns,
    `Deleted Environment in ${ns}`,
    'pending',
    undefined,
    { access: accessList }
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

  const accessList = await lookupServiceAccessesByEnvironment(context, ns, [
    prodEnvId,
  ]);

  assert.strictEqual(
    force == true || accessList.length == 0,
    true,
    `${accessList.length} ${
      accessList.length == 1 ? 'consumer has' : 'consumers have'
    } access to this environment.`
  );

  const activity = await DeleteEnvironmentRecordActivity(
    context,
    ns,
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
  await deleteRecords(
    context,
    'ServiceAccess',
    { productEnvironment: { id: prodEnvId } },
    true,
    ['id']
  );

  await deleteRecords(
    context,
    'AccessRequest',
    { productEnvironment: { id: prodEnvId } },
    true,
    ['id']
  );

  await deleteRecords(context, 'Environment', { id: prodEnvId }, false, ['id']);
};
