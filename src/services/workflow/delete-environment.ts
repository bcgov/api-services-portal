import { strict as assert } from 'assert';

import {
  deleteRecord,
  deleteRecords,
  lookupCredentialReferenceByServiceAccess,
  lookupCredentialIssuerById,
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

const logger = Logger('wf.DeleteEnvironment');

export const DeleteEnvironment = async (
  context: any,
  operation: any,
  keys: any
) => {
  logger.debug('Deleting Service Accesses for Environment %j', keys);

  const environmentId = keys.environmentId;

  await deleteRecords(
    context,
    'ServiceAccess',
    { productEnvironment: { id: environmentId } },
    true,
    ['id']
  );
};
