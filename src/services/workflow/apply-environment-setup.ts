import {
  deleteRecord,
  lookupEnvironmentAndApplicationByAccessRequest,
  lookupCredentialIssuerById,
  markActiveTheServiceAccess,
  markAccessRequestAsNotIssued,
  recordActivity,
  lookupProductEnvironmentServices,
  lookupProductEnvironmentServicesBySlug,
  updateCallbackUrl,
  lookupByIdentityProviderPrefix,
} from '../keystone';
import { strict as assert } from 'assert';
import {
  KeycloakClientRegistrationService,
  KeycloakTokenService,
  KeycloakUserService,
  KeycloakClientService,
  getOpenidFromIssuer,
  OpenidWellKnown,
  ClientRegResponse,
} from '../keycloak';
import { KongConsumerService } from '../kong';
import { FeederService } from '../feeder';
import { AccountLink, NewCredential, RequestControls } from './types';
import { IssuerEnvironmentConfig, getIssuerEnvironmentConfig } from './types';
import { generateCredential } from './generate-credential';
import {
  isUpdatingToIssued,
  isUpdatingToRejected,
  isRequested,
} from './common';
import { Logger } from '../../logger';
import {
  AccessRequest,
  CredentialIssuer,
  Environment,
  GatewayConsumer,
} from '../keystone/types';
import { updateAccessRequestState } from '../keystone';
import { getEnvironmentContext } from './get-namespaces';
import { KeycloakIdPService } from '../keycloak';
import { Keystone } from '@keystonejs/keystone';
import {
  findClient,
  registerClient,
  searchForClient,
} from './client-credentials';
import { IdPDetail } from '../keycloak/identity-providers';
import jwtDecoder from 'jwt-decode';
import FederatedIdentityRepresentation from 'keycloak-admin/lib/defs/federatedIdentityRepresentation';

const logger = Logger('wf.ApplyEnvSetup');

export const ApplyEnvironmentSetup = async (
  context: any,
  prodEnvId: string,
  callbackUrl: string
): Promise<Environment> => {
  logger.debug('[ApplyEnvironmentSetup] We are in!');

  const productEnvironment: Environment = await lookupProductEnvironmentServices(
    context,
    prodEnvId
  );

  await updateCallbackUrl(context, prodEnvId, callbackUrl);

  const issuer: CredentialIssuer = productEnvironment.credentialIssuer;

  const envName = productEnvironment.name;

  const envConfig = getIssuerEnvironmentConfig(issuer, envName);

  logger.debug('[ApplyEnvironmentSetup] %j', envConfig);

  const brokerAlias = `${issuer.identityProviderPrefix}-${envName}`;

  const authzOpenid = await getAuthzOpenid(context);

  // CreateOrUpdate the APS CredentialIssuer Client on the remote IdP (for account linking)
  await createOrUpdateRemoteIdPClient(
    context,
    'idp-account-link',
    brokerAlias,
    {
      callbackUrl: `${authzOpenid.issuer}/*`,
      jwksUrl: authzOpenid.jwks_uri,
    },
    issuer,
    envName
  );

  // CreateOrUpdate the IdP on Authz Keycloak
  // TODO: Use the template
  await createOrUpdateIdentityProvider(
    context,
    'template',
    envConfig,
    brokerAlias
  );

  // CreateOrUpdate the Product Environment Client on the remote IdP
  const clientId = `app-${productEnvironment.appId.toLowerCase()}`;
  const result = await createOrUpdateRemoteIdPClient(
    context,
    'user-public',
    clientId,
    {
      callbackUrl: callbackUrl,
    },
    issuer,
    envName
  );

  // Add the relevant roles to it
  await syncClientRoles(issuer, envConfig, result.client.id);

  // If the Product Environment Client was created, then return the CID/CSC/ISSUER
  const returnedEnvironment: Environment = {
    id: productEnvironment.id,
    flow: productEnvironment.flow,
    callbackUrl,
    services: null,
  };

  if (result.created) {
    const newCreds: NewCredential = {
      flow: 'authorization-code',
    };
    newCreds.issuer = result.openid.issuer;
    newCreds.clientId = result.client.clientId;
    newCreds.clientSecret = result.client.clientSecret;
    returnedEnvironment['credentials'] = JSON.stringify(newCreds);
  } else {
    const newCreds: NewCredential = {
      flow: 'authorization-code',
      clientId: clientId,
      issuer: envConfig.issuerUrl,
    };
    returnedEnvironment['credentials'] = JSON.stringify(newCreds);
  }
  return returnedEnvironment;
};

