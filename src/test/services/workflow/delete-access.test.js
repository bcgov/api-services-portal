import {
  AfterDeleteAccess,
  DeleteAccess,
} from '../../../services/workflow/delete-access';
import * as keystone from '../../../services/keystone';
import { KongConsumerService } from '../../../services/kong';
import { StructuredActivityService } from '../../../services/workflow/namespace-activity';

const mockDeleteConsumer = jest.fn();
const mockLogDeleteAccess = jest.fn();

jest.mock('../../../services/keystone', () => ({
  deleteRecord: jest.fn(),
  deleteRecords: jest.fn(),
  lookupCredentialReferenceByServiceAccess: jest.fn(),
  lookupCredentialIssuerById: jest.fn(),
  lookupEnvironmentAndIssuerById: jest.fn(),
  lookupConsumerUsername: jest.fn(),
}));

jest.mock('../../../services/kong', () => ({
  KongConsumerService: jest.fn().mockImplementation(() => ({
    deleteConsumer: mockDeleteConsumer,
  })),
}));

jest.mock('../../../services/keycloak', () => ({}));
jest.mock('../../../services/uma2', () => ({}));
jest.mock('../../../services/workflow/namespace-activity', () => ({
  StructuredActivityService: jest.fn().mockImplementation(() => ({
    logDeleteAccess: mockLogDeleteAccess,
  })),
}));

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

describe('AfterDeleteAccess', function () {
  const environment = {
    id: 'env-1',
    name: 'test',
    product: { name: 'Product', namespace: 'provider-gw' },
  };

  beforeEach(() => {
    keystone.lookupEnvironmentAndIssuerById.mockResolvedValue(environment);
  });

  it('records an SDX revoke against the provider namespace and consumer', async function () {
    keystone.lookupConsumerUsername.mockResolvedValue('integration-client');

    await AfterDeleteAccess(context, {
      name: 'conn-1:TEST.SERVICE.v1',
      active: true,
      consumer: 'consumer-1',
      productEnvironment: 'env-1',
    });

    expect(keystone.lookupConsumerUsername).toHaveBeenCalledWith(
      context,
      'consumer-1'
    );
    expect(StructuredActivityService).toHaveBeenCalledWith(
      context,
      'provider-gw'
    );
    expect(mockLogDeleteAccess).toHaveBeenCalledWith(true, {
      product: environment.product,
      environment,
      consumerUsername: 'integration-client',
    });
  });

  it('falls back to the ServiceAccess name once the consumer is gone', async function () {
    keystone.lookupConsumerUsername.mockResolvedValue(undefined);

    await AfterDeleteAccess(context, {
      name: 'client-1',
      active: true,
      consumer: 'consumer-1',
      productEnvironment: 'env-1',
    });

    expect(mockLogDeleteAccess.mock.calls[0][1].consumerUsername).toBe(
      'client-1'
    );
  });

  it('records a namespace service account against its own namespace', async function () {
    keystone.lookupConsumerUsername.mockResolvedValue(undefined);

    await AfterDeleteAccess(context, {
      name: 'sa-gw-1',
      namespace: 'gw-1',
      active: true,
      consumer: 'consumer-1',
      productEnvironment: 'env-1',
    });

    expect(StructuredActivityService).toHaveBeenCalledWith(context, 'gw-1');
  });
});
