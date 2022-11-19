import { lookupCredentialIssuerById, lookupSharedIssuers } from '../keystone';
import {
  KeycloakClientRegistrationService,
  KeycloakTokenService,
  getOpenidFromIssuer,
  KeycloakClientService,
} from '../keycloak';
import { v4 as uuidv4 } from 'uuid';
import { strict as assert } from 'assert';
import { CredentialIssuer } from '../keystone/types';
import {
  IssuerEnvironmentConfig,
  getIssuerEnvironmentConfig,
  RequestControls,
  getAllIssuerEnvironmentConfigs,
} from './types';
import { ClientAuthenticator } from '../keycloak/client-registration-service';

export async function syncClient(
  context: any,
  environment: string,
  clientAuthenticator: ClientAuthenticator,
  credentialIssuerPK: string,
  controls: RequestControls
) {
  // Find the credential issuer and based on its type, go do the appropriate action
  const issuer: CredentialIssuer = await lookupCredentialIssuerById(
    context,
    credentialIssuerPK
  );

  const issuerEnvConfig: IssuerEnvironmentConfig = getIssuerEnvironmentConfig(
    issuer,
    environment
  );

  const openid = await getOpenidFromIssuer(issuerEnvConfig.issuerUrl);

  // token is NULL if 'iat'
  // token is retrieved from doing a /token login using the provided client ID and secret if 'managed'
  // issuer.initialAccessToken if 'iat'
  const kctoksvc = new KeycloakTokenService(openid.token_endpoint);

  const token =
    issuerEnvConfig.clientRegistration == 'anonymous'
      ? null
      : issuerEnvConfig.clientRegistration == 'managed'
      ? await kctoksvc.getKeycloakSession(
          issuerEnvConfig.clientId,
          issuerEnvConfig.clientSecret
        )
      : issuerEnvConfig.initialAccessToken;

  // If there are any custom client Mappers, then include them
  const clientMappers =
    issuer.clientMappers == null ? [] : JSON.parse(issuer.clientMappers);

  const clientId =
    environment == 'prod'
      ? issuer.clientId
      : `${issuer.clientId}-${environment}`;

  const baseUrl = `${process.env.EXTERNAL_URL}/ext/${clientAuthenticator}/ns/${issuer.namespace}/client/${clientId}`;

  // Find the Client ID for the ProductEnvironment - that will be used to associated the clientRoles

  // lookup Application and use the ID to make sure a corresponding Consumer exists (1 -- 1)
  const client = await new KeycloakClientRegistrationService(
    issuerEnvConfig.issuerUrl,
    openid.registration_endpoint,
    token
  ).clientRegistration(
    clientAuthenticator,
    clientId,
    uuidv4(),
    controls.clientCertificate,
    controls.jwksUrl,
    clientMappers,
    true,
    baseUrl
  );
  assert.strictEqual(client.clientId, clientId);

  return {
    openid,
    client,
  };
}

/**
 * Whenever the CredentialIssuer is updated, and inheritFrom is set,
 * then sync the Roles and Authz settings in the Client Registration
 * @param context
 * @param credentialIssuerPK
 */
export async function syncSharedIdp(context: any, credentialIssuerPK: string) {
  const issuer: CredentialIssuer = await lookupCredentialIssuerById(
    context,
    credentialIssuerPK
  );

  const envConfigs = getAllIssuerEnvironmentConfigs(issuer);

  function updateClient(config: IssuerEnvironmentConfig) {
    // get the Client in the remote IdP
    // sync Roles
  }
}

/**
 * Get all the shared CredentialIssuers and return the environmentDetails
 *
 * @param context
 */
export async function previewSharedIdPs(context: any, clientId: string) {
  const shared = await lookupSharedIssuers(context);
}
