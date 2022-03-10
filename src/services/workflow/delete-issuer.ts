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

const logger = Logger('wf.DeleteIssuer');

export const DeleteIssuerValidate = async (
  context: any,
  ns: string,
  id: string
): Promise<void> => {
  logger.debug('Validate Deleting Issuer ns=%s, id=%s', ns, id);

  const issuer = await lookupCredentialIssuerById(context, id);

  const ids = issuer.environments.map((e: Environment) => e.id);

  const accessList = await lookupServiceAccessesByEnvironment(context, ns, ids);

  assert.strictEqual(
    accessList.length == 0,
    true,
    `${accessList.length} ${
      accessList.length == 1 ? 'consumer has' : 'consumers have'
    } access using this authorization profile.`
  );
};
