import { strict as assert } from 'assert';

import { Logger } from '../../logger';
import {
  deleteRecords,
  lookupServiceAccessesByEnvironment,
  lookupServiceAccessesForNamespace,
  lookupServicesByNamespace,
  recordActivityWithBlob,
} from '../keystone';
import { updateActivity } from '../keystone/activity';
import { lookupEnvironmentsByNS } from '../keystone/product-environment';
import { Environment } from '../keystone/types';
//import { CascadeDeleteEnvironment } from './delete-environment';
import { GWAService } from '../gwaapi';

const logger = Logger('wf.DeleteNamespace');

export const DeleteNamespaceValidate = async (
  context: any,
  ns: string,
  force: boolean
): Promise<void> => {
  logger.debug('Validate Deleting Gateway ns=%s', ns);

  const gwServices = await lookupServicesByNamespace(context, ns);

  const envs = await lookupEnvironmentsByNS(context, ns);

  const ids = envs.map((e: Environment) => e.id);

  const accessList = await lookupServiceAccessesByEnvironment(context, ns, ids);

  const messages = [] as any[];
  if (accessList.length > 0) {
    messages.push(
      `${accessList.length} ${
        accessList.length == 1 ? 'consumer has' : 'consumers have'
      } access to products in this gateway.`
    );
  }
  if (gwServices.length > 0) {
    messages.push(
      `${gwServices.length} ${
        gwServices.length == 1 ? 'service has' : 'services have'
      } been configured in this gateway.`
    );
  }

  // Even when force=true, if there are consumers then do not proceed
  if (accessList.length != 0) {
    const msg = `${accessList.length} ${
      accessList.length == 1 ? 'consumer has' : 'consumers have'
    } access to products in this gateway.`;
    assert.strictEqual(accessList.length == 0, true, msg);
  }
  if (!force) {
    assert.strictEqual(gwServices.length == 0, true, messages.join('  '));
  }
};

export const DeleteNamespaceRecordActivity = async (
  context: any,
  ns: string
): Promise<{ id: string }> => {
  logger.debug('Record Activity for Deleting Gateway ns=%s', ns);

  const envs = await lookupEnvironmentsByNS(context, ns);

  const ids = envs.map((e: Environment) => e.id);

  const accessList = await lookupServiceAccessesByEnvironment(context, ns, ids);
  const serviceAccountAccessList = await lookupServiceAccessesForNamespace(
    context,
    ns
  );

  const r = await recordActivityWithBlob(
    context.sudo(),
    'delete',
    'Namespace',
    ns,
    `Deleted ${ns} namespace`,
    'pending',
    JSON.stringify({
      message: '{actor} deleted {ns} namespace',
      params: { actor: context.authedItem.name, ns },
    }),
    { access: accessList, serviceAccounts: serviceAccountAccessList },
    [`Namespace:${ns}`, `actor:${context.authedItem.name}`]
  );

  return r;
};

export const DeleteNamespace = async (
  context: any,
  subjectToken: string,
  ns: string
) => {
  logger.debug('Deleting Gateway ns=%s', ns);
  assert.strictEqual(
    typeof ns === 'string' && ns.length > 0,
    true,
    'Invalid namespace'
  );

  const activity = await DeleteNamespaceRecordActivity(context, ns);

  const gwaService = new GWAService(process.env.GWA_API_URL);
  await gwaService.deleteAllGatewayConfiguration(subjectToken, ns);

  const envs = await lookupEnvironmentsByNS(context, ns);
  const ids = envs.map((e: Environment) => e.id);

  // "DeleteNamespaceValidate" is called prior to this one, so
  // it won't reach here if there are Service Access records
  // but to be extra safe, lets keep this code
  //
  // for (const envId of ids) {
  //   await CascadeDeleteEnvironment(context, ns, envId);
  // }

  // await deleteRecords(context, 'ServiceAccess', { namespace: ns }, true, [
  //   'id',
  // ]);

  await deleteRecords(context, 'Product', { namespace: ns }, true, ['id']);

  await deleteRecords(context, 'CredentialIssuer', { namespace: ns }, true, [
    'id',
  ]);

  await updateActivity(context.sudo(), activity.id, 'success', undefined);
};
