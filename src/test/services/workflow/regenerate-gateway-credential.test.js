import { regenerateGatewayCredential } from '../../../services/workflow/regenerate-gateway-credential';
import { StructuredActivityService } from '../../../services/workflow/namespace-activity';
import * as keystone from '../../../services/keystone';
import * as kongReplace from '../../../services/workflow/kong-api-key-replace';
import * as getNamespaces from '../../../services/workflow/get-namespaces';
import { KeycloakClientService } from '../../../services/keycloak';

jest.mock('../../../services/keystone', () => ({
  lookupServiceAccessByName: jest.fn(),
  linkCredRefsToServiceAccess: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../../services/workflow/kong-api-key-replace', () => ({
  replaceApiKey: jest.fn(),
}));

jest.mock('../../../services/workflow/get-namespaces', () => ({
  getEnvironmentContext: jest.fn(),
}));

jest.mock('../../../services/keycloak', () => ({
  KeycloakClientService: jest.fn(),
}));

const mockLogRegenerateCredential = jest.fn();
jest.mock('../../../services/workflow/namespace-activity', () => {
  const actual = jest.requireActual(
    '../../../services/workflow/namespace-activity'
  );
  return {
    ...actual,
    StructuredActivityService: jest.fn().mockImplementation(() => ({
      logRegenerateCredential: mockLogRegenerateCredential,
    })),
  };
});

const lookupServiceAccessByName = keystone.lookupServiceAccessByName;
const linkCredRefsToServiceAccess = keystone.linkCredRefsToServiceAccess;
const replaceApiKey = kongReplace.replaceApiKey;
const getEnvironmentContext = getNamespaces.getEnvironmentContext;
const KeycloakClientServiceMock = KeycloakClientService;

const GATEWAY = 'notify';
const CLIENT_ID = '23C4F461-A1B2C3D4E5F';

function buildContext() {
  return {
    sudo: () => ({}),
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockLogRegenerateCredential.mockReset();
  mockLogRegenerateCredential.mockResolvedValue(undefined);
});