export async function createOrUpdateIdentityProvider(
  context: Keystone,
  template: string,
  remoteIssuer: IssuerEnvironmentConfig,
  brokerAlias: string
) {
  const prodEnv = await lookupProductEnvironmentServicesBySlug(
    context,
    process.env.GWA_PROD_ENV_SLUG
  );

  const envCtx = await getEnvironmentContext(context, prodEnv.id, {}, true);

  const openid = await getOpenidFromIssuer(remoteIssuer.issuerUrl);
  const idpDetail: IdPDetail = {
    brokerAlias,
    brokerDisplayName: '',
    providerClientId: brokerAlias,
    providerOpenidConfig: openid,
  };

  const svc = new KeycloakIdPService(envCtx.issuerEnvConfig.issuerUrl);
  await svc.login(
    envCtx.issuerEnvConfig.clientId,
    envCtx.issuerEnvConfig.clientSecret
  );

  const existing = await svc.findOne(brokerAlias);
  if (!existing) {
    await svc.createProvider(template, idpDetail);
  }
}

export async function createOrUpdateRemoteIdPClient(
  context: Keystone,
  clientTemplate: string,
  clientId: string,
  controls: RequestControls,
  remoteIssuer: CredentialIssuer,
  env: string
): Promise<{
  created: boolean;
  openid: OpenidWellKnown;
  client: any;
}> {
  const existing = await searchForClient(
    context,
    env,
    remoteIssuer.id,
    clientId
  );

  if (existing.client == null) {
    const newClient = await registerClient(
      context,
      env,
      remoteIssuer.id,
      controls,
      clientId,
      true,
      clientTemplate
    );
    logger.debug('[createOrUpdateRemoteIdPClient] NEW %j', newClient.client);
    return newClient;
  } else {
    logger.debug(
      '[createOrUpdateRemoteIdPClient] EXISTING %j',
      existing.client
    );
    return existing;
  }
}

export async function getAccountLinkUrl(
  context: Keystone,
  prodEnvId: string,
  callbackUrl: string
): Promise<AccountLink> {
  const prodEnv = await lookupProductEnvironmentServicesBySlug(
    context,
    process.env.GWA_PROD_ENV_SLUG
  );

  const envCtx = await getEnvironmentContext(context, prodEnv.id, {}, false);

  const svc = new KeycloakIdPService(envCtx.issuerEnvConfig.issuerUrl);
  await svc.login(
    envCtx.issuerEnvConfig.clientId,
    envCtx.issuerEnvConfig.clientSecret
  );

  const { brokerAlias, issuerUrl } = await lookupBrokerAlias(
    context,
    prodEnvId
  );

  //logger.debug('[getAccountLinkUrl] %j', envCtx);

  const jwt: any = jwtDecoder(envCtx.subjectToken);

  logger.debug('[getAccountLinkUrl] %j %s', jwt, envCtx.subjectUuid);

  const linkingUrl = svc.buildAccountLinkUrl(
    envCtx.issuerEnvConfig.issuerUrl,
    brokerAlias,
    jwt,
    callbackUrl
  );

  const federatedIdentities: FederatedIdentityRepresentation[] = await svc.listFederatedIdentitiesForUser(
    jwt.sub
  );

  return {
    environmentName: prodEnv.name,
    productName: prodEnv.product.name,
    issuerUrl: issuerUrl,
    brokerAlias,
    linkedIdentities: federatedIdentities.filter(
      (f) => f.identityProvider === brokerAlias
    ),
    linkingUrl,
  } as AccountLink;
}

