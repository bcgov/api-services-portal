import { parse } from 'path';
import { Logger } from '../../logger';
import { RuntimeGroupService } from '../batch/runtime-group';
import { SubsystemEntry } from '../gateway-patterns/catalog';
import {
  getOrganization,
  parseOrganizationMemberDetails,
} from '../keystone/organization';
import { Subsystem, UmaPolicyInput } from '../keystone/types';
import { Policy, ResourceSet } from '../uma2';
import { CreateNamespace, CreateNamespaceArgs } from './create-namespace';
import assert from '../user-assert';
import { EnvironmentContext, getEnvironmentContext } from './get-namespaces';
import { lookupProductEnvironmentServicesBySlug } from '../keystone';
import { createUmaPolicy, updateUmaPolicy } from './ns-uma-policy-access';
import { SysGroupAccessService } from '../org-groups/sys-group-access';
import { GroupAccessService } from '../org-groups';

const logger = Logger('wf.CreateNamespaceSDX');

/**
 * Arguments for creating a namespace for an organization.
 */
export interface CreateNamespaceForOrganizationArgs {
  /** The organization that owns the runtime group */
  organization: string;
}

export async function LookupOrganizationGatewayId(
  context: any,
  organization: string
): Promise<{
  member: { memberClass: string; memberId: string };
  gatewayId: string;
}> {
  const org = await getOrganization(context, organization);
  if (!org) {
    throw new Error(`Organization ${organization} not found`);
  }

  const member = parseOrganizationMemberDetails(org.tags);

  const gatewayId =
    `sdx-o-${member.memberClass}-${member.memberId}`.toLocaleLowerCase();

  return { member, gatewayId };
}

export async function CreateNamespaceForOrganization(
  context: any,
  { organization }: CreateNamespaceForOrganizationArgs
): Promise<ResourceSet> {
  const { member, gatewayId } = await LookupOrganizationGatewayId(
    context,
    organization
  );

  const envCtx = await getEnvCtx(context);

  // Create the namespace with SDX edge configuration
  const resourceSet = await createSDXNamespace(context, envCtx, {
    name: gatewayId,
    org: organization,
    orgUnit: undefined,
    orgEnabled: false,
    displayName: `SDX - ${member.memberClass}.${member.memberId}`,
    dataPlane: `sdx-edge`,
    domains: [],
  });

  logger.debug(
    '[CreateNamespaceForOrganization] Created Namespace %s for Organization %s',
    resourceSet.name,
    organization
  );

  return resourceSet;
}

/**
 * Arguments for creating a namespace for a runtime group.
 */
export interface CreateNamespaceForRuntimeGroupArgs {
  /** The organization that owns the runtime group */
  organization: string;
  /** The unique name identifying the runtime group */
  runtimeGroupName: string;
}

/**
 * Creates a namespace for a runtime group in the SDX edge environment.
 *
 * This function retrieves the runtime group configuration and creates a corresponding
 * namespace with appropriate domain settings for both the runtime group host and
 * consumer endpoint.
 *
 * @param context - The request context
 * @param args - Arguments containing organization and runtime group name
 * @returns Promise resolving to the created ResourceSet
 */
export async function CreateNamespaceForRuntimeGroup(
  context: any,
  args: CreateNamespaceForRuntimeGroupArgs
): Promise<ResourceSet> {
  // Retrieve the runtime group configuration
  const rgService = new RuntimeGroupService();
  const runtimeGroups = await rgService.findHostedRuntimeGroupsByName(
    context,
    args.organization,
    args.runtimeGroupName
  );

  const envCtx = await getEnvCtx(context);

  // Create the namespace with SDX edge configuration
  const resourceSet = await createSDXNamespace(context, envCtx, {
    name: runtimeGroups[0].namespace,
    org: args.organization,
    orgUnit: undefined,
    orgEnabled: false,
    displayName: `SDX - Edge ${args.runtimeGroupName}`,
    dataPlane: 'sdx-edge',
    runtimeGroupName: args.runtimeGroupName,
    domains: [
      ...runtimeGroups.map((rg) => rg.host),
      ...runtimeGroups.map((rg) => new URL(rg.consumerEndpoint).hostname),
      ...(process.env.SDX_RESERVED_DOMAINS
        ? process.env.SDX_RESERVED_DOMAINS.split(',')
        : ['pzgw.api.gov.bc.ca']),
    ],
  });

  logger.debug(
    '[CreateNamespaceForRuntimeGroup] Created Namespace %s for Runtime Group %s',
    resourceSet.name,
    args.runtimeGroupName
  );

  return resourceSet;
}

/**
 * Arguments for creating a namespace for a subsystem.
 */
export interface CreateNamespaceForSubsystemArgs {
  /** The subsystem configuration entry */
  subsystem: SubsystemEntry;
  /** The runtime group name to associate with the subsystem */
  runtimeGroupName: string;
  /** The route paths for the namespace */
  routePaths?: string[];
}

/**
 * Creates a namespace for a subsystem within a runtime group in the SDX edge environment.
 *
 * This function creates a namespace specifically for a subsystem, using the subsystem's
 * organization details and gateway configuration while associating it with the specified
 * runtime group's domain settings.
 *
 * @param context - The request context
 * @param args - Arguments containing subsystem entry and runtime group name
 * @returns Promise resolving to the created ResourceSet
 */
