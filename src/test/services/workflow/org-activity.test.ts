import {
  diffOrganizationProfileFields,
  diffSubsystemProfileFields,
  logOrganizationAccessChanges,
  logOrganizationProfileChangeFromRecords,
  logSubsystemActivityFromHook,
  OrgActivityService,
} from '../../../services/workflow/org-activity';
import * as activityModule from '../../../services/keystone/activity';

jest.mock('../../../services/keystone/activity', () => {
  const actual = jest.requireActual('../../../services/keystone/activity');
  return {
    ...actual,
    recordActivity: jest.fn().mockResolvedValue({}),
  };
});

const recordActivityMock = activityModule.recordActivity as jest.Mock;

/** Positional args passed to recordActivity (see services/keystone/activity.ts). */
interface RecordActivityArgs {
  context: unknown;
  action: string;
  type: string;
  refId: string;
  message: string;
  result: string;
  activityContext: string;
  productNamespace: string | null | undefined;
  ids: string[];
}

interface ParsedActivityContext {
  message: string;
  params: Record<string, string>;
}

function toRecordActivityArgs(call: unknown[]): RecordActivityArgs {
  return {
    context: call[0],
    action: call[1] as string,
    type: call[2] as string,
    refId: call[3] as string,
    message: call[4] as string,
    result: call[5] as string,
    activityContext: call[6] as string,
    productNamespace: call[7] as string | null | undefined,
    ids: call[8] as string[],
  };
}

function recordedActivityCalls(): RecordActivityArgs[] {
  return recordActivityMock.mock.calls.map(toRecordActivityArgs);
}

function recordedActivityCallAt(index: number): RecordActivityArgs {
  return toRecordActivityArgs(recordActivityMock.mock.calls[index]);
}

function parseRecordedActivityContext(
  activityContext: string
): ParsedActivityContext {
  return JSON.parse(activityContext);
}

describe('diffOrganizationProfileFields', function () {
  it('returns no fields when before and after are equivalent', function () {
    const profile = {
      title: 'Ministry of Health',
      description: 'Health services',
      tags: ['api', 'public'],
      sector: 'health',
      publicBodyId: 'pb-1',
      orgUnits: [{ name: 'Unit A' }, { name: 'Unit B' }],
    };
    expect(
      diffOrganizationProfileFields(profile, { ...profile })
    ).toEqual([]);
  });

  it('detects a simple title change', function () {
    expect(
      diffOrganizationProfileFields({ title: 'Old' }, { title: 'New' })
    ).toEqual(['title']);
  });

  describe('tags normalization', function () {
    it('treats array order as irrelevant', function () {
      expect(
        diffOrganizationProfileFields(
          { tags: ['b', 'a'] },
          { tags: ['a', 'b'] }
        )
      ).toEqual([]);
    });

    it('treats JSON string tags equal to array form', function () {
      expect(
        diffOrganizationProfileFields(
          { tags: '["api","public"]' },
          { tags: ['public', 'api'] }
        )
      ).toEqual([]);
    });

    it('detects tag changes after normalization', function () {
      expect(
        diffOrganizationProfileFields({ tags: ['a'] }, { tags: ['a', 'b'] })
      ).toEqual(['tags']);
    });

    it('treats invalid JSON string as a single tag literal', function () {
      expect(
        diffOrganizationProfileFields({ tags: 'not-json' }, { tags: 'not-json' })
      ).toEqual([]);
      expect(
        diffOrganizationProfileFields({ tags: 'not-json' }, { tags: ['other'] })
      ).toEqual(['tags']);
    });
  });

  describe('orgUnits normalization', function () {
    it('extracts unit names and ignores order', function () {
      expect(
        diffOrganizationProfileFields(
          { orgUnits: [{ name: 'B' }, { name: 'A' }] },
          { orgUnits: [{ name: 'A' }, { name: 'B' }] }
        )
      ).toEqual([]);
    });

    it('accepts JSON string orgUnits', function () {
      expect(
        diffOrganizationProfileFields(
          { orgUnits: '[{"name":"A"},{"extForeignKey":"B"}]' },
          { orgUnits: [{ id: 'B' }, { name: 'A' }] }
        )
      ).toEqual([]);
    });

    it('falls back to extForeignKey or id when name is missing', function () {
      expect(
        diffOrganizationProfileFields(
          { orgUnits: [{ extForeignKey: 'fk-1' }] },
          { orgUnits: [{ extForeignKey: 'fk-2' }] }
        )
      ).toEqual(['orgUnits']);
    });

    it('detects orgUnits change when units are added or removed', function () {
      expect(
        diffOrganizationProfileFields(
          { orgUnits: [{ name: 'A' }] },
          { orgUnits: [{ name: 'A' }, { name: 'C' }] }
        )
      ).toEqual(['orgUnits']);
    });

    it('treats invalid JSON and non-arrays as empty', function () {
      expect(
        diffOrganizationProfileFields({ orgUnits: 'bad-json' }, { orgUnits: [] })
      ).toEqual([]);
      expect(
        diffOrganizationProfileFields({ orgUnits: null }, { orgUnits: 'x' })
      ).toEqual([]);
    });
  });

  describe('optional scalar fields', function () {
    it.each(['description', 'sector', 'publicBodyId'] as const)(
      'treats null, undefined, and empty string as equal for %s',
      function (field) {
        expect(
          diffOrganizationProfileFields({ [field]: null }, { [field]: '' })
        ).toEqual([]);
        expect(
          diffOrganizationProfileFields(
            { [field]: undefined },
            { [field]: null }
          )
        ).toEqual([]);
      }
    );

    it('detects scalar value changes', function () {
      expect(
        diffOrganizationProfileFields(
          { sector: 'health' },
          { sector: 'finance' }
        )
      ).toEqual(['sector']);
    });
  });

  it('reports multiple changed fields', function () {
    const changed = diffOrganizationProfileFields(
      { title: 'A', tags: ['x'], sector: 's1' },
      { title: 'B', tags: ['y'], sector: 's2' }
    );
    expect(changed).toEqual(
      expect.arrayContaining(['title', 'tags', 'sector'])
    );
    expect(changed).toHaveLength(3);
  });
});

