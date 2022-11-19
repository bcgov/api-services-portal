import { Logger } from '../../logger';
import { IssuerEnvironmentConfig } from '../workflow/types';
import { CredentialIssuer } from './types';

const logger = Logger('keystone.cred-issuer');

export async function lookupSharedIssuers(
  context: any
): Promise<CredentialIssuer[]> {
  const result = await context.executeGraphQL({
    context: context.sudo(),
    query: `query GetSharedIssuers {
                    allCredentialIssuers(where: {isShared: true}) {
                        id
                        name
                        environmentDetails
                    }
                }`,
    variables: {},
  });
  if (result.errors) {
    logger.error('[lookupSharedIssuers] %j', result.errors);
  }
  return result.data.allCredentialIssuers;
}

export async function lookupCredentialIssuerById(
  context: any,
  id: string
): Promise<CredentialIssuer> {
  const result = await context.executeGraphQL({
    query: `query GetCredentialIssuerById($id: ID!) {
                    CredentialIssuer(where: {id: $id}) {
                        id
                        name
                        namespace
                        flow
                        mode
                        clientRegistration
                        clientAuthenticator
                        clientMappers
                        resourceType
                        environmentDetails
                        inheritFrom {
                          environmentDetails
                        }
                        clientId
                        environments {
                          id
                        }
                    }
                }`,
    variables: { id: id },
  });
  if (result.errors) {
    logger.error('[lookupCredentialIssuerById] %j', result.errors);
  }
  return result.data.CredentialIssuer;
}

export function updateEnvironmentDetails(
  origJsonString: string,
  updatesJsonString: string
) {
  const newList: IssuerEnvironmentConfig[] = [];
  const existing: IssuerEnvironmentConfig[] = JSON.parse(origJsonString);
  const updates: IssuerEnvironmentConfig[] = JSON.parse(updatesJsonString);

  // the data received from the browser will have masked records
  // so we want to ignore them and only process new records
  const found: string[] = [];
  updates.forEach((upd: any) => {
    if ('exists' in upd) {
      found.push(upd.environment);
    } else {
      const existingIndex = existing.findIndex((env) => {
        return env.environment === upd.environment;
      });
      // if (existingIndex === -1) {
      //   logger.debug('Adding %s', upd.environment);
      // } else {
      //   logger.debug('Replacing %s', upd.environment);
      // }
      newList.push(upd);
    }
  });
  // handle case where an environment is in existing, but not in updates
  existing
    .filter((env) => found.includes(env.environment) === true)
    .forEach((env) => {
      newList.push(env);
    });
  return JSON.stringify(newList);
}

export function maskEnvironmentDetails(issuer: CredentialIssuer): string {
  const envDetails = JSON.parse(issuer.environmentDetails);
  envDetails.forEach(function (env: IssuerEnvironmentConfig) {
    if (env.clientId || env.clientSecret) {
      env.clientSecret = '****';
    } else if (env.initialAccessToken) {
      env.initialAccessToken = '****';
    }
    env.exists = true;
  });
  return JSON.stringify(envDetails);
}

export function dynamicallySetEnvironmentDetails(
  issuer: CredentialIssuer
): string {
  if (issuer.inheritFrom) {
    logger.debug('[dynamicallySetEnvironmentDetails] %j', issuer.inheritFrom);
    const envConfigs = issuer.inheritFrom.environmentDetails
      ? JSON.parse(issuer.inheritFrom.environmentDetails)
      : [];

    return generateEnvDetails(issuer.clientId, envConfigs);
  } else {
    return maskEnvironmentDetails(issuer);
  }
}

export function generateEnvDetails(
  clientId: string,
  envConfigs: IssuerEnvironmentConfig[]
) {
  const envDetails: IssuerEnvironmentConfig[] = [];

  ['dev', 'test', 'prod', 'sandbox', 'other'].forEach((env) => {
    const sharedEnv = envConfigs
      .filter((i: any) => i.environment === env)
      .pop();
    if (sharedEnv) {
      envDetails.push({
        exists: true,
        environment: env,
        issuerUrl: sharedEnv.issuerUrl,
        clientRegistration: 'shared-idp',
        clientId: env === 'prod' ? clientId : `${clientId}-${env}`,
      });
    }
  });
  return JSON.stringify(envDetails);
}
