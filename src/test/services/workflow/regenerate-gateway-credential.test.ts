import { regenerateGatewayCredential } from '../../../services/workflow/regenerate-gateway-credential';
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

const lookupServiceAccessByName =
  keystone.lookupServiceAccessByName as jest.Mock;
const linkCredRefsToServiceAccess =
  keystone.linkCredRefsToServiceAccess as jest.Mock;
const replaceApiKey = kongReplace.replaceApiKey as jest.Mock;
const getEnvironmentContext =
  getNamespaces.getEnvironmentContext as jest.Mock;
const KeycloakClientServiceMock = KeycloakClientService as jest.Mock;

const GATEWAY = 'notify';
const CLIENT_ID = '23C4F461-A1B2C3D4E5F';

function buildContext() {
  return {
    sudo: () => ({}),
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('regenerateGatewayCredential', function () {
  it('rotates an API key in place and returns NewCredential', async function () {
    lookupServiceAccessByName.mockResolvedValue({
      id: 'sa-1',
      namespace: GATEWAY,
      productEnvironment: {
        id: 'env-1',
        flow: 'kong-api-key-acl',
        product: { namespace: GATEWAY },
      },
      consumer: { customId: CLIENT_ID },
      credentialReference: { keyAuthPK: 'old-key', clientId: CLIENT_ID },
    });
    replaceApiKey.mockResolvedValue({
      apiKey: { apiKey: 'new-api-key', keyAuthPK: 'new-key' },
    });

    const result = await regenerateGatewayCredential(
      buildContext(),
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
  });

  it('rotates client-secret credentials', async function () {
    lookupServiceAccessByName.mockResolvedValue({
      id: 'sa-1',
      productEnvironment: {
        id: 'env-1',
        flow: 'client-credentials',
        product: { namespace: GATEWAY },
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

    const result = await regenerateGatewayCredential(
      buildContext(),
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
  });
});
