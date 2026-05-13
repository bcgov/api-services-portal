import { parse } from 'path';
import { Logger } from '../../logger';
import { RuntimeGroupService } from '../batch/runtime-group';
import { SubsystemEntry } from '../gateway-patterns/catalog';
import {
  getOrganization,
  parseOrganizationMemberDetails,
} from '../keystone/organization';
import { Subsystem } from '../keystone/types';
import { ResourceSet } from '../uma2';
import { CreateNamespace } from './create-namespace';
import assert from '../user-assert';

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
  args: CreateNamespaceForOrganizationArgs
): Promise<ResourceSet> {
  const org = await getOrganization(context, args.organization);
  if (!org) {
    throw new Error(`Organization ${args.organization} not found`);
  }

  const member = parseOrganizationMemberDetails(org.tags);

  const name = `sdx-o-${member.memberClass}-${member.memberId}`.toLocaleLowerCase();

  // Create the namespace with SDX edge configuration
  const resourceSet = await CreateNamespace(context, {
    name: name,
    org: args.organization,
    orgUnit: undefined,
    orgEnabled: false,
    displayName: `SDX - LAB.${member.memberClass}.${member.memberId}`,
    dataPlane: 'sdx-edge',
    domains: [],
  });

  logger.debug(
    '[CreateNamespaceForOrganization] Created Namespace %s for Organization %s',
    resourceSet.name,
    args.organization
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
  const rg = await rgService.findRuntimeGroupByUniqueName(
    context,
    args.runtimeGroupName
  );

  assert.strictEqual(
    rg.hostedOrganizations.filter((o) => o.name === args.organization).length >
      0,
    true,
    'Runtime Group not allowed for organization'
  );

  // Extract the consumer endpoint hostname for domain configuration
  const consumerEP = new URL(rg.consumerEndpoint);

  // Create the namespace with SDX edge configuration
  const resourceSet = await CreateNamespace(context, {
    name: rg.namespace,
    org: args.organization,
    orgUnit: undefined,
    orgEnabled: false,
    displayName: `SDX - Edge ${args.runtimeGroupName}`,
    dataPlane: 'sdx-edge',
    domains: [rg.host, consumerEP.hostname],
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
  const rg = await rgService.findRuntimeGroupByUniqueName(
    context,
    args.runtimeGroupName
  );

  assert.strictEqual(
    rg.hostedOrganizations.filter(
      (o) => o.name === args.subsystem.organization?.name
    ).length > 0,
    true,
    'Runtime Group not allowed for organization'
  );

  // Extract the consumer endpoint hostname for domain configuration
  const consumerEP = new URL(rg.consumerEndpoint);

  // Create the namespace using subsystem organization and gateway details
  const resourceSet = await CreateNamespace(context, {
    name: args.subsystem.gateway?.id,
    org: args.subsystem.organization?.name,
    orgUnit: args.subsystem.organization?.orgUnit,
    orgEnabled: false,
    displayName: `SDX - ${args.subsystem.name}`,
    dataPlane: 'sdx-edge',
    domains: [rg.host, consumerEP.hostname],
    routePaths: args.routePaths,
  });

  logger.debug(
    '[CreateNamespaceForSubsystem] Created Namespace %s for Subsystem %s',
    resourceSet.name,
    args.subsystem.name
  );

  return resourceSet;
}
