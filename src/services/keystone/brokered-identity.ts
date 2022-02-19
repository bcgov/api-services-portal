import { Logger } from '../../logger';
import {
  Application,
  BrokeredIdentity,
  BrokeredIdentityCreateInput,
} from './types';

const logger = Logger('keystone.brokeredIdentity');

export async function lookupBrokeredIdentities(
  context: any,
  owner: string
): Promise<BrokeredIdentity[]> {
  const result = await context.executeGraphQL({
    query: `query GetBrokeredIdentity($owner: ID!) {
                    allBrokeredIdentities(where: {owner: {id: $id}}) {
                        id
                        issuerUrl
                        providerAlias
                        userId
                        username
                    }
                }`,
    variables: { owner },
  });
  logger.debug('[lookupBrokeredIdentity] result %j', result);
  return result.data.allBrokeredIdentities;
}

export async function createBrokeredIdentity(
  context: any,
  brokeredIdentity: BrokeredIdentityCreateInput
): Promise<BrokeredIdentity[]> {
  logger.debug('[createBrokeredIdentity] create %j', brokeredIdentity);
  const result = await context.executeGraphQL({
    query: `mutation ($data: BrokeredIdentityCreateInput) {
                    createBrokeredIdentity(data: $data) {
                        issuerUrl
                        providerAlias
                        userId
                        username
                    }
                }`,
    variables: { data: brokeredIdentity },
  });
  if ('errors' in result) {
    logger.error('[createBrokeredIdentity] result %j', result);
  } else {
    logger.debug('[createBrokeredIdentity] result %j', result);
  }
  return 'errors' in result ? null : result.data.createBrokeredIdentity;
}
