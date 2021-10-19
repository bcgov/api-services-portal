import {
  KeycloakTokenService,
  KeycloakClientService,
  getOpenidFromIssuer,
  getUma2FromIssuer,
  OpenidWellKnown,
  Uma2WellKnown,
} from '../../services/keycloak';
import {
  IssuerEnvironmentConfig,
  getIssuerEnvironmentConfig,
  checkIssuerEnvironmentConfig,
} from '../../services/workflow/types';
import {
  UMAPermissionService,
  UMA2TokenService,
  UMAResourceRegistrationService,
  ResourceSetQuery,
} from '../../services/uma2';
import { strict as assert } from 'assert';
import { Logger } from '../../logger';
import { Environment, EnvironmentWhereInput } from '@/services/keystone/types';
import { mergeWhereClause } from '@keystonejs/utils';
import getSubjectToken from '../../auth/auth-token';

import {
  lookupEnvironmentAndIssuerById,
  lookupEnvironmentAndIssuerUsingWhereClause,
} from '../../services/keystone';

const logger = Logger('List.Ext.Common');
export interface TokenExchangeResult {
  issuer: string;
  resourceRegistrationEndpoint: string;
  accessToken: string;
  clientUuid?: string;
}

export interface EnvironmentContext {
  subjectToken: string;
  subjectUuid: string;
  prodEnv: Environment;
  issuerEnvConfig: IssuerEnvironmentConfig;
  openid: OpenidWellKnown;
  uma2: Uma2WellKnown;
  usesUma2: boolean;
  accessToken?: string;
}

function isAuthzUsingUma2(prodEnv: {
  credentialIssuer: { resourceType: string };
}): boolean {
  return (
    (prodEnv.credentialIssuer.resourceType == null ||
      prodEnv.credentialIssuer.resourceType === '') == false
  );
}

export function isUserBasedResourceOwners(envCtx: EnvironmentContext): Boolean {
  return (
    envCtx.prodEnv.credentialIssuer.resourceAccessScope == null ||
    envCtx.prodEnv.credentialIssuer.resourceAccessScope === ''
  );
}

export async function getEnvironmentContext(
  context: any,
  prodEnvId: string,
  access: any
): Promise<EnvironmentContext> {
  const noauthContext = context.createContext({ skipAccessControl: true });
  const prodEnv = await lookupEnvironmentAndIssuerUsingWhereClause(
    noauthContext,
    mergeWhereClause(
      { where: { id: prodEnvId } } as EnvironmentWhereInput,
      access
    ).where
  );
  const issuerEnvConfig: IssuerEnvironmentConfig = checkIssuerEnvironmentConfig(
    prodEnv.credentialIssuer,
    prodEnv.name
  );

  if (issuerEnvConfig == null) {
    return null;
  }

  const usesUma2 = isAuthzUsingUma2(prodEnv);
  const openid = await getOpenidFromIssuer(issuerEnvConfig.issuerUrl);
  const uma2 = usesUma2
    ? await getUma2FromIssuer(issuerEnvConfig.issuerUrl)
    : null;
  const subjectToken = getSubjectToken(context.req);
  const subjectUuid = context.req.user.sub;

  return {
    subjectToken,
    subjectUuid,
    prodEnv,
    issuerEnvConfig,
    openid,
    usesUma2,
    uma2,
  };
}

/**
 * There are two scenarios:
 * 1. The Resource Server is the owner for all resources : in this case the Authorization Profile
 *    defines a Resource Access Scope indicating what permission the Subject user must have in order to
 *    act as the Owner and use the Protection API.
 * 2. The Subject user is the owner of the Resources and therefore can use the Subject token to exchange
 *    for a new token that has permission to use the Protection API.
 *
 * @param keystone
 * @param subjectToken
 * @param prodEnvId
 */
