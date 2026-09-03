const {
  httpStatusForIssuerMisconfig,
  clientMessageForIssuerMisconfig,
  issuerMisconfigFromHttpError,
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
