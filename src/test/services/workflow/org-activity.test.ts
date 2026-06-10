import {
  buildOrganizationProfileSnapshot,
  buildOrganizationUnitProfileSnapshot,
  OrgActivityService,
  logOrganizationAccessChanges,
  logOrganizationProfileChangeFromRecords,
  logOrganizationUnitEstablishedFromRecords,
  logOrganizationUnitProfileChangeFromRecords,
  logOrganizationUnitsFromChildSync,
  shouldLogOrgUnitEstablishment,
  resolveOrgHierarchyKeys,
} from '../../../services/workflow/org-activity';
import * as activityModule from '../../../services/keystone/activity';
import * as organizationModule from '../../../services/keystone/organization';

jest.mock('../../../services/keystone/activity', () => {
  const actual = jest.requireActual('../../../services/keystone/activity');
  return {
    ...actual,
    recordActivity: jest.fn().mockResolvedValue({}),
    recordActivityWithBlob: jest.fn().mockResolvedValue({}),
  };
});

jest.mock('../../../services/keystone/organization', () => ({
  getOrganizationUnit: jest.fn(),
}));

const recordActivityMock = activityModule.recordActivity as jest.Mock;
const recordActivityWithBlobMock =
  activityModule.recordActivityWithBlob as jest.Mock;
const getOrganizationUnitMock = organizationModule.getOrganizationUnit as jest.Mock;

describe('resolveOrgHierarchyKeys', function () {
  it('uses the sole segment for root organization access', function () {
    expect(resolveOrgHierarchyKeys('', 'ca.bc.gov')).toEqual({
      filterOrg: 'ca.bc.gov',
      refId: 'ca.bc.gov',
    });
  });

  it('uses the leaf org for ministry-level access under ca.bc.gov', function () {
    expect(
      resolveOrgHierarchyKeys('/ca.bc.gov', 'ministry-of-kittens')
    ).toEqual({
      filterOrg: 'ministry-of-kittens',
      refId: 'ministry-of-kittens',
    });
  });

  it('indexes org unit access under the parent org with the unit as refId', function () {
    expect(
      resolveOrgHierarchyKeys(
        '/ca.bc.gov/ministry-of-kittens',
        'division-of-toys'
      )
    ).toEqual({
      filterOrg: 'ministry-of-kittens',
      refId: 'division-of-toys',
      orgUnit: 'division-of-toys',
    });
  });
});

describe('profile snapshots', function () {
  it('captures all organization sync fields except orgUnits', function () {
    expect(
      buildOrganizationProfileSnapshot({
        name: 'my-org',
        title: 'My Org',
        description: 'About us',
        tags: '["a"]',
        sector: 'health',
        publicBodyId: 'pb-1',
        extSource: 'internal',
        orgUnits: [{ name: 'unit-a' }],
        extRecordHash: 'abc',
      })
    ).toEqual({
      name: 'my-org',
      sector: 'health',
      title: 'My Org',
      tags: '["a"]',
      description: 'About us',
      publicBodyId: 'pb-1',
      extSource: 'internal',
      extRecordHash: 'abc',
    });
  });

  it('captures all org unit sync fields', function () {
    expect(
      buildOrganizationUnitProfileSnapshot({
        name: 'my-unit',
        title: 'My Unit',
        description: 'Unit details',
        tags: ['a'],
        sector: 'health',
        extSource: 'internal',
        extRecordHash: 'abc',
      })
    ).toEqual({
      name: 'my-unit',
      sector: 'health',
      title: 'My Unit',
      tags: ['a'],
      description: 'Unit details',
      extSource: 'internal',
      extRecordHash: 'abc',
    });
  });
});

