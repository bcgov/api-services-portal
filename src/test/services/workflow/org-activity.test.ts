import {
  diffOrganizationProfileFields,
  OrgActivityService,
  logOrganizationAccessChanges,
  logOrganizationProfileChangeFromRecords,
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
    expect(recordActivityMock.mock.calls[0][8]).toContain('actor:Alice');

    recordActivityMock.mockClear();
    const ctxReq = { req: { user: { name: 'Bob' } } };
    await new OrgActivityService(ctxReq, 'my-org').logOrganizationEstablished(
      true
    );
    expect(recordActivityMock.mock.calls[0][8]).toContain('actor:Bob');

    recordActivityMock.mockClear();
    await new OrgActivityService({}, 'my-org').logOrganizationEstablished(true);
    expect(recordActivityMock.mock.calls[0][8]).toContain('actor:system');
  });

  it('always records access changes as "updated" with the signed delta', async function () {
    const service = new OrgActivityService({ authedItem: { name: 'Admin' } }, 'my-org');

    await service.logUpdateOrganizationAccess(true, {
      subject_email: 'user1@local',
      subject: 'User One',
      roles: '[-] organization-admin',
    });
    expect(recordActivityMock.mock.calls[0][1]).toBe('updated');
    const ctx = JSON.parse(recordActivityMock.mock.calls[0][6]);
    expect(ctx.params.subject_email).toBe('user1@local');
    expect(ctx.params.subject).toBe('User One');
    expect(ctx.params.accessAction).toBeUndefined();
    expect(ctx.message).toBe(
      '{actor} {action} {subject} organization access on {organization}: {roles}'
    );
    expect(recordActivityMock.mock.calls[0][8]).toContain('user:user1@local');
    expect(recordActivityMock.mock.calls[0][4]).toBe(
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
    const actions = recordActivityMock.mock.calls.map((c) => c[1]);
    expect(actions).toEqual(['add', 'rotate', 'delete']);
    const keyIds = recordActivityMock.mock.calls.map((c) => c[8][1]);
    expect(keyIds).toEqual(['key:key-a', 'key:key-b', 'key:key-c']);
  });

  it('always passes org filterKey as first id', async function () {
    await new OrgActivityService({ authedItem: { name: 'Admin' } }, 'my-org')
      .logOrganizationCSR(true, { keyName: 'signing-key' });

    expect(recordActivityMock.mock.calls[0][8][0]).toBe('org:my-org');
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
    expect(recordActivityMock.mock.calls[0][1]).toBe('updated');
    const message = recordActivityMock.mock.calls[0][4];
    expect(message).toBe(
      'Admin updated Cope, Aidan CITZ:EX organization access on my-org: [+] system-owner'
    );
    expect(message).not.toContain('organization-admin');
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
    expect(recordActivityMock.mock.calls[0][1]).toBe('updated');
    expect(recordActivityMock.mock.calls[0][4]).toBe(
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
    expect(recordActivityMock.mock.calls[0][1]).toBe('updated');
    expect(recordActivityMock.mock.calls[0][4]).toBe(
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
    expect(recordActivityMock.mock.calls[0][1]).toBe('update');
    expect(recordActivityMock.mock.calls[0][2]).toBe('OrganizationProfile');
    const activityContext = JSON.parse(recordActivityMock.mock.calls[0][6]);
    expect(activityContext.params.changedFields).toBe('title,sector');
  });
});
