import { strict as assert } from 'assert';

import {
  deleteRecord,
  deleteRecords,
  lookupCredentialReferenceByServiceAccess,
  lookupCredentialIssuerById,
  lookupServiceAccessesByEnvironment,
  lookupProduct,
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
import { DeleteEnvironment } from '.';

const logger = Logger('wf.DeleteProduct');

export const DeleteNamespaceValidate = async (
  context: any,
  ns: string,
  id: string,
  force: boolean
): Promise<void> => {
  logger.debug('Validate Deleting Namespace ns=%s', ns);

  const envs = await lookupEnvironmentsByNS(context, ns);
  logger.error('Environments %j', envs);

  const ids = envs.map((e: Environment) => e.id);

  const accessList = await lookupServiceAccessesByEnvironment(context, ns, ids);

  // also lookup Gateway Routes for the Namespace and report on that number

  assert.strictEqual(
    force || accessList.length == 0,
    true,
    `${accessList.length} ${
      accessList.length == 1 ? 'consumer has' : 'consumers have'
    } access to products in this namespace.`
  );
};

export const DeleteNamespace = async (context: any, ns: string) => {
  logger.debug('Deleting Namespace ns=%s', ns);

  const envs = await lookupEnvironmentsByNS(context, ns);

  const ids = envs.map((e: Environment) => e.id);

  for (const envId of ids) {
    await deleteRecords(
      context,
      'ServiceAccess',
      { productEnvironment: { id: envId } },
      true,
      ['id']
    );

    await deleteRecords(context, 'Environment', { id: envId }, false, ['id']);
  }

  await deleteRecords(context, 'Product', { namespace: ns }, false, ['id']);
};
