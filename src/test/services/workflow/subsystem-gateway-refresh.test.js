const mockFindHosted = jest.fn();
const mockGetGroup = jest.fn();
const mockUpdateGroup = jest.fn();
const mockFindResource = jest.fn();
const mockCreateNamespace = jest.fn();
const mockAssignRoles = jest.fn();
const mockCreatePolicy = jest.fn();
const mockRevoke = jest.fn();
const mockInjectToken = jest.fn();

jest.mock('../../../services/batch/runtime-group', () => ({
  RuntimeGroupService: jest.fn(() => ({
    findHostedRuntimeGroupsByName: mockFindHosted,
  })),
}));
jest.mock('../../../services/keycloak', () => ({
  KeycloakGroupService: jest.fn(() => ({
    login: jest.fn(),
    getGroup: mockGetGroup,
    updateGroup: mockUpdateGroup,
  })),
  KeycloakPermissionTicketService: jest.fn(() => ({
    listPermissions: jest.fn(async () => []),
    deletePermission: mockRevoke,
  })),
}));
jest.mock('../../../services/uma2', () => ({
  UMAResourceRegistrationService: jest.fn(() => ({
    findResourceByName: mockFindResource,
  })),
}));
jest.mock('../../../services/workflow/create-namespace', () => ({
  CreateNamespace: mockCreateNamespace,
}));
jest.mock('../../../services/keystone', () => ({
  lookupProductEnvironmentServicesBySlug: jest.fn(async () => ({ id: 'env' })),
  recordActivity: jest.fn(),
}));
jest.mock('../../../services/workflow/get-namespaces', () => ({
  getEnvironmentContext: jest.fn(async () => ({
    issuerEnvConfig: {},
    uma2: {},
    openid: {},
    subjectUuid: 'operator',
  })),
  injectResSvrAccessTokenToContext: mockInjectToken,
}));
jest.mock('../../../services/workflow/ns-uma-policy-access', () => ({
  createUmaPolicy: mockCreatePolicy,
}));
jest.mock('../../../services/org-groups/sys-group-access', () => ({
  SysGroupAccessService: jest.fn(() => ({
    login: jest.fn(),
    createOrUpdateGroupAccess: mockAssignRoles,
  })),
}));
jest.mock('../../../services/org-groups', () => ({
  GroupAccessService: jest.fn(() => ({
    login: jest.fn(),
    assignSystemRolesToNamespace: jest.fn(),
  })),
}));

const {
  CreateNamespaceForSubsystem,
} = require('../../../services/workflow/create-namespace-sdx');
const { recordActivity } = require('../../../services/keystone');
const context = {
  createContext: () => ({}),
  sudo: () => ({}),
  authedItem: { name: 'Operator' },
};
const args = {
  subsystem: {
    name: 'VEHICLES',
    clientId: 'MIN.TEC.VEHICLES',
    organization: { name: 'ministry-of-tech' },
    gateway: { id: 'sdx-vehicles' },
  },
  runtimeGroupName: 'share0',
  routePaths: ['/MIN.TEC.VEHICLES'],
};
const runtime = (env) => ({
  host: `share0.${env}.servers.sdx`,
  consumerEndpoint: `https://share0.${env}.example.com`,
});
const resource = { id: 'resource-id', name: 'sdx-vehicles', type: 'namespace' };
let group;
const reservedDomains = process.env.SDX_RESERVED_DOMAINS;
beforeEach(() => {
  jest.clearAllMocks();
  delete process.env.SDX_RESERVED_DOMAINS;
  group = {
    id: 'group-id',
    name: 'sdx-vehicles',
    attributes: {
      org: ['ministry-of-tech'],
      'perm-runtime-group': ['share0'],
      'perm-data-plane': ['sdx-edge'],
      'perm-domains': ['old.example.com'],
      'perm-route-paths': ['/MIN.TEC.VEHICLES'],
      custom: ['preserve-me'],
    },
  };
  mockFindHosted.mockResolvedValue([runtime('apsdev'), runtime('apstest')]);
  mockGetGroup.mockImplementation(async () =>
    JSON.parse(JSON.stringify(group))
  );
  mockUpdateGroup.mockImplementation(async (updated) => {
    group = updated;
  });
  mockFindResource.mockResolvedValue(resource);
  mockCreateNamespace.mockResolvedValue(resource);
});
afterAll(() => {
  if (reservedDomains === undefined) delete process.env.SDX_RESERVED_DOMAINS;
  else process.env.SDX_RESERVED_DOMAINS = reservedDomains;
});

test('refreshes domains from every hosted environment without recreating or assigning roles', async () => {
  await expect(CreateNamespaceForSubsystem(context, args)).resolves.toEqual(
    resource
  );
  expect(group.attributes).toEqual({
    org: ['ministry-of-tech'],
    'perm-runtime-group': ['share0'],
    'perm-data-plane': ['sdx-edge'],
    'perm-route-paths': ['/MIN.TEC.VEHICLES'],
    custom: ['preserve-me'],
    'perm-domains': [
      'share0.apsdev.servers.sdx',
      'share0.apstest.servers.sdx',
      'share0.apsdev.example.com',
      'share0.apstest.example.com',
      'pzgw.api.gov.bc.ca',
    ],
  });
  expect(mockCreateNamespace).not.toHaveBeenCalled();
  expect(mockAssignRoles).not.toHaveBeenCalled();
  expect(mockCreatePolicy).not.toHaveBeenCalled();
  expect(mockRevoke).not.toHaveBeenCalled();
  expect(recordActivity).toHaveBeenCalledWith(
    expect.anything(),
    'update',
    'Namespace',
    'sdx-vehicles',
    expect.any(String),
    'success',
    expect.any(String),
    'sdx-vehicles',
    expect.any(Array)
  );
});

