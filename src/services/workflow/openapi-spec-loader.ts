import { OpenAPISpec } from '@/controllers/v3/types';
import { Logger } from '../../logger';
import YAML from 'yaml';
import { ValidateError } from '@tsoa/runtime';
import { Subsystem } from '../keystone/types';
import { SubsystemService } from '../batch/subsystem';
import { BuildServiceName } from '../gateway-patterns/catalog';
import { OpenAPISpecValidationService } from './openapi-spec-validation-service';
import { assertSdxEnvironment } from './sdx-environments';

const logger = Logger('wf.OASLoader');

export interface OpenAPISpecInput {
  organization: string;
  subsystem: string;
  environment: string;
  spec: string;
  state?: string;
  upstreamUrl?: string;
}

export interface SpecOperations {
  operationId: string;
  summary: string;
  method: string;
  path: string;
  scopes?: ResourceScope[];
}

export interface ResourceScope {
  name: string;
  description?: string;
}

export const LoadOpenAPISpec = async (
  context: any,
  spec: OpenAPISpecInput
): Promise<OpenAPISpec> => {
  // KeystoneJS entity
  const outSpec: OpenAPISpec = {};

  // Reject unknown environments
  assertSdxEnvironment(spec.environment);

  const subsystemRecord: Subsystem =
    await new SubsystemService().findSubsystemByName(
      context,
      spec.organization,
      spec.subsystem
    );

  let oas;

  // try parsing YAML, if it fails, try parsing as JSON
  try {
    oas = YAML.parse(spec.spec);
  } catch (yamlError) {
    logger.warn(
      `Failed to parse spec as YAML for subsystem ${spec.subsystem} in organization ${spec.organization}. Attempting to parse as JSON. Error: ${yamlError}`
    );
    try {
      oas = JSON.parse(spec.spec);
    } catch (jsonError) {
      logger.error(
        `Failed to parse spec as JSON for subsystem ${spec.subsystem} in organization ${spec.organization}. Error: ${jsonError}`
      );
      throw new ValidateError(
        {
          spec: {
            message:
              'Invalid OpenAPI specification format. Spec must be valid YAML or JSON.',
          },
        },
        'Validation Failed'
      );
    }
  }

  const validationResult =
    await new OpenAPISpecValidationService().validateRuleset(
      spec.spec,
      getCSBCApiStandard(oas)
    );
  oas.info['x-csbc-api-standard'] = validationResult.version;
  oas.info['x-csbc-api-standard-ruleset'] = validationResult.ruleset;

  const serviceName = BuildServiceName(subsystemRecord, spec.environment, oas);

  const persistedSpec = YAML.stringify(oas);

  outSpec.spec = persistedSpec;
  outSpec.name = serviceName;
  (outSpec as any).namespace = subsystemRecord.namespace;
  outSpec.organization = spec.organization;
  outSpec.subsystem = spec.subsystem;
  outSpec.environment = spec.environment;
  outSpec.title = oas.info?.title;
  outSpec.summary = oas.info?.summary;
  outSpec.specVersion =
    'openapi' in oas ? `openapi=${oas.openapi}` : `asyncapi=${oas.asyncapi}`;
  outSpec.version = oas.info?.version;
  outSpec.description = oas.info?.description;
  outSpec.ref = outSpec.name;
  if (spec.upstreamUrl !== undefined) {
    outSpec.upstreamUrl = spec.upstreamUrl;
  }
  outSpec.operations = JSON.stringify(parseSpecOperations(oas));

  return outSpec;
};

function getCSBCApiStandard(oas: any): string | undefined {
  const apiStandard = oas.info?.['x-csbc-api-standard'];
  if (apiStandard === undefined) {
    return undefined;
  }
  if (typeof apiStandard !== 'string' || apiStandard.trim().length === 0) {
    throw new ValidateError(
      {
        'info.x-csbc-api-standard': {
          message: 'info.x-csbc-api-standard must be a non-empty string',
        },
      },
      'Validation Failed'
    );
  }
  return apiStandard;
}

// OpenAPI 3.0/3.1 Path Items also contain parameters, servers, $ref and
// specification extensions. Only HTTP operation fields become catalog methods.
const OPENAPI_HTTP_METHODS = new Set([
  'get',
  'put',
  'post',
  'delete',
  'options',
  'head',
  'patch',
  'trace',
]);

function parseSpecOperations(spec: any) {
  const operations =
    spec?.paths &&
    Object.keys(spec.paths).map((path) => {
      const pathItem = spec.paths[path];

      // include all the standard operations
      const stdOperations = Object.keys(pathItem)
        .filter((method) => OPENAPI_HTTP_METHODS.has(method))
        .map((method) => {
          const op = pathItem[method];
          return {
            operationId: op.operationId,
            method: method.toUpperCase(),
            path,
            summary: op.summary || '',
            // An operation's own security, even an empty array, replaces the
            // document's security.
            scopes: parseScopes(
              spec.components?.securitySchemes,
              op.security !== undefined ? op.security : spec.security
            ),
          };
        });

      // Callback definitions remain in the stored spec; they are not catalog operations.
      return [...stdOperations];
    });

  const flattenedOperations: {
    operationId: string;
    summary: string;
    method: string;
    path: string;
    scopes?: ResourceScope[];
  }[] = [];
  if (operations) {
    for (const opList of operations) {
      for (const op of opList) {
        flattenedOperations.push(op);
      }
    }
  }
  return flattenedOperations;
}

// OAuth2 flows in the order their scopes are read. authorizationCode comes
// first so a scope declared in several flows keeps its authorizationCode
// description, as it did when only that flow was read.
const OAUTH2_FLOWS = [
  'authorizationCode',
  'clientCredentials',
  'implicit',
  'password',
];

/**
 * Returns the scopes an operation requires, from every oauth2 security scheme
 * named in any of its security requirements and every flow in those schemes.
 * Only scopes the operation requires are returned, each once, in a stable
 * order: authorizationCode scopes first, then the other flows in
 * OAUTH2_FLOWS order; within a flow, schemes in the order the requirements
 * name them and scopes in the order the scheme declares them.
 */
function parseScopes(schemes: any, security: any): ResourceScope[] {
  if (!Array.isArray(security)) {
    return [];
  }

  // scheme name -> scopes the operation requires from that scheme
  const required = new Map<string, Set<string>>();
  for (const requirement of security) {
    for (const [schemeName, scopeNames] of Object.entries(requirement || {})) {
      if (schemes?.[schemeName]?.type !== 'oauth2') {
        continue;
      }
      const names = required.get(schemeName) || new Set<string>();
      for (const name of Array.isArray(scopeNames) ? scopeNames : []) {
        names.add(name);
      }
      required.set(schemeName, names);
    }
  }

  const found = new Map<string, ResourceScope>();
  for (const flowName of OAUTH2_FLOWS) {
    for (const [schemeName, requiredNames] of required) {
      const declared = declaredScopes(
        schemes[schemeName].flows?.[flowName]?.scopes
      );
      for (const scope of declared) {
        if (requiredNames.has(scope.name) && !found.has(scope.name)) {
          found.set(scope.name, scope);
        }
      }
    }
  }
  return [...found.values()];
}

function declaredScopes(scopes: any): ResourceScope[] {
  if (Array.isArray(scopes)) {
    return scopes.map((s) => ({ name: s }));
  } else if (scopes && typeof scopes === 'object') {
    return Object.keys(scopes).map((s) => ({
      name: s,
      description: scopes[s],
    }));
  }
  return [];
}
