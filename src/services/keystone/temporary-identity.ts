import { Logger } from '../../logger';
import { scopesToRoles } from '../../auth/scope-role-utils';
import { getUma2FromIssuer } from '../keycloak';
import { UMA2TokenService } from '../uma2';
import { strict as assert } from 'assert';
import jwtDecoder from 'jwt-decode';
import { TemporaryIdentity } from './types';

const logger = Logger('keystone.tempid');

export async function switchTo(
  context: any,
  namespace: string,
  subjectToken: string,
  curJti: string,
  newJti: string,
  newIdentityProvider: string
): Promise<boolean> {
  const uma2 = await getUma2FromIssuer(process.env.OIDC_ISSUER);
  const accessToken = await new UMA2TokenService(uma2.token_endpoint)
    .getRequestingPartyToken(
      process.env.GWA_RES_SVR_CLIENT_ID,
      process.env.GWA_RES_SVR_CLIENT_SECRET,
      subjectToken,
      namespace
    )
    .catch((err) => {
      logger.error('Error getting new RPT %s', err);
      throw err;
    });
  try {
    const rpt: any = jwtDecoder(accessToken);
    logger.info(
      '[ns-switch] %s -> %s : %s',
      curJti,
      newJti,
      curJti === newJti ? 'SAME TOKEN' : 'REFRESHED TOKEN!'
    );
    return await assignNamespace(
      context,
      curJti,
      newJti,
      newIdentityProvider,
      rpt['authorization']['permissions'][0]
    );
  } catch (err) {
    logger.error('Error evaluating new access token %s', err);
    throw err;
  }
}

export async function clearNamespace(
  context: any,
  jti: string,
  newJti: string,
  identityProvider: string
): Promise<boolean> {
  return assignNamespace(context, jti, newJti, identityProvider, {
    rsname: null,
    scopes: [],
  });
}

export async function assignNamespace(
  context: any,
  jti: string,
  newJti: string,
  identityProvider: string,
  umaAuthDetails: any
): Promise<boolean> {
  const namespace = umaAuthDetails['rsname'];
  const scopes = umaAuthDetails['scopes'];
  const _roles = scopesToRoles(identityProvider, scopes);

  const noauthContext = context.createContext({
    skipAccessControl: true,
  });

  if (await isSdxViewer(noauthContext, namespace, scopes)) {
    _roles.push('sdx-viewer');
  }

  const roles = JSON.stringify(_roles);

  const ident = await getIdentityByJti(noauthContext, jti);
  let tempId = ident.id;

  const { errors } = await context.executeGraphQL({
    context: noauthContext,
    query: `mutation ($tempId: ID!, $newJti: String, $namespace: String, $roles: String, $scopes: String) {
                  updateTemporaryIdentity(id: $tempId, data: {jti: $newJti, namespace: $namespace, roles: $roles, scopes: $scopes }) {
                      id
              } }`,
    variables: {
      tempId,
      newJti,
      namespace,
      roles,
      scopes: JSON.stringify(scopes),
    },
  });
  if (errors) {
    logger.error('assign_namespace - NO! Something went wrong %j', errors);
  }
  return Boolean(errors) == false;
}

/**
 * Subsystem roles on an SDX subsystem gateway only grant Namespace.View, which
 * does not include the Consumers page. Viewers of an SDX subsystem gateway who
 * can't already manage its consumers get read-only access to them.
 */
export async function isSdxViewer(
  context: any,
  namespace: string,
  scopes: string[]
): Promise<boolean> {
  if (
    !namespace ||
    !scopes.includes('Namespace.View') ||
    scopes.includes('Namespace.Manage') ||
    scopes.includes('Access.Manage')
  ) {
    return false;
  }
  const result = await context.executeGraphQL({
    query: `query GetSubsystemsForNamespace($namespace: String!) {
                  allSubsystems(where: { namespace: $namespace }, first: 1) {
                      id
                  }
              }`,
    variables: { namespace },
  });
  return result.data?.allSubsystems?.length > 0;
}

export async function updateUserProfileDetails(
  context: any,
  jti: string,
  email: string
): Promise<boolean> {
  const noauthContext = context.createContext({
    skipAccessControl: true,
  });

  const ident = await getIdentityByJti(noauthContext, jti);
  let tempId = ident.id;

  const { errors } = await context.executeGraphQL({
    context: noauthContext,
    query: `mutation ($tempId: ID!, $email: String) {
                  updateTemporaryIdentity(id: $tempId, data: {email: $email }) {
                      id
              } }`,
    variables: {
      tempId,
      email,
    },
  });
  if (errors) {
    logger.error('[updateUserProfileDetails] %s %j', jti, errors);
  }
  return Boolean(errors) == false;
}

async function getIdentityByJti(
  context: any,
  jti: string
): Promise<TemporaryIdentity> {
  const result = await context.executeGraphQL({
    query: `query GetIdentityByJti ($jti: String!) {
                  allTemporaryIdentities(where: { jti: $jti }) {
                      id
              } }`,
    variables: {
      jti,
    },
  });
  logger.debug('[getIdentityByJti] %j', result);

  if (result.errors) {
    logger.error('[getIdentityByJti] %s %j', jti, result);
  }
  assert.strictEqual(
    result.data?.allTemporaryIdentities?.length,
    1,
    'Unable to get identity information'
  );

  return result.data.allTemporaryIdentities[0];
}
