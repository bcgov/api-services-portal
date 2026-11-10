const {
  httpStatusForIssuerMisconfig,
  clientMessageForIssuerMisconfig,
  issuerMisconfigFromHttpError,
  IssuerMisconfigError,
} = require('../../services/issuerMisconfigError');

describe('issuer misconfig error mapping', () => {
  it('passes 4xx through and maps other statuses to 500', () => {
    expect(
      httpStatusForIssuerMisconfig({
        reason: 'Bad request',
        description: 'Query action=delete removes the entire key qualifier',
        status: '400 Bad Request',
        statusCode: 400,
      })
    ).toBe(400);
    expect(
      httpStatusForIssuerMisconfig({
        reason: 'Unprocessable entity',
        description: 'last key',
        status: '422 Unprocessable Entity',
        statusCode: 422,
      })
    ).toBe(422);
    expect(
      httpStatusForIssuerMisconfig({
        reason: 'Internal server error',
        description: '',
        status: '500 Internal Server Error',
        statusCode: 500,
      })
    ).toBe(500);
    expect(
      httpStatusForIssuerMisconfig({
        reason: 'unknown',
        description: '',
        status: '',
        statusCode: undefined,
      })
    ).toBe(500);
  });

  it('prefers RFC 7807 detail for the client message', () => {
    const detail = issuerMisconfigFromHttpError(
      400,
      'Bad Request',
      JSON.stringify({
        title: 'Bad request',
        status: 400,
        detail:
          'Query action=delete removes the entire key qualifier. For targeted deletion, use action=apply with operation=delete.',
      })
    );
    expect(detail.statusCode).toBe(400);
    expect(detail.reason).toBe('Bad request');
    expect(detail.description).toMatch(/targeted deletion/);
    expect(clientMessageForIssuerMisconfig(detail)).toBe(
      '[400] Query action=delete removes the entire key qualifier. For targeted deletion, use action=apply with operation=delete.'
    );
  });

  it('keeps the upstream gwa-api error and request id from a provisioner 502', () => {
    const detail = issuerMisconfigFromHttpError(
      502,
      'Bad Gateway',
      JSON.stringify({
        title: 'Bad gateway',
        status: 502,
        code: 'BAD_GATEWAY',
        requestId: 'req-42',
        details: {
          environment: 'test',
          status: 400,
          details: { error: 'Sync Failed.' },
        },
      })
    );
    expect(detail.statusCode).toBe(502);
    expect(detail.requestId).toBe('req-42');
    expect(detail.description).toMatch(/Sync Failed/);
    expect(JSON.parse(new IssuerMisconfigError(detail).message).requestId).toBe(
      'req-42'
    );
  });

  it('parses last-key 422 from the provisioner', () => {
    const detail = issuerMisconfigFromHttpError(
      422,
      'Unprocessable Entity',
      JSON.stringify({
        title: 'Unprocessable entity',
        status: 422,
        detail:
          'Deleting the last key requires query action=delete to remove the entire key qualifier',
      })
    );
    expect(httpStatusForIssuerMisconfig(detail)).toBe(422);
    expect(clientMessageForIssuerMisconfig(detail)).toMatch(/last key/);
  });
});
