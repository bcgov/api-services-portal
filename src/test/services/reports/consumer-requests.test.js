jest.mock('../../../services/keystone', () => ({
  getAccessRequestsByNamespace: jest.fn(),
}));

import { getAccessRequestsByNamespace } from '../../../services/keystone';
import { getConsumerRequests } from '../../../services/report/data/consumer-requests';

describe('getConsumerRequests', () => {
  it('includes the requestor email', async () => {
    getAccessRequestsByNamespace.mockResolvedValue([
      {
        isComplete: true,
        isApproved: true,
        createdAt: '2026-01-01T00:00:00Z',
        requestor: {
          name: 'Jane Doe',
          username: 'jdoe@idir',
          email: 'jane.doe@gov.bc.ca',
        },
        application: { name: 'Geocoder Client', appId: 'APP1' },
        productEnvironment: {
          name: 'prod',
          appId: 'ENV1',
          flow: 'kong-api-key-only',
          product: { name: 'Geocoder' },
        },
        serviceAccess: { consumer: { username: 'CONSUMER1' } },
      },
    ]);

    const result = await getConsumerRequests({}, [{ name: 'gw-1' }]);

    expect(getAccessRequestsByNamespace).toHaveBeenCalledWith({}, 'gw-1');
    expect(result).toEqual([
      expect.objectContaining({
        namespace: 'gw-1',
        requestor: 'Jane Doe',
        requestor_email: 'jane.doe@gov.bc.ca',
        consumer_username: 'CONSUMER1',
        req_result: 'Approved',
      }),
    ]);
  });
});
