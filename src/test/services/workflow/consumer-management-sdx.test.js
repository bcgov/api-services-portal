import {
  getNamespaceConsumerAccess,
  grantAccessToConsumer,
  revokeAccessFromConsumer,
  revokeAllConsumerAccess,
  updateConsumerAccess,
} from '../../../services/workflow/consumer-management';
import * as keystone from '../../../services/keystone';
import { lookupEnvironmentsByNS } from '../../../services/keystone/product-environment';
import { KongConsumerService } from '../../../services/kong';

const mockGetConsumerACLByNamespace = jest.fn();

jest.mock('../../../services/keystone', () => ({
  getConsumerLabels: jest.fn(),
  lookupConsumerPlugins: jest.fn(),
  lookupLabeledServiceAccessesForNamespace: jest.fn(),
  lookupServiceAccessesByConsumer: jest.fn(),
  deleteServiceAccess: jest.fn(),
}));

jest.mock('../../../services/keystone/product-environment', () => ({
  lookupEnvironmentsByNS: jest.fn(),
}));

jest.mock('../../../services/kong', () => ({
  KongConsumerService: jest.fn().mockImplementation(() => ({
    getConsumerACLByNamespace: mockGetConsumerACLByNamespace,
  })),
}));

jest.mock('../../../services/workflow', () => ({}));
jest.mock('../../../services/workflow/get-namespaces', () => ({}));
jest.mock('../../../services/workflow/consumer-filters', () => ({}));
jest.mock('../../../services/workflow/consumer-plugins', () => ({}));
jest.mock('../../../services/keycloak', () => ({}));
jest.mock('../../../services/keycloak/client-roles', () => ({}));

const context = {};

const consumer = {
  id: 'consumer-1',
  username: 'integration-client',
  extForeignKey: 'kong-1',
  plugins: [],
};

const sdxConsumer = { ...consumer, tags: JSON.stringify(['sdx']) };

const environment = {
  id: 'env-1',
  name: 'test',
  appId: 'APP1',
  flow: 'client-credentials',
  product: { name: 'Product' },
  services: [],
};

const env = { ...process.env };

afterAll(() => {
  process.env = env;
});

beforeEach(() => {
  jest.clearAllMocks();
  keystone.lookupLabeledServiceAccessesForNamespace.mockResolvedValue([
    { consumer: { id: 'consumer-1' }, application: { name: 'app' } },
  ]);
  keystone.getConsumerLabels.mockResolvedValue([]);
  keystone.lookupServiceAccessesByConsumer.mockResolvedValue([
    { id: 'sa-1', productEnvironment: environment },
  ]);
  lookupEnvironmentsByNS.mockResolvedValue([environment]);
  mockGetConsumerACLByNamespace.mockResolvedValue([]);
});

it('reads an SDX consumer access without calling Kong', async function () {
  keystone.lookupConsumerPlugins.mockResolvedValue(sdxConsumer);

  const access = await getNamespaceConsumerAccess(context, 'ns', 'consumer-1');

  expect(KongConsumerService).not.toHaveBeenCalled();
  expect(access.prodEnvAccess.map((p) => p.serviceAccessId)).toEqual(['sa-1']);
});

it('reads other consumer ACLs from the APS Kong', async function () {
  process.env.KONG_URL = 'http://kong:8001';
  keystone.lookupConsumerPlugins.mockResolvedValue(consumer);

  await getNamespaceConsumerAccess(context, 'ns', 'consumer-1');

  expect(KongConsumerService).toHaveBeenCalledWith('http://kong:8001');
  expect(mockGetConsumerACLByNamespace).toHaveBeenCalledWith('kong-1', 'ns');
});

it.each([
  [
    'grant',
    (ctx) => grantAccessToConsumer(ctx, 'ns', 'consumer-1', 'env-1', {}),
  ],
  [
    'revoke',
    (ctx) => revokeAccessFromConsumer(ctx, 'ns', 'consumer-1', 'env-1'),
  ],
  [
    'update',
    (ctx) => updateConsumerAccess(ctx, 'ns', 'consumer-1', 'env-1', {}),
  ],
  ['delete', (ctx) => revokeAllConsumerAccess(ctx, 'ns', 'consumer-1')],
])('refuses to %s an SDX consumer', async function (_, action) {
  keystone.lookupConsumerPlugins.mockResolvedValue(sdxConsumer);

  await expect(action(context)).rejects.toThrow(
    'SDX consumers are managed through their SDX connections'
  );
  expect(keystone.deleteServiceAccess).not.toHaveBeenCalled();
});
