const {
  ConnectionRequestNotificationService,
  getConnectionNotificationEvent,
} = require('../../services/notification/connection-request-notification.service');
const {
  NotificationService,
} = require('../../services/notification/notification.service');

describe('ConnectionRequestNotificationService', () => {
  const connection = {
    clientId: 'LAB.MIN.CLIENT',
    serviceId: 'LAB.MIN.SERVICE.v1',
    environment: 'prod',
    policyVersion: 'SDX.R1.00',
    requesterDetails: JSON.stringify({
      requester: {
        name: 'Request User',
        email: 'requester@example.com',
      },
      client: {
        clientId: 'css-client',
        integrationId: 'css-integration',
        privacyZone: 'citizen',
      },
    }),
    isApproved: false,
    isActive: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.SDX_UI_URL = 'http://sdx-ui.example.com/';
  });

  it.each([
    ['created', 'create', undefined, connection, {}],
    [
      'reapproval',
      'update',
      { ...connection, isApproved: true },
      connection,
      { isApproved: false },
    ],
    [
      'approved',
      'update',
      connection,
      { ...connection, isApproved: true },
      { isApproved: true },
    ],
    [
      'revoked',
      'update',
      { ...connection, isApproved: true },
      { ...connection, isApproved: true, isActive: false },
      { isActive: false },
    ],
    ['rejected', 'delete', { ...connection, isActive: false }, undefined, {}],
    // A pending request that is deactivated is only announced when it is deleted
    [
      undefined,
      'update',
      connection,
      { ...connection, isActive: false },
      { isActive: false },
    ],
    // An approved connection was announced when it was deactivated
    [
      undefined,
      'delete',
      { ...connection, isApproved: true, isActive: false },
      undefined,
      {},
    ],
  ])(
    'identifies the %s lifecycle event',
    (expected, operation, existingItem, updatedItem, originalInput) => {
      expect(
        getConnectionNotificationEvent(
          operation,
          existingItem,
          updatedItem,
          originalInput
        )
      ).toBe(expected);
    }
  );

  it('renders escaped connection context in notification templates', () => {
    const service = new NotificationService({
      getConfig: () => ({ notification: { enabled: false } }),
    });

    const content = service.templateToContent(
      { name: 'Portal <User>' },
      'connection-rqst',
      {
        hasCssDetails: true,
        cssClientId: 'CLIENT<&>',
        cssIntegrationId: 'INTEGRATION',
        cssPrivacyZone: 'ZONE<&>',
        sdxClientId: 'SDX-CLIENT',
        requestedBy: 'Jane <jane@example.com>',
        serviceId: 'SERVICE',
        environment: 'prod',
        policyVersion: 'SDX.R1.00',
        connectionsUrl: 'https://api.example.com/connections?x=1&y=2',
        brochureUrl: 'https://sdx.example.com',
        headline: 'Connection request waiting for approval',
        message: 'A new connection request is waiting for your approval.',
      }
    );

    expect(content).toContain('Portal &lt;User&gt;');
    expect(content).toContain('CLIENT&lt;&amp;&gt;');
    expect(content).toContain('ZONE&lt;&amp;&gt;');
    expect(content).toContain('Jane &lt;jane@example.com&gt;');
    expect(content).toContain('Requested by');
    expect(content).toContain('Common Single Sign-on');
    expect(content).toContain('Secure Data Exchange');
    expect(content).toContain('API Program Services Team');
    expect(content).toContain('View request');
    expect(content).toContain('Connection request waiting for approval');
    expect(content).toContain(
      'A new connection request is waiting for your approval.'
    );
    expect(content).toContain(
      'href="https://api.example.com/connections?x=1&amp;y=2"'
    );
    expect(content).toContain('href="https://sdx.example.com"');
  });

  it('omits the CSS details table when the request has none', () => {
    const service = new NotificationService({
      getConfig: () => ({ notification: { enabled: false } }),
    });
    const context = { serviceId: 'SERVICE', cssClientId: 'Not specified' };

    const without = service.templateToContent(
      { name: 'User' },
      'connection-rqst',
      { ...context, hasCssDetails: false }
    );
    const withCss = service.templateToContent(
      { name: 'User' },
      'connection-rqst',
      { ...context, hasCssDetails: true }
    );

    expect(without).not.toContain('Common Single Sign-on');
    expect(without).not.toContain('{{#if');
    expect(without).not.toContain('{{/if}}');
    expect(without).toContain('Secure Data Exchange');
    expect(withCss).toContain('Common Single Sign-on');
    expect(withCss).not.toContain('{{#if');
  });

  it('does not expand placeholders injected through context values', () => {
    const service = new NotificationService({
      getConfig: () => ({ notification: { enabled: false } }),
    });

    const content = service.templateToContent(
      { name: 'Portal User' },
      'connection-rqst',
      {
        hasCssDetails: true,
        cssClientId: '{{connectionsUrl}}',
        connectionsUrl: 'https://api.example.com/connections',
      }
    );

    expect(content).toContain('{{connectionsUrl}}');
    expect(content).toContain('{{serviceId}}');
  });

  it('notifies Connection.Manage users when a request is created', async () => {
    const notify = jest.fn().mockResolvedValue(undefined);
    const findService = jest.fn().mockResolvedValue({
      namespace: 'service-gateway',
      organization: { name: 'ministry-of-citz' },
      subsystem: { clientId: 'LAB.MIN.CLIENT' },
    });
    const findAccessManagers = jest.fn().mockResolvedValue([
      {
        name: 'Access Manager',
        username: 'manager',
        email: 'manager@example.com',
      },
    ]);
    const findRoleAccessManagers = jest.fn().mockResolvedValue([]);
    const service = new ConnectionRequestNotificationService(
      { notify },
      findService,
      findAccessManagers,
      findRoleAccessManagers
    );

    await service.notifyChange({
      context: {},
      operation: 'create',
      updatedItem: connection,
    });

    expect(findAccessManagers).toHaveBeenCalledWith(
      {},
      'service-gateway',
      'Connection.Manage'
    );
    expect(findRoleAccessManagers).toHaveBeenCalledWith({}, 'LAB.MIN.CLIENT');
    expect(notify).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'manager@example.com' }),
      expect.objectContaining({
        template: 'connection-rqst',
        subject: 'Connection Request - LAB.MIN.SERVICE.v1',
        context: expect.objectContaining({
          cssClientId: 'css-client',
          cssIntegrationId: 'css-integration',
          cssPrivacyZone: 'citizen',
          hasCssDetails: true,
          sdxClientId: 'LAB.MIN.CLIENT',
          requestedBy: 'Request User (requester@example.com)',
          serviceId: 'LAB.MIN.SERVICE.v1',
          connectionsUrl:
            'http://sdx-ui.example.com/connections?org=ministry-of-citz',
          headline: 'Connection request waiting for approval',
        }),
      })
    );
  });

  const findClient = jest
    .fn()
    .mockResolvedValue({ organization: { name: 'ministry-of-client' } });

  it('notifies the requester when a request is approved', async () => {
    const notify = jest.fn().mockResolvedValue(undefined);
    const findService = jest.fn();
    const service = new ConnectionRequestNotificationService(
      { notify },
      findService,
      undefined,
      undefined,
      findClient
    );

    await service.notifyChange({
      context: {},
      operation: 'update',
      existingItem: connection,
      updatedItem: { ...connection, isApproved: true },
    });

    expect(notify).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'requester@example.com' }),
      expect.objectContaining({
        template: 'connection-rqst',
        subject: 'Connection Request Approved - LAB.MIN.SERVICE.v1',
        context: expect.objectContaining({
          headline: 'Connection request approved',
          connectionsUrl:
            'http://sdx-ui.example.com/connections?org=ministry-of-client',
        }),
      })
    );
    expect(findClient).toHaveBeenCalledWith({}, 'LAB.MIN.CLIENT');
    expect(findService).not.toHaveBeenCalled();
  });

  it('supports the R1 requester string shape', async () => {
    const notify = jest.fn().mockResolvedValue(undefined);
    const service = new ConnectionRequestNotificationService(
      { notify },
      undefined,
      undefined,
      undefined,
      findClient
    );

    await service.notifyChange({
      context: {},
      operation: 'update',
      existingItem: connection,
      originalInput: { isApproved: true },
      updatedItem: {
        ...connection,
        isApproved: true,
        requesterDetails: JSON.stringify({
          requester: 'requester@example.com',
          client: { clientId: 'css-client' },
        }),
      },
    });

    expect(notify).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'requester@example.com',
        name: 'requester@example.com',
      }),
      expect.objectContaining({
        template: 'connection-rqst',
        context: expect.objectContaining({
          headline: 'Connection request approved',
        }),
      })
    );
  });

  it('supports the R1 requester name with a separate requesterEmail', async () => {
    const notify = jest.fn().mockResolvedValue(undefined);
    const service = new ConnectionRequestNotificationService(
      { notify },
      undefined,
      undefined,
      undefined,
      findClient
    );

    await service.notifyChange({
      context: {},
      operation: 'update',
      existingItem: connection,
      updatedItem: {
        ...connection,
        isApproved: true,
        requesterDetails: JSON.stringify({
          requester: 'Jane Requester',
          requesterEmail: 'jane@example.com',
        }),
      },
    });

    expect(notify).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'jane@example.com',
        name: 'Jane Requester',
      }),
      expect.objectContaining({
        context: expect.objectContaining({
          requestedBy: 'Jane Requester (jane@example.com)',
        }),
      })
    );
  });

  it('does not notify a requester that has a name but no email', async () => {
    const notify = jest.fn().mockResolvedValue(undefined);
    const service = new ConnectionRequestNotificationService(
      { notify },
      undefined,
      undefined,
      undefined,
      findClient
    );

    await service.notifyChange({
      context: {},
      operation: 'update',
      existingItem: connection,
      updatedItem: {
        ...connection,
        isApproved: true,
        requesterDetails: JSON.stringify({ requester: 'Jane Requester' }),
      },
    });

    expect(notify).not.toHaveBeenCalled();
  });

  it('notifies the requester when a pending request is deleted', async () => {
    const notify = jest.fn().mockResolvedValue(undefined);
    const service = new ConnectionRequestNotificationService(
      { notify },
      undefined,
      undefined,
      undefined,
      findClient
    );

    await service.notifyChange({
      context: {},
      operation: 'delete',
      existingItem: { ...connection, isActive: false },
    });

    expect(notify).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'requester@example.com' }),
      expect.objectContaining({
        subject: 'Connection Request Rejected - LAB.MIN.SERVICE.v1',
        context: expect.objectContaining({
          headline: 'Connection request rejected',
          sdxClientId: 'LAB.MIN.CLIENT',
          connectionsUrl:
            'http://sdx-ui.example.com/connections?org=ministry-of-client',
        }),
      })
    );
  });

  it('does not notify for an unrelated update', async () => {
    const notify = jest.fn().mockResolvedValue(undefined);
    const service = new ConnectionRequestNotificationService({ notify });

    await service.notifyChange({
      context: {},
      operation: 'update',
      existingItem: connection,
      updatedItem: { ...connection, environment: 'test' },
    });

    expect(notify).not.toHaveBeenCalled();
  });
});
