import {
  buildOrganizationProfileSnapshot,
  buildOrganizationUnitProfileSnapshot,
  OrgActivityResourceKind,
  OrgActivityService,
  isGatewayPatternPublishSuccessful,
  formatHostedOrganizationsParam,
  hasHostedOrganizationsChange,
  logOrganizationAccessChanges,
  logOrganizationActivityFromHook,
  logOrganizationUnitActivityFromHook,
  logOpenAPISpecActivityFromHook,
  logRuntimeGroupActivityFromHook,
  logSubsystemActivityFromHook,
  relationshipNameFromRef,
  resourceRefId,
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

jest.mock('../../../services/keystone/organization', () => {
  const actual = jest.requireActual('../../../services/keystone/organization');
  return {
    ...actual,
    getOrganizationUnit: jest.fn(),
  };
});

const recordActivityMock = activityModule.recordActivity as jest.Mock;
const recordActivityWithBlobMock =
  activityModule.recordActivityWithBlob as jest.Mock;
const getOrganizationUnitMock =
  organizationModule.getOrganizationUnit as jest.Mock;

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

describe('isGatewayPatternPublishSuccessful', function () {
  it('returns true for empty DELETE response', function () {
    expect(isGatewayPatternPublishSuccessful({}, 'delete')).toBe(true);
  });

  it('returns false for empty apply response', function () {
    expect(isGatewayPatternPublishSuccessful({}, 'apply')).toBe(false);
  });

  it('returns false for null apply response', function () {
    expect(isGatewayPatternPublishSuccessful(null, 'apply')).toBe(false);
  });

  it('returns true for null delete response', function () {
    expect(isGatewayPatternPublishSuccessful(null, 'delete')).toBe(true);
  });

  it('returns true when failed is 0', function () {
    expect(
      isGatewayPatternPublishSuccessful(
        {
          applied: 1,
          failed: 0,
          results: [{ provider: 'gwa', status: 'applied' }],
        },
        'apply'
      )
    ).toBe(true);
  });

  it('returns false when failed is greater than 0', function () {
    expect(
      isGatewayPatternPublishSuccessful(
        {
          applied: 0,
          failed: 1,
          results: [
            {
              provider: 'gwa',
              status: 'failed',
              details: { message: 'GWA API responded 403' },
            },
          ],
        },
        'apply'
      )
    ).toBe(false);
  });

  it('returns false when any result status is failed', function () {
    expect(
      isGatewayPatternPublishSuccessful(
        {
          results: [
            { provider: 'gwa', status: 'applied' },
            { provider: 'gwa', status: 'failed' },
          ],
        },
        'apply'
      )
    ).toBe(false);
  });

  it('returns false for remove when failed is greater than 0', function () {
    expect(
      isGatewayPatternPublishSuccessful(
        {
          failed: 1,
          results: [{ provider: 'gwa', status: 'failed' }],
        },
        'delete'
      )
    ).toBe(false);
  });

  it('returns true for apply when results is a successful deck output string', function () {
    expect(
      isGatewayPatternPublishSuccessful(
        {
          results: 'results: |\n  creating key-set sdx.org.min.citz\n',
        },
        'apply'
      )
    ).toBe(true);
  });

  it('returns false for apply when results string reports failed count', function () {
    expect(
      isGatewayPatternPublishSuccessful(
        {
          results: 'applied: 0\nfailed: 1\n',
        },
        'apply'
      )
    ).toBe(false);
  });
});

describe('OrgActivityService', function () {
  beforeEach(() => {
    recordActivityMock.mockClear();
    recordActivityWithBlobMock.mockClear();
  });

  it('records organization establishment with a profile blob when provided', async function () {
    await new OrgActivityService(
      { authedItem: { name: 'Admin' } },
      'my-org'
    ).logOrganizationEstablished(true, {
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
    await new OrgActivityService(
      ctxAuthed,
      'my-org'
    ).logOrganizationEstablished(true);
    expect(getRecordActivityCall(recordActivityMock).ids).toContain(
      'actor:Alice'
    );

    recordActivityMock.mockClear();
    const ctxReq = { req: { user: { name: 'Bob' } } };
    await new OrgActivityService(ctxReq, 'my-org').logOrganizationEstablished(
      true
    );
    expect(getRecordActivityCall(recordActivityMock).ids).toContain(
      'actor:Bob'
    );

    recordActivityMock.mockClear();
    await new OrgActivityService({}, 'my-org').logOrganizationEstablished(true);
    expect(getRecordActivityCall(recordActivityMock).ids).toContain(
      'actor:system'
    );
  });

  it('always records access changes as "updated" with the signed delta', async function () {
    const service = new OrgActivityService(
      { authedItem: { name: 'Admin' } },
      'my-org'
    );

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

  it('records failed activity for logGatewayPatternPublish', async function () {
    const deckBlob = 'applied: 0\nfailed: 1\n';
    const service = new OrgActivityService(
      { authedItem: { name: 'Admin' } },
      'my-org'
    );
    await service.logGatewayPatternPublish(false, {
      pattern: 'sdx-keys.r1',
      scope: 'organization',
      targetName: 'my-org',
      gatewayKeyName: 'sdx.keys.min.citz.org:0',
      detail: 'published key sdx.keys.min.citz.org:0',
      deckBlob,
    });

    const call = getRecordActivityWithBlobCall(recordActivityWithBlobMock);
    expect(call.result).toBe('failed');
  });

  it('records one published activity for logGatewayPatternPublish', async function () {
    const deckBlob = 'results: |\n  creating key-set sdx.org.min.citz\n';
    const service = new OrgActivityService(
      { authedItem: { name: 'Admin' } },
      'my-org'
    );
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
    const service = new OrgActivityService(
      { authedItem: { name: 'Admin' } },
      'my-org'
    );
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
    const service = new OrgActivityService(
      { authedItem: { name: 'Admin' } },
      'my-org'
    );
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
    const service = new OrgActivityService(
      { authedItem: { name: 'Admin' } },
      'my-org'
    );
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
    const service = new OrgActivityService(
      { authedItem: { name: 'Admin' } },
      'my-org'
    );
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
    await new OrgActivityService(
      { authedItem: { name: 'Admin' } },
      'my-org'
    ).logOrganizationCSR(true, { runtimeGroupName: 'my-edge-rg' });

    const call = getRecordActivityCall(recordActivityMock);
    expect(call.refId).toBe('csr:my-edge-rg');
    expect(call.ids[0]).toBe('org:my-org');
  });

  it('records subsystem create with org filter keys, subsystem refId, and product namespace', async function () {
    await new OrgActivityService(
      { authedItem: { name: 'Admin' } },
      'my-org'
    ).logSubsystemCreated(true, {
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
    await new OrgActivityService(
      { authedItem: { name: 'Admin' } },
      'my-org'
    ).logSubsystemDeleted(true, {
      subsystemName: 'MY-SUBSYS',
      productNamespace: 'sdx-abc123',
    });

    const call = getRecordActivityCall(recordActivityMock);
    expect(call.action).toBe('deleted');
    expect(call.refId).toBe('subsystem:MY-SUBSYS');
    expect(call.productNamespace).toBe('sdx-abc123');
  });

  it('records subsystem profile updates with a profile blob and product namespace', async function () {
    await new OrgActivityService(
      { authedItem: { name: 'Admin' } },
      'my-org'
    ).logSubsystemProfileChange(true, {
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
    await new OrgActivityService(
      { authedItem: { name: 'Admin' } },
      'my-org'
    ).logServicePublished(true, {
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
    await new OrgActivityService(
      { authedItem: { name: 'Admin' } },
      'my-org'
    ).logServiceRemoved(true, {
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

  it('records runtime group create with runtime group refId and hosting params', async function () {
    await new OrgActivityService(
      { authedItem: { name: 'Admin' } },
      'my-org'
    ).logRuntimeGroupCreated(true, {
      runtimeGroupName: 'myedge',
      hostedOrganizations: ['ministry-of-health', 'my-org'],
    });

    expect(recordActivityMock).toHaveBeenCalledTimes(1);
    const call = getRecordActivityCall(recordActivityMock);
    expect(call.action).toBe('created');
    expect(call.type).toBe('RuntimeGroup');
    expect(call.refId).toBe('runtimeGroup:myedge');
    expect(call.message).toBe(
      'Admin created runtime group myedge on my-org hosting ministry-of-health, my-org'
    );
    expect(call.ids).toEqual([
      'org:my-org',
      'runtimeGroup:myedge',
      'actor:Admin',
    ]);
    const context = JSON.parse(call.activityContext);
    expect(context.params.hostedOrganizations).toBe(
      'ministry-of-health, my-org'
    );
  });

  it('records runtime group create without hosting param when empty', async function () {
    await new OrgActivityService(
      { authedItem: { name: 'Admin' } },
      'my-org'
    ).logRuntimeGroupCreated(true, {
      runtimeGroupName: 'myedge',
    });

    const call = getRecordActivityCall(recordActivityMock);
    expect(call.message).toBe('Admin created runtime group myedge on my-org');
    const context = JSON.parse(call.activityContext);
    expect(context.params.hostedOrganizations).toBeUndefined();
  });

  it('records runtime group delete with runtime group refId', async function () {
    await new OrgActivityService(
      { authedItem: { name: 'Admin' } },
      'my-org'
    ).logRuntimeGroupDeleted(true, { runtimeGroupName: 'myedge' });

    const call = getRecordActivityCall(recordActivityMock);
    expect(call.action).toBe('deleted');
    expect(call.type).toBe('RuntimeGroup');
    expect(call.refId).toBe('runtimeGroup:myedge');
    expect(call.message).toBe('Admin deleted runtime group myedge on my-org');
    expect(call.ids).toEqual([
      'org:my-org',
      'runtimeGroup:myedge',
      'actor:Admin',
    ]);
  });

  it('records runtime group hosting updates with full list in params', async function () {
    await new OrgActivityService(
      { authedItem: { name: 'Admin' } },
      'my-org'
    ).logRuntimeGroupHostingChange(true, {
      runtimeGroupName: 'myedge',
      hostedOrganizations: ['ministry-of-health'],
    });

    const call = getRecordActivityCall(recordActivityMock);
    expect(call.action).toBe('updated');
    expect(call.type).toBe('RuntimeGroup');
    expect(call.refId).toBe('runtimeGroup:myedge');
    expect(call.message).toBe(
      'Admin updated hosted organizations for runtime group myedge on my-org: ministry-of-health'
    );
    const context = JSON.parse(call.activityContext);
    expect(context.params.hostedOrganizations).toBe('ministry-of-health');
  });
});

describe('hosted organization helpers', function () {
  it('formats hosted organizations for params', function () {
    expect(
      formatHostedOrganizationsParam(['ministry-of-health', 'my-org'])
    ).toBe('ministry-of-health, my-org');
    expect(formatHostedOrganizationsParam([])).toBe('');
  });

  it('detects hosted organization list changes', async function () {
    const context = {
      executeGraphQL: jest.fn().mockResolvedValue({
        data: { allOrganizations: [{ name: 'my-org' }] },
      }),
    };

    await expect(
      hasHostedOrganizationsChange(
        context,
        { hostedOrganizations: ['org-1'] },
        { hostedOrganizations: [] }
      )
    ).resolves.toBe(true);
  });

  it('ignores unchanged hosted organization lists', async function () {
    await expect(
      hasHostedOrganizationsChange(
        {},
        { hostedOrganizations: [{ name: 'my-org' }] },
        { hostedOrganizations: [{ name: 'my-org' }] }
      )
    ).resolves.toBe(false);
  });
});

describe('relationshipNameFromRef', function () {
  const lookupById = jest.fn();

  beforeEach(() => {
    lookupById.mockReset();
  });

  it('returns embedded name from relationship object', async function () {
    await expect(
      relationshipNameFromRef({}, { name: 'my-org' }, lookupById)
    ).resolves.toBe('my-org');
    expect(lookupById).not.toHaveBeenCalled();
  });

  it('looks up name by relationship object id', async function () {
    lookupById.mockResolvedValue('my-org');
    await expect(
      relationshipNameFromRef({}, { id: '27' }, lookupById)
    ).resolves.toBe('my-org');
    expect(lookupById).toHaveBeenCalledWith({}, '27');
  });

  it('falls back to raw id when lookup misses and fallbackToRawId is set', async function () {
    lookupById.mockResolvedValue(undefined);
    await expect(
      relationshipNameFromRef({}, 'org-1', lookupById, {
        fallbackToRawId: true,
      })
    ).resolves.toBe('org-1');
  });

  it('returns undefined when lookup misses and fallbackToRawId is false', async function () {
    lookupById.mockResolvedValue(undefined);
    await expect(
      relationshipNameFromRef({}, 'org-1', lookupById)
    ).resolves.toBeUndefined();
  });
});

describe('logOrganizationActivityFromHook', function () {
  beforeEach(() => {
    recordActivityMock.mockClear();
    recordActivityWithBlobMock.mockClear();
  });

  it('records organization establishment on create', async function () {
    await logOrganizationActivityFromHook(
      { authedItem: { name: 'Admin' } },
      'create',
      null,
      {
        name: 'my-org',
        title: 'My Org',
        description: 'About us',
        tags: '[]',
        extSource: 'ckan',
      }
    );

    expect(recordActivityWithBlobMock).toHaveBeenCalledTimes(1);
    const call = getRecordActivityWithBlobCall(recordActivityWithBlobMock);
    expect(call.action).toBe('registered');
    expect(call.type).toBe('Organization');
    expect(call.blob?.title).toBe('My Org');
  });

  it('records organization establishment and linked org units on create', async function () {
    await logOrganizationActivityFromHook(
      { authedItem: { name: 'Admin' } },
      'create',
      null,
      {
        name: 'my-org',
        title: 'My Org',
        description: 'About us',
        tags: '[]',
        extSource: 'internal',
      },
      {
        orgUnits: {
          create: [
            {
              name: 'unit-a',
              title: 'Unit A',
              description: 'Unit details',
              tags: '[]',
              extSource: 'internal',
              extRecordHash: '',
            },
          ],
        },
      }
    );

    expect(recordActivityWithBlobMock).toHaveBeenCalledTimes(2);
    const orgCall = getRecordActivityWithBlobCall(
      recordActivityWithBlobMock,
      0
    );
    expect(orgCall.action).toBe('registered');
    expect(orgCall.type).toBe('Organization');
    const unitCall = getRecordActivityWithBlobCall(
      recordActivityWithBlobMock,
      1
    );
    expect(unitCall.action).toBe('registered');
    expect(unitCall.type).toBe('OrganizationUnit');
    expect(unitCall.message).toBe('Admin established organization unit unit-a');
    expect(unitCall.blob).toEqual({
      name: 'unit-a',
      title: 'Unit A',
      description: 'Unit details',
      tags: '[]',
      extSource: 'internal',
      extRecordHash: '',
    });
  });

  it('records organization profile updates on scalar field changes', async function () {
    await logOrganizationActivityFromHook(
      { authedItem: { name: 'Admin' } },
      'update',
      { name: 'my-org', title: 'Old' },
      { name: 'my-org', title: 'New' }
    );

    expect(recordActivityWithBlobMock).toHaveBeenCalledTimes(1);
    const call = getRecordActivityWithBlobCall(recordActivityWithBlobMock);
    expect(call.action).toBe('updated');
    expect(call.type).toBe('OrganizationProfile');
    expect(call.blob).toEqual({
      name: 'my-org',
      title: 'New',
    });
  });

  it('records org unit establishment from originalInput connect mutation', async function () {
    const executeGraphQL = jest.fn().mockResolvedValue({
      data: {
        allOrganizationUnits: [
          {
            name: 'unit-2',
            title: 'Unit 2',
            description: 'Second unit',
            tags: '[]',
            extSource: 'internal',
            extRecordHash: '',
          },
        ],
      },
    });

    await logOrganizationActivityFromHook(
      { authedItem: { name: 'Admin' }, executeGraphQL },
      'update',
      { name: 'my-org', title: 'Same', orgUnits: [] },
      { name: 'my-org', title: 'Same' },
      { orgUnits: { disconnectAll: true, connect: [{ id: 'unit-2' }] } }
    );

    expect(recordActivityWithBlobMock).toHaveBeenCalledTimes(1);
    const call = getRecordActivityWithBlobCall(recordActivityWithBlobMock);
    expect(call.action).toBe('registered');
    expect(call.type).toBe('OrganizationUnit');
    expect(call.message).toBe('Admin established organization unit unit-2');
  });
});

describe('logOrganizationUnitActivityFromHook', function () {
  beforeEach(() => {
    recordActivityWithBlobMock.mockClear();
    getOrganizationUnitMock.mockReset();
  });

  it('records org unit profile updates on update', async function () {
    getOrganizationUnitMock.mockResolvedValue({
      name: 'my-org',
      orgUnits: [{ name: 'my-unit' }],
    });

    await logOrganizationUnitActivityFromHook(
      { authedItem: { name: 'Admin' } },
      { name: 'my-unit', title: 'Old' },
      { name: 'my-unit', title: 'New' }
    );

    expect(getOrganizationUnitMock).toHaveBeenCalledWith(
      { authedItem: { name: 'Admin' } },
      'my-unit'
    );
    expect(recordActivityWithBlobMock).toHaveBeenCalledTimes(1);
    const call = getRecordActivityWithBlobCall(recordActivityWithBlobMock);
    expect(call.action).toBe('updated');
    expect(call.type).toBe('OrganizationProfile');
    expect(call.refId).toBe('orgUnit:my-unit');
    expect(call.blob).toEqual({
      name: 'my-unit',
      title: 'New',
    });
    expect(call.ids).toEqual(['org:my-org', 'orgUnit:my-unit', 'actor:Admin']);
  });
});

describe('logRuntimeGroupActivityFromHook', function () {
  beforeEach(() => {
    recordActivityMock.mockClear();
  });

  it('records runtime group create from hook data', async function () {
    await logRuntimeGroupActivityFromHook(
      {
        authedItem: { name: 'Admin' },
        executeGraphQL: jest.fn().mockResolvedValue({
          data: { allOrganizations: [{ name: 'my-org' }] },
        }),
      },
      'create',
      null,
      {
        name: 'myedge',
        organization: 'org-1',
        hostedOrganizations: ['org-1'],
      }
    );

    const call = getRecordActivityCall(recordActivityMock);
    expect(call.action).toBe('created');
    expect(call.refId).toBe('runtimeGroup:myedge');
  });

  it('records runtime group hosting change from hook data', async function () {
    await logRuntimeGroupActivityFromHook(
      {
        authedItem: { name: 'Admin' },
        executeGraphQL: jest.fn().mockResolvedValue({
          data: { allOrganizations: [{ name: 'my-org' }] },
        }),
      },
      'update',
      {
        name: 'myedge',
        organization: { name: 'my-org' },
        hostedOrganizations: [{ name: 'my-org' }],
      },
      {
        name: 'myedge',
        organization: { name: 'my-org' },
        hostedOrganizations: [],
      }
    );

    const call = getRecordActivityCall(recordActivityMock);
    expect(call.action).toBe('updated');
    const context = JSON.parse(call.activityContext);
    expect(context.params.hostedOrganizations).toBe('');
  });

  it('records hosting clear when originalInput includes hostedOrganizations', async function () {
    await logRuntimeGroupActivityFromHook(
      {
        authedItem: { name: 'Admin' },
        executeGraphQL: jest.fn().mockResolvedValue({
          data: {
            allOrganizations: [{ name: 'my-org' }],
            allRuntimeGroups: [
              {
                organization: { name: 'my-org' },
                hostedOrganizations: [],
              },
            ],
          },
        }),
      },
      'update',
      {
        name: 'myedge',
        organization: { name: 'my-org' },
      },
      {
        name: 'myedge',
        organization: { name: 'my-org' },
      },
      { hostedOrganizations: { disconnectAll: true } }
    );

    const call = getRecordActivityCall(recordActivityMock);
    expect(call.action).toBe('updated');
    const context = JSON.parse(call.activityContext);
    expect(context.params.hostedOrganizations).toBe('');
  });

  it('skips runtime group logging when only endpoints change', async function () {
    await logRuntimeGroupActivityFromHook(
      {
        authedItem: { name: 'Admin' },
        executeGraphQL: jest.fn().mockResolvedValue({
          data: { allOrganizations: [{ name: 'my-org' }] },
        }),
      },
      'update',
      {
        name: 'myedge',
        organization: { name: 'my-org' },
        hostedOrganizations: [{ name: 'my-org' }],
        sdxEndpoint: 'https://old',
      },
      {
        name: 'myedge',
        organization: { name: 'my-org' },
        hostedOrganizations: [{ name: 'my-org' }],
        sdxEndpoint: 'https://new',
      }
    );

    expect(recordActivityMock).not.toHaveBeenCalled();
  });

  it('records runtime group delete from hook data', async function () {
    await logRuntimeGroupActivityFromHook(
      {
        authedItem: { name: 'Admin' },
        executeGraphQL: jest.fn().mockResolvedValue({
          data: { allOrganizations: [{ name: 'my-org' }] },
        }),
      },
      'delete',
      {
        name: 'myedge',
        organization: 'org-1',
      },
      {
        name: 'myedge',
        organization: 'org-1',
      }
    );

    const call = getRecordActivityCall(recordActivityMock);
    expect(call.action).toBe('deleted');
    expect(call.refId).toBe('runtimeGroup:myedge');
  });

  it('records runtime group delete when hook item omits organization', async function () {
    await logRuntimeGroupActivityFromHook(
      {
        authedItem: { name: 'Admin' },
        executeGraphQL: jest.fn().mockResolvedValue({
          data: {
            allRuntimeGroups: [
              {
                organization: { name: 'my-org' },
                hostedOrganizations: [],
              },
            ],
          },
        }),
      },
      'delete',
      {
        name: 'myedge',
      },
      {
        name: 'myedge',
      }
    );

    const call = getRecordActivityCall(recordActivityMock);
    expect(call.action).toBe('deleted');
    expect(call.refId).toBe('runtimeGroup:myedge');
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

describe('logOpenAPISpecActivityFromHook', function () {
  beforeEach(() => {
    recordActivityMock.mockClear();
  });

  it('records service publish on create', async function () {
    await logOpenAPISpecActivityFromHook(
      {
        authedItem: { name: 'Admin' },
        executeGraphQL: jest.fn(),
      },
      'create',
      null,
      {
        name: 'MY-SERVICE',
        organization: { name: 'my-org' },
        subsystem: { name: 'MY-SUBSYS' },
      }
    );

    expect(recordActivityMock).toHaveBeenCalledTimes(1);
    const call = getRecordActivityCall(recordActivityMock);
    expect(call.action).toBe('published');
    expect(call.type).toBe('Service');
    expect(call.refId).toBe('service:MY-SERVICE');
    expect(call.message).toBe(
      'Admin published service MY-SERVICE on subsystem MY-SUBSYS in my-org'
    );
  });

  it('records service remove on delete', async function () {
    await logOpenAPISpecActivityFromHook(
      {
        authedItem: { name: 'Admin' },
        executeGraphQL: jest.fn(),
      },
      'delete',
      {
        name: 'MY-SERVICE',
        organization: { name: 'my-org' },
        subsystem: { name: 'MY-SUBSYS' },
      },
      {
        name: 'MY-SERVICE',
        organization: { name: 'my-org' },
        subsystem: { name: 'MY-SUBSYS' },
      }
    );

    expect(recordActivityMock).toHaveBeenCalledTimes(1);
    const call = getRecordActivityCall(recordActivityMock);
    expect(call.action).toBe('removed');
    expect(call.refId).toBe('service:MY-SERVICE');
  });

  it('resolves organization and subsystem from relationship ids', async function () {
    const executeGraphQL = jest
      .fn()
      .mockResolvedValueOnce({
        data: { allOrganizations: [{ name: 'my-org' }] },
      })
      .mockResolvedValueOnce({
        data: { allSubsystems: [{ name: 'MY-SUBSYS' }] },
      });

    await logOpenAPISpecActivityFromHook(
      { authedItem: { name: 'Admin' }, executeGraphQL },
      'create',
      null,
      {
        name: 'MY-SERVICE',
        organization: 'org-1',
        subsystem: 'sub-1',
      }
    );

    expect(recordActivityMock).toHaveBeenCalledTimes(1);
    const call = getRecordActivityCall(recordActivityMock);
    expect(call.message).toBe(
      'Admin published service MY-SERVICE on subsystem MY-SUBSYS in my-org'
    );
  });

  it('does not record activity when organization cannot be resolved', async function () {
    await logOpenAPISpecActivityFromHook(
      {
        authedItem: { name: 'Admin' },
        executeGraphQL: jest.fn().mockResolvedValue({
          data: { allOrganizations: [], allOpenAPISpecs: [] },
        }),
      },
      'create',
      null,
      {
        name: 'MY-SERVICE',
        organization: { id: 'missing-org' },
        subsystem: { name: 'MY-SUBSYS' },
      }
    );

    expect(recordActivityMock).not.toHaveBeenCalled();
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
    expect(call.ids).toEqual(['org:my-org', 'user:aidan@idir', 'actor:Admin']);
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
