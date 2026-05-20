import { OpenAPISpec } from '@/controllers/v3/types';
import { Logger } from '../../logger';
import YAML from 'yaml';
import { Subsystem } from '../keystone/types';
import { SubsystemService } from '../batch/subsystem';
import { BuildServiceName } from '../gateway-patterns/catalog';

const logger = Logger('wf.OASLoader');

export interface OpenAPISpecInput {
  organization: string;
  subsystem: string;
  spec: string;
  state?: string;
}

export const LoadOpenAPISpec = async (
  context: any,
  spec: OpenAPISpecInput
): Promise<OpenAPISpec> => {
  // KeystoneJS entity
  const outSpec: OpenAPISpec = {};

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
      throw new Error(
        `Invalid OpenAPI specification format. Spec must be valid YAML or JSON.`
      );
    }
  }

  const serviceName = BuildServiceName(subsystemRecord, oas);

  outSpec.spec = spec.spec;
  outSpec.name = serviceName;
  (outSpec as any).namespace = subsystemRecord.namespace;
  outSpec.organization = spec.organization;
  outSpec.subsystem = spec.subsystem;
  outSpec.title = oas.info?.title;
  outSpec.summary = oas.info?.summary;
  outSpec.version = oas.info?.version;
  outSpec.description = oas.info?.description;
  outSpec.ref = outSpec.name;
  outSpec.operations = JSON.stringify(parseSpecOperations(oas));

  return outSpec;
};

function parseSpecOperations(spec: any) {
  const operations =
    spec?.paths &&
    Object.keys(spec.paths).map((path) => {
      return Object.keys(spec.paths[path]).map((method) => {
        const op = spec.paths[path][method];
        return {
          operationId: op.operationId,
          method: method.toUpperCase(),
          path,
          summary: op.summary || '',
          scopes:
            op.security && op.security[0] && op.security[0]['bearer_auth']
              ? op.security[0]['bearer_auth']
              : [],
        };
      });
    });

  const flattenedOperations: {
    operationId: string;
    summary: string;
    method: string;
    path: string;
    scopes?: string[];
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
