import fetch from 'node-fetch';
import { FieldErrors, ValidateError } from 'tsoa';
import { Logger } from '../../logger';

const logger = Logger('wf.OASValidation');

const DEFAULT_RULESET = 'basic-ruleset';

export interface OpenAPISpecValidationResult {
  valid: boolean;
  version: string;
  ruleset: string;
  durationMs?: number;
  validatedAt?: string;
  summary?: {
    errors: number;
    warnings: number;
    infos: number;
    hints: number;
  };
  results?: {
    code: string;
    message: string;
    severity: 'error' | 'warn' | 'info' | 'hint';
    path: string[];
  }[];
}

export class OpenAPISpecValidationError extends ValidateError {
  constructor(public result: OpenAPISpecValidationResult) {
    super(
      validationFields('spec', formatValidationFailure(result)),
      'Validation Failed'
    );
    this.name = 'OpenAPISpecValidationError';
  }
}

export class OpenAPISpecValidationService {
  private validationApiUrl: string;
  private version?: string;
  private configuredRuleset?: string;

  constructor(
    validationApiUrl = process.env.OAS_VALIDATION_API_URL,
    version = process.env.OAS_VALIDATION_RULESET_VERSION,
    ruleset = process.env.OAS_VALIDATION_RULESET
  ) {
    if (!validationApiUrl) {
      throw new Error('OAS_VALIDATION_API_URL is required');
    }

    this.validationApiUrl = validationApiUrl.replace(/\/+$/, '');
    this.version = version;
    this.configuredRuleset = ruleset;
  }

  public async validateRuleset(
    spec: string,
    requestedVersion?: string
  ): Promise<OpenAPISpecValidationResult> {
    const result = await this.createValidation(spec, requestedVersion);

    if (!result.valid) {
      throw new OpenAPISpecValidationError(result);
    }

    return result;
  }

  private async createValidation(
    spec: string,
    requestedVersion?: string
  ): Promise<OpenAPISpecValidationResult> {
    const version = await this.getVersion(requestedVersion);
    const ruleset = await this.getRuleset(version);
    const url = `${this.validationApiUrl}/versions/${encodeURIComponent(
      version
    )}/rulesets/${encodeURIComponent(ruleset)}/validations`;

    logger.debug(
      'Validating OpenAPI spec using version %s and ruleset %s',
      version,
      ruleset
    );

    const res = await fetch(url, {
      method: 'POST',
      body: spec,
      headers: {
        'Content-Type': contentTypeForSpec(spec),
      },
    });

    if (!res.ok) {
      const body = await res.text();
      logger.error(
        'OpenAPI spec validation request failed for version %s and ruleset %s - %d %s: %s',
        version,
        ruleset,
        res.status,
        res.statusText,
        body
      );
      throw new Error(
        `OpenAPI specification validation service failed: ${res.status} ${res.statusText}`
      );
    }

    return (await res.json()) as OpenAPISpecValidationResult;
  }

  private async getVersion(requestedVersion?: string): Promise<string> {
    const supportedVersions = await this.getSupportedVersions();
    const latestVersion = supportedVersions[0];
    if (!latestVersion) {
      throw new Error(
        'OpenAPI specification validation service did not return any ruleset versions'
      );
    }

    if (this.version && !supportedVersions.includes(this.version)) {
      logger.error(
        "Configured OAS_VALIDATION_RULESET_VERSION '%s' is not supported. Falling back to latest supported version '%s'.",
        this.version,
        latestVersion
      );
      this.version = undefined;
    }

    const targetVersion = this.version || latestVersion;

    if (requestedVersion) {
      if (!supportedVersions.includes(requestedVersion)) {
        throw new ValidateError(
          validationFields(
            'info.x-csbc-api-standard',
            `OpenAPI specification declares unsupported x-csbc-api-standard '${requestedVersion}'. Update info.x-csbc-api-standard to '${targetVersion}'.`
          ),
          'Validation Failed'
        );
      }
      return requestedVersion;
    }

    this.version = targetVersion;
    return targetVersion;
  }

  private async getRuleset(version: string): Promise<string> {
    if (!this.configuredRuleset) {
      return DEFAULT_RULESET;
    }

    const supportedRulesets = await this.getSupportedRulesets(version);
    if (supportedRulesets.includes(this.configuredRuleset)) {
      return this.configuredRuleset;
    }

    logger.error(
      "Configured OAS_VALIDATION_RULESET '%s' is not available for version '%s'. Falling back to default ruleset '%s'.",
      this.configuredRuleset,
      version,
      DEFAULT_RULESET
    );
    return DEFAULT_RULESET;
  }

  private async getSupportedVersions(): Promise<string[]> {
    const res = await fetch(`${this.validationApiUrl}/versions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const body = await res.text();
      logger.error(
        'OpenAPI spec validation versions request failed - %d %s: %s',
        res.status,
        res.statusText,
        body
      );
      throw new Error(
        `OpenAPI specification validation service failed: ${res.status} ${res.statusText}`
      );
    }

    const body = (await res.json()) as { versions?: string[] };
    return body.versions || [];
  }

  private async getSupportedRulesets(version: string): Promise<string[]> {
    const res = await fetch(
      `${this.validationApiUrl}/versions/${encodeURIComponent(version)}/rulesets`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!res.ok) {
      const body = await res.text();
      logger.error(
        'OpenAPI spec validation rulesets request failed for version %s - %d %s: %s',
        version,
        res.status,
        res.statusText,
        body
      );
      throw new Error(
        `OpenAPI specification validation service failed: ${res.status} ${res.statusText}`
      );
    }

    const body = (await res.json()) as { rulesets?: string[] };
    return body.rulesets || [];
  }
}

function contentTypeForSpec(
  spec: string
): 'application/json' | 'application/yaml' {
  try {
    JSON.parse(spec);
    return 'application/json';
  } catch {
    return 'application/yaml';
  }
}

function validationFields(field: string, message: string): FieldErrors {
  return {
    [field]: {
      message,
    },
  };
}

function formatValidationFailure(result: OpenAPISpecValidationResult): string {
  const errors = result.results?.filter((r) => r.severity === 'error') || [];
  const details = errors
    .slice(0, 3)
    .map((error) => {
      const path = error.path?.length ? ` at ${error.path.join('.')}` : '';
      return `${error.code}${path}: ${error.message}`;
    })
    .join('; ');

  const errorCount = result.summary?.errors ?? errors.length;
  return [
    `OpenAPI specification failed validation with ruleset '${result.ruleset}' and ${errorCount} error(s).`,
    details,
  ]
    .filter(Boolean)
    .join(' ');
}
