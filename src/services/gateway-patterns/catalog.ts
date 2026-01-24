import { OpenApiSpec, Subsystem } from '../keystone/types';
import { getRecord, getRecords } from '../../batch/feed-worker';
import { BatchWhereClause } from '../keystone/batch-service';
import { strict as assert } from 'assert';
import { OrgNamespace } from '../org-groups/types';
import { getNamespaceDetails } from '../workflow/get-namespaces';
import { assertAndRaiseValidateError } from './evaluator';
import { RuntimeGroupService } from '../batch/runtime-group';
import { Logger } from '../../logger';
import { sub } from 'date-fns';
import { parse } from 'path';
import { SubsystemService } from '../batch/subsystem';
import { OpenAPISpecService } from '../batch/oas-service';

const logger = Logger('gateway-patterns.catalog');

/**
 * @tsoaModel
 *
 */
export interface MemberOrganization {
  memberClass: string;
  memberId: string;
}

/**
 * @tsoaModel
 *
 */
export interface SubsystemEntry {
  name: string;
  locator: string;
  organization?: {
    name: string;
    orgUnit?: string;
    trustJwksEndpoint?: string;
  };
  member: MemberOrganization;
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

  const specService = new OpenAPISpecService();

  return records.map((c: OpenApiSpec) => {
    logger.debug(`Processing catalog entry: ${c.name} %j`, c);

    const member = parseOrganizationMemberDetails(
      c.subsystem.organization.tags
    );

    const serviceName = specService.titleToServiceName(c.title);
    const serviceVersion = specService.majorPart(c.version);

    return {
      name: c.name,
      locators: [
        `LAB.${member.memberClass}.${member.memberId}.${serviceName}.${serviceVersion}`,
        `LAB.${member.memberClass}.${member.memberId}.${c.subsystem.name}.${serviceName}.${serviceVersion}`,
      ],
      title: c.title,
      version: c.version,
      summary: c.summary,
      description: c.description,
      spec: includeSpec ? c.spec : undefined,
      subsystem: {
        name: c.subsystem.name,
        locator: `LAB.${member.memberClass}.${member.memberId}.${c.subsystem.name}`,
        organization: {
          name: c.organization.name,
        },
        member,
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

export async function GetServiceClient(
  ctx: any,
  org: string,
  subsystem: string
): Promise<ServiceClient> {
  const subsysService = new SubsystemService();
  const c = await subsysService.findSubsystemByName(ctx, org, subsystem);

  const member = parseOrganizationMemberDetails(c.organization.tags);

  return {
    subsystem: {
      name: c.name,
      locator: `LAB.${member.memberClass}.${member.memberId}.${c.name}`,
      organization: {
        name: c.organization.name,
      },
      member,
      gateway: {
        id: c.namespace,
      },
    },
  };
}

function parseOrganizationMemberDetails(tagsStr: string): MemberOrganization {
  assertAndRaiseValidateError(
    tagsStr != null && Boolean(tagsStr),
    'Incomplete organization details',
    'organization',
    'member information not found'
  );

  const tags = JSON.parse(tagsStr);
  const member: { [key: string]: string } = {};

  tags.forEach((part: string) => {
    const kv = part.split(':');
    if (kv.length === 2 && kv[0] === 'member_class') {
      member['memberClass'] = kv[1];
    }
    if (kv.length === 2 && kv[0] === 'member_id') {
      member['memberId'] = kv[1];
    }
  });

  assertAndRaiseValidateError(
    Boolean(member['memberClass']) && Boolean(member['memberId']),
    'Incomplete organization details',
    'organization',
    'member information not found'
  );

  return {
    memberClass: member['memberClass'],
    memberId: member['memberId'],
  };
}
