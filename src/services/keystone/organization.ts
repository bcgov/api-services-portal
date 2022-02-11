import { Logger } from '../../logger';
import { Organization } from './types';

const logger = Logger('keystone.organization');

export async function getOrganizations(context: any): Promise<Organization[]> {
  const result = await context.executeGraphQL({
    query: `query GetOrganizations {
                    allOrganizations {
                        name
                        title
                        description
                        orgUnits {
                          name
                          title
                        }
                    }
                }`,
    variables: {},
  });
  // logger.debug('[getOrganizations] result %j', result);
  return result.data.allOrganizations;
}
