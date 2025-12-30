import { OpenAPISpec } from '@/controllers/v3/types';
import { Logger } from '../../logger';
import { ValidateError } from 'tsoa';
import YAML from 'yaml';
import { getRecord, getRecordById, getRecords } from '../../batch/feed-worker';
import { Subsystem } from '../keystone/types';
import { IServiceOperation } from '../gateway-patterns/catalog';
import { SubsystemService } from '../batch/subsystem';

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
  const outSpec: OpenAPISpec = {};

  const subsystemRecord: Subsystem = await new SubsystemService().findSubsystemByName(
    context,
    spec.organization,
    spec.subsystem
  );

  const oas = YAML.parse(spec.spec);

  outSpec.spec = spec.spec;
  (outSpec as any).namespace = subsystemRecord.namespace;
  outSpec.organization = spec.organization;
  outSpec.subsystem = spec.subsystem;
  outSpec.state = spec.state;
  outSpec.title = oas.info?.title;
  outSpec.summary = oas.info?.summary;
  outSpec.version = oas.info?.version;
  outSpec.description = oas.info?.description;
  outSpec.ref = `${spec.organization}/${outSpec.title}/${outSpec.version}`;
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

  const flattenedOperations: IServiceOperation[] = [];
  if (operations) {
    for (const opList of operations) {
      for (const op of opList) {
        flattenedOperations.push(op);
      }
    }
  }
  return flattenedOperations;
}
