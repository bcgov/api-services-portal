require('reflect-metadata');

jest.mock('../controllers/ioc/registry', () => ({
  Register: jest.fn(),
}));

const { ApiOpenapiApp } = require('../api-openapi');

describe('ApiOpenapiApp', () => {
  const originalValidationApiUrl = process.env.OAS_VALIDATION_API_URL;
  const originalSdxUiUrl = process.env.SDX_UI_URL;

  afterEach(() => {
    process.env.OAS_VALIDATION_API_URL = originalValidationApiUrl;
    process.env.SDX_UI_URL = originalSdxUiUrl;
  });

  it('does not require OAS_VALIDATION_API_URL during construction', () => {
    delete process.env.OAS_VALIDATION_API_URL;

    expect(() => new ApiOpenapiApp()).not.toThrow();
  });

  it('requires OAS_VALIDATION_API_URL when preparing middleware', () => {
    delete process.env.OAS_VALIDATION_API_URL;

    expect(() => new ApiOpenapiApp().prepareMiddleware({})).toThrow(
      'OAS_VALIDATION_API_URL is required'
    );
  });

  it('requires OAS_VALIDATION_API_URL to be an absolute http(s) URL', () => {
    process.env.OAS_VALIDATION_API_URL = 'validation.local';

    expect(() => new ApiOpenapiApp().prepareMiddleware({})).toThrow(
      'OAS_VALIDATION_API_URL must be an absolute http(s) URL'
    );
  });

  it('accepts an absolute http(s) OAS_VALIDATION_API_URL', () => {
    process.env.OAS_VALIDATION_API_URL = 'https://validation.local';

    expect(() => new ApiOpenapiApp()).not.toThrow();
  });

  it('requires SDX_UI_URL when preparing middleware', () => {
    delete process.env.SDX_UI_URL;

    expect(() => new ApiOpenapiApp().prepareMiddleware({})).toThrow(
      'SDX_UI_URL is required'
    );
  });

  it('requires SDX_UI_URL to be an absolute http(s) URL', () => {
    process.env.SDX_UI_URL = 'sdx.local';

    expect(() => new ApiOpenapiApp().prepareMiddleware({})).toThrow(
      'SDX_UI_URL must be an absolute http(s) URL'
    );
  });
});