describe('OrgActivityService', function () {
  beforeEach(() => {
    recordActivityMock.mockClear();
  });

  it('resolves actor from authedItem, then req.user, then system', async function () {
    const ctxAuthed = { authedItem: { name: 'Alice' } };
    await new OrgActivityService(ctxAuthed, 'my-org').logOrganizationEstablished(
      true
    );
    expect(recordedActivityCallAt(0).ids).toContain('actor:Alice');

    recordActivityMock.mockClear();
    const ctxReq = { req: { user: { name: 'Bob' } } };
    await new OrgActivityService(ctxReq, 'my-org').logOrganizationEstablished(
      true
    );
    expect(recordedActivityCallAt(0).ids).toContain('actor:Bob');

    recordActivityMock.mockClear();
    await new OrgActivityService({}, 'my-org').logOrganizationEstablished(true);
    expect(recordedActivityCallAt(0).ids).toContain('actor:system');
  });

  it('always records access changes as "updated" with the signed delta', async function () {
    const service = new OrgActivityService({ authedItem: { name: 'Admin' } }, 'my-org');

    await service.logUpdateOrganizationAccess(true, {
      subject_email: 'user1@local',
      subject: 'User One',
      roles: '[-] organization-admin',
    });
    const recorded = recordedActivityCallAt(0);
    expect(recorded.action).toBe('updated');
    const ctx = parseRecordedActivityContext(recorded.activityContext);
    expect(ctx.params.subject_email).toBe('user1@local');
    expect(ctx.params.subject).toBe('User One');
    expect(ctx.params.accessAction).toBeUndefined();
    expect(ctx.message).toBe(
      '{actor} {action} {subject} organization access on {organization}: {roles}'
    );
    expect(recorded.ids).toContain('user:user1@local');
    expect(recorded.message).toBe(
      'Admin updated User One organization access on my-org: [-] organization-admin'
    );
  });

  it('records one activity per key in logOrganizationPatternPublish', async function () {
    const service = new OrgActivityService({ authedItem: { name: 'Admin' } }, 'my-org');
    await service.logOrganizationPatternPublish(true, {
      keysAdded: ['key-a'],
      keysRotated: ['key-b'],
      keysRemoved: ['key-c'],
    });

    expect(recordActivityMock).toHaveBeenCalledTimes(3);
    const calls = recordedActivityCalls();
    expect(calls.map((c) => c.action)).toEqual(['added', 'rotated', 'deleted']);
    expect(calls.map((c) => c.ids[1])).toEqual([
      'key:key-a',
      'key:key-b',
      'key:key-c',
    ]);
  });

  it('always passes org filterKey as first id', async function () {
    await new OrgActivityService({ authedItem: { name: 'Admin' } }, 'my-org')
      .logOrganizationCSR(true, { keyName: 'signing-key' });

    expect(recordedActivityCallAt(0).ids[0]).toBe('org:my-org');
  });

  it('records organization key actions in past tense', async function () {
    const service = new OrgActivityService({ authedItem: { name: 'Admin' } }, 'my-org');
    await service.logOrganizationKey(true, 'add', 'key-a');

    const recorded = recordedActivityCallAt(0);
    expect(recorded.action).toBe('added');
    expect(recorded.message).toBe(
      'Admin added organization key key-a on my-org'
    );
    const activityContext = parseRecordedActivityContext(
      recorded.activityContext
    );
    expect(activityContext.params.keyAction).toBe('added');
  });

  it('records subsystem create with org and subsystem filter keys', async function () {
    await new OrgActivityService({ authedItem: { name: 'Admin' } }, 'my-org')
      .logSubsystemCreated(true, { subsystemName: 'MY-SUBSYS' });

    const recorded = recordedActivityCallAt(0);
    expect(recorded.action).toBe('created');
    expect(recorded.type).toBe('Subsystem');
    expect(recorded.message).toBe(
      'Admin created subsystem MY-SUBSYS on my-org'
    );
    expect(recorded.ids).toEqual([
      'org:my-org',
      'subsystem:MY-SUBSYS',
      'actor:Admin',
    ]);
  });

  it('records subsystem profile updates with changed fields', async function () {
    await new OrgActivityService({ authedItem: { name: 'Admin' } }, 'my-org')
      .logSubsystemProfileChange(true, {
        subsystemName: 'MY-SUBSYS',
        changedFields: 'description',
      });

    const recorded = recordedActivityCallAt(0);
    expect(recorded.action).toBe('updated');
    expect(recorded.message).toBe(
      'Admin updated subsystem profile (description) for MY-SUBSYS on my-org'
    );
  });

  it('records service publish with org, subsystem, and service filter keys', async function () {
    await new OrgActivityService({ authedItem: { name: 'Admin' } }, 'my-org')
      .logServicePublished(true, {
        serviceName: 'MY-SERVICE',
        subsystemName: 'MY-SUBSYS',
      });

    const recorded = recordedActivityCallAt(0);
    expect(recorded.action).toBe('published');
    expect(recorded.type).toBe('Service');
    expect(recorded.message).toBe(
      'Admin published service MY-SERVICE on subsystem MY-SUBSYS in my-org'
    );
    expect(recorded.ids).toEqual([
      'org:my-org',
      'subsystem:MY-SUBSYS',
      'service:MY-SERVICE',
      'actor:Admin',
    ]);
    const activityContext = parseRecordedActivityContext(
      recorded.activityContext
    );
    expect(activityContext.params.subsystemName).toBe('MY-SUBSYS');
  });

  it('records service remove in past tense', async function () {
    await new OrgActivityService({ authedItem: { name: 'Admin' } }, 'my-org')
      .logServiceRemoved(true, {
        serviceName: 'MY-SERVICE',
        subsystemName: 'MY-SUBSYS',
      });

    const recorded = recordedActivityCallAt(0);
    expect(recorded.action).toBe('removed');
    expect(recorded.message).toBe(
      'Admin removed service MY-SERVICE from subsystem MY-SUBSYS in my-org'
    );
    expect(recorded.ids).toEqual([
      'org:my-org',
      'subsystem:MY-SUBSYS',
      'service:MY-SERVICE',
      'actor:Admin',
    ]);
  });
});

