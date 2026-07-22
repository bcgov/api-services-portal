import { format, getOrgActivity } from '../../../services/keystone/activity';
import { PUBLIC_ORG_ACTIVITY } from '../../../services/workflow/org-activity-public';

const sampleActivities = [
  {
    id: 'act-1',
    type: 'Organization',
    name: 'register Organization[ministry-of-health]',
    namespace: 'platform',
    action: 'register',
    refId: 'ministry-of-health',
    result: 'success',
    message: 'Org registered',
    context: '',
    actor: { name: 'Harley' },
    blob: null as { type: string; blob: string } | null,
    filterKey1: 'org:ministry-of-health',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
];

function mockOrgActivityContext(
  activities: typeof sampleActivities = sampleActivities
): any {
  return {
    executeGraphQL: jest.fn(({ query, variables }: any) => {
      if (!query.includes('OrgActivities')) {
        return { errors: [{ message: 'Unexpected query' }] };
      }
      return { data: { allActivities: activities } };
    }),
  };
}

describe('Activity Message Formatting', function () {
  it('it should format a successfull message', async function () {
    const tests = [
      {
        message: '{actor} {action} to {resource1} for {resource2}',
        params: {
          actor: 'Harley',
          action: 'requested access',
          resource1: 'Demo API (dev)',
          resource2: 'application ABC',
        },
        result: 'Harley requested access to Demo API (dev) for application ABC',
      },
      {
        message: '{actor} {action} {entity} to {resource1} for {resource2}',
        params: {
          actor: 'Mark',
          action: 'approved',
          entity: 'access',
          resource1: 'Demo API (dev)',
          resource2: 'consumer 11111111',
        },
        result: 'Mark approved access to Demo API (dev) for consumer 11111111',
      },
      {
        message: '{actor} {action} {entity} to {resource1} for {resource2}',
        params: {
          actor: 'Mark',
          action: 'rejected',
          entity: 'access',
          resource1: 'Demo API (dev)',
          resource2: 'consumer 11111111',
        },
        result: 'Mark rejected access to Demo API (dev) for consumer 11111111',
      },
      {
        message:
          '{actor} {action} for {application} to access {resource} ({note})',
        params: {
          actor: 'Harley',
          action: 'received credentials',
          entity: 'access',
          application: 'App 1234',
          resource: 'Demo API (dev)',
          note: 'access pending approval',
        },
        result:
          'Harley received credentials for App 1234 to access Demo API (dev) (access pending approval)',
      },
      {
        message: '{actor} {action} {resource}',
        params: {
          actor: 'Janis',
          action: 'edited',
          resource: "My Demo Product's environment (prod)",
        },
        result: "Janis edited My Demo Product's environment (prod)",
      },
      {
        message: '{actor} {action} {resource} {entity}',
        params: {
          actor: 'Wendy',
          action: 'edited',
          entity: 'Authorization Profile',
          resource: 'Ministry of X IdP Realm',
        },
        result: 'Wendy edited Ministry of X IdP Realm Authorization Profile',
      },
      {
        message: '{actor} {action} {resource} {entity}',
        params: {
          actor: 'Wendy',
          action: 'created',
          entity: 'Authorization Profile',
          resource: 'Ministry of X IdP Realm',
        },
        result: 'Wendy created Ministry of X IdP Realm Authorization Profile',
      },
      {
        message: '{actor} {action} {entity}',
        params: {
          actor: 'sa-moh-proto-ca8523432-9d238d1238d',
          action: 'updated',
          entity: 'Gateway Configuration',
        },
        result:
          'sa-moh-proto-ca8523432-9d238d1238d updated Gateway Configuration',
      },
      {
        message:
          'Failed to {action} {entity} to {resource1} for {resource2} (actor: {actor}, reason: {reason})',
        params: {
          actor: 'Mark',
          action: 'reject',
          entity: 'access',
          resource1: 'Demo API (dev)',
          resource2: 'consumer 11111111',
          reason: 'missing one of these realm defaults',
        },
        result:
          'Failed to reject access to Demo API (dev) for consumer 11111111 (actor: Mark, reason: missing one of these realm defaults)',
      },
    ];
    tests.forEach((test) => {
      const output = format(test.message, test.params);
      expect(output).toBe(test.result);
    });
  });
});

describe('getOrgActivity', function () {
  it('queries OrgActivities and returns allActivities', async function () {
    const ctx = mockOrgActivityContext();
    const result = await getOrgActivity(ctx, 'ministry-of-health');

    expect(ctx.executeGraphQL).toHaveBeenCalledTimes(1);
    expect(ctx.executeGraphQL.mock.calls[0][0].query).toContain(
      'OrgActivities'
    );
    expect(result).toEqual(sampleActivities);
  });

  it('filters by org name when orgName is provided', async function () {
    const ctx = mockOrgActivityContext();
    await getOrgActivity(ctx, 'ministry-of-health');

    expect(ctx.executeGraphQL.mock.calls[0][0].variables.where).toEqual({
      filterKey1: 'org:ministry-of-health',
    });
  });

  it('filters all org activities when orgName is omitted', async function () {
    const ctx = mockOrgActivityContext();
    await getOrgActivity(ctx);

    expect(ctx.executeGraphQL.mock.calls[0][0].variables.where).toEqual({
      filterKey1_starts_with: 'org:',
    });
  });

  it('adds public activity OR clause when publicOnly is true', async function () {
    const ctx = mockOrgActivityContext();
    await getOrgActivity(ctx, 'ministry-of-health', 20, 0, true);

    expect(ctx.executeGraphQL.mock.calls[0][0].variables.where).toEqual({
      AND: [
        { filterKey1: 'org:ministry-of-health' },
        { OR: [...PUBLIC_ORG_ACTIVITY] },
        { result_not: 'failed' },
      ],
    });
  });

  it('does not add public filter when publicOnly is false', async function () {
    const ctx = mockOrgActivityContext();
    await getOrgActivity(ctx, 'ministry-of-health', 20, 0, false);

    expect(ctx.executeGraphQL.mock.calls[0][0].variables.where).toEqual({
      filterKey1: 'org:ministry-of-health',
    });
  });

  it('caps first at 100', async function () {
    const ctx = mockOrgActivityContext();
    await getOrgActivity(ctx, 'ministry-of-health', 500);

    expect(ctx.executeGraphQL.mock.calls[0][0].variables.first).toBe(100);
  });

  it('passes first and skip to GraphQL', async function () {
    const ctx = mockOrgActivityContext();
    await getOrgActivity(ctx, 'ministry-of-health', 15, 30);

    const { first, skip } = ctx.executeGraphQL.mock.calls[0][0].variables;
    expect(first).toBe(15);
    expect(skip).toBe(30);
  });
});
