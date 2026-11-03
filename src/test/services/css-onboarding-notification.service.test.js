jest.mock(
  'juice',
  () => ({
    inlineContent: (html) => html,
  }),
  { virtual: true }
);
jest.mock(
  'nodemailer',
  () => ({
    createTransport: () => ({ sendMail: async () => undefined }),
  }),
  { virtual: true }
);

const {
  CssOnboardingNotificationService,
  cssOnboardingNotification,
} = require('../../services/notification/css-onboarding-notification.service');
const {
  NotificationService,
} = require('../../services/notification/notification.service');

const request = {
  requester: {
    displayName: 'Jane Doe',
    email: 'jane@example.gov.bc.ca',
  },
  clientId: 'partner-app',
  policyVersion: 'SDX.R1.00',
  privacyZone: 'public',
  resourceServers: [
    {
      id: 'claims',
      environment: 'dev',
      services: [
        { name: 'notes-svc', scopes: ['Notes.Read'] },
        { name: 'claims-svc', scopes: ['Claims.Read'] },
      ],
    },
  ],
};

const pendingTask = {
  ref: 'css-onboarding:integration-a',
  type: 'integrationAccessRequest-subsystemLinking',
  status: 'pending',
  title: 'Onboard integration-a (Jane Doe)',
  jsonBlob: JSON.stringify({
    integrationId: 'integration-a',
    submissionId: 'submission-1',
    request,
  }),
};