describe('OrgActivityService', function () {
  beforeEach(() => {
    recordActivityMock.mockClear();
    recordActivityWithBlobMock.mockClear();
  });

  it('records organization establishment with a profile blob when provided', async function () {
    await new OrgActivityService({ authedItem: { name: 'Admin' } }, 'my-org')
      .logOrganizationEstablished(true, {
        name: 'my-org',
        title: 'My Org',
        description: 'About us',
      });

    expect(recordActivityWithBlobMock).toHaveBeenCalledTimes(1);
    expect(recordActivityWithBlobMock.mock.calls[0][1]).toBe('registered');
    expect(recordActivityWithBlobMock.mock.calls[0][2]).toBe('Organization');
    expect(recordActivityWithBlobMock.mock.calls[0][7]).toEqual({
      name: 'my-org',
      title: 'My Org',
      description: 'About us',
    });
  });

  it('resolves actor from authedItem, then req.user, then system', async function () {
    recordActivityWithBlobMock.mockClear();
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
      refId: 'my-org',
    });
    expect(recordActivityMock.mock.calls[0][1]).toBe('updated');
    expect(recordActivityMock.mock.calls[0][3]).toBe('my-org');
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

  it('records one published activity for logGatewayPatternPublish', async function () {
    const deckBlob = 'results: |\n  creating key-set sdx.org.min.citz\n';
    const service = new OrgActivityService({ authedItem: { name: 'Admin' } }, 'my-org');
    await service.logGatewayPatternPublish(true, {
      pattern: 'sdx-keys.r1',
      scope: 'organization',
      targetName: 'my-org',
      deckBlob,
    });

    expect(recordActivityWithBlobMock).toHaveBeenCalledTimes(1);
    expect(recordActivityMock).not.toHaveBeenCalled();
    expect(recordActivityWithBlobMock.mock.calls[0][1]).toBe('published');
    expect(recordActivityWithBlobMock.mock.calls[0][2]).toBe('OrganizationKey');
    expect(recordActivityWithBlobMock.mock.calls[0][3]).toBe('my-org');
    const ctx = JSON.parse(recordActivityWithBlobMock.mock.calls[0][6]);
    expect(ctx.params.entity).toBe('OrganizationKey');
    expect(ctx.params.targetName).toBe('my-org');
    expect(ctx.params.detail).toBeUndefined();
    expect(recordActivityWithBlobMock.mock.calls[0][7]).toBe(deckBlob);
    expect(recordActivityWithBlobMock.mock.calls[0][8]).toEqual([
      'org:my-org',
      'scope:organization',
      'target:my-org',
      'actor:Admin',
    ]);
    expect(recordActivityWithBlobMock.mock.calls[0][4]).toBe(
      'Admin published sdx-keys.r1 for my-org'
    );
  });

  it('records removed activity for logGatewayPatternPublish remove path', async function () {
    const service = new OrgActivityService({ authedItem: { name: 'Admin' } }, 'my-org');
    await service.logGatewayPatternPublish(true, {
      pattern: 'sdx-keys.r1',
      scope: 'organization',
      targetName: 'my-org',
      detail: 'removed key sdx.keys.min.citz.org:0',
      removed: true,
    });

    expect(recordActivityMock).toHaveBeenCalledTimes(1);
    expect(recordActivityWithBlobMock).not.toHaveBeenCalled();
    expect(recordActivityMock.mock.calls[0][1]).toBe('removed');
    expect(recordActivityMock.mock.calls[0][4]).toBe(
      'Admin removed sdx-keys.r1 for my-org: removed key sdx.keys.min.citz.org:0'
    );
  });

  it('uses RuntimeGroupKey entity when runtime-group-scoped', async function () {
    const service = new OrgActivityService({ authedItem: { name: 'Admin' } }, 'my-org');
    await service.logGatewayPatternPublish(true, {
      pattern: 'sdx-keys.r1',
      scope: 'runtime-group',
      targetName: 'my-edge-rg',
      deckBlob: 'results: creating key\n',
    });

    expect(recordActivityWithBlobMock.mock.calls[0][2]).toBe('RuntimeGroupKey');
  });

  it('includes targetName when subsystem-scoped', async function () {
    const service = new OrgActivityService({ authedItem: { name: 'Admin' } }, 'my-org');
    await service.logGatewayPatternPublish(true, {
      pattern: 'sdx-keys.r1',
      scope: 'subsystem',
      targetName: 'LAB.MIN.FOOD.MY-UI',
      deckBlob: 'results: creating key\n',
    });

    expect(recordActivityWithBlobMock.mock.calls[0][2]).toBe('SubsystemKey');
    expect(recordActivityWithBlobMock.mock.calls[0][3]).toBe('LAB.MIN.FOOD.MY-UI');
    expect(recordActivityWithBlobMock.mock.calls[0][4]).toBe(
      'Admin published sdx-keys.r1 for LAB.MIN.FOOD.MY-UI'
    );
    expect(recordActivityWithBlobMock.mock.calls[0][8]).toEqual([
      'org:my-org',
      'scope:subsystem',
      'target:LAB.MIN.FOOD.MY-UI',
      'actor:Admin',
    ]);
  });

  it('uses GatewayPatternPublish entity for non-key patterns', async function () {
    const service = new OrgActivityService({ authedItem: { name: 'Admin' } }, 'my-org');
    await service.logGatewayPatternPublish(true, {
      pattern: 'sdx-p2p-consumer.r1',
    });

    expect(recordActivityMock.mock.calls[0][2]).toBe('GatewayPatternPublish');
    expect(recordActivityMock.mock.calls[0][3]).toBe('my-org');
    expect(recordActivityMock.mock.calls[0][4]).toBe(
      'Admin published sdx-p2p-consumer.r1'
    );
    expect(recordActivityMock.mock.calls[0][8]).toEqual(['org:my-org', 'actor:Admin']);
  });

  it('always passes org filterKey as first id', async function () {
    await new OrgActivityService({ authedItem: { name: 'Admin' } }, 'my-org')
      .logOrganizationCSR(true, { keyName: 'signing-key' });

    expect(recordActivityMock.mock.calls[0][3]).toBe('signing-key');
    expect(recordActivityMock.mock.calls[0][8][0]).toBe('org:my-org');
  });
});