test('can be repeated after another environment is added and remains idempotent', async () => {
  await CreateNamespaceForSubsystem(context, args);
  mockFindHosted.mockResolvedValue([
    runtime('apsdev'),
    runtime('apstest'),
    runtime('apsprod'),
  ]);
  await CreateNamespaceForSubsystem(context, args);
  const domains = [...group.attributes['perm-domains']];
  await CreateNamespaceForSubsystem(context, args);
  expect(domains).toContain('share0.apsprod.servers.sdx');
  expect(domains).toContain('share0.apsprod.example.com');
  expect(group.attributes['perm-domains']).toEqual(domains);
  expect(mockCreateNamespace).not.toHaveBeenCalled();
});

test('deduplicates runtime and configured reserved domains', async () => {
  process.env.SDX_RESERVED_DOMAINS =
    'pzgw.example.com,share0.apsdev.servers.sdx';
  mockFindHosted.mockResolvedValue([runtime('apsdev'), runtime('apsdev')]);
  await CreateNamespaceForSubsystem(context, args);
  expect(group.attributes['perm-domains']).toEqual([
    'share0.apsdev.servers.sdx',
    'share0.apsdev.example.com',
    'pzgw.example.com',
  ]);
});

test('rejects a request to change the registered runtime group', async () => {
  await expect(
    CreateNamespaceForSubsystem(context, {
      ...args,
      runtimeGroupName: 'other',
    })
  ).rejects.toThrow('runtime group cannot be changed');
  expect(mockUpdateGroup).not.toHaveBeenCalled();
  expect(mockCreateNamespace).not.toHaveBeenCalled();
  expect(group.attributes['perm-runtime-group']).toEqual(['share0']);
  expect(group.attributes['perm-domains']).toEqual(['old.example.com']);
});

test.each([[['other']], [[]], [['share0', 'other']]])(
  'rejects runtime assignment %j before writes',
  async (names) => {
    group.attributes['perm-runtime-group'] = names;
    await expect(CreateNamespaceForSubsystem(context, args)).rejects.toThrow(
      'runtime group cannot be changed'
    );
    expect(mockUpdateGroup).not.toHaveBeenCalled();
    expect(mockCreateNamespace).not.toHaveBeenCalled();
    expect(mockInjectToken).not.toHaveBeenCalled();
  }
);

test.each([
  ['org', ['another-org']],
  ['perm-data-plane', ['other']],
  ['org-unit', ['another-unit']],
  ['decommissioned', ['true']],
])('rejects an incompatible existing gateway (%s)', async (key, value) => {
  group.attributes[key] = value;
  await expect(CreateNamespaceForSubsystem(context, args)).rejects.toThrow(
    'not an active SDX gateway'
  );
  expect(mockUpdateGroup).not.toHaveBeenCalled();
  expect(recordActivity).not.toHaveBeenCalled();
});

test('retains the hosting guard on refresh', async () => {
  mockFindHosted.mockResolvedValue([]);
  await expect(CreateNamespaceForSubsystem(context, args)).rejects.toThrow(
    'does not host organization'
  );
  expect(mockGetGroup).not.toHaveBeenCalled();
  expect(mockUpdateGroup).not.toHaveBeenCalled();
});

test('rejects incomplete registration before changing domains', async () => {
  mockFindResource.mockResolvedValue(undefined);
  await expect(CreateNamespaceForSubsystem(context, args)).rejects.toThrow(
    'namespace resource is missing'
  );
  expect(mockUpdateGroup).not.toHaveBeenCalled();
  expect(mockCreateNamespace).not.toHaveBeenCalled();
});

test('propagates a failed Keycloak update without recording success', async () => {
  mockUpdateGroup.mockRejectedValueOnce(new Error('Keycloak update failed'));
  await expect(CreateNamespaceForSubsystem(context, args)).rejects.toThrow(
    'Keycloak update failed'
  );
  expect(recordActivity).not.toHaveBeenCalled();
});

test('uses the original creation and role setup when no gateway group exists', async () => {
  mockGetGroup.mockResolvedValueOnce(null);
  await expect(CreateNamespaceForSubsystem(context, args)).resolves.toEqual(
    resource
  );
  expect(mockCreateNamespace).toHaveBeenCalledWith(
    context,
    expect.objectContaining({
      name: 'sdx-vehicles',
      runtimeGroupName: 'share0',
      domains: expect.arrayContaining([
        'share0.apsdev.servers.sdx',
        'share0.apstest.servers.sdx',
      ]),
    })
  );
  expect(mockAssignRoles).toHaveBeenCalledTimes(1);
  expect(mockCreatePolicy).toHaveBeenCalledTimes(1);
  expect(mockUpdateGroup).not.toHaveBeenCalled();
});
