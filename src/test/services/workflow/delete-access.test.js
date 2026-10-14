import { DeleteAccess } from '../../../services/workflow/delete-access';
import * as keystone from '../../../services/keystone';
import { KongConsumerService } from '../../../services/kong';

const mockDeleteConsumer = jest.fn();

jest.mock('../../../services/keystone', () => ({
  deleteRecord: jest.fn(),
  deleteRecords: jest.fn(),
  lookupCredentialReferenceByServiceAccess: jest.fn(),
  lookupCredentialIssuerById: jest.fn(),
  lookupEnvironmentAndIssuerById: jest.fn(),
}));

jest.mock('../../../services/kong', () => ({
  KongConsumerService: jest.fn().mockImplementation(() => ({
    deleteConsumer: mockDeleteConsumer,
  })),
}));

jest.mock('../../../services/keycloak', () => ({}));
jest.mock('../../../services/uma2', () => ({}));
jest.mock('../../../services/workflow/namespace-activity', () => ({}));

const deleteRecord = keystone.deleteRecord;
const lookupCredentialReferenceByServiceAccess =
  keystone.lookupCredentialReferenceByServiceAccess;

const context = {};

const serviceAccess = {
  id: 'sa-1',
  consumerType: 'client',
  consumer: {
    id: 'consumer-1',
    username: 'integration-client',
    customId: 'integration-client',
    extForeignKey: 'kong-1',
  },
  productEnvironment: { name: 'test', flow: 'protected-externally' },
};

const sdxServiceAccess = {
  ...serviceAccess,
  consumer: { ...serviceAccess.consumer, tags: JSON.stringify(['sdx']) },
};

const env = { ...process.env };

afterAll(() => {
  process.env = env;
});

beforeEach(() => {
  jest.clearAllMocks();
  process.env.KONG_URL = 'http://kong:8001';
  deleteRecord.mockResolvedValue(undefined);
  mockDeleteConsumer.mockResolvedValue(undefined);
});

it('removes the consumer from the Portal and Kong', async function () {
  lookupCredentialReferenceByServiceAccess.mockResolvedValue(serviceAccess);

  await DeleteAccess(context, { serviceAccess: 'sa-1' });

  expect(deleteRecord).toHaveBeenCalledWith(
    context,
    'AccessRequest',
    { serviceAccess: { id: 'sa-1' } },
    ['id']
  );
  expect(deleteRecord).toHaveBeenCalledWith(
    context,
    'GatewayConsumer',
    { id: 'consumer-1' },
    ['id', 'extForeignKey', 'customId']
  );
  expect(KongConsumerService).toHaveBeenCalledWith('http://kong:8001');
  expect(mockDeleteConsumer).toHaveBeenCalledWith('kong-1');
});

it('only removes the access request for an SDX consumer', async function () {
  lookupCredentialReferenceByServiceAccess.mockResolvedValue(sdxServiceAccess);

  await DeleteAccess(context, { serviceAccess: 'sa-1' });

  expect(deleteRecord.mock.calls).toEqual([
    [context, 'AccessRequest', { serviceAccess: { id: 'sa-1' } }, ['id']],
  ]);
  expect(mockDeleteConsumer).not.toHaveBeenCalled();
});
