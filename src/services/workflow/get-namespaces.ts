import {
  KeycloakTokenService,
  KeycloakClientService,
  getOpenidFromIssuer,
  getUma2FromIssuer,
  OpenidWellKnown,
  Uma2WellKnown,
} from '../keycloak';
import {
  ResourceScope,
  ResourceSet,
  UMA2TokenService,
  UMAPermissionService,
  UMAResourceRegistrationService,
} from '../uma2';
import { strict as assert } from 'assert';
import { Environment, EnvironmentWhereInput } from '../keystone/types';
import { mergeWhereClause } from '@keystonejs/utils';
import {
  IssuerEnvironmentConfig,
  getIssuerEnvironmentConfig,
  checkIssuerEnvironmentConfig,
} from '../workflow/types';

import {
  lookupProductEnvironmentServicesBySlug,
  lookupEnvironmentAndIssuerById,
  lookupEnvironmentAndIssuerUsingWhereClause,
} from '../keystone';

import getSubjectToken from '../../auth/auth-token';

import { Logger } from '../../logger';

const logger = Logger('wf.getns');

export async function getGwaProductEnvironment(
  context: any,
  withSubject: boolean
): Promise<EnvironmentContext> {
  const prodEnvId = await getProductEnvironmentIdBySlug(
    context,
    process.env.GWA_PROD_ENV_SLUG
  );

  return getEnvironmentContext(context, prodEnvId, {}, withSubject);
}

export async function getMyNamespaces(
  envCtx: EnvironmentContext
): Promise<NamespaceSummary[]> {
  const resourceIds = await getNamespaceResourceSets(envCtx);
  const resourcesApi = new UMAResourceRegistrationService(
    envCtx.uma2.resource_registration_endpoint,
    envCtx.accessToken
  );
  const namespaces = await resourcesApi.listResourcesByIdList(resourceIds);

  return namespaces.map((ns: ResourceSet) => ({
    id: ns.id,
    name: ns.name,
    scopes: ns.resource_scopes,
    prodEnvId: envCtx.prodEnv.id,
  }));
}

export async function getEnvironmentContext(
  context: any,
  prodEnvId: string,
  access: any,
  withSubject: boolean
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
  const subjectToken = withSubject ? getSubjectToken(context.req) : null;
  const subjectUuid = withSubject ? context.req.user.sub : null;

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

async function getNamespaceResourceSets(envCtx: EnvironmentContext) {
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

export async function getResourceServerContext(
  prodEnv: Environment
): Promise<ResourceServerContext> {
  if (!prodEnv.credentialIssuer) {
    logger.debug(
      '[getResourceServerContext] Credential Issuer Undefined! %j',
      prodEnv
    );
    return null;
  }
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

  return {
    prodEnv,
    issuerEnvConfig,
    openid,
    usesUma2,
    uma2,
  };
}

async function getProductEnvironmentIdBySlug(context: any, slug: string) {
  const noauthContext = context.createContext({
    skipAccessControl: true,
  });
  const prodEnv = await lookupProductEnvironmentServicesBySlug(
    noauthContext,
    slug
  );
  return prodEnv.id;
}

function isUserBasedResourceOwners(envCtx: EnvironmentContext): Boolean {
  return (
    envCtx.prodEnv.credentialIssuer.resourceAccessScope == null ||
    envCtx.prodEnv.credentialIssuer.resourceAccessScope === ''
  );
}

function isAuthzUsingUma2(prodEnv: Environment): boolean {
  return (
    (prodEnv.credentialIssuer.resourceType == null ||
      prodEnv.credentialIssuer.resourceType === '') == false
  );
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

export interface ResourceServerContext {
  prodEnv: Environment;
  issuerEnvConfig: IssuerEnvironmentConfig;
  openid: OpenidWellKnown;
  uma2: Uma2WellKnown;
  usesUma2: boolean;
  accessToken?: string;
}
export interface NamespaceSummary {
  id: string;
  name: string;
  scopes: ResourceScope[];
  prodEnvId: string;
}