export async function CreateNamespaceForSubsystem(
  context: any,
  args: CreateNamespaceForSubsystemArgs
): Promise<ResourceSet> {
  // Retrieve the runtime group configuration
  const rgService = new RuntimeGroupService();
  const runtimeGroups = await rgService.findHostedRuntimeGroupsByName(
    context,
    args.subsystem.organization.name,
    args.runtimeGroupName
  );

  const envCtx = await getEnvCtx(context);

  // Create the namespace using subsystem organization and gateway details
  // pzgw.api.gov.bc.ca : required for allowing API calls from PZGW to the subsystem in the SDX edge environment
  // In the p2p-consumer pattern, the consumer routes can be setup on the consumer's runtime group, or
  // due to the token exchange, a central gateway for handling consumer requests.
  const resourceSet = await createSDXNamespace(context, envCtx, {
    name: args.subsystem.gateway?.id,
    org: args.subsystem.organization?.name,
    orgUnit: args.subsystem.organization?.orgUnit,
    orgEnabled: false,
    displayName: `SDX - ${args.subsystem.name}`,
    dataPlane: 'sdx-edge',
    runtimeGroupName: args.runtimeGroupName,
    domains: [
      ...runtimeGroups.map((rg) => rg.host),
      ...runtimeGroups.map((rg) => new URL(rg.consumerEndpoint).hostname),
      ...(process.env.SDX_RESERVED_DOMAINS
        ? process.env.SDX_RESERVED_DOMAINS.split(',')
        : ['pzgw.api.gov.bc.ca']),
    ],
    routePaths: args.routePaths,
  });

  logger.debug(
    '[CreateNamespaceForSubsystem] Created Namespace %s for Subsystem %s',
    resourceSet.name,
    args.subsystem.clientId
  );

  // Setup the roles for the subsystem and assign this user
  // the 'tech-lead' and 'access-manager' roles by default
  const subsystemId = args.subsystem.clientId;

  await prepareRoleAssignments(
    envCtx,
    'subsystem',
    subsystemId,
    resourceSet.name,
    ['tech-lead', 'access-manager', 'system-owner']
  );

  return resourceSet;
}

async function getEnvCtx(context: any): Promise<EnvironmentContext> {
  const noauthContext = context.createContext({
    skipAccessControl: true,
  });
  const prodEnv = await lookupProductEnvironmentServicesBySlug(
    noauthContext,
    process.env.GWA_PROD_ENV_SLUG
  );
  const envCtx = await getEnvironmentContext(context, prodEnv.id, {}, true);

  return envCtx;
}

async function prepareRoleAssignments(
  envCtx: EnvironmentContext,
  type: 'subsystem' | 'runtime',
  systemId: string,
  gatewayId: string,
  roles: string[]
) {
  const sga = new SysGroupAccessService(envCtx.uma2);
  await sga.login(
    envCtx.issuerEnvConfig.clientId,
    envCtx.issuerEnvConfig.clientSecret
  );
  const r = await sga.createOrUpdateGroupAccess(
    type,
    {
      name: systemId,
      parent: '/systems',
      members: [
        {
          member: { id: envCtx.subjectUuid },
          roles,
        },
      ],
    },
    ['idir']
  );
  logger.debug(
    "Created System Group Access for subsystem '%s': %o",
    systemId,
    r
  );

  // Assign the corresponding namespace permissions for the roles
  const ga = new GroupAccessService(envCtx.uma2);
  await ga.login(
    envCtx.issuerEnvConfig.clientId,
    envCtx.issuerEnvConfig.clientSecret
  );
  const namespaceRolesResult = await ga.assignSystemRolesToNamespace(
    gatewayId,
    systemId
  );
  logger.debug(
    "Assigned System Roles to Namespace '%s': %o",
    gatewayId,
    namespaceRolesResult
  );
}

async function createSDXNamespace(
  context: any,
  envCtx: EnvironmentContext,
  args: CreateNamespaceArgs
): Promise<ResourceSet> {
  // A user should only be getting Namespace.View, but due to how the getResources
  // work, it wants the user to have Namespace.Manage to perform this umaPolicy creation step
  // Grant "Connection.Manage" and "GatewayPattern.Publish" to the namespace for the SDX provisioner service account
  // as a default
  args.assignedScopes = [
    'Namespace.Manage',
    'Connection.Manage',
    'GatewayPattern.Publish',
  ];
  args.includeSDXScopes = true;

  const resourceSet = await CreateNamespace(context, args);

  const name = 'sdx-provisioner';

  const umaPolicy: Policy = {
    name: `${name} access to ${resourceSet.name}`,
    description: `Service Acct ${name}`,
    clients: [name],
    scopes: ['GatewayConfig.Publish', 'Namespace.Manage'],
  };

  const umaResult = await createUmaPolicy(
    context,
    envCtx,
    resourceSet.id,
    umaPolicy
  );

  logger.debug(
    "Created UMA policy for namespace '%s' with ID '%s': %o",
    resourceSet.name,
    resourceSet.id,
    umaResult
  );

  return resourceSet;
}
