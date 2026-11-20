jest.mock('node-fetch', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const fetch = require('node-fetch').default;
const { ProvisionerService } = require('../../../services/provisioner');

describe('ProvisionerService connection lifecycle events', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ applied: 1, failed: 0, results: [] }),
    });
  });

  it('sends the persisted lifecycle operation id to the provisioner', async () => {
    const provisioner = new ProvisionerService('http://provisioner/v1');

    await provisioner.postConnectionRequestChangeEvent(
      {
        id: 'connection-1',
        clientId: 'client-1',
        serviceId: 'service-1',
        policyVersion: 'SDX.R1.00',
        environment: 'dev',
        isApproved: true,
        requesterDetails: '{}',
        clientResources: '{}',
        serviceResources: '{}',
        provisionerStatus: JSON.stringify({
          status: 'pending',
          operation: 'provision',
          operationId: '88a7d896-1d5a-4a86-9af4-ac9ca80185b0',
        }),
      },
      'apply'
    );

    expect(fetch).toHaveBeenCalledWith(
      'http://provisioner/v1/connections/connection-1?action=apply',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          clientId: 'client-1',
          serviceId: 'service-1',
          policyVersion: 'SDX.R1.00',
          environment: 'dev',
          isApproved: true,
          requesterDetails: {},
          clientResources: {},
          serviceResources: {},
          operationId: '88a7d896-1d5a-4a86-9af4-ac9ca80185b0',
        }),
      })
    );
  });

  it('accepts an already parsed lifecycle status from Keystone', async () => {
    const provisioner = new ProvisionerService('http://provisioner/v1');

    await provisioner.postConnectionRequestChangeEvent(
      {
        id: 'connection-1',
        clientId: 'client-1',
        serviceId: 'service-1',
        policyVersion: 'SDX.R1.00',
        environment: 'dev',
        isApproved: true,
        requesterDetails: '{}',
        clientResources: '{}',
        serviceResources: '{}',
        provisionerStatus: {
          status: 'deprovisioning',
          operation: 'deprovision',
          operationId: 'ca5019b2-b8d1-4362-846b-276b063f94c4',
        },
      },
      'apply'
    );

    const request = fetch.mock.calls[0][1];
    expect(JSON.parse(request.body).operationId).toBe(
      'ca5019b2-b8d1-4362-846b-276b063f94c4'
    );
  });
});
