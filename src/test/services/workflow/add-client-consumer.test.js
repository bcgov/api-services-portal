import { AddClientConsumer } from '../../../services/workflow/add-client-consumer';
import * as keystone from '../../../services/keystone';

const mockForceSync = jest.fn();

jest.mock('../../../services/keystone', () => ({
  addKongConsumer: jest.fn(),
  deleteRecord: jest.fn(),
}));

jest.mock('../../../services/feeder', () => ({
  FeederService: jest.fn().mockImplementation(() => ({
    forceSync: mockForceSync,
  })),
}));

const addKongConsumer = keystone.addKongConsumer;
const deleteRecord = keystone.deleteRecord;

const context = {};

beforeEach(() => {
  jest.clearAllMocks();
  addKongConsumer.mockResolvedValue('consumer-1');
  deleteRecord.mockResolvedValue(undefined);
  mockForceSync.mockResolvedValue(undefined);
});

it('returns the Keystone consumer after the feeder sync succeeds', async function () {
  await expect(
    AddClientConsumer(context, 'client-1', 'client-1', 'kong-1')
  ).resolves.toBe('consumer-1');

  expect(deleteRecord).not.toHaveBeenCalled();
});

it('removes the Keystone consumer when the feeder sync fails', async function () {
  mockForceSync.mockRejectedValueOnce(new Error('sync failed'));

  await expect(
    AddClientConsumer(context, 'client-1', 'client-1', 'kong-1')
  ).rejects.toThrow('sync failed');

  expect(deleteRecord).toHaveBeenCalledWith(
    context,
    'GatewayConsumer',
    { id: 'consumer-1' },
    ['id']
  );
});

it('looks up a partial consumer by Kong ID when creation rejects', async function () {
  addKongConsumer.mockRejectedValueOnce(new Error('keystone failed'));

  await expect(
    AddClientConsumer(context, 'client-1', 'client-1', 'kong-1')
  ).rejects.toThrow('keystone failed');

  expect(deleteRecord).toHaveBeenCalledWith(
    context,
    'GatewayConsumer',
    { extForeignKey: 'kong-1' },
    ['id']
  );
});
