const mockGroup = { id: 'group', attributes: {} };
const mockGetGroup = jest.fn();
const mockUpdateGroup = jest.fn();
jest.mock('../../../services/keycloak', () => ({
  KeycloakGroupService: jest.fn(() => ({
    login: jest.fn(),
    createIfMissing: jest.fn(async () => ({ id: 'group', created: true })),
    getGroupById: mockGetGroup, updateGroup: mockUpdateGroup,
  })),
  KeycloakPermissionTicketService: jest.fn(),
}));
jest.mock('../../../services/org-groups', () => ({
  NamespaceService: jest.fn(() => ({ login: jest.fn(), checkNamespaceAvailable: jest.fn() })),
}));
jest.mock('../../../services/keystone', () => ({
  lookupProductEnvironmentServicesBySlug: jest.fn(async () => ({ id: 'env' })),
  recordActivity: jest.fn(),
}));
jest.mock('../../../services/workflow/get-namespaces', () => ({
  getEnvironmentContext: jest.fn(async () => ({ issuerEnvConfig: {}, uma2: {} })),
}));
jest.mock('../../../lists/extensions/Common', () => ({
  getResourceSets: jest.fn(), isUserBasedResourceOwners: () => true,
}));
jest.mock('../../../services/uma2', () => ({
  UMAResourceRegistrationService: jest.fn(() => ({
    createResourceSet: jest.fn(async (input) => ({ ...input, id: 'resource' })),
  })),
}));
const { CreateNamespace } = require('../../../services/workflow/create-namespace');
const context = { createContext: () => ({}), sudo: () => ({}), authedItem: { name: 'Aidan' } };
const args = { name: 'sdx-test', displayName: 'SDX Test', includeSDXScopes: true,
  domains: ['share0.apsdev.servers.sdx'] };
beforeEach(() => {
  jest.clearAllMocks(); mockGroup.attributes = {}; mockGetGroup.mockResolvedValue(mockGroup);
});
test('persists the assigned runtime hostname in Keycloak perm-domains', async () => {
  await CreateNamespace(context, args);
  expect(mockUpdateGroup).toHaveBeenCalledWith(expect.objectContaining({
    attributes: expect.objectContaining({ 'perm-domains': args.domains }),
  }));
  expect(mockGetGroup).toHaveBeenCalledTimes(2);
});
test('does not report success when Keycloak does not persist the hostname', async () => {
  mockGetGroup.mockResolvedValueOnce(mockGroup).mockResolvedValueOnce({ attributes: {} });
  await expect(CreateNamespace(context, args)).rejects.toThrow(
    'missing permitted domains in Keycloak: share0.apsdev.servers.sdx');
});
