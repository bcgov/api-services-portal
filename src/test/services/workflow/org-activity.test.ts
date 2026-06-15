import {
  buildOrganizationProfileSnapshot,
  buildOrganizationUnitProfileSnapshot,
  OrgActivityResourceKind,
  OrgActivityService,
  logOrganizationAccessChanges,
  logOrganizationProfileChangeFromRecords,
  logOrganizationUnitEstablishedFromRecords,
  logOrganizationUnitProfileChangeFromRecords,
  logOrganizationUnitsFromChildSync,
  logSubsystemActivityFromHook,
  resourceRefId,
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

function getRecordActivityCall(mock: jest.Mock, callIndex = 0) {
  const [
    context,
    action,
    type,
    refId,
    message,
    result,
    activityContext,
    productNamespace,
    ids,
  ] = mock.mock.calls[callIndex];
  return {
    context,
    action,
    type,
    refId,
    message,
    result,
    activityContext,
    productNamespace,
    ids,
  };
}

function getRecordActivityWithBlobCall(mock: jest.Mock, callIndex = 0) {
  const [
    context,
    action,
    type,
    refId,
    message,
    result,
    activityContext,
    blob,
    ids,
    productNamespace,
  ] = mock.mock.calls[callIndex];
  return {
    context,
    action,
    type,
    refId,
    message,
    result,
    activityContext,
    blob,
    ids,
    productNamespace,
  };
}

describe('resourceRefId', function () {
  it('prefixes standard org activity resources', function () {
    expect(
      resourceRefId({
        kind: OrgActivityResourceKind.Subsystem,
        value: 'MY-SUBSYS',
      })
    ).toBe('subsystem:MY-SUBSYS');
  });

  it('uses bare Kong gateway key names', function () {
    expect(
      resourceRefId({
        kind: OrgActivityResourceKind.GatewayKey,
        value: 'sdx.keys.min.citz.org:0',
      })
    ).toBe('sdx.keys.min.citz.org:0');
  });
});

describe('resolveOrgHierarchyKeys', function () {
  it('uses the sole segment for root organization access', function () {
    expect(resolveOrgHierarchyKeys('', 'ca.bc.gov')).toEqual({
      filterOrg: 'ca.bc.gov',
      resource: {
        kind: OrgActivityResourceKind.Organization,
        value: 'ca.bc.gov',
      },
    });
  });

  it('uses the leaf org for ministry-level access under ca.bc.gov', function () {
    expect(
      resolveOrgHierarchyKeys('/ca.bc.gov', 'ministry-of-kittens')
    ).toEqual({
      filterOrg: 'ministry-of-kittens',
      resource: {
        kind: OrgActivityResourceKind.Organization,
        value: 'ministry-of-kittens',
      },
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
      resource: {
        kind: OrgActivityResourceKind.OrgUnit,
        value: 'division-of-toys',
      },
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
    const call = getRecordActivityWithBlobCall(recordActivityWithBlobMock);
    expect(call.action).toBe('registered');
    expect(call.type).toBe('Organization');
    expect(call.blob).toEqual({
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
    expect(getRecordActivityCall(recordActivityMock).ids).toContain('actor:Alice');

    recordActivityMock.mockClear();
    const ctxReq = { req: { user: { name: 'Bob' } } };
    await new OrgActivityService(ctxReq, 'my-org').logOrganizationEstablished(
      true
    );
    expect(getRecordActivityCall(recordActivityMock).ids).toContain('actor:Bob');

    recordActivityMock.mockClear();
    await new OrgActivityService({}, 'my-org').logOrganizationEstablished(true);
    expect(getRecordActivityCall(recordActivityMock).ids).toContain('actor:system');
  });

  it('always records access changes as "updated" with the signed delta', async function () {
    const service = new OrgActivityService({ authedItem: { name: 'Admin' } }, 'my-org');

    await service.logUpdateOrganizationAccess(true, {
      subject_email: 'user1@local',
      subject: 'User One',
      roles: '[-] organization-admin',
      resource: {
        kind: OrgActivityResourceKind.Organization,
        value: 'my-org',
      },
    });
    const call = getRecordActivityCall(recordActivityMock);
    expect(call.action).toBe('updated');
    expect(call.refId).toBe('org:my-org');
    const ctx = JSON.parse(call.activityContext);
    expect(ctx.params.subject_email).toBe('user1@local');
    expect(ctx.params.subject).toBe('User One');
    expect(ctx.params.accessAction).toBeUndefined();
    expect(ctx.message).toBe(
      '{actor} {action} {subject} organization access on {organization}: {roles}'
    );
    expect(call.ids).toContain('user:user1@local');
    expect(call.message).toBe(
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
      gatewayKeyName: 'sdx.keys.min.citz.org:0',
      detail: 'published key sdx.keys.min.citz.org:0',
      deckBlob,
    });

    expect(recordActivityWithBlobMock).toHaveBeenCalledTimes(1);
    expect(recordActivityMock).not.toHaveBeenCalled();
    const call = getRecordActivityWithBlobCall(recordActivityWithBlobMock);
    expect(call.action).toBe('published');
    expect(call.type).toBe('OrganizationKey');
    expect(call.refId).toBe('sdx.keys.min.citz.org:0');
    const ctx = JSON.parse(call.activityContext);
    expect(ctx.params.entity).toBe('OrganizationKey');
    expect(ctx.params.targetName).toBe('my-org');
    expect(ctx.params.detail).toBe('published key sdx.keys.min.citz.org:0');
    expect(call.blob).toBe(deckBlob);
    expect(call.ids).toEqual([
      'org:my-org',
      'scope:organization',
      'actor:Admin',
    ]);
    expect(call.message).toBe(
      'Admin published sdx-keys.r1 for my-org: published key sdx.keys.min.citz.org:0'
    );
  });

  it('records removed activity for logGatewayPatternPublish remove path', async function () {
    const service = new OrgActivityService({ authedItem: { name: 'Admin' } }, 'my-org');
    await service.logGatewayPatternPublish(true, {
      pattern: 'sdx-keys.r1',
      scope: 'organization',
      targetName: 'my-org',
      gatewayKeyName: 'sdx.keys.min.citz.org:0',
      detail: 'removed key sdx.keys.min.citz.org:0',
      removed: true,
    });

    expect(recordActivityMock).toHaveBeenCalledTimes(1);
    expect(recordActivityWithBlobMock).not.toHaveBeenCalled();
    const call = getRecordActivityCall(recordActivityMock);
    expect(call.action).toBe('removed');
    expect(call.message).toBe(
      'Admin removed sdx-keys.r1 for my-org: removed key sdx.keys.min.citz.org:0'
    );
  });

  it('uses RuntimeGroupKey entity when runtime-group-scoped', async function () {
    const service = new OrgActivityService({ authedItem: { name: 'Admin' } }, 'my-org');
    await service.logGatewayPatternPublish(true, {
      pattern: 'sdx-keys.r1',
      scope: 'runtime-group',
      targetName: 'my-edge-rg',
      gatewayKeyName: 'sdx.keys.my-edge-rg.edge:0',
      detail: 'published key sdx.keys.my-edge-rg.edge:0',
      deckBlob: 'results: creating key\n',
    });

    expect(getRecordActivityWithBlobCall(recordActivityWithBlobMock).type).toBe(
      'RuntimeGroupKey'
    );
  });

  it('includes targetName when subsystem-scoped', async function () {
    const service = new OrgActivityService({ authedItem: { name: 'Admin' } }, 'my-org');
    await service.logGatewayPatternPublish(true, {
      pattern: 'sdx-keys.r1',
      scope: 'subsystem',
      targetName: 'LAB.MIN.FOOD.MY-UI',
      gatewayKeyName: 'sdx.keys.lab.min.food.my-ui.sys:0',
      detail: 'published key sdx.keys.lab.min.food.my-ui.sys:0',
      deckBlob: 'results: creating key\n',
    });

    const call = getRecordActivityWithBlobCall(recordActivityWithBlobMock);
    expect(call.type).toBe('SubsystemKey');
    expect(call.refId).toBe('sdx.keys.lab.min.food.my-ui.sys:0');
    expect(call.message).toBe(
      'Admin published sdx-keys.r1 for LAB.MIN.FOOD.MY-UI: published key sdx.keys.lab.min.food.my-ui.sys:0'
    );
    expect(call.ids).toEqual([
      'org:my-org',
      'scope:subsystem',
      'client:LAB.MIN.FOOD.MY-UI',
      'actor:Admin',
    ]);
  });

  it('uses GatewayPatternPublish entity for non-key patterns', async function () {
    const service = new OrgActivityService({ authedItem: { name: 'Admin' } }, 'my-org');
    await service.logGatewayPatternPublish(true, {
      pattern: 'sdx-p2p-consumer.r1',
    });

    const call = getRecordActivityCall(recordActivityMock);
    expect(call.type).toBe('GatewayPatternPublish');
    expect(call.refId).toBe('pattern:sdx-p2p-consumer.r1');
    expect(call.message).toBe('Admin published sdx-p2p-consumer.r1');
    expect(call.ids).toEqual(['org:my-org', 'actor:Admin']);
  });

  it('always passes org filterKey as first id', async function () {
    await new OrgActivityService({ authedItem: { name: 'Admin' } }, 'my-org')
      .logOrganizationCSR(true, { runtimeGroupName: 'my-edge-rg' });

    const call = getRecordActivityCall(recordActivityMock);
    expect(call.refId).toBe('csr:my-edge-rg');
    expect(call.ids[0]).toBe('org:my-org');
  });

  it('records subsystem create with org filter keys, subsystem refId, and product namespace', async function () {
    await new OrgActivityService({ authedItem: { name: 'Admin' } }, 'my-org')
      .logSubsystemCreated(true, {
        subsystemName: 'MY-SUBSYS',
        productNamespace: 'sdx-abc123',
      });

    expect(recordActivityMock).toHaveBeenCalledTimes(1);
    const call = getRecordActivityCall(recordActivityMock);
    expect(call.action).toBe('created');
    expect(call.type).toBe('Subsystem');
    expect(call.refId).toBe('subsystem:MY-SUBSYS');
    expect(call.message).toBe('Admin created subsystem MY-SUBSYS on my-org');
    expect(call.productNamespace).toBe('sdx-abc123');
    expect(call.ids).toEqual([
      'org:my-org',
      'subsystem:MY-SUBSYS',
      'actor:Admin',
    ]);
  });

  it('records subsystem delete with subsystem refId and product namespace', async function () {
    await new OrgActivityService({ authedItem: { name: 'Admin' } }, 'my-org')
      .logSubsystemDeleted(true, {
        subsystemName: 'MY-SUBSYS',
        productNamespace: 'sdx-abc123',
      });

    const call = getRecordActivityCall(recordActivityMock);
    expect(call.action).toBe('deleted');
    expect(call.refId).toBe('subsystem:MY-SUBSYS');
    expect(call.productNamespace).toBe('sdx-abc123');
  });

  it('records subsystem profile updates with a profile blob and product namespace', async function () {
    await new OrgActivityService({ authedItem: { name: 'Admin' } }, 'my-org')
      .logSubsystemProfileChange(true, {
        subsystemName: 'MY-SUBSYS',
        productNamespace: 'sdx-abc123',
        profile: { name: 'MY-SUBSYS', description: 'Updated details' },
      });

    expect(recordActivityWithBlobMock).toHaveBeenCalledTimes(1);
    const call = getRecordActivityWithBlobCall(recordActivityWithBlobMock);
    expect(call.action).toBe('updated');
    expect(call.type).toBe('Subsystem');
    expect(call.refId).toBe('subsystem:MY-SUBSYS');
    expect(call.blob).toEqual({
      name: 'MY-SUBSYS',
      description: 'Updated details',
    });
    expect(call.productNamespace).toBe('sdx-abc123');
    expect(call.message).toBe(
      'Admin updated subsystem profile for MY-SUBSYS on my-org'
    );
  });

  it('records service publish with org, subsystem, and service filter keys', async function () {
    await new OrgActivityService({ authedItem: { name: 'Admin' } }, 'my-org')
      .logServicePublished(true, {
        serviceName: 'MY-SERVICE',
        subsystemName: 'MY-SUBSYS',
      });

    const call = getRecordActivityCall(recordActivityMock);
    expect(call.action).toBe('published');
    expect(call.type).toBe('Service');
    expect(call.refId).toBe('service:MY-SERVICE');
    expect(call.message).toBe(
      'Admin published service MY-SERVICE on subsystem MY-SUBSYS in my-org'
    );
    expect(call.ids).toEqual([
      'org:my-org',
      'subsystem:MY-SUBSYS',
      'service:MY-SERVICE',
      'actor:Admin',
    ]);
  });

  it('records service remove in past tense', async function () {
    await new OrgActivityService({ authedItem: { name: 'Admin' } }, 'my-org')
      .logServiceRemoved(true, {
        serviceName: 'MY-SERVICE',
        subsystemName: 'MY-SUBSYS',
      });

    const call = getRecordActivityCall(recordActivityMock);
    expect(call.action).toBe('removed');
    expect(call.refId).toBe('service:MY-SERVICE');
    expect(call.message).toBe(
      'Admin removed service MY-SERVICE from subsystem MY-SUBSYS in my-org'
    );
  });
});

describe('logSubsystemActivityFromHook', function () {
  beforeEach(() => {
    recordActivityMock.mockClear();
    recordActivityWithBlobMock.mockClear();
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
        namespace: 'sdx-abc123',
      }
    );

    expect(recordActivityMock).toHaveBeenCalledTimes(1);
    const call = getRecordActivityCall(recordActivityMock);
    expect(call.action).toBe('created');
    expect(call.refId).toBe('subsystem:MY-SUBSYS');
    expect(call.productNamespace).toBe('sdx-abc123');
    expect(call.ids[0]).toBe('org:ca.bc.gov.my-org');
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
        {
          name: 'MY-SUBSYS',
          organization: '999',
          namespace: 'sdx-abc123',
        }
      )
    ).rejects.toThrow(/Unable to resolve organization name/);
  });

  it('throws when subsystem product namespace is missing', async function () {
    await expect(
      logSubsystemActivityFromHook(
        {
          authedItem: { name: 'Admin' },
          executeGraphQL: jest.fn().mockResolvedValue({
            data: { allOrganizations: [{ name: 'ca.bc.gov.my-org' }] },
          }),
        },
        'create',
        null,
        { name: 'MY-SUBSYS', organization: '3' }
      )
    ).rejects.toThrow(/Subsystem product namespace is required/);
  });

  it('records delete activity from subsystem hook data', async function () {
    await logSubsystemActivityFromHook(
      {
        authedItem: { name: 'Admin' },
        executeGraphQL: jest.fn().mockResolvedValue({
          data: { allOrganizations: [{ name: 'ca.bc.gov.my-org' }] },
        }),
      },
      'delete',
      {
        name: 'MY-SUBSYS',
        organization: '3',
        namespace: 'sdx-abc123',
      },
      {
        name: 'MY-SUBSYS',
        organization: '3',
        namespace: 'sdx-abc123',
      }
    );

    expect(recordActivityMock).toHaveBeenCalledTimes(1);
    const call = getRecordActivityCall(recordActivityMock);
    expect(call.action).toBe('deleted');
    expect(call.refId).toBe('subsystem:MY-SUBSYS');
    expect(call.productNamespace).toBe('sdx-abc123');
  });

  it('records update activity even when profile is unchanged', async function () {
    await logSubsystemActivityFromHook(
      {
        authedItem: { name: 'Admin' },
        executeGraphQL: jest.fn().mockResolvedValue({
          data: { allOrganizations: [{ name: 'ca.bc.gov.my-org' }] },
        }),
      },
      'update',
      {
        description: 'same',
        name: 'MY-SUBSYS',
        organization: '3',
        namespace: 'sdx-abc123',
      },
      {
        description: 'same',
        name: 'MY-SUBSYS',
        organization: '3',
        namespace: 'sdx-abc123',
      }
    );

    expect(recordActivityWithBlobMock).toHaveBeenCalledTimes(1);
    const call = getRecordActivityWithBlobCall(recordActivityWithBlobMock);
    expect(call.action).toBe('updated');
    expect(call.type).toBe('Subsystem');
    expect(call.refId).toBe('subsystem:MY-SUBSYS');
    expect(call.productNamespace).toBe('sdx-abc123');
    expect(call.blob).toEqual({
      name: 'MY-SUBSYS',
      description: 'same',
    });
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
    const call = getRecordActivityCall(recordActivityMock);
    expect(call.action).toBe('updated');
    expect(call.refId).toBe('org:my-org');
    expect(call.ids).toEqual([
      'org:my-org',
      'user:aidan@idir',
      'actor:Admin',
    ]);
    const message = call.message;
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

    const call = getRecordActivityCall(recordActivityMock);
    expect(call.refId).toBe('orgUnit:my-unit');
    expect(call.ids).toEqual([
      'org:my-org',
      'orgUnit:my-unit',
      'user:aidan@idir',
      'actor:Admin',
    ]);
    expect(call.message).toBe(
      'Admin updated Cope, Aidan CITZ:EX organization unit access on my-unit: [+] organization-admin'
    );
    const ctx = JSON.parse(call.activityContext);
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
    const call = getRecordActivityCall(recordActivityMock);
    expect(call.action).toBe('updated');
    expect(call.message).toBe(
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
    const call = getRecordActivityCall(recordActivityMock);
    expect(call.action).toBe('updated');
    expect(call.message).toBe(
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
    const call = getRecordActivityWithBlobCall(recordActivityWithBlobMock);
    expect(call.action).toBe('updated');
    expect(call.type).toBe('OrganizationProfile');
    expect(call.refId).toBe('org:my-org');
    expect(call.message).toBe('Admin updated organization profile for my-org');
    expect(call.blob).toEqual({
      name: 'my-org',
      sector: 's2',
      title: 'New',
      extRecordHash: 'hash',
    });
    expect(call.ids).toEqual(['org:my-org', 'actor:Admin']);
    expect(call.productNamespace).toBeNull();
    const activityContext = JSON.parse(call.activityContext);
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
    const call = getRecordActivityWithBlobCall(recordActivityWithBlobMock);
    expect(call.action).toBe('registered');
    expect(call.type).toBe('OrganizationUnit');
    expect(call.refId).toBe('orgUnit:my-unit');
    const activityContext = JSON.parse(call.activityContext);
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
    const call = getRecordActivityWithBlobCall(recordActivityWithBlobMock);
    expect(call.action).toBe('updated');
    expect(call.type).toBe('OrganizationProfile');
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
    const call = getRecordActivityWithBlobCall(recordActivityWithBlobMock);
    expect(call.action).toBe('registered');
    expect(call.type).toBe('OrganizationUnit');
    expect(call.message).toBe('Admin established organization unit my-unit');
    expect(call.ids).toEqual([
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
    const call = getRecordActivityWithBlobCall(recordActivityWithBlobMock);
    expect(call.refId).toBe('orgUnit:my-unit');
    expect(call.blob).toEqual({
      name: 'my-unit',
      title: 'New unit title',
      description: 'Unit details',
    });
    expect(call.ids).toEqual([
      'org:my-org',
      'orgUnit:my-unit',
      'actor:Admin',
    ]);
    expect(call.message).toBe(
      'Admin updated organization unit profile for my-unit'
    );
    const activityContext = JSON.parse(call.activityContext);
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
    expect(getRecordActivityWithBlobCall(recordActivityWithBlobMock).ids).toEqual([
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
