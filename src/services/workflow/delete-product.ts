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

const logger = Logger('wf.DeleteProduct');

export const DeleteProductValidate = async (
  context: any,
  ns: string,
  id: string
): Promise<void> => {
  logger.debug('Validate Deleting Product ns=%s, id=%s', ns, id);

  const product = await lookupProduct(context, ns, id);
  logger.error('Product %j', product);

  const ids = product.environments.map((e: Environment) => e.id);

  const accessList = await lookupServiceAccessesByEnvironment(context, ns, ids);

  assert.strictEqual(
    accessList.length == 0,
    true,
    `${accessList.length} ${
      accessList.length == 1 ? 'consumer has' : 'consumers have'
    } access to this product.`
  );
};

export const DeleteProductEnvironments = async (
  context: any,
  ns: string,
  id: string
) => {
  logger.debug('Deleting Product ns=%s, id=%s', ns, id);

  const product = await lookupProduct(context, ns, id);
  logger.error('Product %j', product);

  const ids = product.environments.map((e: Environment) => e.id);

  for (const envId of ids) {
    await deleteRecords(context, 'Environment', { id: envId }, false, ['id']);
  }
};
