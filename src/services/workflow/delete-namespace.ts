import { strict as assert } from 'assert';

import {
  deleteRecord,
  deleteRecords,
  lookupCredentialReferenceByServiceAccess,
  lookupCredentialIssuerById,
  lookupServiceAccessesByEnvironment,
  lookupProduct,
  lookupServicesByNamespace,
  recordActivityWithBlob,
} from '../keystone';
import {
  KeycloakClientRegistrationService,
  KeycloakTokenService,
  getOpenidFromIssuer,
  getUma2FromIssuer,
} from '../keycloak';
import { KongConsumerService } from '../kong';
import { IssuerEnvironmentConfig, getIssuerEnvironmentConfig } from './types';
import { Logger } from '../../logger';
import { UMAPolicyService } from '../uma2';
import { Environment } from '../keystone/types';
import { lookupEnvironmentsByNS } from '../keystone/product-environment';
import { FieldErrors } from 'tsoa';
import { updateActivity } from '../keystone/activity';

const logger = Logger('wf.DeleteNamespace');

export const DeleteNamespaceValidate = async (
  context: any,
  ns: string
): Promise<void> => {
  logger.debug('Validate Deleting Namespace ns=%s', ns);

  const gwServices = await lookupServicesByNamespace(context, ns);

  const envs = await lookupEnvironmentsByNS(context, ns);

  const ids = envs.map((e: Environment) => e.id);

  const accessList = await lookupServiceAccessesByEnvironment(context, ns, ids);

  const messages = [];
  if (accessList.length > 0) {
    messages.push(
      `${accessList.length} ${
        accessList.length == 1 ? 'consumer has' : 'consumers have'
      } access to products in this namespace.`
    );
  }
  if (gwServices.length > 0) {
    messages.push(
      `${gwServices.length} ${
        gwServices.length == 1 ? 'service has' : 'services have'
      } been configured in this namespace.`
    );
  }

  assert.strictEqual(
    gwServices.length == 0 && accessList.length == 0,
    true,
    messages.join('  ')
  );
};

export const DeleteNamespaceRecordActivity = async (
  context: any,
  ns: string
): Promise<{ id: string }> => {
  logger.debug('Record Activity for Deleting Namespace ns=%s', ns);

  const envs = await lookupEnvironmentsByNS(context, ns);

  const ids = envs.map((e: Environment) => e.id);

  const accessList = await lookupServiceAccessesByEnvironment(context, ns, ids);

  const r = await recordActivityWithBlob(
    context.sudo(),
    'delete',
    'Namespace',
    ns,
    `Deleted ${ns} namespace`,
    'pending',
    undefined,
    { access: accessList }
  );
  return r;
};

export const DeleteNamespace = async (context: any, ns: string) => {
  logger.debug('Deleting Namespace ns=%s', ns);

  const gwServices = await lookupServicesByNamespace(context, ns);

  const envs = await lookupEnvironmentsByNS(context, ns);

  const ids = envs.map((e: Environment) => e.id);

  assert.strictEqual(
    gwServices.length == 0,
    true,
    `Gateway Services still exist for this namespace.`
  );

  const activity = await DeleteNamespaceRecordActivity(context, ns);

  for (const envId of ids) {
    await deleteRecords(
      context,
      'ServiceAccess',
      { productEnvironment: { id: envId } },
      true,
      ['id']
    );

    await deleteRecords(
      context,
      'AccessRequest',
      { productEnvironment: { id: envId } },
      true,
      ['id']
    );

    await deleteRecords(context, 'Environment', { id: envId }, false, ['id']);
  }

  await deleteRecords(context, 'Product', { namespace: ns }, false, ['id']);

  await updateActivity(context.sudo(), activity.id, 'success', undefined);
};