export async function getAllUserAccountLinks(
  context: Keystone,
  callbackUrl: string
): Promise<AccountLink[]> {
  const prodEnv = await lookupProductEnvironmentServicesBySlug(
    context,
    process.env.GWA_PROD_ENV_SLUG
  );

  const envCtx = await getEnvironmentContext(context, prodEnv.id, {}, false);

  const svc = new KeycloakIdPService(envCtx.issuerEnvConfig.issuerUrl);
  await svc.login(
    envCtx.issuerEnvConfig.clientId,
    envCtx.issuerEnvConfig.clientSecret
  );

  const jwt: any = jwtDecoder(envCtx.subjectToken);

  const federatedIdentities: FederatedIdentityRepresentation[] = await svc.listFederatedIdentitiesForUser(
    jwt.sub
  );

  const issuers = await lookupByIdentityProviderPrefix(
    context,
    federatedIdentities.map((f) =>
      f.identityProvider.substring(0, f.identityProvider.lastIndexOf('-'))
    )
  );

  return federatedIdentities.map((id) => {
    const brokerAlias = id.identityProvider;
    const identityProviderPrefix = id.identityProvider.substring(
      0,
      id.identityProvider.lastIndexOf('-')
    );
    const envName = id.identityProvider.substring(
      id.identityProvider.lastIndexOf('-') + 1
    );

    const issuer = issuers
      .filter((i) => i.identityProviderPrefix === identityProviderPrefix)
      .pop();

    const envDetails: IssuerEnvironmentConfig[] = JSON.parse(
      issuer.environmentDetails
    );

    const matchedEnv = envDetails
      .filter((e) => e.environment === envName)
      .pop();

    const linkingUrl = svc.buildAccountLinkUrl(
      envCtx.issuerEnvConfig.issuerUrl,
      brokerAlias,
      jwt,
      callbackUrl
    );

    return {
      environmentName: prodEnv.name,
      productName: prodEnv.product.name,
      issuerUrl: matchedEnv.issuerUrl,
      brokerAlias,
      linkedIdentities: federatedIdentities
        .filter((f) => f.identityProvider === brokerAlias)
        .map((f) => f.userName),
      linkingUrl,
    } as AccountLink;
  });
}

async function getAuthzOpenid(context: Keystone): Promise<OpenidWellKnown> {
  const prodEnv = await lookupProductEnvironmentServicesBySlug(
    context,
    process.env.GWA_PROD_ENV_SLUG
  );

  const envCtx = await getEnvironmentContext(context, prodEnv.id, {}, true);

  const openid = await getOpenidFromIssuer(envCtx.issuerEnvConfig.issuerUrl);

  return openid;
}

async function lookupBrokerAlias(
  context: Keystone,
  prodEnvId: string
): Promise<{ brokerAlias: string; issuerUrl: string }> {
  const productEnvironment: Environment = await lookupProductEnvironmentServices(
    context,
    prodEnvId
  );

  const issuer: CredentialIssuer = productEnvironment.credentialIssuer;

  const envName = productEnvironment.name;

  const envConfig = getIssuerEnvironmentConfig(issuer, envName);

  logger.debug('[lookupBrokerAlias] %j', envConfig);

  const brokerAlias = `${issuer.identityProviderPrefix}-${envName}`;

  return {
    brokerAlias,
    issuerUrl: envConfig.issuerUrl,
  };
}

export async function syncClientRoles(
  issuer: CredentialIssuer,
  issuerEnvConfig: IssuerEnvironmentConfig,
  clientUuid: string
) {
  const kcClientService = new KeycloakClientService(
    issuerEnvConfig.issuerUrl,
    null
  );

  await kcClientService.login(
    issuerEnvConfig.clientId,
    issuerEnvConfig.clientSecret
  );

  const desired: string[] = issuer.clientRoles
    ? JSON.parse(issuer.clientRoles)
    : [];

  logger.debug('[syncClientRoles] %s %j', clientUuid, desired);

  const existing = await kcClientService.listRoles(clientUuid);

  const additions = desired.filter(
    (roleName) => existing.filter((role) => role.name === roleName).length == 0
  );
  const deletions = existing
    .filter(
      (role) => desired.filter((roleName) => role.name === roleName).length == 0
    )
    .map((role) => role.name);

  await kcClientService.syncRoles(clientUuid, additions, deletions);
}

// async function syncClientRoles(context: Keystone, issuer: CredentialIssuer, issuerEnvConfig: IssuerEnvironmentConfig, clientUuid: string) {
//   const kcUserService = new KeycloakUserService(
//     issuerEnvConfig.issuerUrl,
//   );

//   const kcClientService = new KeycloakClientService(
//     issuerEnvConfig.issuerUrl,
//     null
//   );

//   await kcUserService.login(
//     issuerEnvConfig.clientId,
//     issuerEnvConfig.clientSecret
//   );

//   await kcClientService.login(
//     issuerEnvConfig.clientId,
//     issuerEnvConfig.clientSecret
//   );

//   const userId = await kcClientService.lookupServiceAccountUserId(
//     clientUuid
//   );

//   await kcUserService.syncUserClientRoles(
//     userId,
//     client.id,
//     args.grant ? selectedRole : [],
//     args.grant ? [] : selectedRole
//   );

// }
