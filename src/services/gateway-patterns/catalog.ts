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
import { ResourceScope } from '../workflow/openapi-spec-loader';

const logger = Logger('gateway-patterns.catalog');

/**
 * @tsoaModel
 *
 */
export interface SubsystemEntry {
  name: string;
  description?: string;
  clientId: string;
  organization?: {
    name: string;
    description?: string;
    title?: string;
    orgUnit?: string;
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
  integrationClientIds: string[];
  runtimeGroups?: {
    name: string;
    environment: string;
    host: string;
    sdxEndpoint: string;
    consumerEndpoint: string;
  }[];
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
    scopes?: ResourceScope[];
  }[];
  spec?: string;
  specVersion: string;
  subsystem: SubsystemEntry;
}

export interface ResourceScopeParts {
  name: string;
  description: string;
  namespace: string;
  resourceType: string;
  subResourceTypes?: string[];
  action: string;
}

export interface ScopedServiceOperations {
  name: string;
  specVersion: string;
  version: string;
  subsystem: SubsystemEntry;
  operationIds: string[];
}

export interface ResourceScopeEntry extends ResourceScopeParts {
  services: ScopedServiceOperations[];
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
      specVersion: c.specVersion,
      annotations: c.annotations,
      environment: c.environment,
      summary: c.summary,
      description: c.description,
      spec: includeSpec ? c.spec : undefined,
      subsystem: {
        name: c.subsystem.name,
        description: c.subsystem.description,
        clientId: `${member.memberClass}.${member.memberId}.${c.subsystem.name}`,
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
        integrationClientIds: c.subsystem.integrations.map(
          (i) => i.integrationClientId
        ),
      },
      operations: JSON.parse(c.operations || '[]'),
    } as ServiceCatalogEntry;
  });
}

export async function GetScopes(ctx: any): Promise<ResourceScopeEntry[]> {
  const catalog = await GetCatalog(ctx);
  const scopes: ({ service: ScopedServiceOperations } & ResourceScopeParts)[] =
    [];

  catalog.forEach((service) => {
    const serviceScopes = service.operations.reduce(
      (acc: ResourceScope[], op) => {
        if (op.scopes) {
          return acc.concat(op.scopes);
        }
        return acc;
      },
      []
    );

    const serviceBase = {
      name: service.name,
      specVersion: service.specVersion,
      version: service.version,
      subsystem: service.subsystem,
    };

    const scopeList = serviceScopes
      .filter((scope) => typeof scope !== 'string')
      .map(
        (scope) =>
          ({
            ...parseScopeName(scope),
            ...{
              service: {
                ...serviceBase,
                subsystem: service.subsystem,
                operationIds: service.operations
                  .filter((op) => op.scopes && op.scopes.includes(scope))
                  .map((op) => op.operationId),
              },
            },
          } as { service: ScopedServiceOperations } & ResourceScopeParts)
      );

    scopes.push(...scopeList);
  });

  // group the scopes by name to get all the ScopedServiceOperations
  // to create the ResourceScopeEntry response
  const scopeGroups: Record<string, ResourceScopeEntry> = {};
  scopes.forEach((scope) => {
    if (!scopeGroups[scope.name]) {
      scopeGroups[scope.name] = {
        name: scope.name,
        description: scope.description,
        namespace: scope.namespace,
        resourceType: scope.resourceType,
        subResourceTypes: scope.subResourceTypes,
        action: scope.action,
        services: [scope.service],
      };
    } else {
      // if the scope already exists then we need to add the service to the existing entry
      scopeGroups[scope.name].services.push(scope.service);
    }
  });
  return Object.values(scopeGroups);
}

/**
 * Scope format in BCNF format:
 *
 * scope           = namespace ":" resource { ":" resource } ":" action ;
 * namespace       = identifier ;
 * resource        = identifier ;
 * action          = identifier ;
 * identifier      = letter { letter | digit | "-" | "_" } ;
 * letter          = "a"…"z" ;
 * digit           = "0"…"9" ;
 *
 * @param scope
 * @returns
 */
function parseScopeName(
  // service: ServiceCatalogEntry,
  // operation: { operationId: string },
  scope: ResourceScope
): ResourceScopeParts {
  const parts = scope.name.split(':');
  // parse based on the BCNF format defined above, which should have at least 3 parts: {namespace}:{resourceType}:{action}
  assertAndRaiseValidateError(
    parts.length >= 3,
    'Invalid scope format',
    'inputs.scope',
    'scope should be in format: namespace ":" resource { ":" resource } ":" action'
  );

  return {
    name: scope.name,
    description: scope.description,
    namespace: parts[0],
    resourceType: parts[1],
    subResourceTypes:
      parts.length > 3 ? parts.slice(2, parts.length - 1) : undefined,
    action: parts[parts.length - 1],
  };
}

export async function EnrichWithRuntimeGroup(
  ctx: any,
  subsystemEntry: SubsystemEntry,
  quiet: boolean = false
): Promise<void> {
  const orgNamespace: OrgNamespace = await getNamespaceDetails(
    ctx,
    subsystemEntry.gateway.id
  );

  if (quiet && orgNamespace == null) {
    return;
  }

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
  const rgService = new RuntimeGroupService();
  const runtimeGroups = await rgService.findHostedRuntimeGroupsByName(
    ctx,
    subsystemEntry.organization.name,
    orgNamespace.permRuntimeGroup
  );
  subsystemEntry.runtimeGroups = runtimeGroups.map((rg) => ({
    name: rg.name,
    environment: rg.environment,
    host: rg.host,
    sdxEndpoint: rg.sdxEndpoint,
    consumerEndpoint: rg.consumerEndpoint,
  }));
}

export function BuildClientID(subsystemEntry: SubsystemEntry): string {
  return `${subsystemEntry.member?.memberClass}.${subsystemEntry.member?.memberId}.${subsystemEntry.name}`;
}

export function GetSubsystemEntryForSubsystem(c: Subsystem): SubsystemEntry {
  const member = parseOrganizationMemberDetails(c.organization.tags);

  return {
    name: c.name,
    description: c.description,
    clientId: `${member.memberClass}.${member.memberId}.${c.name}`,
    organization: {
      name: c.organization.name,
      title: c.organization.title,
      description: c.organization.description,
    },
    member: member,
    gateway: {
      id: c.namespace,
    },
    integrationClientIds: c.integrations.map((i) => i.integrationClientId),
  };
}

export function BuildServiceName(
  subsystemRecord: Subsystem,
  environment: string,
  oas: any
): string {
  const specService = new OpenAPISpecService();

  const serviceName = specService.titleToServiceName(oas.info?.title || '');

  const serviceVersion = specService.majorPart(oas.info?.version);

  const member = parseOrganizationMemberDetails(
    subsystemRecord.organization.tags
  );

  const env = environment.toLocaleUpperCase();

  return `${env}.${member.memberClass}.${member.memberId}.${serviceName}.${serviceVersion}`;
}

export function ParseClientId(id: string): {
  member: {
    memberClass: string;
    memberId: string;
  };
  subsystem: {
    name: string;
  };
} {
  const parts = id.split('.');
  assertAndRaiseValidateError(
    parts.length === 3,
    'Invalid client id format',
    'inputs.client_id',
    'client id should be in format {member_class}.{member_id}.{subsystem_name}'
  );

  return {
    member: {
      memberClass: parts[0],
      memberId: parts[1],
    },
    subsystem: {
      name: parts[2],
    },
  };
}
