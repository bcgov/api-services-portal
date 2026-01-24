import { OpenApiSpec, Subsystem } from '../keystone/types';
import { getRecords } from '../../batch/feed-worker';
import { BatchWhereClause } from '../keystone/batch-service';
import { strict as assert } from 'assert';
import { OrgNamespace } from '../org-groups/types';
import { getNamespaceDetails } from '../workflow/get-namespaces';
import { assertAndRaiseValidateError } from './evaluator';
import { RuntimeGroupService } from '../batch/runtime-group';
import { Logger } from '../../logger';
import { sub } from 'date-fns';

const logger = Logger('gateway-patterns.catalog');

/**
 * @tsoaModel
 *
 */
export interface SubsystemEntry {
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
    sdxEndpoint?: string;
    consumerEndpoint?: string;
  };
}

/**
 * @tsoaModel
 *
 */
export interface ServiceClient {
  subsystem: SubsystemEntry;
}

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
  name: string;
  locators?: string[];
  title: string;
  version: string;
  summary?: string;
  description: string;
  operations: ServiceOperation[];
  spec?: string;
  subsystem: SubsystemEntry;
}

export async function GetCatalogByName(
  ctx: any,
  name: string,
  includeSpec: boolean = false
): Promise<ServiceCatalogEntry> {
  const batchClause = {
    query: '$name: String',
    clause: '{ name: $name }',
    variables: { name },
  };
  const records = await GetCatalog(ctx, includeSpec, batchClause);
  assert.strictEqual(records.length == 0, false, 'Service not found');
  return records.pop();
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
        name: c.name,
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
        operations: JSON.parse(c.operations || '{}'),
      } as ServiceCatalogEntry)
  );
}

export async function EnrichWithRuntimeGroup(
  ctx: any,
  subsystemEntry: SubsystemEntry
): Promise<void> {
  const orgNamespace: OrgNamespace = await getNamespaceDetails(
    ctx,
    subsystemEntry.gateway.id
  );

  assertAndRaiseValidateError(
    orgNamespace != null,
    'Incomplete subsystem setup',
    'inputs.service_locator',
    'missing gateway details'
  );

  assertAndRaiseValidateError(
    orgNamespace.permDomains?.length > 0,
    'Incomplete subsystem setup',
    'inputs.service_locator',
    'missing domain permission'
  );

  assertAndRaiseValidateError(
    orgNamespace.permDataPlane === 'sdx-edge',
    'Invalid subsystem setup',
    'inputs.service_locator',
    'invalid data plane permission'
  );

  // lookup runtime group based on domain
  const host = orgNamespace.permDomains[0];
  const rgService = new RuntimeGroupService();
  const runtimeGroup = await rgService.findRuntimeGroupByUniqueHost(ctx, host);
  subsystemEntry.runtimeGroup = {
    name: runtimeGroup.name,
    host,
    sdxEndpoint: runtimeGroup.sdxEndpoint,
    consumerEndpoint: runtimeGroup.consumerEndpoint,
  };
}

export async function GetServiceClient(
  ctx: any,
  org: string,
  subsystem: string
): Promise<ServiceClient> {
  const batchClause = {
    query: '$org: String, $subsystem: String',
    clause: '{ name: $subsystem, organization: { name: $org } }',
    variables: { org, subsystem },
  };

  const records: Subsystem[] = await getRecords(
    ctx,
    'Subsystem',
    'allSubsystems',
    ['organization'],
    batchClause
  );

  assertAndRaiseValidateError(
    records.length === 1,
    'Incomplete service client setup',
    'inputs.client_locator',
    'subsystem not found'
  );

  const c = records.pop();

  // logger.info('[GetServiceClient] Retrieved client subsystem %j', c);
  // assertAndRaiseValidateError(
  //   c.slug === `${org}.${subsystem}`,
  //   'Incomplete service client setup',
  //   'inputs.client_locator',
  //   'subsystem organization error'
  // );

  return {
    subsystem: {
      name: c.name,
      organization: {
        name: c.organization.name,
      },
      gateway: {
        id: c.namespace,
      },
    },
  };
}
