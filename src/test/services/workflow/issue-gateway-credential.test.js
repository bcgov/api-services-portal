import { issueGatewayCredential } from '../../../services/workflow/issue-gateway-credential';
import * as keystone from '../../../services/keystone';
import * as apply from '../../../services/workflow/apply';
import * as consumerMgmt from '../../../services/workflow/consumer-management';
import * as kongApiKey from '../../../services/workflow/kong-api-key';
import * as clientCredentials from '../../../services/workflow/client-credentials';

jest.mock('../../../services/keystone', () => ({
  lookupEnvironmentByAppIdInNamespace: jest.fn(),
  lookupProductEnvironmentServices: jest.fn(),
  lookupApplicationByAppId: jest.fn(),
  addApplication: jest.fn(),
  deleteApplication: jest.fn(),
  deleteRecord: jest.fn(),
  lookupKongConsumerByCustomId: jest.fn(),
  lookupCredentialIssuerById: jest.fn(),
  addServiceAccess: jest.fn(),
  deleteServiceAccess: jest.fn(),
}));

jest.mock('../../../services/workflow/apply', () => ({
  setupAuthorizationAndEnable: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../../services/workflow/consumer-management', () => ({
  saveConsumerLabels: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../../services/workflow/kong-api-key', () => ({
  registerApiKey: jest.fn(),
}));

jest.mock('../../../services/workflow/client-credentials', () => ({
  registerClient: jest.fn(),
}));

jest.mock('../../../services/workflow/update-credential', () => ({
  IsCertificateValid: jest.fn().mockReturnValue(true),
  IsJWKSURLValid: jest.fn().mockResolvedValue(true),
}));

jest.mock('../../../services/workflow/add-client-consumer', () => ({
  AddClientConsumer: jest.fn().mockResolvedValue('consumer-pk-1'),
}));

const mockForceSync = jest.fn().mockResolvedValue(undefined);
jest.mock('../../../services/feeder', () => ({
  FeederService: jest.fn().mockImplementation(() => ({
    forceSync: mockForceSync,
  })),
}));

const mockDeleteConsumer = jest.fn().mockResolvedValue(undefined);
jest.mock('../../../services/kong', () => ({
  KongConsumerService: jest.fn().mockImplementation(() => ({
    createKongConsumer: jest.fn().mockResolvedValue({ id: 'kong-1' }),
    deleteConsumer: mockDeleteConsumer,
  })),
}));

jest.mock('../../../services/keycloak', () => ({
  getOpenidFromIssuer: jest.fn().mockResolvedValue({
    issuer: 'https://idp/realms/x',
    token_endpoint: 'https://idp/token',
    registration_endpoint: 'https://idp/reg',
  }),
  KeycloakTokenService: jest.fn().mockImplementation(() => ({
    getKeycloakSession: jest.fn().mockResolvedValue('token'),
  })),
  KeycloakClientRegistrationService: jest.fn().mockImplementation(() => ({
    deleteClientRegistration: jest.fn().mockResolvedValue(undefined),
  })),
}));

jest.mock('../../../services/keystone/gateway-service', () => ({
  parsePluginConfig: jest.fn(),
}));

jest.mock('../../../services/workflow/types', () => {
  const actual = jest.requireActual('../../../services/workflow/types');
  return {
    ...actual,
    getIssuerEnvironmentConfig: jest.fn().mockReturnValue({
      exists: true,
      environment: 'dev',
      issuerUrl: 'https://idp',
      clientRegistration: 'managed',
      clientId: 'admin',
      clientSecret: 'secret',
    }),
  };
});

const lookupEnvironmentByAppIdInNamespace =
  keystone.lookupEnvironmentByAppIdInNamespace;
const lookupProductEnvironmentServices =
  keystone.lookupProductEnvironmentServices;
const lookupApplicationByAppId = keystone.lookupApplicationByAppId;
const addApplication = keystone.addApplication;
const deleteApplication = keystone.deleteApplication;
const deleteRecord = keystone.deleteRecord;
const lookupKongConsumerByCustomId = keystone.lookupKongConsumerByCustomId;
const addServiceAccess = keystone.addServiceAccess;
const deleteServiceAccess = keystone.deleteServiceAccess;
const setupAuthorizationAndEnable = apply.setupAuthorizationAndEnable;
const saveConsumerLabels = consumerMgmt.saveConsumerLabels;
const registerApiKey = kongApiKey.registerApiKey;
const registerClient = clientCredentials.registerClient;

const GATEWAY = 'notify';
const ENV_APP_ID = '23C4F461';
const APP_APP_ID = 'A1B2C3D4E5F';

