import {
  issueGatewayCredential,
  IssueGatewayCredentialInput,
} from '../../../services/workflow/issue-gateway-credential';
import * as keystone from '../../../services/keystone';
import * as apply from '../../../services/workflow/apply';
import * as consumerMgmt from '../../../services/workflow/consumer-management';
import * as kongApiKey from '../../../services/workflow/kong-api-key';
import * as clientCredentials from '../../../services/workflow/client-credentials';
import * as updateCredential from '../../../services/workflow/update-credential';
import { FeederService } from '../../../services/feeder';
import { KongConsumerService } from '../../../services/kong';
import { AddClientConsumer } from '../../../services/workflow/add-client-consumer';

jest.mock('../../../services/keystone', () => ({
  lookupEnvironmentByAppIdInNamespace: jest.fn(),
  lookupProductEnvironmentServices: jest.fn(),
  lookupApplicationByAppId: jest.fn(),
  addApplication: jest.fn(),
  lookupKongConsumerByCustomId: jest.fn(),
  lookupCredentialIssuerById: jest.fn(),
  addServiceAccess: jest.fn(),
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

jest.mock('../../../services/feeder', () => ({
  FeederService: jest.fn().mockImplementation(() => ({
    forceSync: jest.fn().mockResolvedValue(undefined),
  })),
}));

jest.mock('../../../services/kong', () => ({
  KongConsumerService: jest.fn().mockImplementation(() => ({
    createKongConsumer: jest.fn().mockResolvedValue({ id: 'kong-1' }),
  })),
}));

jest.mock('../../../services/keycloak', () => ({
  getOpenidFromIssuer: jest.fn().mockResolvedValue({
    issuer: 'https://idp/realms/x',
    token_endpoint: 'https://idp/token',
  }),
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
  keystone.lookupEnvironmentByAppIdInNamespace as jest.Mock;
const lookupProductEnvironmentServices =
  keystone.lookupProductEnvironmentServices as jest.Mock;
const lookupApplicationByAppId =
  keystone.lookupApplicationByAppId as jest.Mock;
const addApplication = keystone.addApplication as jest.Mock;
const lookupKongConsumerByCustomId =
  keystone.lookupKongConsumerByCustomId as jest.Mock;
const addServiceAccess = keystone.addServiceAccess as jest.Mock;
const setupAuthorizationAndEnable =
  apply.setupAuthorizationAndEnable as jest.Mock;
const saveConsumerLabels = consumerMgmt.saveConsumerLabels as jest.Mock;
const registerApiKey = kongApiKey.registerApiKey as jest.Mock;

const GATEWAY = 'notify';
const ENV_APP_ID = '23C4F461';
const APP_APP_ID = 'A1B2C3D4E5F';

function apiKeyEnvironment(overrides: any = {}) {
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

function buildContext() {
  const sudoCtx = { sudo: undefined as undefined };
  return {
    authedItem: { namespace: GATEWAY },
    sudo: () => sudoCtx,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  lookupEnvironmentByAppIdInNamespace.mockResolvedValue(apiKeyEnvironment());
  lookupProductEnvironmentServices.mockResolvedValue(apiKeyEnvironment());
  addApplication.mockResolvedValue({
    id: 'app-1',
    appId: APP_APP_ID,
    name: 'notify-tenant-a',
    namespace: GATEWAY,
  });
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
  addServiceAccess.mockResolvedValue('sa-1');
});

describe('issueGatewayCredential', function () {
  it('creates application, issues API key, enables access, and saves labels', async function () {
    const input: IssueGatewayCredentialInput = {
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
});
