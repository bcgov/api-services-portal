import { Logger } from '../../logger';
import { assertAndRaiseValidateError } from '../gateway-patterns/evaluator';
import { Organization } from './types';

const logger = Logger('keystone.organization');

/**
 * @tsoaModel
 *
 */
export interface MemberOrganization {
  memberClass: string;
  memberId: string;
}

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

export async function getOrganization(
  context: any,
  name: string
): Promise<Organization[]> {
  const result = await context.executeGraphQL({
    query: `query GetOrganizations($name: String!) {
                    allOrganizations(where: { name: $name } ) {
                        name
                        title
                        description
                        tags
                    }
                }`,
    variables: { name },
  });
  logger.debug('[getOrganization] result %j', result);
  return result.data.allOrganizations[0];
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

export function parseOrganizationMemberDetails(
  tagsStr: string
): MemberOrganization {
  assertAndRaiseValidateError(
    tagsStr != null && Boolean(tagsStr),
    'Incomplete organization details',
    'organization',
    'member information not found'
  );

  const tags = JSON.parse(tagsStr);
  const member: { [key: string]: string } = {};

  tags.forEach((part: string) => {
    const kv = part.split(':');
    if (kv.length === 2 && kv[0] === 'member_class') {
      member['memberClass'] = kv[1];
    }
    if (kv.length === 2 && kv[0] === 'member_id') {
      member['memberId'] = kv[1];
    }
  });

  assertAndRaiseValidateError(
    Boolean(member['memberClass']) && Boolean(member['memberId']),
    'Incomplete organization details',
    'organization',
    'member information not found'
  );

  return {
    memberClass: member['memberClass'],
    memberId: member['memberId'],
  };
}
