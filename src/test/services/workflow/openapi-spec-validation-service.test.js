const fetch = require('node-fetch');
const {
  OpenAPISpecValidationError,
  OpenAPISpecValidationServiceUnavailableError,
  OpenAPISpecValidationService,
} = require('../../../services/workflow/openapi-spec-validation-service');

jest.mock('node-fetch');

describe('OpenAPISpecValidationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NODE_ENV = 'test';
    delete process.env.OAS_VALIDATION_API_URL;
    delete process.env.OAS_VALIDATION_RULESET_VERSION;
    delete process.env.OAS_VALIDATION_RULESET;
  });

  it('submits the uploaded spec to the configured ruleset validation endpoint', async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          versions: ['v-test', 'v0.2.0-test'],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          rulesets: ['basic-ruleset', 'strict-ruleset'],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          valid: true,
          version: 'v-test',
          ruleset: 'basic-ruleset',
          summary: { errors: 0, warnings: 0, infos: 0, hints: 0 },
          results: [],
        }),
      });

    const service = new OpenAPISpecValidationService(
      'http://validation.local/',
      'v-test',
      'basic-ruleset'
    );

    const result = await service.validateRuleset('{"openapi":"3.1.0"}');

    expect(result.version).toBe('v-test');
    expect(fetch).toHaveBeenNthCalledWith(
      3,
      'http://validation.local/versions/v-test/rulesets/basic-ruleset/validations',
      expect.objectContaining({
        method: 'POST',
        body: '{"openapi":"3.1.0"}',
        headers: {
          'Content-Type': 'application/json',
        },
      })
    );
  });

  it('defaults to the latest version returned by the versions endpoint', async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          versions: ['v0.3.0-test', 'v0.2.0-test', 'v0.1.0-test'],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          valid: true,
          version: 'v0.3.0-test',
          ruleset: 'basic-ruleset',
          summary: { errors: 0, warnings: 0, infos: 0, hints: 0 },
          results: [],
        }),
      });

    const service = new OpenAPISpecValidationService(
      'http://validation.local/',
      undefined
    );

    const result = await service.validateRuleset('{"openapi":"3.1.0"}');

    expect(result.version).toBe('v0.3.0-test');
    expect(fetch).toHaveBeenNthCalledWith(
      1,
      'http://validation.local/versions',
      expect.objectContaining({
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
    );
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      'http://validation.local/versions/v0.3.0-test/rulesets/basic-ruleset/validations',
      expect.objectContaining({
        method: 'POST',
      })
    );
  });

  it('falls back to the default ruleset when the configured ruleset is unavailable', async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          versions: ['v0.3.0-test', 'v0.2.0-test'],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          rulesets: ['basic-ruleset'],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          valid: true,
          version: 'v0.3.0-test',
          ruleset: 'basic-ruleset',
          summary: { errors: 0, warnings: 0, infos: 0, hints: 0 },
          results: [],
        }),
      });

    const service = new OpenAPISpecValidationService(
      'http://validation.local/',
      undefined,
      'strict-ruleset'
    );

    await service.validateRuleset('{"openapi":"3.1.0"}');

    expect(fetch).toHaveBeenNthCalledWith(
      2,
      'http://validation.local/versions/v0.3.0-test/rulesets',
      expect.objectContaining({
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
    );
    expect(fetch).toHaveBeenNthCalledWith(
      3,
      'http://validation.local/versions/v0.3.0-test/rulesets/basic-ruleset/validations',
      expect.objectContaining({
        method: 'POST',
      })
    );
  });

  it('uses the declared x-csbc-api-standard version when it is supported', async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          versions: ['v0.3.0-test', 'v0.2.0-test', 'v0.1.0-test'],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          valid: true,
          version: 'v0.2.0-test',
          ruleset: 'basic-ruleset',
          summary: { errors: 0, warnings: 0, infos: 0, hints: 0 },
          results: [],
        }),
      });

    const service = new OpenAPISpecValidationService(
      'http://validation.local/',
      undefined
    );

    await service.validateRuleset(
      '{"openapi":"3.1.0"}',
      'v0.2.0-test'
    );

    expect(fetch).toHaveBeenNthCalledWith(
      2,
      'http://validation.local/versions/v0.2.0-test/rulesets/basic-ruleset/validations',
      expect.objectContaining({
        method: 'POST',
      })
    );
  });

  it('throws when the declared x-csbc-api-standard version is unsupported', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        versions: ['v0.3.0-test', 'v0.2.0-test'],
      }),
    });

    const service = new OpenAPISpecValidationService(
      'http://validation.local/',
      undefined
    );

    await expect(
      service.validateRuleset('{"openapi":"3.1.0"}', 'v0.1.0-test')
    ).rejects.toMatchObject({
      message: 'Validation Failed',
      fields: {
        'info.x-csbc-api-standard': {
          message:
            "OpenAPI specification declares unsupported x-csbc-api-standard 'v0.1.0-test'. Update info.x-csbc-api-standard to 'v0.3.0-test'.",
        },
      },
    });
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('suggests the pinned version for an unsupported declared standard', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        versions: ['v0.3.0-test', 'v0.2.0-test'],
      }),
    });

    const service = new OpenAPISpecValidationService(
      'http://validation.local/',
      'v0.2.0-test'
    );

    await expect(
      service.validateRuleset('{"openapi":"3.1.0"}', 'v0.1.0-test')
    ).rejects.toMatchObject({
      fields: {
        'info.x-csbc-api-standard': {
          message:
            "OpenAPI specification declares unsupported x-csbc-api-standard 'v0.1.0-test'. Update info.x-csbc-api-standard to 'v0.2.0-test'.",
        },
      },
    });
  });

  it('falls back to latest when the pinned version is unsupported', async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          versions: ['v0.3.0-test', 'v0.2.0-test'],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          valid: true,
          version: 'v0.3.0-test',
          ruleset: 'basic-ruleset',
          summary: { errors: 0, warnings: 0, infos: 0, hints: 0 },
          results: [],
        }),
      });

    const service = new OpenAPISpecValidationService(
      'http://validation.local/',
      'v0.1.0-test'
    );

    await service.validateRuleset('{"openapi":"3.1.0"}');

    expect(fetch).toHaveBeenNthCalledWith(
      2,
      'http://validation.local/versions/v0.3.0-test/rulesets/basic-ruleset/validations',
      expect.objectContaining({
        method: 'POST',
      })
    );
  });

  it('throws a validation error when the selected ruleset finds errors', async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          versions: ['v-test', 'v0.2.0-test'],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          valid: false,
          version: 'v-test',
          ruleset: 'basic-ruleset',
          summary: { errors: 1, warnings: 0, infos: 0, hints: 0 },
          results: [
            {
              code: 'operation-id-required',
              message: 'operationId is required',
              severity: 'error',
              path: ['paths', '/users', 'get'],
            },
          ],
        }),
      });

    const service = new OpenAPISpecValidationService(
      'http://validation.local',
      'v-test'
    );

    let error;
    try {
      await service.validateRuleset('openapi: 3.1.0');
    } catch (err) {
      error = err;
    }

    expect(error).toMatchObject({
      message: 'Validation Failed',
      fields: {
        spec: expect.any(Object),
      },
    });
    expect(error.fields.spec.message).toContain(
      "OpenAPI specification failed validation with ruleset 'basic-ruleset' and 1 error(s)."
    );
    expect(error.result.results).toEqual([
      {
        code: 'operation-id-required',
        message: 'operationId is required',
        severity: 'error',
        path: ['paths', '/users', 'get'],
      },
    ]);
    expect(fetch).toHaveBeenCalledTimes(2);

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: {
          'Content-Type': 'application/yaml',
        },
      })
    );
  });

  it('throws a service unavailable error when the validation service request fails', async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      text: async () => '{"error":"not_found"}',
    });

    const service = new OpenAPISpecValidationService(
      'http://validation.local',
      'missing-version'
    );

    await expect(service.validateRuleset('{}')).rejects.toMatchObject({
      name: 'OpenAPISpecValidationServiceUnavailableError',
      message: 'OAS validation service unavailable: 404 Not Found',
    });
  });

  it('throws a service unavailable error when the selected default ruleset is not found by the validation service', async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          versions: ['v-test'],
        }),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: async () => '{"error":"ruleset_not_found"}',
      });

    const service = new OpenAPISpecValidationService(
      'http://validation.local',
      'v-test'
    );

    await expect(service.validateRuleset('{}')).rejects.toMatchObject({
      name: 'OpenAPISpecValidationServiceUnavailableError',
      message: 'OAS validation service unavailable: 404 Not Found',
    });
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      'http://validation.local/versions/v-test/rulesets/basic-ruleset/validations',
      expect.objectContaining({
        method: 'POST',
      })
    );
  });

  it('throws a service unavailable error when the request times out', async () => {
    fetch.mockRejectedValue({
      name: 'AbortError',
    });

    const service = new OpenAPISpecValidationService(
      'http://validation.local',
      undefined,
      undefined,
      1
    );

    const promise = service.validateRuleset('{}');

    await expect(promise).rejects.toBeInstanceOf(
      OpenAPISpecValidationServiceUnavailableError
    );
    await expect(promise).rejects.toMatchObject({
      message: 'OAS validation service unavailable: request timed out',
    });
  });

  it('throws when no versions are available for the default version lookup', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        versions: [],
      }),
    });

    const service = new OpenAPISpecValidationService(
      'http://validation.local',
      undefined
    );

    await expect(service.validateRuleset('{}')).rejects.toMatchObject({
      name: 'OpenAPISpecValidationServiceUnavailableError',
      message:
        'OpenAPI specification validation service did not return any ruleset versions',
    });
  });

  it('requires the validation service URL', () => {
    expect(() => new OpenAPISpecValidationService()).toThrow(
      'OAS_VALIDATION_API_URL is required'
    );
  });
});