describe('diffSubsystemProfileFields', function () {
  it('detects description changes only', function () {
    expect(
      diffSubsystemProfileFields(
        { description: 'before' },
        { description: 'after' }
      )
    ).toEqual(['description']);
    expect(
      diffSubsystemProfileFields(
        { description: 'same' },
        { description: 'same' }
      )
    ).toEqual([]);
  });
});

describe('logSubsystemActivityFromHook', function () {
  beforeEach(() => {
    recordActivityMock.mockClear();
  });

  it('records create activity from subsystem hook data', async function () {
    await logSubsystemActivityFromHook(
      {
        authedItem: { name: 'Admin' },
        executeGraphQL: jest.fn().mockResolvedValue({
          data: { allOrganizations: [{ name: 'ca.bc.gov.my-org' }] },
        }),
      },
      'create',
      null,
      {
        name: 'MY-SUBSYS',
        organization: '3',
      }
    );

    expect(recordActivityMock).toHaveBeenCalledTimes(1);
    const recorded = recordedActivityCallAt(0);
    expect(recorded.action).toBe('created');
    expect(recorded.ids[0]).toBe('org:ca.bc.gov.my-org');
  });

  it('throws when organization id cannot be resolved to a name', async function () {
    await expect(
      logSubsystemActivityFromHook(
        {
          authedItem: { name: 'Admin' },
          executeGraphQL: jest.fn().mockResolvedValue({
            data: { allOrganizations: [] },
          }),
        },
        'create',
        null,
        { name: 'MY-SUBSYS', organization: '999' }
      )
    ).rejects.toThrow(/Unable to resolve organization name/);
  });

  it('records delete activity from subsystem hook data', async function () {
    const ctx = {
      authedItem: { name: 'Admin' },
      executeGraphQL: jest.fn().mockResolvedValue({
        data: { allOrganizations: [{ name: 'ca.bc.gov.my-org' }] },
      }),
    };
    await logSubsystemActivityFromHook(
      ctx,
      'delete',
      {
        name: 'MY-SUBSYS',
        organization: '3',
      },
      {
        name: 'MY-SUBSYS',
        organization: '3',
      }
    );

    expect(recordActivityMock).toHaveBeenCalledTimes(1);
    expect(recordedActivityCallAt(0).action).toBe('deleted');
  });

  it('skips update activity when profile is unchanged', async function () {
    await logSubsystemActivityFromHook(
      {
        authedItem: { name: 'Admin' },
        executeGraphQL: jest.fn().mockResolvedValue({
          data: { allOrganizations: [{ name: 'ca.bc.gov.my-org' }] },
        }),
      },
      'update',
      { description: 'same', name: 'MY-SUBSYS', organization: '3' },
      { description: 'same', name: 'MY-SUBSYS', organization: '3' }
    );

    expect(recordActivityMock).not.toHaveBeenCalled();
  });
});

