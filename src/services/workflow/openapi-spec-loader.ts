import { OpenAPISpec } from '@/controllers/v3/types';
import { Logger } from '../../logger';
import { ValidateError } from 'tsoa';
import YAML from 'yaml';
import { getRecord, getRecordById, getRecords } from '../../batch/feed-worker';
import { Subsystem } from '../keystone/types';
import { IServiceOperation } from '../gateway-patterns/catalog';

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

  const batchClause = {
    query: '$org: String, $name: String',
    clause: '{ name: $name, organization: { name: $org } }',
    variables: { org: spec.organization, name: spec.subsystem },
  };
  const records: Subsystem[] = await getRecords(
    context,
    'Subsystem',
    'allSubsystems',
    [],
    batchClause
  );

  const subsystemRecord = records[0];

  const oas = YAML.parse(spec.spec);

  if (subsystemRecord.organization.name !== spec.organization) {
    const fields = {
      organization: {
        message: `Spec organization mismatch: subsystem=${subsystemRecord.organization.name} vs spec=${spec.organization}`,
      },
    };
    logger.debug('Spec organization mismatch details: %j', fields);
    throw new ValidateError(fields, 'Invalid Spec - organization mismatch');
  }

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
  outSpec.operations = JSON.stringify(parseSpec(oas));
  logger.debug('Parsed OAS operations: %j', Object.keys(outSpec).sort());
  return outSpec;
};

function parseSpec(spec: any) {
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
