import { OpenidWellKnown } from '../..';
import { IdPDetail } from '../../identity-providers';

export function IdPAuthzProfileTemplate({
  brokerAlias,
  brokerDisplayName,
  providerClientId,
  providerOpenidConfig,
}: IdPDetail) {
  return {
    alias: brokerAlias,
    displayName: brokerDisplayName,
    providerId: 'keycloak-oidc',
    enabled: true,
    updateProfileFirstLoginMode: 'on',
    trustEmail: false,
    storeToken: false,
    addReadTokenRoleOnCreate: false,
    authenticateByDefault: false,
    linkOnly: true,
    firstBrokerLoginFlowAlias: 'first broker login',
    config: {
      hideOnLoginPage: 'true',
      tokenUrl: providerOpenidConfig.token_endpoint,
      clientId: providerClientId,
      authorizationUrl: providerOpenidConfig.authorization_endpoint,
      clientAuthMethod: 'private_key_jwt',
      syncMode: 'IMPORT',
      clientAssertionSigningAlg: 'RS256',
      issuer: providerOpenidConfig.issuer,
      useJwksUrl: 'true',
      pkceEnabled: true,
      pkceMethod: 'S256',
    },
  };
}
