import { strict as assert } from 'assert';
import { getRecords } from '../../batch/feed-worker';
import { Logger } from '../../logger';
import { OpenAPISpecService } from '../batch/oas-service';
import { RuntimeGroupService } from '../batch/runtime-group';
import { BatchWhereClause } from '../keystone/batch-service';
import { parseOrganizationMemberDetails } from '../keystone/organization';
import { OpenApiSpec, Subsystem } from '../keystone/types';
import { OrgNamespace } from '../org-groups/types';
import { getNamespaceDetails } from '../workflow/get-namespaces';
import { assertAndRaiseValidateError } from './evaluator';

const logger = Logger('gateway-patterns.catalog');

/**
 * @tsoaModel
 *
 */
export interface SubsystemEntry {
  name: string;
  clientId: string;
  organization?: {
    name: string;
  };
  member?: {
    memberClass: string;
    memberId: string;
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
export interface ServiceCatalogEntry {
  name: string;
  title: string;
  version: string;
  summary?: string;
  description: string;
  operations: {
    operationId: string;
    summary: string;
    method: string;
    path: string;
    scopes?: string[];
  }[];
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

  return records.map((c: OpenApiSpec) => {
    logger.debug(`Processing catalog entry: ${c.name} %j`, c);

    const member = parseOrganizationMemberDetails(
      c.subsystem.organization.tags
    );

    return {
      name: c.name,
      title: c.title,
      version: c.version,
      summary: c.summary,
      description: c.description,
      spec: includeSpec ? c.spec : undefined,
      subsystem: {
        name: c.subsystem.name,
        clientId: `LAB.${member.memberClass}.${member.memberId}.${c.name}`,
        organization: {
          name: c.organization.name,
        },
        member: {
          memberClass: member.memberClass,
          memberId: member.memberId,
        },
        gateway: {
          id: c.namespace,
        },
      },
      operations: JSON.parse(c.operations || '{}'),
    } as ServiceCatalogEntry;
  });
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

export async function GetServiceClientForSubsystem(
  ctx: any,
  c: Subsystem
): Promise<ServiceClient> {
  const member = parseOrganizationMemberDetails(c.organization.tags);

  return {
    subsystem: {
      name: c.name,
      clientId: `LAB.${member.memberClass}.${member.memberId}.${c.name}`,
      organization: {
        name: c.organization.name,
      },
      gateway: {
        id: c.namespace,
      },
    },
  };
}

export function BuildServiceName(subsystemRecord: Subsystem, oas: any): string {
  const specService = new OpenAPISpecService();

  const serviceName = specService.titleToServiceName(oas.info?.title || '');

  const serviceVersion = specService.majorPart(oas.info?.version);

  const member = parseOrganizationMemberDetails(
    subsystemRecord.organization.tags
  );

  return `LAB.${member.memberClass}.${member.memberId}.${serviceName}.${serviceVersion}`;
}

export function ParseClientId(id: string): any {
  const parts = id.split('.');
  assertAndRaiseValidateError(
    parts.length === 4 && parts[0] === 'LAB',
    'Invalid client id format',
    'inputs.client_id',
    'client id should be in format LAB.{member_class}.{member_id}.{subsystem_name}'
  );

  return {
    member: {
      memberClass: parts[1],
      memberId: parts[2],
    },
    subsystem: {
      name: parts[3],
    },
  };
}
