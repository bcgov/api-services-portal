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

const letterDetails = {
  hasCssDetails: true,
  cssClientId: 'partner-app',
  cssIntegrationId: 'integration-a',
  cssPrivacyZone: 'public',
  sdxClientId: 'partner-app',
  requestedBy: 'Jane Doe (jane@example.gov.bc.ca)',
  serviceId: 'claims-svc, notes-svc',
  environment: 'dev',
  policyVersion: 'SDX.R1.00',
  brochureUrl: 'http://sdx-ui.example.com',
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
    sdxUiUrl: 'http://sdx-ui.example.com/',
    apsOnboardingTicketUrl: 'https://service-desk.example.test/create',
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
      name: 'Jane',
      username: '',
    });
    expect(notify.mock.calls[0][1]).toEqual({
      template: 'connection-rqst',
      subject: 'Your CSS request integration-a: P2P onboarding needed',
      context: {
        isOnboardingInvite: true,
        hasOnboardingDetails: true,
        headline: 'Your CSS request integration-a: P2P onboarding needed',
        message: expect.stringContaining('Your Common Hosted Single Sign-on (CSS) request'),
        projectName: 'partner-app',
        cssRequestId: 'integration-a',
        brochureUrl: letterDetails.brochureUrl,
      },
    });
    expect(notify.mock.calls[1][0]).toEqual({
      email: 'ops@example.com',
      name: 'P2P Operations',
      username: '',
    });
    expect(notify.mock.calls[1][1]).toMatchObject({
      template: 'connection-rqst',
      subject: 'P2P onboarding needed: partner-app, CSS request integration-a',
      context: {
        isOperationsNotice: true,
        projectName: 'partner-app',
        cssRequestId: 'integration-a',
        requesterName: 'Jane Doe',
        requesterEmail: 'jane@example.gov.bc.ca',
        onboardingTicketUrl: mailConfig.apsOnboardingTicketUrl,
        requestedServices: [
          { service: 'notes-svc', environment: 'dev', scopes: 'Notes.Read' },
          { service: 'claims-svc', environment: 'dev', scopes: 'Claims.Read' },
        ],
      },
    });
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
      template: 'connection-rqst',
      subject: 'SDX onboarding complete - integration-a',
      context: {
        ...letterDetails,
        headline: 'Onboarding is done',
        message:
          'Onboarding for integration integration-a is done. The held request has been submitted for approval.',
        connectionsUrl: 'http://sdx-ui.example.com',
      },
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

  it('renders the onboarding letters with their respective templates', async () => {
    const renderer = new NotificationService({
      getConfig: () => ({ notification: { enabled: false } }),
    });
    const notify = jest.fn().mockResolvedValue(undefined);
    const service = serviceWith(notify);
    await service.notifyChange({ operation: 'create', updatedItem: pendingTask });
    await service.notifyChange({
      operation: 'update',
      existingItem: pendingTask,
      updatedItem: { ...pendingTask, status: 'processed' },
    });
    const [invite, aps, done] = notify.mock.calls.map(([user, email]) =>
      renderer.templateToContent(user, email.template, email.context)
    );

    expect(invite).toContain('Hi Jane,');
    expect(invite).toContain('What happens next');
    expect(invite).toContain('Your request');
    expect(invite).not.toContain('Service organization');
    expect(aps).not.toContain('What happens next');
    expect(invite).toMatch(/<table[\s\S]*Project name[\s\S]*partner-app[\s\S]*CSS request ID[\s\S]*integration-a[\s\S]*<\/table>/);
    expect(aps).toContain('Hi P2P Operations,');
    expect(aps).toContain('Next steps');
    expect(aps).toContain('Request details');
    expect(aps).toContain('Requested SDX services');
    expect(Array.from(aps.matchAll(/<th scope="col">([^<]+)<\/th>/g), (match) => match[1])).toEqual([
      'Provider organization',
      'Service',
      'Version',
      'Production or non-production',
      'Requested scopes',
    ]);
    expect(aps).toContain(`href="${mailConfig.apsOnboardingTicketUrl}"`);
    expect(aps).not.toContain('Consumer organization');
    expect(aps).not.toContain('{{');
    expect(aps).toContain('Jane Doe');
    expect(aps).toContain('jane@example.gov.bc.ca');
    expect(aps).toMatch(/notes-svc[\s\S]*Notes.Read[\s\S]*claims-svc[\s\S]*Claims.Read/);
    expect(done).toContain('is done');
    expect(done).toContain('held request has');
    expect(done).toContain('submitted for approval');
  });
});