describe('regenerateGatewayCredential', function () {
  it('rotates an API key in place and returns NewCredential', async function () {
    lookupServiceAccessByName.mockResolvedValue({
      id: 'sa-1',
      namespace: GATEWAY,
      application: { name: 'notify-tenant-a' },
      productEnvironment: {
        id: 'env-1',
        name: 'dev',
        flow: 'kong-api-key-acl',
        product: { namespace: GATEWAY, name: 'Notify' },
      },
      consumer: { customId: CLIENT_ID },
      credentialReference: { keyAuthPK: 'old-key', clientId: CLIENT_ID },
    });
    replaceApiKey.mockResolvedValue({
      apiKey: { apiKey: 'new-api-key', keyAuthPK: 'new-key' },
    });

    const context = buildContext();
    const result = await regenerateGatewayCredential(
      context,
      GATEWAY,
      CLIENT_ID
    );

    expect(replaceApiKey).toHaveBeenCalledWith(CLIENT_ID, 'old-key');
    expect(linkCredRefsToServiceAccess).toHaveBeenCalledWith(
      expect.anything(),
      'sa-1',
      { keyAuthPK: 'new-key', clientId: CLIENT_ID }
    );
    expect(result).toEqual({
      flow: 'kong-api-key-acl',
      clientId: CLIENT_ID,
      apiKey: 'new-api-key',
    });
    expect(StructuredActivityService).toHaveBeenCalledWith(context, GATEWAY);
    expect(mockLogRegenerateCredential).toHaveBeenCalledTimes(1);
    expect(mockLogRegenerateCredential).toHaveBeenCalledWith(true, {
      consumerUsername: CLIENT_ID,
      application: { name: 'notify-tenant-a' },
      product: { name: 'Notify' },
      environment: { name: 'dev' },
    });
    const payload = JSON.stringify(mockLogRegenerateCredential.mock.calls);
    expect(payload).not.toContain('apiKey');
    expect(payload).not.toContain('clientSecret');
    expect(payload).not.toContain('new-api-key');
  });

  it('returns the rotated API key when activity logging fails', async function () {
    lookupServiceAccessByName.mockResolvedValue({
      id: 'sa-1',
      namespace: GATEWAY,
      application: { name: 'notify-tenant-a' },
      productEnvironment: {
        id: 'env-1',
        name: 'dev',
        flow: 'kong-api-key-acl',
        product: { namespace: GATEWAY, name: 'Notify' },
      },
      consumer: { customId: CLIENT_ID },
      credentialReference: { keyAuthPK: 'old-key', clientId: CLIENT_ID },
    });
    replaceApiKey.mockResolvedValue({
      apiKey: { apiKey: 'new-api-key', keyAuthPK: 'new-key' },
    });
    mockLogRegenerateCredential.mockRejectedValueOnce(
      new Error('activity down')
    );

    const result = await regenerateGatewayCredential(
      buildContext(),
      GATEWAY,
      CLIENT_ID
    );

    expect(linkCredRefsToServiceAccess).toHaveBeenCalled();
    expect(result.apiKey).toBe('new-api-key');
    expect(mockLogRegenerateCredential).toHaveBeenCalledTimes(1);
  });

  it('rotates client-secret credentials', async function () {
    lookupServiceAccessByName.mockResolvedValue({
      id: 'sa-1',
      application: { name: 'notify-tenant-a' },
      productEnvironment: {
        id: 'env-1',
        name: 'dev',
        flow: 'client-credentials',
        product: { namespace: GATEWAY, name: 'Notify' },
        credentialIssuer: { clientAuthenticator: 'client-secret' },
      },
      consumer: { customId: CLIENT_ID },
      credentialReference: { clientId: CLIENT_ID },
    });
    getEnvironmentContext.mockResolvedValue({
      issuerEnvConfig: {
        issuerUrl: 'https://idp',
        clientId: 'admin',
        clientSecret: 'secret',
      },
      openid: {
        issuer: 'https://idp/realms/x',
        token_endpoint: 'https://idp/token',
      },
    });
    KeycloakClientServiceMock.mockImplementation(() => ({
      login: jest.fn().mockResolvedValue(undefined),
      findByClientId: jest.fn().mockResolvedValue({ id: 'kc-1' }),
      regenerateSecret: jest.fn().mockResolvedValue('new-secret'),
    }));

    const context = buildContext();
    const result = await regenerateGatewayCredential(
      context,
      GATEWAY,
      CLIENT_ID
    );

    expect(result).toEqual({
      flow: 'client-credentials',
      clientId: CLIENT_ID,
      issuer: 'https://idp/realms/x',
      tokenEndpoint: 'https://idp/token',
      clientSecret: 'new-secret',
    });
    expect(StructuredActivityService).toHaveBeenCalledWith(context, GATEWAY);
    expect(mockLogRegenerateCredential).toHaveBeenCalledTimes(1);
    expect(mockLogRegenerateCredential).toHaveBeenCalledWith(true, {
      consumerUsername: CLIENT_ID,
      application: { name: 'notify-tenant-a' },
      product: { name: 'Notify' },
      environment: { name: 'dev' },
    });
    const payload = JSON.stringify(mockLogRegenerateCredential.mock.calls);
    expect(payload).not.toContain('apiKey');
    expect(payload).not.toContain('clientSecret');
    expect(payload).not.toContain('new-secret');
  });

  it('rejects when consumer is not in the gateway', async function () {
    lookupServiceAccessByName.mockResolvedValue({
      id: 'sa-1',
      namespace: 'other',
      productEnvironment: {
        id: 'env-1',
        flow: 'kong-api-key-only',
        product: { namespace: 'other' },
      },
      consumer: { customId: CLIENT_ID },
      credentialReference: { keyAuthPK: 'k' },
    });

    await expect(
      regenerateGatewayCredential(buildContext(), GATEWAY, CLIENT_ID)
    ).rejects.toThrow(/does not belong to gateway/);
    expect(mockLogRegenerateCredential).not.toHaveBeenCalled();
  });
});
