import {
  OrgActivityService,
  logSubsystemAccessChanges,
} from '../../../services/workflow/org-activity';
import * as activityModule from '../../../services/keystone/activity';

jest.mock('../../../services/keystone/activity', () => {
  const actual = jest.requireActual('../../../services/keystone/activity');
  return {
    ...actual,
    recordActivity: jest.fn().mockResolvedValue({}),
    recordActivityWithBlob: jest.fn().mockResolvedValue({}),
  };
});

const recordActivityMock = activityModule.recordActivity;

function getRecordActivityCall(mock, callIndex = 0) {
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

describe('OrgActivityService.logUpdateSubsystemAccess', function () {
  beforeEach(() => {
    recordActivityMock.mockClear();
  });

  it('records "updated" with the signed delta, scoped to the subsystem', async function () {
    const service = new OrgActivityService(
      { authedItem: { name: 'Admin' } },
      'my-org'
    );

    await service.logUpdateSubsystemAccess(true, {
      subsystemName: 'my-subsystem',
      subject_email: 'user1@local',
      subject: 'User One',
      roles: '[+] tech-lead',
    });

    const call = getRecordActivityCall(recordActivityMock);
    expect(call.action).toBe('updated');
    expect(call.type).toBe('SubsystemAccess');
    expect(call.refId).toBe('subsystem:my-subsystem');
    expect(call.ids).toEqual([
      'org:my-org',
      'subsystem:my-subsystem',
      'user:user1@local',
      'actor:Admin',
    ]);
    expect(call.message).toBe(
      'Admin updated User One subsystem access on my-subsystem in my-org: [+] tech-lead'
    );
    const ctx = JSON.parse(call.activityContext);
    expect(ctx.message).toBe(
      '{actor} {action} {subject} subsystem access on {subsystemName} in {organization}: {roles}'
    );
  });
});

describe('logSubsystemAccessChanges', function () {
  const resolveDisplayName = async (email) =>
    email === 'aidan@idir' ? 'Cope, Aidan CITZ:EX' : email;
  const activityContext = { authedItem: { name: 'Admin' } };

  beforeEach(() => {
    recordActivityMock.mockClear();
  });

  it('records "updated" with only the added role delta on a pure grant', async function () {
    await logSubsystemAccessChanges(
      activityContext,
      'my-org',
      'my-subsystem',
      {
        granted: { 'aidan@idir': ['tech-lead'] },
        revoked: {},
      },
      resolveDisplayName
    );

    expect(recordActivityMock).toHaveBeenCalledTimes(1);
    const call = getRecordActivityCall(recordActivityMock);
    expect(call.action).toBe('updated');
    expect(call.refId).toBe('subsystem:my-subsystem');
    expect(call.message).toBe(
      'Admin updated Cope, Aidan CITZ:EX subsystem access on my-subsystem in my-org: [+] tech-lead'
    );
  });

  it('records a combined grant/revoke delta for the same member', async function () {
    await logSubsystemAccessChanges(
      activityContext,
      'my-org',
      'my-subsystem',
      {
        granted: { 'aidan@idir': ['access-manager'] },
        revoked: { 'aidan@idir': ['tech-lead'] },
      },
      resolveDisplayName
    );

    const call = getRecordActivityCall(recordActivityMock);
    expect(call.message).toBe(
      'Admin updated Cope, Aidan CITZ:EX subsystem access on my-subsystem in my-org: [+] access-manager, [-] tech-lead'
    );
  });

  it('records one activity entry per affected member', async function () {
    await logSubsystemAccessChanges(
      activityContext,
      'my-org',
      'my-subsystem',
      {
        granted: { 'aidan@idir': ['tech-lead'], 'mark@idir': ['subsystem-owner'] },
        revoked: {},
      },
      resolveDisplayName
    );

    expect(recordActivityMock).toHaveBeenCalledTimes(2);
    const emails = recordActivityMock.mock.calls.map(
      (call) => JSON.parse(call[6]).params.subject_email
    );
    expect(emails.sort()).toEqual(['aidan@idir', 'mark@idir']);
  });

  it('records nothing when there are no changes', async function () {
    await logSubsystemAccessChanges(
      activityContext,
      'my-org',
      'my-subsystem',
      { granted: {}, revoked: {} },
      resolveDisplayName
    );

    expect(recordActivityMock).not.toHaveBeenCalled();
  });
});