describe('logOrganizationAccessChanges', function () {
  const resolveDisplayName = async (email: string) =>
    email === 'aidan@idir' ? 'Cope, Aidan CITZ:EX' : email;

  function buildService() {
    return new OrgActivityService({ authedItem: { name: 'Admin' } }, 'my-org');
  }

  beforeEach(() => {
    recordActivityMock.mockClear();
  });

  it('records "updated" with only the added role delta on a pure grant (not the full role set)', async function () {
    await logOrganizationAccessChanges(
      buildService(),
      {
        granted: { 'aidan@idir': ['system-owner'] },
        revoked: {},
      },
      resolveDisplayName
    );

    expect(recordActivityMock).toHaveBeenCalledTimes(1);
    const recorded = recordedActivityCallAt(0);
    expect(recorded.action).toBe('updated');
    expect(recorded.message).toBe(
      'Admin updated Cope, Aidan CITZ:EX organization access on my-org: [+] system-owner'
    );
    expect(recorded.message).not.toContain('organization-admin');
  });

  it('records a single "updated" entry with signed delta when a role is added and removed together', async function () {
    await logOrganizationAccessChanges(
      buildService(),
      {
        granted: { 'aidan@idir': ['system-owner'] },
        revoked: { 'aidan@idir': ['organization-admin'] },
      },
      resolveDisplayName
    );

    expect(recordActivityMock).toHaveBeenCalledTimes(1);
    const recorded = recordedActivityCallAt(0);
    expect(recorded.action).toBe('updated');
    expect(recorded.message).toBe(
      'Admin updated Cope, Aidan CITZ:EX organization access on my-org: [+] system-owner, [-] organization-admin'
    );
  });

  it('records "updated" with the removed role delta on a pure revoke', async function () {
    await logOrganizationAccessChanges(
      buildService(),
      {
        granted: {},
        revoked: { 'aidan@idir': ['system-owner'] },
      },
      resolveDisplayName
    );

    expect(recordActivityMock).toHaveBeenCalledTimes(1);
    const recorded = recordedActivityCallAt(0);
    expect(recorded.action).toBe('updated');
    expect(recorded.message).toBe(
      'Admin updated Cope, Aidan CITZ:EX organization access on my-org: [-] system-owner'
    );
  });
});

describe('logOrganizationProfileChangeFromRecords', function () {
  beforeEach(() => {
    recordActivityMock.mockClear();
  });

  it('does not record activity when profile is unchanged', async function () {
    await logOrganizationProfileChangeFromRecords(
      { authedItem: { name: 'Admin' } },
      'my-org',
      { title: 'Same', tags: ['a'] },
      { title: 'Same', tags: ['a'] }
    );
    expect(recordActivityMock).not.toHaveBeenCalled();
  });

  it('records profile change with comma-separated field names', async function () {
    await logOrganizationProfileChangeFromRecords(
      { authedItem: { name: 'Admin' } },
      'my-org',
      { title: 'Old', sector: 's1' },
      { title: 'New', sector: 's2' }
    );

    expect(recordActivityMock).toHaveBeenCalledTimes(1);
    const recorded = recordedActivityCallAt(0);
    expect(recorded.action).toBe('update');
    expect(recorded.type).toBe('OrganizationProfile');
    const activityContext = parseRecordedActivityContext(
      recorded.activityContext
    );
    expect(activityContext.params.changedFields).toBe('title,sector');
  });
});
