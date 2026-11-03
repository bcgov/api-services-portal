jest.mock('../../../services/keystone', () => ({
  lookupProductEnvironmentServicesBySlug: jest.fn(),
  lookupUsersByUsernames: jest.fn(),
  recordActivity: jest.fn(),
}));
jest.mock('../../../lists/extensions/Common', () => ({
  getEnvironmentContext: jest.fn(),
  getResourceSets: jest.fn(),
}));
jest.mock('../../../services/uma2', () => ({
  UMAResourceRegistrationService: jest.fn(),
}));
jest.mock('../../../services/keycloak', () => ({
  KeycloakPermissionTicketService: jest.fn(),
  KeycloakGroupService: jest.fn(),
}));
jest.mock('../../../services/workflow/delete-namespace', () => ({
  DeleteNamespace: jest.fn(),
  DeleteNamespaceValidate: jest.fn(),
}));
jest.mock('../../../auth/auth-token', () => ({
  __esModule: true,
  default: jest.fn(() => 'subject-token'),
}));

const {
  lookupProductEnvironmentServicesBySlug,
} = require('../../../services/keystone');
const {
  getEnvironmentContext,
  getResourceSets,
} = require('../../../lists/extensions/Common');
const { UMAResourceRegistrationService } = require('../../../services/uma2');
const { KeycloakGroupService } = require('../../../services/keycloak');
const {
  DeleteNamespace,
} = require('../../../services/workflow/delete-namespace');
const NamespaceExtension = require('../../../lists/extensions/Namespace');

const forceDeleteNamespaceResolver = () => {
  let schema;
  NamespaceExtension.extensions[0]({
    extendGraphQLSchema: (s) => {
      schema = s;
    },
  });
  return schema.mutations.find((m) =>
    m.schema.startsWith('forceDeleteNamespace(')
  ).resolver;
};

describe('forceDeleteNamespace', () => {
  const ns = 'sdx-gw-abc12';
  const context = {
    createContext: () => ({ noauth: true }),
    sudo: () => ({ sudo: true }),
    req: { oauth_user: { azp: 'sdx-provisioner' } },
  };
  // Keycloak state the teardown changes: namespace groups and UMA resources
  let groups, resources, deleteResourceSet, updateGroup;

  const forceDelete = () =>
    forceDeleteNamespaceResolver()(
      undefined,
      { namespace: ns, force: false },
      context,
      undefined,
      {}
    );

  beforeEach(() => {
    jest.clearAllMocks();
    groups = {
      [ns]: { name: ns, attributes: { 'perm-data-plane': ['sdx-edge'] } },
    };
    resources = { 'res-1': { id: 'res-1', name: ns } };

    lookupProductEnvironmentServicesBySlug.mockResolvedValue({ id: 'env-1' });
    getEnvironmentContext.mockResolvedValue({
      accessToken: 'token',
      uma2: { resource_registration_endpoint: 'http://keycloak/resource_set' },
      issuerEnvConfig: {
        issuerUrl: 'http://keycloak/realms/master',
        clientId: 'gwa-api',
        clientSecret: 'client-secret',
      },
    });
    getResourceSets.mockImplementation(async () => Object.keys(resources));

    deleteResourceSet = jest.fn(async (id) => {
      delete resources[id];
    });
    UMAResourceRegistrationService.mockImplementation(() => ({
      listResourcesByIdList: async (ids) => ids.map((id) => resources[id]),
      deleteResourceSet,
    }));

    updateGroup = jest.fn(async (group) => {
      groups[group.name] = group;
    });
    KeycloakGroupService.mockImplementation(() => ({
      login: jest.fn(),
      getGroup: async (_parent, name) =>
        groups[name] ? JSON.parse(JSON.stringify(groups[name])) : null,
      updateGroup,
    }));
  });

  it('decommissions the group before deleting the UMA resource', async () => {
    await expect(forceDelete()).resolves.toBe(true);

    expect(DeleteNamespace).toHaveBeenCalledWith(
      { sudo: true },
      'subject-token',
      ns,
      'sdx-provisioner'
    );
    expect(groups[ns].attributes.decommissioned).toEqual(['true']);
    expect(resources).toEqual({});
    expect(updateGroup.mock.invocationCallOrder[0]).toBeLessThan(
      deleteResourceSet.mock.invocationCallOrder[0]
    );
  });

  it('keeps the UMA resource when deleting it fails, so a retry can finish', async () => {
    deleteResourceSet.mockRejectedValueOnce(new Error('keycloak unavailable'));

    await expect(forceDelete()).rejects.toThrow('keycloak unavailable');
    expect(groups[ns].attributes.decommissioned).toEqual(['true']);
    expect(resources).toHaveProperty('res-1');

    await expect(forceDelete()).resolves.toBe(true);
    expect(resources).toEqual({});
    expect(DeleteNamespace).toHaveBeenCalledTimes(2);
    // The second decommission found the group already marked
    expect(updateGroup).toHaveBeenCalledTimes(1);
  });

  it('keeps the UMA resource when the decommission fails, so a retry can finish', async () => {
    updateGroup.mockRejectedValueOnce(new Error('keycloak unavailable'));

    await expect(forceDelete()).rejects.toThrow('keycloak unavailable');
    expect(groups[ns].attributes.decommissioned).toBeUndefined();
    expect(deleteResourceSet).not.toHaveBeenCalled();
    expect(resources).toHaveProperty('res-1');

    await expect(forceDelete()).resolves.toBe(true);
    expect(groups[ns].attributes.decommissioned).toEqual(['true']);
    expect(resources).toEqual({});
  });

  it('keeps the UMA resource when the namespace group is missing', async () => {
    delete groups[ns];

    await expect(forceDelete()).rejects.toThrow('Namespace not found');
    expect(deleteResourceSet).not.toHaveBeenCalled();
    expect(resources).toHaveProperty('res-1');
  });

  it('refuses a namespace without a UMA resource', async () => {
    resources = {};

    await expect(forceDelete()).rejects.toThrow('Invalid Namespace');
    expect(DeleteNamespace).not.toHaveBeenCalled();
    expect(updateGroup).not.toHaveBeenCalled();
  });
});