describe('CSS onboarding Task hook', () => {
  const mailConfig = {
    apsOnboardingEmail: 'ops@example.com',
    sdxOnboardingInviteUrl: '',
    sdxUiUrl: 'http://sdx-ui.example.com/',
  };

  const serviceWith = (notify, config = mailConfig) =>
    new CssOnboardingNotificationService({ notify }, () => config);

  it('sends the Tech Lead invite and the APS notice when a pending task is created', async () => {
    const notify = jest.fn().mockResolvedValue(undefined);
    await serviceWith(notify).notifyChange({
      operation: 'create',
      updatedItem: pendingTask,
    });

    expect(notify).toHaveBeenCalledTimes(2);
    expect(notify.mock.calls[0][0]).toEqual({
      email: 'jane@example.gov.bc.ca',
      name: 'Jane Doe',
      username: '',
    });
    expect(notify.mock.calls[0][1]).toEqual({
      template: 'css-onboarding-invite',
      subject: 'SDX onboarding - integration-a',
      context: {
        integrationId: 'integration-a',
        inviteUrl:
          'http://sdx-ui.example.com/onboarding/invite?integrationId=integration-a',
      },
    });
    expect(notify.mock.calls[1][0]).toEqual({
      email: 'ops@example.com',
      name: 'APS Operations',
      username: '',
    });
    expect(notify.mock.calls[1][1]).toEqual({
      template: 'css-onboarding-aps',
      subject: 'New onboarding task - integration-a',
      context: {
        integrationId: 'integration-a',
        requesterName: 'Jane Doe',
        requesterEmail: 'jane@example.gov.bc.ca',
        services: 'claims-svc, notes-svc',
      },
    });
  });

  it('uses SDX_ONBOARDING_INVITE_URL when it is set', async () => {
    const notify = jest.fn().mockResolvedValue(undefined);
    await serviceWith(notify, {
      apsOnboardingEmail: '',
      sdxOnboardingInviteUrl: 'https://sdx.example/join?integrationId={id}',
      sdxUiUrl: 'http://sdx-ui.example.com',
    }).notifyChange({
      operation: 'create',
      updatedItem: pendingTask,
    });

    expect(notify).toHaveBeenCalledTimes(1);
    expect(notify.mock.calls[0][1].context.inviteUrl).toBe(
      'https://sdx.example/join?integrationId=integration-a'
    );
  });

  it('sends no email when a pending task only updates its payload', async () => {
    const notify = jest.fn().mockResolvedValue(undefined);
    const updated = {
      ...pendingTask,
      title: 'Onboard integration-a (Janet Doe)',
      jsonBlob: JSON.stringify({
        integrationId: 'integration-a',
        submissionId: 'submission-2',
        request: {
          ...request,
          requester: { displayName: 'Janet Doe', email: 'janet@example.gov.bc.ca' },
        },
      }),
    };

    expect(
      cssOnboardingNotification('update', pendingTask, updated)
    ).toBeUndefined();
    await serviceWith(notify).notifyChange({
      operation: 'update',
      existingItem: pendingTask,
      updatedItem: updated,
    });

    expect(notify).not.toHaveBeenCalled();
  });

  it('emails the Tech Lead when the task becomes processed', async () => {
    const notify = jest.fn().mockResolvedValue(undefined);
    const processed = { ...pendingTask, status: 'processed' };

    expect(cssOnboardingNotification('update', pendingTask, processed)).toBe(
      'completed'
    );
    await serviceWith(notify).notifyChange({
      operation: 'update',
      existingItem: pendingTask,
      updatedItem: processed,
    });

    expect(notify).toHaveBeenCalledTimes(1);
    expect(notify.mock.calls[0][0].email).toBe('jane@example.gov.bc.ca');
    expect(notify.mock.calls[0][1]).toEqual({
      template: 'css-onboarding-complete',
      subject: 'SDX onboarding complete - integration-a',
      context: { integrationId: 'integration-a' },
    });
  });

  it('does not email again when a processed task is saved unchanged', async () => {
    const notify = jest.fn().mockResolvedValue(undefined);
    const processed = { ...pendingTask, status: 'processed' };
    await serviceWith(notify).notifyChange({
      operation: 'update',
      existingItem: processed,
      updatedItem: processed,
    });
    expect(notify).not.toHaveBeenCalled();
  });

  it('ignores tasks that are not integration onboarding', async () => {
    const notify = jest.fn().mockResolvedValue(undefined);
    await serviceWith(notify).notifyChange({
      operation: 'create',
      updatedItem: { ...pendingTask, type: 'subsystemLinking' },
    });
    expect(notify).not.toHaveBeenCalled();
  });

  it('renders the onboarding letters', () => {
    const renderer = new NotificationService({
      getConfig: () => ({ notification: { enabled: false } }),
    });
    const invite = renderer.templateToContent(
      { name: 'Jane Doe' },
      'css-onboarding-invite',
      {
        integrationId: 'integration-a',
        inviteUrl:
          'http://sdx-ui.example.com/onboarding/invite?integrationId=integration-a',
      }
    );
    const aps = renderer.templateToContent(
      { name: 'APS Operations' },
      'css-onboarding-aps',
      {
        integrationId: 'integration-a',
        requesterName: 'Jane Doe',
        requesterEmail: 'jane@example.gov.bc.ca',
        services: 'claims-svc, notes-svc',
      }
    );
    const done = renderer.templateToContent(
      { name: 'Jane Doe' },
      'css-onboarding-complete',
      { integrationId: 'integration-a' }
    );

    expect(invite).toContain('Common SSO asked SDX for API access');
    expect(invite).toContain('not onboarded yet');
    expect(invite).toContain('access request is held');
    expect(invite).toContain(
      'APS Operations follows the onboarding blueprint: kickoff, organization'
    );
    expect(invite).toContain(
      'href="http://sdx-ui.example.com/onboarding/invite?integrationId=integration-a"'
    );
    expect(aps).toContain('new onboarding task');
    expect(aps).toContain('Jane Doe');
    expect(aps).toContain('jane@example.gov.bc.ca');
    expect(aps).toContain('claims-svc, notes-svc');
    expect(aps).toContain('kickoff, then organization and subsystem');
    expect(done).toContain('is done');
    expect(done).toContain('held request has');
    expect(done).toContain('submitted for approval');
  });
});
