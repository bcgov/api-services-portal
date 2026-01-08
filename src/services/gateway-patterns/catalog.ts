import { OpenApiSpec } from '../keystone/types';
import { getRecords } from '../../batch/feed-worker';
import { BatchWhereClause } from '../keystone/batch-service';

/**
 * @tsoaModel
 *
 */
export interface ServiceOperation {
  operationId: string;
  summary: string;
  method: string;
  path: string;
  scopes?: string[];
}

/**
 * @tsoaModel
 *
 */
export interface ServiceCatalogEntry {
  id: string;
  locators?: string[];
  title: string;
  version: string;
  summary: string;
  description: string;
  state: string;
  operations: ServiceOperation[];
  spec?: string;
  subsystem: {
    name: string;
    organization?: {
      name: string;
      orgUnit?: string;
      trustJwksEndpoint?: string;
    };
    gateway?: {
      id: string;
      permissions?: {
        dataPlane: string;
        domains: string[];
      };
    };
    runtimeGroup?: {
      name: string;
      host: string;
      publicEndpoint?: string;
      privateEndpoint?: string;
    };
  };
}

export async function GetCatalogById(
  ctx: any,
  id: string,
  includeSpec: boolean = false
): Promise<ServiceCatalogEntry> {
  const batchClause = {
    query: '$name: String',
    clause: '{ name: $name }',
    variables: { name: id },
  };
  return (await GetCatalog(ctx, includeSpec, batchClause))[0];
}

export async function GetCatalog(
  ctx: any,
  includeSpec: boolean = false,
  batchClause?: BatchWhereClause
): Promise<ServiceCatalogEntry[]> {
  const records: OpenApiSpec[] = await getRecords(
    ctx,
    'OpenAPISpec',
    'allOpenAPISpecs',
    ['subsystem', 'organization'],
    batchClause
  );

  return records.map(
    (c: OpenApiSpec) =>
      ({
        id: c.name,
        title: c.title,
        version: c.version,
        summary: c.summary,
        description: c.description,
        spec: includeSpec ? c.spec : undefined,
        subsystem: {
          name: c.subsystem.name,
          organization: {
            name: c.organization.name,
          },
          gateway: {
            id: c.namespace,
          },
        },
        state: c.state,
        operations: JSON.parse(c.operations || '{}'),
      } as ServiceCatalogEntry)
  );
}
