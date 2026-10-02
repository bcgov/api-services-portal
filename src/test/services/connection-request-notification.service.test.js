jest.mock('../../services/keystone', () => ({
  lookupProductEnvironmentServicesBySlug: jest.fn(),
  lookupUsersByNamespace: jest.fn(),
}));
jest.mock('../../services/workflow/get-namespaces', () => ({
  getEnvironmentContext: jest.fn(),
}));
jest.mock('../../services/org-groups/org-group-service', () => ({
  OrgGroupService: jest.fn(),
}));

const {
  lookupProductEnvironmentServicesBySlug,
} = require('../../services/keystone');
const {
  getEnvironmentContext,
} = require('../../services/workflow/get-namespaces');
const {
  OrgGroupService,
} = require('../../services/org-groups/org-group-service');
const {
  ConnectionRequestNotificationService,
  getConnectionNotificationEvent,
  listSubsystemAccessManagers,
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
    [undefined, 'update', undefined, connection, {}],
    [undefined, 'unknown', connection, connection, {}],
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

  describe('requester and link edge cases', () => {
    const newService = (overrides = {}) => {
      const notify = jest.fn().mockResolvedValue(undefined);
      const findService = jest.fn().mockResolvedValue({
        namespace: 'service-gateway',
        organization: { name: 'ministry-of-citz' },
        subsystem: { clientId: 'LAB.MIN.CLIENT' },
      });
      const findAccessManagers = jest
        .fn()
        .mockResolvedValue([{ name: 'Manager', email: 'manager@example.com' }]);
      const findRoleAccessManagers = jest.fn().mockResolvedValue([]);
      const service = new ConnectionRequestNotificationService(
        { notify },
        overrides.findService || findService,
        findAccessManagers,
        findRoleAccessManagers,
        overrides.findClient || findClient
      );
      return { service, notify, findRoleAccessManagers };
    };

    const created = (requesterDetails) => ({
      context: {},
      operation: 'create',
      updatedItem: { ...connection, requesterDetails },
    });

    it('shows the requester as not specified when details are invalid JSON', async () => {
      const { service, notify } = newService();

      await service.notifyChange(created('not json'));

      expect(notify).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          context: expect.objectContaining({
            requestedBy: 'Not specified',
            hasCssDetails: false,
            cssClientId: 'Not specified',
          }),
        })
      );
    });

    it('uses requesterEmail when there is no requester', async () => {
      const { service, notify } = newService();

      await service.notifyChange(
        created(JSON.stringify({ requesterEmail: 'only@example.com' }))
      );

      expect(notify).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          context: expect.objectContaining({ requestedBy: 'only@example.com' }),
        })
      );
    });

    it('uses a requester string that is an email address as the email', async () => {
      const { service, notify } = newService();

      await service.notifyChange(
        created(JSON.stringify({ requester: 'string@example.com' }))
      );

      expect(notify).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          context: expect.objectContaining({
            requestedBy: 'string@example.com',
          }),
        })
      );
    });

    it('links without an organization when the client cannot be found', async () => {
      const { service, notify } = newService({
        findClient: jest
          .fn()
          .mockRejectedValue(new Error('Subsystem not found')),
      });

      await service.notifyChange({
        context: {},
        operation: 'update',
        existingItem: connection,
        updatedItem: { ...connection, isApproved: true },
      });

      expect(notify).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'requester@example.com' }),
        expect.objectContaining({
          context: expect.objectContaining({
            connectionsUrl: 'http://sdx-ui.example.com/connections',
          }),
        })
      );
    });

    it('does not notify access managers when the service has no namespace', async () => {
      const { service, notify } = newService({
        findService: jest.fn().mockResolvedValue({}),
      });

      await service.notifyChange(created(connection.requesterDetails));

      expect(notify).not.toHaveBeenCalled();
    });

    it('resolves the subsystem client id when the service subsystem has none', async () => {
      const subsystem = {
        name: 'SUBSYS',
        namespace: 'gw',
        privacyZone: 'citizen',
        integrations: [],
        organization: {
          name: 'org',
          title: 'Org',
          description: 'd',
          tags: JSON.stringify(['member_class:LAB', 'member_id:MIN']),
        },
      };
      const { service, findRoleAccessManagers } = newService({
        findService: jest
          .fn()
          .mockResolvedValue({ namespace: 'gw', subsystem }),
      });

      await service.notifyChange(created(connection.requesterDetails));

      expect(findRoleAccessManagers).toHaveBeenCalledWith({}, 'LAB.MIN.SUBSYS');
    });

    it('skips role access managers when the service has no subsystem', async () => {
      const { service, findRoleAccessManagers } = newService({
        findService: jest.fn().mockResolvedValue({ namespace: 'gw' }),
      });

      await service.notifyChange(created(connection.requesterDetails));

      expect(findRoleAccessManagers).toHaveBeenCalledWith({}, undefined);
    });

    it('continues without role access managers when the subsystem client id cannot be resolved', async () => {
      const { service, notify, findRoleAccessManagers } = newService({
        findService: jest.fn().mockResolvedValue({
          namespace: 'gw',
          subsystem: { name: 'broken' },
        }),
      });

      await service.notifyChange(created(connection.requesterDetails));

      expect(findRoleAccessManagers).toHaveBeenCalledWith({}, undefined);
      expect(notify).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'manager@example.com' }),
        expect.anything()
      );
    });

    it('does not throw when sending the notification fails', async () => {
      const { service, notify } = newService();
      notify.mockRejectedValue(new Error('smtp down'));

      await expect(
        service.notifyChange(created(connection.requesterDetails))
      ).resolves.toBeUndefined();
    });
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

