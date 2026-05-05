import { OpenAPISpec } from '@/controllers/v3/types';
import { Logger } from '../../logger';
import YAML from 'yaml';
import { Subsystem } from '../keystone/types';
import { SubsystemService } from '../batch/subsystem';
import { BuildServiceName } from '../gateway-patterns/catalog';
import { strict as assert } from 'assert';

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

  const oas = YAML.parse(spec.spec);

  const serviceName = BuildServiceName(subsystemRecord, oas);

  assert.strictEqual(
    Boolean(oas.openapi) || Boolean(oas.asyncapi),
    true,
    'Invalid OpenAPI specification: must contain either openapi or asyncapi field'
  );

  outSpec.specVersion =
    'openapi' in oas ? `openapi=${oas.openapi}` : `asyncapi=${oas.asyncapi}`;
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
  outSpec.operations = JSON.stringify(
    outSpec.specVersion?.startsWith('openapi')
      ? parseOpenapiSpecOperations(oas)
      : parseAsyncapiSpecOperations(oas)
  );

  return outSpec;
};

function parseAsyncapiSpecOperations(spec: any) {
  const flattenedOperations: {
    operationId: string;
    summary: string;
    method: string;
    path?: string;
    scopes?: string[];
  }[] = [];

  const majorVersion = parseInt(spec?.asyncapi?.split('.')?.[0] ?? '2', 10);

  assert.strictEqual(
    majorVersion >= 3,
    true,
    'Unsupported AsyncAPI version: only versions 3.x and above are supported'
  );

  // AsyncAPI 3.x: operations are a top-level object; channels have an address field
  if (!spec?.operations) {
    return flattenedOperations;
  }

  Object.entries(spec.operations).forEach(
    ([operationId, operation]: [string, any]) => {
      const channelRef: string | undefined = operation.channel?.['$ref'];
      let channelAddress: string | undefined;
      if (channelRef) {
        const channelId = channelRef.replace('#/channels/', '');
        channelAddress = spec.channels?.[channelId]?.address ?? channelId;
      }

      flattenedOperations.push({
        method: operation.action === 'send' ? 'SEND' : 'RECEIVE',
        path: channelAddress,
        operationId,
        summary: operation.summary || '',
        scopes: operation.security?.[0]?.['bearer_auth'] || [],
      });
    }
  );

  return flattenedOperations;
}

function parseOpenapiSpecOperations(spec: any) {
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
