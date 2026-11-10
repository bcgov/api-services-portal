jest.mock('../../../services/keystone', () => ({
  lookupProductEnvironmentServicesBySlug: jest.fn(),
  lookupEnvironmentAndIssuerUsingWhereClause: jest.fn(),
}));
jest.mock('../../../services/workflow/types', () => ({
  checkIssuerEnvironmentConfig: jest.fn(),
}));
jest.mock('../../../services/keycloak', () => ({
  KeycloakTokenService: jest.fn(),
  getOpenidFromIssuer: jest.fn(),
  getUma2FromIssuer: jest.fn(),
}));
jest.mock('../../../services/uma2', () => ({
  UMAResourceRegistrationService: jest.fn(),
}));
jest.mock('../../../services/org-groups', () => ({
  NamespaceService: jest.fn(),
}));

const {
  lookupProductEnvironmentServicesBySlug,
  lookupEnvironmentAndIssuerUsingWhereClause,
} = require('../../../services/keystone');
const {
  checkIssuerEnvironmentConfig,
} = require('../../../services/workflow/types');
const {
  KeycloakTokenService,
  getOpenidFromIssuer,
  getUma2FromIssuer,
} = require('../../../services/keycloak');
const { UMAResourceRegistrationService } = require('../../../services/uma2');
const { NamespaceService } = require('../../../services/org-groups');
const {
  getNamespaceAttributes,
  namespaceResourceExists,
} = require('../../../services/workflow/get-namespaces');

const context = { createContext: () => ({ noauth: true }) };

beforeEach(() => {
  jest.clearAllMocks();
  lookupProductEnvironmentServicesBySlug.mockResolvedValue({ id: 'env-1' });
  lookupEnvironmentAndIssuerUsingWhereClause.mockResolvedValue({
    name: 'prod',
    credentialIssuer: { resourceType: 'namespace' },
  });
  checkIssuerEnvironmentConfig.mockReturnValue({
    issuerUrl: 'http://keycloak/realms/master',
    clientId: 'gwa-api',
    clientSecret: 'client-secret',
  });
  getOpenidFromIssuer.mockResolvedValue({
    token_endpoint: 'http://keycloak/token',
  });
  getUma2FromIssuer.mockResolvedValue({
    resource_registration_endpoint: 'http://keycloak/resource_set',
  });
});

describe('getNamespaceAttributes', () => {
  it('reads the namespace group as the issuer client', async () => {
    const login = jest.fn();
    const getNamespaceAttributesForNs = jest
      .fn()
      .mockResolvedValue({ 'perm-data-plane': ['sdx-edge'] });
    NamespaceService.mockImplementation(() => ({
      login,
      getNamespaceAttributes: getNamespaceAttributesForNs,
    }));

    await expect(
      getNamespaceAttributes(context, 'sdx-gw-abc12')
    ).resolves.toEqual({ 'perm-data-plane': ['sdx-edge'] });

    expect(NamespaceService).toHaveBeenCalledWith(
      'http://keycloak/realms/master'
    );
    expect(login).toHaveBeenCalledWith('gwa-api', 'client-secret');
    expect(getNamespaceAttributesForNs).toHaveBeenCalledWith('sdx-gw-abc12');
  });
});

describe('namespaceResourceExists', () => {
  let getKeycloakSession, findResourceByName;

  beforeEach(() => {
    getKeycloakSession = jest.fn().mockResolvedValue('resource-server-token');
    KeycloakTokenService.mockImplementation(() => ({ getKeycloakSession }));
    findResourceByName = jest.fn();
    UMAResourceRegistrationService.mockImplementation(() => ({
      findResourceByName,
    }));
  });

  it('looks up the resource by name as the resource server', async () => {
    findResourceByName.mockResolvedValue({
      id: 'res-1',
      name: 'sdx-gw-abc12',
    });

    await expect(
      namespaceResourceExists(context, 'sdx-gw-abc12')
    ).resolves.toBe(true);

    expect(getKeycloakSession).toHaveBeenCalledWith('gwa-api', 'client-secret');
    expect(UMAResourceRegistrationService).toHaveBeenCalledWith(
      'http://keycloak/resource_set',
      'resource-server-token'
    );
    expect(findResourceByName).toHaveBeenCalledWith('sdx-gw-abc12');
  });

  it('is false once the resource is deleted', async () => {
    findResourceByName.mockResolvedValue(undefined);

    await expect(
      namespaceResourceExists(context, 'sdx-gw-abc12')
    ).resolves.toBe(false);
  });
});
