import { OpenAPISpec } from '@/controllers/v3/types';
import { Logger } from '../../logger';
import { ValidateError } from 'tsoa';
import YAML from 'yaml';

const logger = Logger('wf.OASLoader');

interface OpenAPISpecInput {
  title: string;
  version: string;
  namespace: string;
  spec: string;
  subsystem: string;
  state?: string;
}

export const LoadOpenAPISpec = async (
  context: any,
  spec: OpenAPISpecInput
): Promise<OpenAPISpec> => {
  const outSpec: OpenAPISpec = {};

  logger.info('Loaded OpenAPI Spec %s - %s', spec?.title, spec?.version);

  const oas = YAML.parse(spec.spec);

  if (spec.title != oas.info?.title) {
    throw new ValidateError(
      {
        spec_title: {
          message: `Spec title mismatch: spec=${spec.title} vs blob=${oas.info?.title}`,
        },
      },
      'Invalid Spec'
    );
  }
  if (spec.version != oas.info?.version) {
    throw new ValidateError(
      {
        spec_version: {
          message: `Spec version mismatch: spec=${spec.version} vs blob=${oas.info?.version}`,
        },
      },
      'Invalid Spec'
    );
  }
  outSpec.spec = spec.spec;
  (outSpec as any).namespace = spec.namespace;
  outSpec.subsystem = spec.subsystem;
  outSpec.state = spec.state;
  outSpec.title = oas.info?.title;
  // outSpec.summary = oas.info?.summary || '';
  outSpec.version = oas.info?.version;
  outSpec.description = oas.info?.description || '';
  outSpec.ref = `${spec.namespace}-${outSpec.title}-${outSpec.version}`;
  outSpec.operations = JSON.stringify(parseSpec(oas));
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

  const flattenedOperations = [];
  if (operations) {
    for (const opList of operations) {
      for (const op of opList) {
        flattenedOperations.push(op);
      }
    }
  }
  return flattenedOperations;
}