describe('listSubsystemAccessManagers', () => {
  const context = {
    createContext: jest.fn().mockReturnValue({ noauth: true }),
  };
  let login, listMembersForPath;

  beforeEach(() => {
    jest.clearAllMocks();
    context.createContext.mockReturnValue({ noauth: true });
    lookupProductEnvironmentServicesBySlug.mockResolvedValue({ id: 'env-1' });
    getEnvironmentContext.mockResolvedValue({
      uma2: { issuer: 'http://keycloak/realms/master' },
      issuerEnvConfig: { clientId: 'gwa', clientSecret: 'secret' },
    });
    login = jest.fn().mockResolvedValue(undefined);
    listMembersForPath = jest
      .fn()
      .mockResolvedValue([{ name: 'Role Member', email: 'role@example.com' }]);
    OrgGroupService.mockImplementation(() => ({
      login,
      listMembersForPath,
    }));
  });

  it('returns no members without a client id', async () => {
    expect(await listSubsystemAccessManagers(context)).toEqual([]);
    expect(OrgGroupService).not.toHaveBeenCalled();
  });

  it('lists the members of the subsystem access-manager group', async () => {
    const members = await listSubsystemAccessManagers(
      context,
      'LAB.MIN.CLIENT'
    );

    expect(members).toEqual([
      { name: 'Role Member', email: 'role@example.com' },
    ]);
    expect(OrgGroupService).toHaveBeenCalledWith(
      'http://keycloak/realms/master'
    );
    expect(login).toHaveBeenCalledWith('gwa', 'secret');
    expect(listMembersForPath).toHaveBeenCalledWith(
      '/access-manager/systems/LAB.MIN.CLIENT'
    );
  });

  it('returns no members when the environment has no UMA2 configuration', async () => {
    getEnvironmentContext.mockResolvedValue({});

    expect(
      await listSubsystemAccessManagers(context, 'LAB.MIN.CLIENT')
    ).toEqual([]);
    expect(OrgGroupService).not.toHaveBeenCalled();
  });

  it('returns no members when the lookup fails', async () => {
    listMembersForPath.mockRejectedValue(new Error('keycloak unavailable'));

    expect(
      await listSubsystemAccessManagers(context, 'LAB.MIN.CLIENT')
    ).toEqual([]);
  });
});
