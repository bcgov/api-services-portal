import { Namespace } from './types';
import { Logger } from '../../logger';

const logger = Logger('keystone.user');

export async function getCurrentNamespace(context: any): Promise<Namespace> {
  const result = await context.executeGraphQL({
    query: `query GetCurrentNamespace {
            currentNamespace {
              id
              name
              scopes {
                name
              }
              prodEnvId
            }
          }`,
  });
  logger.debug('Query [getCurrentNamespace] result %j', result);
  return JSON.parse(result.data);
}
