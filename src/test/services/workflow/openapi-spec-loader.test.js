const mockValidateRuleset = jest.fn();
const mockBuildServiceName = jest.fn();

jest.mock('../../../services/workflow/openapi-spec-validation-service', () => ({
  OpenAPISpecValidationService: jest.fn().mockImplementation(() => ({
    validateRuleset: mockValidateRuleset,
  })),
}));

jest.mock('../../../services/batch/subsystem', () => ({
  SubsystemService: jest.fn().mockImplementation(() => ({
    findSubsystemByName: jest.fn().mockResolvedValue({
      namespace: 'ns-1',
      name: 'MY-SVC',
      organization: {
        name: 'ministry-of-citz',
        tags: 'ministry: CITZ',
      },
    }),
  })),
}));

jest.mock('../../../services/gateway-patterns/catalog', () => ({
  BuildServiceName: mockBuildServiceName,
}));

const {
  LoadOpenAPISpec,
} = require('../../../services/workflow/openapi-spec-loader');
const YAML = require('yaml');

describe('LoadOpenAPISpec', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockBuildServiceName.mockReturnValue('DEV.MIN.CITZ.TEST.v1');
  });

  it('validates the uploaded OpenAPI spec before building the Keystone record', async () => {
    mockValidateRuleset.mockResolvedValue({
      version: 'v0.3.0-test',
      ruleset: 'basic-ruleset',
    });

    const result = await LoadOpenAPISpec(
      {},
      {
        organization: 'ministry-of-citz',
        subsystem: 'MY-SVC',
        environment: 'dev',
        spec: `
openapi: 3.1.0
info:
  title: Test API
  version: 1.0.0
paths: {}
`,
      }
    );

    expect(mockValidateRuleset).toHaveBeenCalledWith(
      expect.stringContaining('openapi: 3.1.0'),
      undefined
    );
    expect(mockBuildServiceName).toHaveBeenCalled();
    expect(result.name).toBe('DEV.MIN.CITZ.TEST.v1');
    expect(result.spec).toContain('x-csbc-api-standard: v0.3.0-test');
    expect(result.spec).toContain('x-csbc-api-standard-ruleset: basic-ruleset');
  });

  it.each(['YAML', 'JSON'])(
    'ignores path metadata and preserves real operations in %s',
    async (format) => {
      mockValidateRuleset.mockResolvedValue({
        version: 'v0.3.0-test',
        ruleset: 'basic-ruleset',
      });
      const pathItem = {
        summary: 'Shared path summary',
        description: 'Path description',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        servers: [{ url: 'https://api.example.test' }],
        'x-routing': { value: true },
        get: {
          operationId: 'readItem',
          summary: 'Read an item',
          security: [{ oauth: ['items:read'] }],
        },
        post: { operationId: 'createItem', summary: 'Create an item' },
      };
      const spec = {
        openapi: '3.1.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {
          '/items/{id}': pathItem,
          '/metadata-only': { parameters: [] },
        },
        components: {
          securitySchemes: {
            oauth: {
              type: 'oauth2',
              flows: {
                authorizationCode: {
                  authorizationUrl: 'https://issuer.example/auth',
                  tokenUrl: 'https://issuer.example/token',
                  scopes: { 'items:read': 'Read items' },
                },
              },
            },
          },
        },
      };
      const result = await LoadOpenAPISpec(
        {},
        {
          organization: 'ministry-of-citz',
          subsystem: 'MY-SVC',
          environment: 'dev',
          spec: format === 'JSON' ? JSON.stringify(spec) : YAML.stringify(spec),
        }
      );
      expect(JSON.parse(result.operations)).toEqual([
        {
          operationId: 'readItem',
          method: 'GET',
          path: '/items/{id}',
          summary: 'Read an item',
          scopes: [{ name: 'items:read', description: 'Read items' }],
        },
        {
          operationId: 'createItem',
          method: 'POST',
          path: '/items/{id}',
          summary: 'Create an item',
          scopes: [],
        },
      ]);
      // The uploaded parameter definitions remain in the persisted spec.
      expect(YAML.parse(result.spec).paths['/items/{id}'].parameters).toEqual(
        pathItem.parameters
      );
    }
  );

  it('ignores callback Path Item parameters while retaining the callback operation', async () => {
    mockValidateRuleset.mockResolvedValue({
      version: 'v0.3.0-test',
      ruleset: 'basic-ruleset',
    });
    const result = await LoadOpenAPISpec(
      {},
      {
        organization: 'ministry-of-citz',
        subsystem: 'MY-SVC',
        environment: 'dev',
        spec: YAML.stringify({
          openapi: '3.1.0',
          info: { title: 'Test API', version: '1.0.0' },
          components: { securitySchemes: {} },
          paths: {
            '/items': {
              get: { operationId: 'items' },
              callback: {
                notification: {
                  '/notification': {
                    parameters: [],
                    summary: 'Callback',
                    post: { summary: 'Notify' },
                  },
                },
              },
            },
          },
        }),
      }
    );
    expect(JSON.parse(result.operations)).toEqual([
      {
        operationId: 'items',
        method: 'GET',
        path: '/items',
        summary: '',
        scopes: [],
      },
      {
        operationId: 'callback:notification',
        method: 'post',
        path: '/notification',
        summary: 'Notify',
        scopes: [],
      },
    ]);
  });

  it('keeps all eight OpenAPI 3.0/3.1 HTTP methods', async () => {
    mockValidateRuleset.mockResolvedValue({
      version: 'v0.3.0-test',
      ruleset: 'basic-ruleset',
    });
    const methods = [
      'get',
      'put',
      'post',
      'delete',
      'options',
      'head',
      'patch',
      'trace',
    ];
    const result = await LoadOpenAPISpec(
      {},
      {
        organization: 'ministry-of-citz',
        subsystem: 'MY-SVC',
        environment: 'dev',
        spec: YAML.stringify({
          openapi: '3.1.0',
          info: { title: 'Test API', version: '1.0.0' },
          components: { securitySchemes: {} },
          paths: {
            '/items': Object.fromEntries(
              methods.map((method) => [method, { operationId: method }])
            ),
          },
        }),
      }
    );
    expect(JSON.parse(result.operations).map((op) => op.method)).toEqual(
      methods.map((method) => method.toUpperCase())
    );
  });

  it('passes info.x-csbc-api-standard to the validation service', async () => {
    mockValidateRuleset.mockResolvedValue({
      version: 'v0.2.0-test',
      ruleset: 'custom-ruleset',
    });

    await LoadOpenAPISpec(
      {},
      {
        organization: 'ministry-of-citz',
        subsystem: 'MY-SVC',
        environment: 'dev',
        spec: `
openapi: 3.1.0
info:
  title: Test API
  version: 1.0.0
  x-csbc-api-standard: v0.2.0-test
paths: {}
`,
      }
    );

    expect(mockValidateRuleset).toHaveBeenCalledWith(
      expect.stringContaining('x-csbc-api-standard: v0.2.0-test'),
      'v0.2.0-test'
    );
    expect(mockBuildServiceName).toHaveBeenCalledWith(
      expect.any(Object),
      'dev',
      expect.objectContaining({
        info: expect.objectContaining({
          'x-csbc-api-standard': 'v0.2.0-test',
          'x-csbc-api-standard-ruleset': 'custom-ruleset',
        }),
      })
    );
  });

  it('persists JSON specs as YAML with validation metadata set in info', async () => {
    mockValidateRuleset.mockResolvedValue({
      version: 'v0.3.0-test',
      ruleset: 'strict-ruleset',
    });

    const result = await LoadOpenAPISpec(
      {},
      {
        organization: 'ministry-of-citz',
        subsystem: 'MY-SVC',
        environment: 'dev',
        spec: JSON.stringify({
          openapi: '3.1.0',
          info: {
            title: 'Test API',
            version: '1.0.0',
          },
          paths: {},
        }),
      }
    );

    expect(result.spec.trim()).toContain('openapi: 3.1.0');
    expect(() => JSON.parse(result.spec)).toThrow();
    const parsed = YAML.parse(result.spec);
    expect(parsed.info['x-csbc-api-standard']).toBe('v0.3.0-test');
    expect(parsed.info['x-csbc-api-standard-ruleset']).toBe('strict-ruleset');
  });

  it('rejects an environment that is not in SDX_ENVIRONMENTS before validating the spec', async () => {
    await expect(
      LoadOpenAPISpec(
        {},
        {
          organization: 'ministry-of-citz',
          subsystem: 'MY-SVC',
          environment: 'prod',
          spec: `
openapi: 3.1.0
info:
  title: Test API
  version: 1.0.0
paths: {}
`,
        }
      )
    ).rejects.toMatchObject({
      message: 'Validation Failed',
      fields: {
        environment: {
          message:
            "Environment 'prod' is not a valid SDX environment. Valid environments: dev, cyp",
        },
      },
    });

    expect(mockValidateRuleset).not.toHaveBeenCalled();
    expect(mockBuildServiceName).not.toHaveBeenCalled();
  });

  it('stops loading when info.x-csbc-api-standard is not a string', async () => {
    await expect(
      LoadOpenAPISpec(
        {},
        {
          organization: 'ministry-of-citz',
          subsystem: 'MY-SVC',
          environment: 'dev',
          spec: `
openapi: 3.1.0
info:
  title: Test API
  version: 1.0.0
  x-csbc-api-standard: 123
paths: {}
`,
        }
      )
    ).rejects.toMatchObject({
      message: 'Validation Failed',
      fields: {
        'info.x-csbc-api-standard': {
          message: 'info.x-csbc-api-standard must be a non-empty string',
        },
      },
    });

    expect(mockValidateRuleset).not.toHaveBeenCalled();
    expect(mockBuildServiceName).not.toHaveBeenCalled();
  });

  it('returns a validation error when the spec cannot be parsed as YAML or JSON', async () => {
    await expect(
      LoadOpenAPISpec(
        {},
        {
          organization: 'ministry-of-citz',
          subsystem: 'MY-SVC',
          environment: 'dev',
          spec: 'openapi: "3.1.0"\ninfo:\n  title: [',
        }
      )
    ).rejects.toMatchObject({
      message: 'Validation Failed',
      fields: {
        spec: {
          message:
            'Invalid OpenAPI specification format. Spec must be valid YAML or JSON.',
        },
      },
    });

    expect(mockValidateRuleset).not.toHaveBeenCalled();
    expect(mockBuildServiceName).not.toHaveBeenCalled();
  });

  it('stops loading the uploaded spec when validation fails', async () => {
    mockValidateRuleset.mockRejectedValue(new Error('validation failed'));

    await expect(
      LoadOpenAPISpec(
        {},
        {
          organization: 'ministry-of-citz',
          subsystem: 'MY-SVC',
          environment: 'dev',
          spec: `
openapi: 3.1.0
info:
  title: Test API
  version: 1.0.0
paths: {}
`,
        }
      )
    ).rejects.toThrow('validation failed');

    expect(mockBuildServiceName).not.toHaveBeenCalled();
  });
});
