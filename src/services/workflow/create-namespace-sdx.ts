import { Logger } from '../../logger';
import { RuntimeGroupService } from '../batch/runtime-group';
import { SubsystemEntry } from '../gateway-patterns/catalog';
import { Subsystem } from '../keystone/types';
import { ResourceSet } from '../uma2';
import { CreateNamespace } from './create-namespace';

const logger = Logger('wf.CreateNamespaceSDX');

export interface CreateNamespaceForSubsystemArgs {
  subsystem: SubsystemEntry;
  runtimeGroupName: string;
}

export async function CreateNamespaceForSubsystem(
  context: any,
  args: CreateNamespaceForSubsystemArgs
): Promise<ResourceSet> {
  const rgService = new RuntimeGroupService();
  const rg = await rgService.findRuntimeGroupByUniqueName(
    context,
    args.runtimeGroupName
  );

  const resourceSet = await CreateNamespace(context, {
    name: args.subsystem.gateway?.id,
    org: args.subsystem.organization?.name,
    orgUnit: args.subsystem.organization?.orgUnit,
    orgEnabled: false,
    displayName: `SDX Subsystem ${args.subsystem.name}`,
    dataPlane: 'sdx-edge',
    domains: [rg.host],
  });

  logger.debug(
    '[CreateNamespaceForSubsystem] Created Namespace %s for Subsystem %s',
    resourceSet.name,
    args.subsystem.name
  );

  return resourceSet;
}
