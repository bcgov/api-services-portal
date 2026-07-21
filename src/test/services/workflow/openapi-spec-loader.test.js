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
    mockBuildServiceName.mockReturnValue('LAB.MIN.CITZ.TEST.v1');
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
        environment: 'LAB',
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
    expect(result.name).toBe('LAB.MIN.CITZ.TEST.v1');
    expect(result.spec).toContain('x-csbc-api-standard: v0.3.0-test');
    expect(result.spec).toContain(
      'x-csbc-api-standard-ruleset: basic-ruleset'
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
        environment: 'LAB',
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
      'LAB',
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
        environment: 'LAB',
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

  it('stops loading when info.x-csbc-api-standard is not a string', async () => {
    await expect(
      LoadOpenAPISpec(
        {},
        {
          organization: 'ministry-of-citz',
          subsystem: 'MY-SVC',
          environment: 'LAB',
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
          environment: 'LAB',
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
          environment: 'LAB',
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
