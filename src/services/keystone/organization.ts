import assert from '../user-assert';
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
                        tags
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

export async function getOrganization(
  context: any,
  name: string
): Promise<Organization> {
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

  assert.strictEqual(
    result.data.allOrganizations.length == 0,
    false,
    `Organization ${name} not found`
  );

  return result.data.allOrganizations[0];
}

export async function getOrganizationUnit(
  context: any,
  unit: string
): Promise<Organization> {
  if (!unit) {
    logger.warn(
      '[getOrganizationUnit] called with undefined unit, returning null'
    );
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

export function parseOrganizationMemberDetails(
  tagsStr: string
): MemberOrganization {
  const member = getOrganizationMemberDetails(tagsStr);

  assertAndRaiseValidateError(
    member !== undefined,
    'Incomplete organization details',
    'organization',
    'member information not found'
  );
  return member;
}

export function getOrganizationMemberDetails(
  tagsStr: string
): MemberOrganization | undefined {
  if (tagsStr) {
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

    if (Boolean(member['memberClass']) && Boolean(member['memberId'])) {
      return {
        memberClass: member['memberClass'],
        memberId: member['memberId'],
      };
    }
  }
  return undefined;
}
