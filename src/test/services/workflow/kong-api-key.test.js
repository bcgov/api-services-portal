import { registerApiKey } from '../../../services/workflow/kong-api-key';
import * as keystone from '../../../services/keystone';

const mockCreateKongConsumer = jest.fn();
const mockAddKeyAuthToConsumer = jest.fn();
const mockDeleteConsumer = jest.fn();

jest.mock('../../../services/keystone', () => ({
  addKongConsumer: jest.fn(),
  deleteRecord: jest.fn(),
}));

jest.mock('../../../services/kong', () => ({
  KongConsumerService: jest.fn().mockImplementation(() => ({
    createKongConsumer: mockCreateKongConsumer,
    addKeyAuthToConsumer: mockAddKeyAuthToConsumer,
    deleteConsumer: mockDeleteConsumer,
  })),
}));

const addKongConsumer = keystone.addKongConsumer;
const deleteRecord = keystone.deleteRecord;

const context = {};
const application = { id: 'app-1', name: 'test-app' };

beforeEach(() => {
  jest.clearAllMocks();
  mockCreateKongConsumer.mockResolvedValue({ id: 'kong-1' });
  mockAddKeyAuthToConsumer.mockResolvedValue({
    apiKey: 'secret',
    keyAuthPK: 'key-1',
  });
  mockDeleteConsumer.mockResolvedValue(undefined);
  addKongConsumer.mockResolvedValue('consumer-1');
  deleteRecord.mockResolvedValue(undefined);
});

it('returns the API key and consumer records after successful creation', async function () {
  await expect(
    registerApiKey(context, 'client-1', 'client-1', application)
  ).resolves.toEqual({
    apiKey: { apiKey: 'secret', keyAuthPK: 'key-1' },
    consumer: { id: 'kong-1' },
    consumerPK: 'consumer-1',
  });

  expect(deleteRecord).not.toHaveBeenCalled();
  expect(mockDeleteConsumer).not.toHaveBeenCalled();
});

it('removes the Kong consumer when key creation fails', async function () {
  mockAddKeyAuthToConsumer.mockRejectedValueOnce(new Error('key failed'));

  await expect(
    registerApiKey(context, 'client-1', 'client-1', application)
  ).rejects.toThrow('key failed');

  expect(deleteRecord).toHaveBeenCalledWith(
    context,
    'GatewayConsumer',
    { extForeignKey: 'kong-1' },
    ['id']
  );
  expect(mockDeleteConsumer).toHaveBeenCalledWith('kong-1');
});

it('removes partial resources when the Keystone consumer write fails', async function () {
  addKongConsumer.mockRejectedValueOnce(new Error('keystone failed'));

  await expect(
    registerApiKey(context, 'client-1', 'client-1', application)
  ).rejects.toThrow('keystone failed');

  expect(deleteRecord).toHaveBeenCalledWith(
    context,
    'GatewayConsumer',
    { extForeignKey: 'kong-1' },
    ['id']
  );
  expect(mockDeleteConsumer).toHaveBeenCalledWith('kong-1');
});
