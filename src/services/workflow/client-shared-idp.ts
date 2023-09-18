import { lookupCredentialIssuerById } from '../keystone';
import {
  KeycloakClientRegistrationService,
  KeycloakTokenService,
  getOpenidFromIssuer,
  KeycloakClientService,
  OpenidWellKnown,
} from '../keycloak';
import { v4 as uuidv4 } from 'uuid';
import { strict as assert } from 'assert';
import { CredentialIssuer } from '../keystone/types';
import {
  IssuerEnvironmentConfig,
  RequestControls,
  getAllIssuerEnvironmentConfigs,
} from './types';
import { ClientAuthenticator } from '../keycloak/client-registration-service';
import { ClientRegResponse } from '../uma2';
import { Logger } from '../../logger';
import { KeycloakClientRolesService } from '../keycloak/client-roles';

const logger = Logger('wf.SharedIdP');

/**
 * When a new CredentialIssuer is created where the inheritFrom is set
 * then call this to reserve the client ID on the shared IdP
 *
 * @param context
 * @param credentialIssuerPK
 */
export async function addClientsToSharedIdP(
  context: any,
  namespace: string,
  profileClientId: string,
  inheritFromIssuerPK: string
) {
  // Find the credential issuer and based on its type, go do the appropriate action
  const inheritFromIssuer: CredentialIssuer = await lookupCredentialIssuerById(
    context,
    inheritFromIssuerPK
  );

  assert.strictEqual(
    inheritFromIssuer.isShared,
    true,
    'Invalid IdP for Sharing'
  );

  const envConfigs = getAllIssuerEnvironmentConfigs(inheritFromIssuer);

  const controls: RequestControls = {};
  const authenticator = ClientAuthenticator.SharedIdP;

  for (const issuerEnvConfig of envConfigs) {
    await addClientToSharedIdP(
      namespace,
      profileClientId,
      issuerEnvConfig,
      authenticator,
      controls
    );
  }
}

/**
 * @param namespace
 * @param profileClientId
 * @param issuerEnvConfig
 * @param clientAuthenticator
 * @param controls
 * @returns
 */
async function addClientToSharedIdP(
  namespace: string,
  profileClientId: string,
  issuerEnvConfig: IssuerEnvironmentConfig,
  clientAuthenticator: ClientAuthenticator,
  controls: RequestControls
): Promise<{ openid: OpenidWellKnown; client: ClientRegResponse }> {
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

  const environment = issuerEnvConfig.environment;

  const clientId = genClientId(environment, profileClientId);

  // If there are any custom client Mappers, then include them
  const clientMappers: any[] = [];

  const baseUrl = `${process.env.EXTERNAL_URL}/ext/${clientAuthenticator}/ns/${namespace}/client/${clientId}`;

  // Find the Client ID for the ProductEnvironment - that will be used to associated the clientRoles

  const cliApi = await new KeycloakClientService(issuerEnvConfig.issuerUrl);
  await cliApi.login(issuerEnvConfig.clientId, issuerEnvConfig.clientSecret);

  const exists = await cliApi.isClient(clientId);
  assert.strictEqual(exists, false, 'Client already exists');

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
 * When a CredentialIssuer is deleted where the inheritFrom is set
 * then call this to delete the client ID on the shared IdP
 *
 * @param context
 * @param credentialIssuerPK
 */
export async function DeleteClientsFromSharedIdP(
  context: any,
  profileClientId: string,
  inheritFromIssuerPK: string
) {
  // Find the credential issuer and based on its type, go do the appropriate action
  const inheritFromIssuer: CredentialIssuer = await lookupCredentialIssuerById(
    context,
    inheritFromIssuerPK
  );

  assert.strictEqual(
    inheritFromIssuer.isShared,
    true,
    'Invalid IdP for Sharing'
  );

  const envConfigs = getAllIssuerEnvironmentConfigs(inheritFromIssuer);

  for (const issuerEnvConfig of envConfigs) {
    await deleteClientFromSharedIdP(profileClientId, issuerEnvConfig);
  }
}

async function deleteClientFromSharedIdP(
  profileClientId: string,
  issuerEnvConfig: IssuerEnvironmentConfig
): Promise<void> {
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

  const environment = issuerEnvConfig.environment;

  const clientId = genClientId(environment, profileClientId);

  // Find the Client ID for the ProductEnvironment - that will be used to associated the clientRoles

  const cliApi = await new KeycloakClientService(issuerEnvConfig.issuerUrl);
  await cliApi.login(issuerEnvConfig.clientId, issuerEnvConfig.clientSecret);

  const exists = await cliApi.isClient(clientId);

  if (exists) {
    const client = await cliApi.findByClientId(clientId);
    assert.strictEqual(client.clientId, clientId);

    await cliApi.deleteClient(client.id);
  }
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

  for (const issuerEnvConfig of envConfigs) {
    const cliApi = await new KeycloakClientService(issuerEnvConfig.issuerUrl);
    await cliApi.login(issuerEnvConfig.clientId, issuerEnvConfig.clientSecret);

    const cliRoleApi = await new KeycloakClientRolesService(
      issuerEnvConfig.issuerUrl
    );

    await cliRoleApi.login(
      issuerEnvConfig.clientId,
      issuerEnvConfig.clientSecret
    );

    const environment = issuerEnvConfig.environment;

    const clientId = genClientId(environment, issuer.clientId);

    const client = await cliApi.findByClientId(clientId);

    await cliRoleApi.syncRoles(
      client.id,
      issuer.clientRoles ? JSON.parse(issuer.clientRoles) : []
    );
  }
}

export function genClientId(env: string, clientId: string) {
  return env === 'prod' ? `ap-${clientId}` : `ap-${clientId}-${env}`;
}