export async function getSuitableOwnerToken(
  envctx: EnvironmentContext,
  subjectToken: string,
  prodEnvId: string,
  resourceId: string
): Promise<TokenExchangeResult> {
  logger.debug('[getSuitableOwnerToken] for %s', prodEnvId);
  const resourceAccessScope =
    envctx.prodEnv.credentialIssuer.resourceAccessScope;
  const issuerEnvConfig = envctx.issuerEnvConfig;
  const openid = envctx.openid;

  if (isUserBasedResourceOwners(envctx)) {
    // This will imply scenario 2, so proceed with token exchange
    const accessToken = await new KeycloakTokenService(
      openid.token_endpoint
    ).tokenExchange(
      issuerEnvConfig.clientId,
      issuerEnvConfig.clientSecret,
      subjectToken
    );
    logger.debug(
      '[getSuitableOwnerToken] returned exchanged token %s',
      accessToken.substr(0, 10)
    );
    return { issuer: openid.issuer, accessToken } as TokenExchangeResult;
  } else {
    // This will imply scenario 1, so verify the user is allowed to manage the particular Resource
    // and proceed with getting a token using the Resource Server credentials
    const resSvrAccessToken = await new KeycloakTokenService(
      openid.token_endpoint
    ).getKeycloakSession(
      issuerEnvConfig.clientId,
      issuerEnvConfig.clientSecret
    );
    const permApi = new UMAPermissionService(
      envctx.uma2.permission_endpoint,
      resSvrAccessToken
    );
    const permTicket = await permApi.requestTicket([
      { resource_scopes: [resourceAccessScope] },
    ]);
    const tokenApi = new UMA2TokenService(envctx.uma2.token_endpoint);
    const allowedResources = await tokenApi.getPermittedResourcesUsingTicket(
      subjectToken,
      permTicket
    );
    assert.strictEqual(
      allowedResources.filter((res) => res.rsid === resourceId).length == 0,
      false,
      'Permission Denied'
    );

    // Subject user is allowed to manage this user like an Owner, so return the Resource Server token
    const kcClientService = new KeycloakClientService(openid.issuer);
    await kcClientService.login(
      issuerEnvConfig.clientId,
      issuerEnvConfig.clientSecret
    );
    const client = await kcClientService.findByClientId(
      issuerEnvConfig.clientId
    );

    const issuer = openid.issuer;
    const clientUuid = client.id;

    logger.debug(
      '[getSuitableOwnerToken] returned res-svr token %s',
      resSvrAccessToken.substr(0, 10)
    );
    return {
      issuer,
      accessToken: resSvrAccessToken,
      clientUuid,
    } as TokenExchangeResult;
  }
}

// export async function doTokenExchangeForCredentialIssuer (keystone: any, subjectToken: string, prodEnvId: string) : Promise<TokenExchangeResult> {
//     logger.debug("doTokenExchangeForCredentialIssuer for %s", prodEnvId)
//     const noauthContext =  keystone.createContext({ skipAccessControl: true })
//     const prodEnv = await lookupEnvironmentAndIssuerById(noauthContext, prodEnvId)
//     const issuerEnvConfig: IssuerEnvironmentConfig = getIssuerEnvironmentConfig(prodEnv.credentialIssuer, prodEnv.name)

//     const openid = await getOpenidFromIssuer (issuerEnvConfig.issuerUrl)

//     const issuer = openid.issuer
//     const accessToken = await new KeycloakTokenService(openid.issuer).tokenExchange (issuerEnvConfig.clientId, issuerEnvConfig.clientSecret, subjectToken)
//     logger.debug("doTokenExchangeForCredentialIssuer returned ok %s", prodEnvId)
//     return {issuer, accessToken} as TokenExchangeResult
// }

export async function doClientLoginForCredentialIssuer(
  keystone: any,
  prodEnvId: string
): Promise<TokenExchangeResult> {
  logger.debug('doClientLoginForCredentialIssuer for %s', prodEnvId);
  const noauthContext = keystone.createContext({ skipAccessControl: true });
  const prodEnv = await lookupEnvironmentAndIssuerById(
    noauthContext,
    prodEnvId
  );
  const issuerEnvConfig: IssuerEnvironmentConfig = getIssuerEnvironmentConfig(
    prodEnv.credentialIssuer,
    prodEnv.name
  );

  //const openid = await getOpenidFromIssuer(issuerEnvConfig.issuerUrl);
  const uma2 = await getUma2FromIssuer(issuerEnvConfig.issuerUrl);

  const kcClientService = new KeycloakClientService(uma2.issuer);
  await kcClientService.login(
    issuerEnvConfig.clientId,
    issuerEnvConfig.clientSecret
  );
  const client = await kcClientService.findByClientId(issuerEnvConfig.clientId);

  const issuer = uma2.issuer;
  const resourceRegistrationEndpoint = uma2.resource_registration_endpoint;
  const clientUuid = client.id;
  const accessToken = await new KeycloakTokenService(
    uma2.token_endpoint
  ).getKeycloakSession(issuerEnvConfig.clientId, issuerEnvConfig.clientSecret);
  logger.debug('doClientLoginForCredentialIssuer returned ok %s', prodEnvId);
  return {
    issuer,
    resourceRegistrationEndpoint,
    accessToken,
    clientUuid,
  } as TokenExchangeResult;
}