function apiKeyEnvironment(overrides = {}) {
  return {
    id: 'env-1',
    appId: ENV_APP_ID,
    name: 'dev',
    flow: 'kong-api-key-acl',
    product: { namespace: GATEWAY, name: 'Notify' },
    credentialIssuer: null,
    services: [],
    ...overrides,
  };
}

function clientCredentialsEnvironment(authenticator, overrides = {}) {
  return {
    id: 'env-cc',
    appId: ENV_APP_ID,
    name: 'dev',
    flow: 'client-credentials',
    product: { namespace: GATEWAY, name: 'Notify' },
    credentialIssuer: {
      id: 'issuer-1',
      clientAuthenticator: authenticator,
    },
    services: [],
    ...overrides,
  };
}

function buildContext() {
  const sudoCtx = { sudo: undefined };
  return {
    authedItem: { namespace: GATEWAY },
    sudo: () => sudoCtx,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockForceSync.mockResolvedValue(undefined);
  mockDeleteConsumer.mockResolvedValue(undefined);
  lookupEnvironmentByAppIdInNamespace.mockResolvedValue(apiKeyEnvironment());
  lookupProductEnvironmentServices.mockResolvedValue(apiKeyEnvironment());
  addApplication.mockResolvedValue({
    id: 'app-1',
    appId: APP_APP_ID,
    name: 'notify-tenant-a',
    namespace: GATEWAY,
  });
  deleteApplication.mockResolvedValue(undefined);
  deleteRecord.mockResolvedValue(undefined);
  lookupKongConsumerByCustomId.mockReset();
  lookupKongConsumerByCustomId
    .mockResolvedValueOnce(undefined) // duplicate check
    .mockResolvedValue({
      id: 'consumer-1',
      customId: `${ENV_APP_ID}-${APP_APP_ID}`,
      extForeignKey: 'kong-1',
    });
  registerApiKey.mockResolvedValue({
    apiKey: { apiKey: 'secret-api-key', keyAuthPK: 'key-pk' },
    consumer: { id: 'kong-1' },
    consumerPK: 'consumer-1',
  });
  registerClient.mockResolvedValue({
    openid: {
      issuer: 'https://idp/realms/x',
      token_endpoint: 'https://idp/token',
    },
    client: {
      id: 'keycloak-1',
      clientId: `${ENV_APP_ID}-${APP_APP_ID}`,
      clientSecret: 'client-secret',
    },
  });
  addServiceAccess.mockResolvedValue('sa-1');
  keystone.lookupCredentialIssuerById.mockResolvedValue({
    id: 'issuer-1',
    mode: 'auto',
    flow: 'client-credentials',
    clientAuthenticator: 'client-secret',
  });
});

