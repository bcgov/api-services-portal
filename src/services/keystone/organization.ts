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

export async function getOrganizationUnit(
  context: any,
  unit: string
): Promise<Organization> {
  const result = await context.executeGraphQL({
    query: `query GetOrganizations($unit: String!) {
                    allOrganizations(where: { orgUnits_some: { name: $unit } } ) {
                        name
                        title
                        description
                        orgUnits(where: { name: $unit }) {
                          name
                          title
                        }
                    }
                }`,
    variables: { unit },
  });
  logger.debug('[getOrganizationUnit] %s - result %j', unit, result);
  return result.data.allOrganizations.length == 0
    ? null
    : result.data.allOrganizations[0];
}
