const { lookupCredentialIssuerById, addKongConsumer } = require('../keystone');

import {
  KeycloakClientRegistrationService,
  KeycloakClientService,
  KeycloakTokenService,
  getOpenidFromIssuer,
} from '../keycloak';

import { v4 as uuidv4 } from 'uuid';

import { strict as assert } from 'assert';

import { CredentialIssuer } from '../keystone/types';
import {
  IssuerEnvironmentConfig,
  getIssuerEnvironmentConfig,
  RequestControls,
} from './types';
import { ClientAuthenticator } from '../keycloak/client-registration-service';

/**
 * Steps:
 * - create the Client in the idP
 * - create the corresponding Consumer in Kong
 * - sync the Kong Consumer in KeystoneJS
 *
 * @param {*} credentialIssuerPK
 * @param {*} newClientId
 */
export async function registerClient(
  context: any,
  environment: string,
  credentialIssuerPK: string,
  controls: RequestControls,
  newClientId: string,
  enabled: boolean = false,
  template: string = undefined,
  extraClientMappers: any[] = []
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

  // Find the Client ID for the ProductEnvironment - that will be used to associated the clientRoles

  // lookup Application and use the ID to make sure a corresponding Consumer exists (1 -- 1)
  const client = await new KeycloakClientRegistrationService(
    issuerEnvConfig.issuerUrl,
    openid.registration_endpoint,
    token
  ).clientRegistration(
    <ClientAuthenticator>issuer.clientAuthenticator,
    newClientId,
    uuidv4(),
    controls.clientCertificate,
    controls.jwksUrl,
    clientMappers.concat(extraClientMappers),
    enabled,
    template,
    controls.callbackUrl
  );
  assert.strictEqual(client.clientId, newClientId);

  return {
    created: true,
    openid,
    client,
  };
}

export async function searchForClient(
  context: any,
  environment: string,
  credentialIssuerPK: string,
  clientId: string
) {
  const { openid, kcClientService } = await loginToRemoteIdP(
    context,
    environment,
    credentialIssuerPK
  );

  const client = await kcClientService.searchForClientId(clientId);

  return {
    created: false,
    openid,
    client,
  };
}

export async function findClient(
  context: any,
  environment: string,
  credentialIssuerPK: string,
  clientId: string
) {
  const { openid, kcClientService } = await loginToRemoteIdP(
    context,
    environment,
    credentialIssuerPK
  );

  const client = await kcClientService.findByClientId(clientId);

  return {
    openid,
    client,
  };
}

export async function loginToRemoteIdP(
  context: any,
  environment: string,
  credentialIssuerPK: string
): Promise<any> {
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
  // openid.issuer and issuerEnvConfig.issuerUrl may be different
  // but for kcClientService we want to use the issuerEnvConfig.issuerUrl
  // openid.issuer will be an externally accessible URL where is `issuerEnvConfig.issuerUrl`
  // could be internal (similar to the openid.token_endpoint and registration_endpoint)
  const kcClientService = new KeycloakClientService(
    issuerEnvConfig.issuerUrl,
    null
  );

  await kcClientService.login(
    issuerEnvConfig.clientId,
    issuerEnvConfig.clientSecret
  );

  return {
    openid,
    kcClientService,
  };
}
