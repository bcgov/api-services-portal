import {
  getOrganization,
  getOrganizations,
  getOrganizationMemberDetails,
  parseOrganizationMemberDetails,
} from '../../../services/keystone/organization';

const orgs = [
  {
    name: 'ministry-of-health',
    title: 'Ministry of Health',
    description: 'Health stuff',
    tags: JSON.stringify(['member_class:MIN', 'member_id:CITZ']),
    publicBodyId: 'PB-MOH-001',
    extSource: 'ckan',
    orgUnits: [
      {
        name: 'planning-and-innovation-division',
        title: 'Planning and Innovation',
      },
    ],
  },
  {
    name: 'ministry-of-citizens-services',
    title: 'Ministry of Citizens Services',
    description: 'Custom org without a public body reference',
    tags: JSON.stringify([]),
    publicBodyId: null,
    extSource: 'sdx',
    orgUnits: [],
  },
];

function mockContext(): any {
  return {
    executeGraphQL: jest.fn(({ query, variables }: any) => {
      if (query.indexOf('GetOrganizations') < 0) {
        return { errors: [{ message: 'Unexpected query' }] };
      }
      if (variables && 'name' in variables) {
        return {
          data: {
            allOrganizations: orgs.filter((o) => o.name === variables.name),
          },
        };
      }
      return { data: { allOrganizations: orgs } };
    }),
  };
}

describe('KeystoneJS', function () {
  describe('test getOrganizations', function () {
    it('asks the GraphQL API for publicBodyId and extSource', async function () {
      const ctx = mockContext();
      await getOrganizations(ctx);
      expect(ctx.executeGraphQL.mock.calls[0][0].query).toContain(
        'publicBodyId'
      );
      expect(ctx.executeGraphQL.mock.calls[0][0].query).toContain('extSource');
    });

    it('returns the publicBodyId value alongside other Organization fields', async function () {
      const result = await getOrganizations(mockContext());
      expect(result).toHaveLength(2);
      expect(result[0].publicBodyId).toBe('PB-MOH-001');
      expect(result[0].extSource).toBe('ckan');
      expect(result[1].publicBodyId).toBeNull();
      expect(result[1].extSource).toBe('sdx');
    });
  });

  describe('test getOrganization', function () {
    it('asks the GraphQL API for publicBodyId and extSource', async function () {
      const ctx = mockContext();
      await getOrganization(ctx, 'ministry-of-health');
      expect(ctx.executeGraphQL.mock.calls[0][0].query).toContain(
        'publicBodyId'
      );
      expect(ctx.executeGraphQL.mock.calls[0][0].query).toContain('extSource');
    });

    it('returns the publicBodyId for the named Organization', async function () {
      const result = await getOrganization(
        mockContext(),
        'ministry-of-health'
      );
      expect(result.publicBodyId).toBe('PB-MOH-001');
    });
  });

  describe('test getOrganizationMemberDetails', function () {
    it('parses member tags', function () {
      const member = getOrganizationMemberDetails(
        JSON.stringify(['member_class:MIN', 'member_id:CITZ'])
      );
      expect(member).toEqual({ memberClass: 'MIN', memberId: 'CITZ' });
    });

    it('returns undefined when no member tags are present', function () {
      expect(getOrganizationMemberDetails(JSON.stringify([]))).toBeUndefined();
    });

    it('throws via parseOrganizationMemberDetails when member info is missing', function () {
      expect(() =>
        parseOrganizationMemberDetails(JSON.stringify([]))
      ).toThrow();
    });
  });
});
