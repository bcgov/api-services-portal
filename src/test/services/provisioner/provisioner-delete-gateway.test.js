jest.mock('node-fetch', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const fetch = require('node-fetch').default;
const { ProvisionerService } = require('../../../services/provisioner');

describe('ProvisionerService.deleteGateway', () => {
  const provisioner = new ProvisionerService('http://provisioner/v1');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deletes the gateway by its encoded id, without a content type', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ gatewayId: 'sdx-gw/abc', result: 'deleted' }),
    });

    await expect(provisioner.deleteGateway('sdx-gw/abc')).resolves.toEqual({
      gatewayId: 'sdx-gw/abc',
      result: 'deleted',
    });

    expect(fetch).toHaveBeenCalledWith(
      'http://provisioner/v1/gateways/sdx-gw%2Fabc',
      { method: 'DELETE' }
    );
  });

  it('throws the provisioner problem when the delete is refused', async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 409,
      statusText: 'Conflict',
      text: async () =>
        JSON.stringify({
          title: 'Conflict',
          detail: 'Gateway sdx-gw-abc12 still has 2 configured resources',
          requestId: 'req-1',
        }),
    });

    let error;
    try {
      await provisioner.deleteGateway('sdx-gw-abc12');
    } catch (e) {
      error = e;
    }

    expect(error?.name).toBe('IssuerMisconfigError');
    expect(error.errors[0]).toEqual({
      reason: 'Conflict',
      description: 'Gateway sdx-gw-abc12 still has 2 configured resources',
      status: '409 Conflict',
      statusCode: 409,
      requestId: 'req-1',
    });
  });
});
