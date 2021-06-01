import {
  deleteRecord,
  lookupEnvironmentAndApplicationByAccessRequest,
  lookupCredentialIssuerById,
  markActiveTheServiceAccess,
  markAccessRequestAsNotIssued,
  recordActivity,
} from '../keystone';
import { strict as assert } from 'assert';
import {
  KeycloakClientRegistrationService,
  KeycloakTokenService,
  getOpenidFromIssuer,
} from '../keycloak';
import { KongConsumerService } from '../kong';
import { FeederService } from '../feeder';
import { RequestControls } from './types';
import { IssuerEnvironmentConfig, getIssuerEnvironmentConfig } from './types';
import { generateCredential } from './generate-credential';
import {
  isUpdatingToIssued,
  isUpdatingToRejected,
  isRequested,
} from './common';
import { Logger } from '../../logger';
import { AccessRequest, GatewayConsumer } from '../keystone/types';
import { updateAccessRequestState } from '../keystone';

const logger = Logger('wf.RegenCreds');

interface ScopesAndRolesUpdateInput {
  credentialIssuerId: string;
  environmentName: string;
  consumerUsername: string;
  consumerType: string; // client or user - from the ServiceAccess record
  controls: RequestControls;
}

export const updateScopesAndRoles = async (
  context: any,
  setup: ScopesAndRolesUpdateInput
): Promise<Boolean> => {
  // Find the credential issuer and based on its type, go do the appropriate action
  const issuer = await lookupCredentialIssuerById(
    context,
    setup.credentialIssuerId
  );

  assert.strictEqual(
    issuer != null &&
      ['authorization-code', 'client-credentials'].includes(issuer.flow),
    true,
    `Flow ${issuer.flow} does not support scopes and roles`
  );

  const issuerEnvConfig: IssuerEnvironmentConfig = getIssuerEnvironmentConfig(
    issuer,
    setup.environmentName
  );

  const openid = await getOpenidFromIssuer(issuerEnvConfig.issuerUrl);

  // token is NULL if 'iat'
  // token is retrieved from doing a /token login using the provided client ID and secret if 'managed'
  // issuer.initialAccessToken if 'iat'
  const token =
    issuerEnvConfig.clientRegistration == 'anonymous'
      ? null
      : issuerEnvConfig.clientRegistration == 'managed'
      ? await new KeycloakTokenService(openid.issuer).getKeycloakSession(
          issuerEnvConfig.clientId,
          issuerEnvConfig.clientSecret
        )
      : issuerEnvConfig.initialAccessToken;

  const controls: RequestControls = {
    ...{ defaultClientScopes: [], defaultOptionalScopes: [] },
    ...setup.controls,
  };

  const kcClientService = new KeycloakClientRegistrationService(
    openid.issuer,
    token
  );

  // Only valid for 'managed' client registration
  // const kcadminApi = new KeycloakClientService(baseUrl, realm)
  await kcClientService.login(
    issuerEnvConfig.clientId,
    issuerEnvConfig.clientSecret
  );

  if (setup.consumerType === 'client') {
    // await kcClientService.syncAndApplyClientRoles(
    // await kcClientService.syncAndApplyClientScopes(
    await kcClientService.syncAndApply(
      setup.consumerUsername,
      controls.defaultClientScopes,
      controls.defaultOptionalScopes
    );
  } else {
    // await kcUserService.syncAndApplyUserRoles(
    //   setup.consumerUsername,
    //   controls.roles,
    // );
  }
  return true;
};
