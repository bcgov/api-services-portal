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
  if (result.errors) {
    logger.error('[getOrganizations] errors %j', result.errors);
    throw new Error('Failed to get organizations');
  }
  return result.data?.allOrganizations ?? [];
}

export async function getOrganizationUnit(
  context: any,
  unit: string
): Promise<Organization> {
  if (!unit) {
    logger.warn('[getOrganizationUnit] called with undefined unit, returning null');
    return null;
  }
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
  if (result.errors) {
    logger.error('[getOrganizationUnit] %s - errors %j', unit, result.errors);
    throw new Error(`Failed to get organization unit: ${unit}`);
  }
  const orgs = result.data?.allOrganizations ?? [];
  return orgs.length === 0 ? null : orgs[0];
}
