import { Logger } from '../../logger';
import { IssuerEnvironmentConfig } from '../workflow/types';
import { CredentialIssuer } from './types';

const logger = Logger('keystone.cred-issuer');

export async function lookupCredentialIssuerById(
  context: any,
  id: string
): Promise<CredentialIssuer> {
  const result = await context.executeGraphQL({
    query: `query GetCredentialIssuerById($id: ID!) {
                    CredentialIssuer(where: {id: $id}) {
                        id
                        name
                        flow
                        mode
                        clientRegistration
                        clientAuthenticator
                        clientMappers
                        resourceType
                        environmentDetails
                    }
                }`,
    variables: { id: id },
  });
  logger.debug('Query [lookupCredentialIssuerById] result %j', result);
  return result.data.CredentialIssuer;
}

export async function lookupByIdentityProviderPrefix(
  context: any,
  prefixList: string[]
): Promise<CredentialIssuer[]> {
  const result = await context.executeGraphQL({
    query: `query GetCredentialIssuerById($prefixList: [String]!) {
                    allCredentialIssuers(where: {identityProviderPrefix_in: $prefixList}) {
                        id
                        name
                        flow
                        mode
                        clientRegistration
                        clientAuthenticator
                        clientMappers
                        identityProviderPrefix
                        resourceType
                        environmentDetails
                        environments {
                          name
                          product {
                            name
                          }
                        }
                    }
                }`,
    variables: { prefixList },
  });
  logger.debug('Query [lookupByIdentityProviderPrefix] result %j', result);
  return result.data.allCredentialIssuers;
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
      if (existingIndex === -1) {
        logger.debug('Adding %s', upd.environment);
      } else {
        logger.debug('Replacing %s', upd.environment);
      }
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
