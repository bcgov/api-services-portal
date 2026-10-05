import { DeleteAccess } from '../../../services/workflow/delete-access';
import * as keystone from '../../../services/keystone';

const mockDeleteConsumer = jest.fn();

jest.mock('../../../services/keystone', () => ({
  countOtherServiceAccessesByConsumer: jest.fn(),
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

const countOtherServiceAccessesByConsumer =
  keystone.countOtherServiceAccessesByConsumer;
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

beforeEach(() => {
  jest.clearAllMocks();
  lookupCredentialReferenceByServiceAccess.mockResolvedValue(serviceAccess);
  deleteRecord.mockResolvedValue(undefined);
  mockDeleteConsumer.mockResolvedValue(undefined);
});

it('keeps a consumer that is shared with other service accesses', async function () {
  countOtherServiceAccessesByConsumer.mockResolvedValue(2);

  await DeleteAccess(context, { serviceAccess: 'sa-1' });

  expect(countOtherServiceAccessesByConsumer).toHaveBeenCalledWith(
    context,
    'consumer-1',
    'sa-1'
  );
  expect(deleteRecord).toHaveBeenCalledTimes(1);
  expect(deleteRecord).toHaveBeenCalledWith(
    context,
    'AccessRequest',
    { serviceAccess: { id: 'sa-1' } },
    ['id']
  );
  expect(mockDeleteConsumer).not.toHaveBeenCalled();
});

it('removes a consumer that has no other service access', async function () {
  countOtherServiceAccessesByConsumer.mockResolvedValue(0);

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
  expect(mockDeleteConsumer).toHaveBeenCalledWith('kong-1');
});