describe('issueGatewayCredential', function () {
  it('creates application, issues API key, enables access, and saves labels', async function () {
    const input = {
      environmentAppId: ENV_APP_ID,
      application: { name: 'notify-tenant-a', description: 'Tenant A' },
      labels: { 'issued-by': 'notify' },
      controls: { aclGroups: ['notify-tenant-a'] },
    };

    const result = await issueGatewayCredential(
      buildContext(),
      GATEWAY,
      input
    );

    expect(addApplication).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        name: 'notify-tenant-a',
        description: 'Tenant A',
        namespace: GATEWAY,
      })
    );
    expect(registerApiKey).toHaveBeenCalled();
    expect(setupAuthorizationAndEnable).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.objectContaining({
        flow: 'kong-api-key-acl',
        namespace: GATEWAY,
        environmentAppId: ENV_APP_ID,
        controls: expect.objectContaining({
          aclGroups: ['notify-tenant-a'],
        }),
      })
    );
    expect(saveConsumerLabels).toHaveBeenCalledWith(
      expect.anything(),
      GATEWAY,
      'consumer-1',
      [{ labelGroup: 'issued-by', values: ['notify'] }]
    );
    expect(saveConsumerLabels.mock.invocationCallOrder[0]).toBeLessThan(
      setupAuthorizationAndEnable.mock.invocationCallOrder[0]
    );
    expect(deleteServiceAccess).not.toHaveBeenCalled();
    expect(deleteApplication).not.toHaveBeenCalled();
    expect(result).toEqual({
      flow: 'kong-api-key-acl',
      clientId: `${ENV_APP_ID}-${APP_APP_ID}`,
      apiKey: 'secret-api-key',
    });
  });

  it('reuses an existing application in the same gateway for another environment', async function () {
    lookupApplicationByAppId.mockResolvedValue({
      id: 'app-1',
      appId: APP_APP_ID,
      name: 'notify-tenant-a',
      namespace: GATEWAY,
    });

    const result = await issueGatewayCredential(buildContext(), GATEWAY, {
      environmentAppId: ENV_APP_ID,
      application: { appId: APP_APP_ID },
    });

    expect(addApplication).not.toHaveBeenCalled();
    expect(lookupApplicationByAppId).toHaveBeenCalledWith(
      expect.anything(),
      APP_APP_ID,
      GATEWAY
    );
    expect(result.clientId).toBe(`${ENV_APP_ID}-${APP_APP_ID}`);
    expect(deleteApplication).not.toHaveBeenCalled();
  });

  it('rejects when application already has access to the environment', async function () {
    lookupKongConsumerByCustomId.mockReset();
    lookupKongConsumerByCustomId.mockResolvedValue({
      id: 'existing',
      customId: `${ENV_APP_ID}-${APP_APP_ID}`,
    });

    await expect(
      issueGatewayCredential(buildContext(), GATEWAY, {
        environmentAppId: ENV_APP_ID,
        application: { name: 'notify-tenant-a' },
      })
    ).rejects.toThrow(/already has access/);

    expect(deleteApplication).toHaveBeenCalledWith(expect.anything(), 'app-1');
  });

  it('rejects unsupported flows', async function () {
    const env = apiKeyEnvironment({ flow: 'public' });
    lookupEnvironmentByAppIdInNamespace.mockResolvedValue(env);
    lookupProductEnvironmentServices.mockResolvedValue(env);

    await expect(
      issueGatewayCredential(buildContext(), GATEWAY, {
        environmentAppId: ENV_APP_ID,
        application: { name: 'x' },
      })
    ).rejects.toThrow(/does not support credential issuance/);

    expect(addApplication).not.toHaveBeenCalled();
  });

  it('requires application.name when creating', async function () {
    await expect(
      issueGatewayCredential(buildContext(), GATEWAY, {
        environmentAppId: ENV_APP_ID,
        application: {},
      })
    ).rejects.toThrow(/application.name is required/);
  });

  it('rejects reuse when application is not in the gateway', async function () {
    lookupApplicationByAppId.mockResolvedValue(undefined);

    await expect(
      issueGatewayCredential(buildContext(), GATEWAY, {
        environmentAppId: ENV_APP_ID,
        application: { appId: 'MISSINGAPPID' },
      })
    ).rejects.toThrow(/not found in gateway/);
  });

  it('cleans up ServiceAccess and new Application when authorization setup fails', async function () {
    setupAuthorizationAndEnable.mockRejectedValueOnce(
      new Error('authorization failed')
    );

    await expect(
      issueGatewayCredential(buildContext(), GATEWAY, {
        environmentAppId: ENV_APP_ID,
        application: { name: 'notify-tenant-a' },
      })
    ).rejects.toThrow('authorization failed');

    expect(deleteServiceAccess).toHaveBeenCalledWith(
      expect.anything(),
      'sa-1'
    );
    expect(deleteApplication).toHaveBeenCalledWith(expect.anything(), 'app-1');
  });

  it('cleans up without activating access when label persistence fails', async function () {
    saveConsumerLabels.mockRejectedValueOnce(new Error('labels failed'));

    await expect(
      issueGatewayCredential(buildContext(), GATEWAY, {
        environmentAppId: ENV_APP_ID,
        application: { name: 'notify-tenant-a' },
        labels: { 'issued-by': 'notify' },
      })
    ).rejects.toThrow('labels failed');

    expect(setupAuthorizationAndEnable).not.toHaveBeenCalled();
    expect(deleteServiceAccess).toHaveBeenCalledWith(
      expect.anything(),
      'sa-1'
    );
    expect(deleteApplication).toHaveBeenCalledWith(expect.anything(), 'app-1');
  });

  it('rolls back partial credential resources when forceSync fails before ServiceAccess', async function () {
    mockForceSync.mockRejectedValueOnce(new Error('forceSync failed'));

    await expect(
      issueGatewayCredential(buildContext(), GATEWAY, {
        environmentAppId: ENV_APP_ID,
        application: { name: 'notify-tenant-a' },
      })
    ).rejects.toThrow('forceSync failed');

    expect(addServiceAccess).not.toHaveBeenCalled();
    expect(deleteRecord).toHaveBeenCalledWith(
      expect.anything(),
      'GatewayConsumer',
      { id: 'consumer-1' },
      ['id']
    );
    expect(mockDeleteConsumer).toHaveBeenCalledWith('kong-1');
    expect(deleteApplication).toHaveBeenCalledWith(expect.anything(), 'app-1');
  });

  it('does not delete a reused Application when issuance fails', async function () {
    lookupApplicationByAppId.mockResolvedValue({
      id: 'app-1',
      appId: APP_APP_ID,
      name: 'notify-tenant-a',
      namespace: GATEWAY,
    });
    setupAuthorizationAndEnable.mockRejectedValueOnce(
      new Error('authorization failed')
    );

    await expect(
      issueGatewayCredential(buildContext(), GATEWAY, {
        environmentAppId: ENV_APP_ID,
        application: { appId: APP_APP_ID },
      })
    ).rejects.toThrow('authorization failed');

    expect(deleteServiceAccess).toHaveBeenCalledWith(
      expect.anything(),
      'sa-1'
    );
    expect(deleteApplication).not.toHaveBeenCalled();
  });

  it('does not repeat the feeder sync after adding a client consumer', async function () {
    const env = clientCredentialsEnvironment('client-secret');
    lookupEnvironmentByAppIdInNamespace.mockResolvedValue(env);
    lookupProductEnvironmentServices.mockResolvedValue(env);

    const result = await issueGatewayCredential(buildContext(), GATEWAY, {
      environmentAppId: ENV_APP_ID,
      application: { name: 'client-app' },
      controls: {},
    });

    expect(mockForceSync).not.toHaveBeenCalled();
    expect(result).toEqual({
      flow: 'client-credentials',
      clientId: `${ENV_APP_ID}-${APP_APP_ID}`,
      clientSecret: 'client-secret',
      issuer: null,
      tokenEndpoint: 'https://idp/token',
      clientPublicKey: null,
      clientPrivateKey: null,
    });
  });

  describe('client-credentials signing controls', function () {
    beforeEach(() => {
      keystone.lookupCredentialIssuerById.mockResolvedValue({
        id: 'issuer-1',
        mode: 'auto',
        flow: 'client-credentials',
        clientAuthenticator: 'client-jwt',
      });
    });

    it('rejects client-jwt without certificate controls', async function () {
      const env = clientCredentialsEnvironment('client-jwt');
      lookupEnvironmentByAppIdInNamespace.mockResolvedValue(env);
      lookupProductEnvironmentServices.mockResolvedValue(env);

      await expect(
        issueGatewayCredential(buildContext(), GATEWAY, {
          environmentAppId: ENV_APP_ID,
          application: { name: 'jwt-app' },
          controls: {},
        })
      ).rejects.toThrow(
        /client-jwt requires clientGenCertificate or clientCertificate/
      );

      expect(addApplication).not.toHaveBeenCalled();
    });

    it('rejects client-jwt with both generated and supplied certificates', async function () {
      const env = clientCredentialsEnvironment('client-jwt');
      lookupEnvironmentByAppIdInNamespace.mockResolvedValue(env);
      lookupProductEnvironmentServices.mockResolvedValue(env);

      await expect(
        issueGatewayCredential(buildContext(), GATEWAY, {
          environmentAppId: ENV_APP_ID,
          application: { name: 'jwt-app' },
          controls: {
            clientGenCertificate: true,
            clientCertificate: 'PEM',
          },
        })
      ).rejects.toThrow(
        /Provide only one of clientGenCertificate or clientCertificate/
      );
    });

    it('rejects jwksUrl combined with clientGenCertificate for jwks authenticator', async function () {
      const env = clientCredentialsEnvironment('client-jwt-jwks-url');
      lookupEnvironmentByAppIdInNamespace.mockResolvedValue(env);
      lookupProductEnvironmentServices.mockResolvedValue(env);
      keystone.lookupCredentialIssuerById.mockResolvedValue({
        id: 'issuer-1',
        mode: 'auto',
        flow: 'client-credentials',
        clientAuthenticator: 'client-jwt-jwks-url',
      });

      await expect(
        issueGatewayCredential(buildContext(), GATEWAY, {
          environmentAppId: ENV_APP_ID,
          application: { name: 'jwks-app' },
          controls: {
            jwksUrl: 'https://example.com/jwks.json',
            clientGenCertificate: true,
          },
        })
      ).rejects.toThrow(
        /client-jwt-jwks-url does not accept clientGenCertificate/
      );
    });

    it('rejects client-secret requests that include jwt signing controls', async function () {
      const env = clientCredentialsEnvironment('client-secret');
      lookupEnvironmentByAppIdInNamespace.mockResolvedValue(env);
      lookupProductEnvironmentServices.mockResolvedValue(env);
      keystone.lookupCredentialIssuerById.mockResolvedValue({
        id: 'issuer-1',
        mode: 'auto',
        flow: 'client-credentials',
        clientAuthenticator: 'client-secret',
      });

      await expect(
        issueGatewayCredential(buildContext(), GATEWAY, {
          environmentAppId: ENV_APP_ID,
          application: { name: 'secret-app' },
          controls: { clientGenCertificate: true },
        })
      ).rejects.toThrow(
        /client-secret authenticator does not accept jwksUrl, clientCertificate, or clientGenCertificate/
      );
    });
  });
});