export async function getResourceSets(envCtx: EnvironmentContext) {
  logger.debug('[getResourceSets] for %s', envCtx.prodEnv.id);

  if (isUserBasedResourceOwners(envCtx)) {
    const issuerEnvConfig = envCtx.issuerEnvConfig;
    const accessToken = await new KeycloakTokenService(
      envCtx.openid.token_endpoint
    ).tokenExchange(
      issuerEnvConfig.clientId,
      issuerEnvConfig.clientSecret,
      envCtx.subjectToken
    );
    envCtx.accessToken = accessToken;
    const resourcesApi = new UMAResourceRegistrationService(
      envCtx.uma2.resource_registration_endpoint,
      accessToken
    );
    const subjectOwnedResourceIds = await resourcesApi.listResources({
      owner: envCtx.subjectUuid,
    } as ResourceSetQuery);
    logger.debug(
      '[getResourceSets] (UserBased) RETURN %j',
      subjectOwnedResourceIds
    );
    return subjectOwnedResourceIds;
  } else {
    const issuerEnvConfig = envCtx.issuerEnvConfig;
    const resourceAccessScope =
      envCtx.prodEnv.credentialIssuer.resourceAccessScope;
    const resSvrAccessToken = await new KeycloakTokenService(
      envCtx.openid.token_endpoint
    ).getKeycloakSession(
      issuerEnvConfig.clientId,
      issuerEnvConfig.clientSecret
    );
    envCtx.accessToken = resSvrAccessToken;
    const permApi = new UMAPermissionService(
      envCtx.uma2.permission_endpoint,
      resSvrAccessToken
    );
    const permTicket = await permApi.requestTicket([
      { resource_scopes: [resourceAccessScope] },
    ]);
    const tokenApi = new UMA2TokenService(envCtx.uma2.token_endpoint);
    const allowedResources = await tokenApi.getPermittedResourcesUsingTicket(
      envCtx.subjectToken,
      permTicket
    );
    logger.debug('[getResourceSets] (ResSvrBased) RETURN %j', allowedResources);
    return allowedResources.map((res) => res.rsid);
  }
}

export async function getNamespaceResourceSets(envCtx: EnvironmentContext) {
  logger.debug('[getNamespaceResourceSets] for %s', envCtx.prodEnv.id);

  assert.strictEqual(
    isUserBasedResourceOwners(envCtx),
    false,
    'User-based resource owner is not supposed to be used for namespaces!'
  );

  const issuerEnvConfig = envCtx.issuerEnvConfig;
  //const resourceAccessScope =
  //  envCtx.prodEnv.credentialIssuer.resourceAccessScope;
  const resSvrAccessToken = await new KeycloakTokenService(
    envCtx.openid.token_endpoint
  ).getKeycloakSession(issuerEnvConfig.clientId, issuerEnvConfig.clientSecret);
  envCtx.accessToken = resSvrAccessToken;
  const permApi = new UMAPermissionService(
    envCtx.uma2.permission_endpoint,
    resSvrAccessToken
  );
  const permTicket = await permApi.requestTicket([
    {
      resource_scopes: [
        'Namespace.View',
        'Namespace.Manage',
        'CredentialIssuer.Admin',
        'Access.Manage',
      ],
    },
  ]);
  const tokenApi = new UMA2TokenService(envCtx.uma2.token_endpoint);
  const allowedResources = await tokenApi.getPermittedResourcesUsingTicket(
    envCtx.subjectToken,
    permTicket
  );
  logger.debug(
    '[getNamespaceResourceSets] (ResSvrBased) RETURN %j',
    allowedResources
  );
  return allowedResources.map((res) => res.rsid);
}
