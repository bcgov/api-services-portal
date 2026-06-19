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
import { getEnvironmentContext } from './get-namespaces';
import { lookupProductEnvironmentServicesBySlug } from '../keystone';
import { createUmaPolicy, updateUmaPolicy } from './ns-uma-policy-access';

const logger = Logger('wf.CreateNamespaceSDX');

/**
 * Arguments for creating a namespace for an organization.
 */
export interface CreateNamespaceForOrganizationArgs {
  /** The organization that owns the runtime group */
  organization: string;
}

export async function CreateNamespaceForOrganization(
  context: any,
  { organization }: CreateNamespaceForOrganizationArgs
): Promise<ResourceSet> {
  const org = await getOrganization(context, organization);
  if (!org) {
    throw new Error(`Organization ${organization} not found`);
  }

  const member = parseOrganizationMemberDetails(org.tags);

  const name =
    `sdx-o-${member.memberClass}-${member.memberId}`.toLocaleLowerCase();

  // Create the namespace with SDX edge configuration
  const resourceSet = await createSDXNamespace(context, {
    name: name,
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

  // Create the namespace with SDX edge configuration
  const resourceSet = await createSDXNamespace(context, {
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

  // Create the namespace using subsystem organization and gateway details
  // pzgw.api.gov.bc.ca : required for allowing API calls from PZGW to the subsystem in the SDX edge environment
  // In the p2p-consumer pattern, the consumer routes can be setup on the consumer's runtime group, or
  // due to the token exchange, a central gateway for handling consumer requests.
  const resourceSet = await createSDXNamespace(context, {
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
    args.subsystem.name
  );

  return resourceSet;
}

async function createSDXNamespace(
  context: any,
  args: CreateNamespaceArgs
): Promise<ResourceSet> {
  // A user should only be getting Namespace.View, but due to how the getResources
  // works, it wants the user to have Namespace.Manage to perform this umaPolicy creation step
  args.assignedScopes = ['Namespace.Manage'];

  const resourceSet = await CreateNamespace(context, args);

  const noauthContext = context.createContext({
    skipAccessControl: true,
  });
  const prodEnv = await lookupProductEnvironmentServicesBySlug(
    noauthContext,
    process.env.GWA_PROD_ENV_SLUG
  );
  const envCtx = await getEnvironmentContext(context, prodEnv.id, {}, true);

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
