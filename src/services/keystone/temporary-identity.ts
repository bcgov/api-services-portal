import { Logger } from '../../logger';
import { scopesToRoles } from '../../auth/scope-role-utils';
import { getUma2FromIssuer } from '../keycloak';
import { UMA2TokenService } from '../uma2';
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

  const roles = JSON.stringify(_roles);

  const noauthContext = context.createContext({
    skipAccessControl: true,
  });

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
  return result.data.allTemporaryIdentities[0];
}
