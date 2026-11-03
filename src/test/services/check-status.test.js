const { checkStatus } = require('../../services/checkStatus');

const errorResponse = (body) => ({
  ok: false,
  status: 400,
  statusText: 'Bad Request',
  text: async () => body,
});

const thrownBy = async (res) => {
  try {
    await checkStatus(res);
  } catch (e) {
    return e;
  }
};

describe('checkStatus', () => {
  it('returns a successful response', async () => {
    const res = { ok: true };

    await expect(checkStatus(res)).resolves.toBe(res);
  });

  it('keeps the gwa-api error id as the request id', async () => {
    const error = await thrownBy(
      errorResponse(
        JSON.stringify({
          error: 'Data Plane Not Configured',
          error_description: "Data plane 'sdx-edge' is not configured",
          error_id: 'err-123',
        })
      )
    );

    expect(error.errors[0]).toEqual({
      reason: 'Data Plane Not Configured',
      description: "Data plane 'sdx-edge' is not configured",
      status: '400 Bad Request',
      statusCode: 400,
      requestId: 'err-123',
    });
  });

  it('leaves the request id out when gwa-api sends none', async () => {
    const error = await thrownBy(
      errorResponse(JSON.stringify({ error: 'Unexpected Error' }))
    );

    expect(error.errors[0]).not.toHaveProperty('requestId');
  });
});
