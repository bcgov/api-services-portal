jest.mock('../../../services/keystone', () => ({
  lookupProductEnvironmentServicesBySlug: jest.fn(),
  lookupUsersByUsernames: jest.fn(),
  recordActivity: jest.fn(),
}));
jest.mock('../../../lists/extensions/Common', () => ({
  doClientLoginForCredentialIssuer: jest.fn(),
}));
jest.mock('../../../services/uma2', () => ({
  UMAResourceRegistrationService: jest.fn(),
}));
jest.mock('../../../services/keycloak', () => ({
  KeycloakPermissionTicketService: jest.fn(),
  KeycloakGroupService: jest.fn(),
}));

const {
  lookupProductEnvironmentServicesBySlug,
  lookupUsersByUsernames,
} = require('../../../services/keystone');
const {
  doClientLoginForCredentialIssuer,
} = require('../../../lists/extensions/Common');
const { UMAResourceRegistrationService } = require('../../../services/uma2');
const {
  KeycloakPermissionTicketService,
} = require('../../../services/keycloak');
const NamespaceExtension = require('../../../lists/extensions/Namespace');

const usersByNamespaceResolver = () => {
  let schema;
  NamespaceExtension.extensions[0]({
    extendGraphQLSchema: (s) => {
      schema = s;
    },
  });
  return schema.queries.find((q) => q.schema.startsWith('usersByNamespace('))
    .resolver;
};

describe('usersByNamespace', () => {
  const context = { createContext: () => ({ noauth: true }) };
  let listResources, listResourcesByIdList, listPermissions;

  beforeEach(() => {
    jest.clearAllMocks();
    lookupProductEnvironmentServicesBySlug.mockResolvedValue({ id: 'env-1' });
    doClientLoginForCredentialIssuer.mockResolvedValue({
      issuer: 'http://keycloak/realms/master',
      accessToken: 'token',
      clientUuid: 'client-uuid',
      resourceRegistrationEndpoint: 'http://keycloak/resource_set',
    });
    listResources = jest.fn().mockResolvedValue(['ns-resource-id']);
    listResourcesByIdList = jest.fn();
    UMAResourceRegistrationService.mockImplementation(() => ({
      listResources,
      listResourcesByIdList,
    }));
    listPermissions = jest.fn().mockResolvedValue([
      { scopeName: 'Access.Manage', granted: true, requesterName: 'manager' },
      { scopeName: 'Access.Manage', granted: false, requesterName: 'pending' },
      { scopeName: 'Namespace.View', granted: true, requesterName: 'viewer' },
    ]);
    KeycloakPermissionTicketService.mockImplementation(() => ({
      listPermissions,
    }));
    lookupUsersByUsernames.mockResolvedValue([{ username: 'manager' }]);
  });

  it('looks up only the requested namespace, by exact name, owner and type', async () => {
    const resolver = usersByNamespaceResolver();

    const users = await resolver(
      undefined,
      { namespace: 'gw-abc12', scopeName: 'Access.Manage' },
      context,
      undefined,
      {}
    );

    expect(listResources).toHaveBeenCalledWith({
      name: 'gw-abc12',
      exactName: true,
      owner: 'client-uuid',
      type: 'namespace',
    });
    expect(listResourcesByIdList).not.toHaveBeenCalled();
    expect(listPermissions).toHaveBeenCalledWith({
      resourceId: 'ns-resource-id',
      returnNames: true,
    });
    expect(lookupUsersByUsernames).toHaveBeenCalledWith({ noauth: true }, [
      'manager',
    ]);
    expect(users).toEqual([{ username: 'manager' }]);
  });

  it('returns users with any granted scope when no scope is given', async () => {
    const resolver = usersByNamespaceResolver();

    await resolver(undefined, { namespace: 'gw-abc12' }, context, undefined, {});

    expect(lookupUsersByUsernames).toHaveBeenCalledWith({ noauth: true }, [
      'manager',
      'viewer',
    ]);
  });

  it('fails when the namespace does not exist', async () => {
    listResources.mockResolvedValue([]);
    const resolver = usersByNamespaceResolver();

    await expect(
      resolver(undefined, { namespace: 'gw-missing' }, context, undefined, {})
    ).rejects.toThrow('Namespace gw-missing not found');
    expect(listPermissions).not.toHaveBeenCalled();
  });

  it('rejects an invalid namespace name', async () => {
    const resolver = usersByNamespaceResolver();

    await expect(
      resolver(undefined, { namespace: 'BAD NAME' }, context, undefined, {})
    ).rejects.toThrow('Gateway ID must be');
    expect(listResources).not.toHaveBeenCalled();
  });
});