describe('logOrganizationAccessChanges', function () {
  const resolveDisplayName = async (email: string) =>
    email === 'aidan@idir' ? 'Cope, Aidan CITZ:EX' : email;
  const activityContext = { authedItem: { name: 'Admin' } };

  beforeEach(() => {
    recordActivityMock.mockClear();
  });

  it('records "updated" with only the added role delta on a pure grant (not the full role set)', async function () {
    await logOrganizationAccessChanges(
      activityContext,
      { parent: '/ca.bc.gov', name: 'my-org' },
      {
        granted: { 'aidan@idir': ['system-owner'] },
        revoked: {},
      },
      resolveDisplayName
    );

    expect(recordActivityMock).toHaveBeenCalledTimes(1);
    expect(recordActivityMock.mock.calls[0][1]).toBe('updated');
    expect(recordActivityMock.mock.calls[0][3]).toBe('my-org');
    expect(recordActivityMock.mock.calls[0][8]).toEqual([
      'org:my-org',
      'user:aidan@idir',
      'actor:Admin',
    ]);
    const message = recordActivityMock.mock.calls[0][4];
    expect(message).toBe(
      'Admin updated Cope, Aidan CITZ:EX organization access on my-org: [+] system-owner'
    );
    expect(message).not.toContain('organization-admin');
  });

  it('records org unit access under the parent org with the unit as refId', async function () {
    await logOrganizationAccessChanges(
      activityContext,
      { parent: '/ca.bc.gov/my-org', name: 'my-unit' },
      {
        granted: { 'aidan@idir': ['organization-admin'] },
        revoked: {},
      },
      resolveDisplayName
    );

    expect(recordActivityMock.mock.calls[0][3]).toBe('my-unit');
    expect(recordActivityMock.mock.calls[0][8]).toEqual([
      'org:my-org',
      'orgUnit:my-unit',
      'user:aidan@idir',
      'actor:Admin',
    ]);
    expect(recordActivityMock.mock.calls[0][4]).toBe(
      'Admin updated Cope, Aidan CITZ:EX organization unit access on my-unit: [+] organization-admin'
    );
    const ctx = JSON.parse(recordActivityMock.mock.calls[0][6]);
    expect(ctx.params.organization).toBe('my-org');
    expect(ctx.params.orgUnit).toBe('my-unit');
    expect(ctx.message).toBe(
      '{actor} {action} {subject} organization unit access on {orgUnit}: {roles}'
    );
  });

  it('records a single "updated" entry with signed delta when a role is added and removed together', async function () {
    await logOrganizationAccessChanges(
      activityContext,
      { parent: '/ca.bc.gov', name: 'my-org' },
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
      activityContext,
      { parent: '/ca.bc.gov', name: 'my-org' },
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
    recordActivityWithBlobMock.mockClear();
  });

  it('records profile change with a JSON blob snapshot', async function () {
    await logOrganizationProfileChangeFromRecords(
      { authedItem: { name: 'Admin' } },
      'my-org',
      {
        name: 'my-org',
        title: 'New',
        sector: 's2',
        orgUnits: [{ name: 'unit-a' }],
        extRecordHash: 'hash',
      }
    );

    expect(recordActivityWithBlobMock).toHaveBeenCalledTimes(1);
    expect(recordActivityWithBlobMock.mock.calls[0][1]).toBe('updated');
    expect(recordActivityWithBlobMock.mock.calls[0][2]).toBe('OrganizationProfile');
    expect(recordActivityWithBlobMock.mock.calls[0][3]).toBe('my-org');
    expect(recordActivityWithBlobMock.mock.calls[0][4]).toBe(
      'Admin updated organization profile for my-org'
    );
    expect(recordActivityWithBlobMock.mock.calls[0][7]).toEqual({
      name: 'my-org',
      sector: 's2',
      title: 'New',
      extRecordHash: 'hash',
    });
    expect(recordActivityWithBlobMock.mock.calls[0][8]).toEqual([
      'org:my-org',
      'actor:Admin',
    ]);
    expect(recordActivityWithBlobMock.mock.calls[0][9]).toBeNull();
    const activityContext = JSON.parse(
      recordActivityWithBlobMock.mock.calls[0][6]
    );
    expect(activityContext.params.organization).toBe('my-org');
  });
});

describe('shouldLogOrgUnitEstablishment', function () {
  it('skips ckan-sourced org units', function () {
    expect(shouldLogOrgUnitEstablishment({ extSource: 'ckan' })).toBe(false);
  });

  it('allows non-ckan org units', function () {
    expect(shouldLogOrgUnitEstablishment({ extSource: 'internal' })).toBe(true);
    expect(shouldLogOrgUnitEstablishment({})).toBe(true);
  });
});

describe('logOrganizationUnitsFromChildSync', function () {
  beforeEach(() => {
    recordActivityWithBlobMock.mockClear();
    getOrganizationUnitMock.mockReset();
  });

  it('logs register activity for created child units under the parent org', async function () {
    await logOrganizationUnitsFromChildSync(
      { authedItem: { name: 'Admin' } },
      [
        {
          name: 'my-unit',
          title: 'Division of pups',
          description: 'Org unit for catalog activity test',
          extSource: 'internal',
        },
      ],
      [{ result: 'created' }],
      'my-org'
    );

    expect(getOrganizationUnitMock).not.toHaveBeenCalled();
    expect(recordActivityWithBlobMock).toHaveBeenCalledTimes(1);
    expect(recordActivityWithBlobMock.mock.calls[0][1]).toBe('registered');
    expect(recordActivityWithBlobMock.mock.calls[0][2]).toBe('OrganizationUnit');
    expect(recordActivityWithBlobMock.mock.calls[0][3]).toBe('my-unit');
    const activityContext = JSON.parse(
      recordActivityWithBlobMock.mock.calls[0][6]
    );
    expect(activityContext.params.organization).toBe('my-org');
    expect(activityContext.params.orgUnit).toBe('my-unit');
    expect(activityContext.message).toBe(
      '{actor} established organization unit {orgUnit}'
    );
  });

  it('logs profile updates for updated child units', async function () {
    await logOrganizationUnitsFromChildSync(
      { authedItem: { name: 'Admin' } },
      [
        {
          name: 'my-unit',
          title: 'Updated title',
          extSource: 'internal',
        },
      ],
      [{ result: 'updated' }],
      'my-org'
    );

    expect(recordActivityWithBlobMock).toHaveBeenCalledTimes(1);
    expect(recordActivityWithBlobMock.mock.calls[0][1]).toBe('updated');
    expect(recordActivityWithBlobMock.mock.calls[0][2]).toBe('OrganizationProfile');
  });

  it('does not log establishment for ckan-sourced child units', async function () {
    await logOrganizationUnitsFromChildSync(
      { authedItem: { name: 'Admin' } },
      [{ name: 'my-unit', title: 'BCDC unit', extSource: 'ckan' }],
      [{ result: 'created' }],
      'my-org'
    );

    expect(recordActivityWithBlobMock).not.toHaveBeenCalled();
  });
});

describe('logOrganizationUnitEstablishedFromRecords', function () {
  beforeEach(() => {
    recordActivityWithBlobMock.mockClear();
  });

  it('records org unit establishment with a JSON blob snapshot', async function () {
    await logOrganizationUnitEstablishedFromRecords(
      { authedItem: { name: 'Admin' } },
      'my-unit',
      {
        name: 'my-unit',
        title: 'New unit title',
        description: 'Unit details',
        extSource: 'internal',
      },
      'my-org'
    );

    expect(recordActivityWithBlobMock).toHaveBeenCalledTimes(1);
    expect(recordActivityWithBlobMock.mock.calls[0][1]).toBe('registered');
    expect(recordActivityWithBlobMock.mock.calls[0][2]).toBe('OrganizationUnit');
    expect(recordActivityWithBlobMock.mock.calls[0][4]).toBe(
      'Admin established organization unit my-unit'
    );
    expect(recordActivityWithBlobMock.mock.calls[0][8]).toEqual([
      'org:my-org',
      'orgUnit:my-unit',
      'actor:Admin',
    ]);
  });
});

describe('logOrganizationUnitProfileChangeFromRecords', function () {
  beforeEach(() => {
    recordActivityWithBlobMock.mockClear();
    getOrganizationUnitMock.mockReset();
  });

  it('records org unit profile changes under the parent org with orgUnit filter key', async function () {
    getOrganizationUnitMock.mockResolvedValue({
      name: 'my-org',
      orgUnits: [{ name: 'my-unit' }],
    });

    await logOrganizationUnitProfileChangeFromRecords(
      { authedItem: { name: 'Admin' } },
      'my-unit',
      {
        name: 'my-unit',
        title: 'New unit title',
        description: 'Unit details',
      }
    );

    expect(getOrganizationUnitMock).toHaveBeenCalledWith(
      { authedItem: { name: 'Admin' } },
      'my-unit'
    );
    expect(recordActivityWithBlobMock).toHaveBeenCalledTimes(1);
    expect(recordActivityWithBlobMock.mock.calls[0][3]).toBe('my-unit');
    expect(recordActivityWithBlobMock.mock.calls[0][7]).toEqual({
      name: 'my-unit',
      title: 'New unit title',
      description: 'Unit details',
    });
    expect(recordActivityWithBlobMock.mock.calls[0][8]).toEqual([
      'org:my-org',
      'orgUnit:my-unit',
      'actor:Admin',
    ]);
    expect(recordActivityWithBlobMock.mock.calls[0][4]).toBe(
      'Admin updated organization unit profile for my-unit'
    );
    const activityContext = JSON.parse(
      recordActivityWithBlobMock.mock.calls[0][6]
    );
    expect(activityContext.params.organization).toBe('my-org');
    expect(activityContext.params.orgUnit).toBe('my-unit');
    expect(activityContext.message).toBe(
      '{actor} updated organization unit profile for {orgUnit}'
    );
  });

  it('uses parentOrgName when provided without looking up the parent org', async function () {
    await logOrganizationUnitProfileChangeFromRecords(
      { authedItem: { name: 'Admin' } },
      'my-unit',
      {
        name: 'my-unit',
        title: 'New unit title',
        description: 'Unit details',
      },
      'my-org'
    );

    expect(getOrganizationUnitMock).not.toHaveBeenCalled();
    expect(recordActivityWithBlobMock).toHaveBeenCalledTimes(1);
    expect(recordActivityWithBlobMock.mock.calls[0][8]).toEqual([
      'org:my-org',
      'orgUnit:my-unit',
      'actor:Admin',
    ]);
  });

  it('does not record activity when parent org cannot be resolved', async function () {
    getOrganizationUnitMock.mockResolvedValue(null);

    await logOrganizationUnitProfileChangeFromRecords(
      { authedItem: { name: 'Admin' } },
      'my-unit',
      { name: 'my-unit', title: 'New' }
    );

    expect(recordActivityWithBlobMock).not.toHaveBeenCalled();
  });
});
