import {
  Body,
  Controller,
  Delete,
  Get,
  OperationId,
  Path,
  Put,
  Query,
  Request,
  Route,
  Security,
  Tags,
} from 'tsoa';
import { inject, injectable } from 'tsyringe';
import { BatchResult } from '../../../batch/types';
import { SubsystemService } from '../../../services/batch/subsystem';
import { Subsystem } from '../../../services/batch/types';
import {
  GetSubsystemEntryForSubsystem,
  SubsystemEntry,
} from '../../../services/gateway-patterns/catalog';
import { CreateNamespaceForSubsystem } from '../../../services/workflow/create-namespace-sdx';
import { getGwaProductEnvironment } from '../../../services/workflow';
import { assertEqual } from '../../ioc/assert';
import { KeystoneService } from '../../ioc/keystoneInjector';
import { SubsystemInput } from './types';
import {
  removeEmpty,
  removeKeys,
  replaceKey,
  transformAllRefID,
} from '../../../batch/feed-worker';
import { getRoutePathPrefix } from '../../../services/utils';
import { GroupAccessService } from '../../../services/org-groups';
import { SysGroupAccessService } from '../../../services/org-groups/sys-group-access';
import {
  GroupMember,
  GroupMembership,
} from '../../../services/org-groups/types';
import {
  buildOrgAccessDisplayNameResolver,
  logSubsystemAccessChanges,
} from '../../../services/workflow/org-activity';
import { Logger } from '../../../logger';

const logger = Logger('controller.org-subsystem');

@injectable()
@Route('/organizations/{org}/subsystems')
@Tags('Subsystems')
export class OrgSubsystemController extends Controller {
  private keystone: KeystoneService;
  constructor(@inject('KeystoneService') private _keystone: KeystoneService) {
    super();
    this.keystone = _keystone;
  }

  /**
   * Creates or updates a subsystem configuration for the specified organization.
   * The subsystem defines settings for gateway instances including hosting details,
   * endpoints, and network configuration.
   *
   * > `Required Scope:` System.Manage
   *
   * @summary Create or update a subsystem
   *
   * @param org - Organization identifier
   * @param body - Subsystem configuration input
   * @param request - HTTP request object for context creation
   * @return Promise resolving to a BatchResult indicating the outcome of the operation
   */
  @Put()
  @OperationId('upsertSubsystem')
  @Security('jwt', ['System.Manage'])
  public async upsertSubsystem(
    @Path() org: string,
    @Body() body: SubsystemInput,
    @Request() request: any
  ): Promise<BatchResult> {
    const ctx = this.keystone.createContext(request);

    let input: Subsystem = {};
    Object.assign(input, body);
    input['organization'] = org;

    return new SubsystemService().upsertSubsystem(ctx, input);
  }

  /**
   * Retrieves a list of subsystems associated with an organization.
   * Each subsystem entry includes details such as its name, associated gateway information,
   * and configuration settings.
   *
   * > `Required Scope:` System.Manage
   *
   * @summary Retrieve a list of subsystems
   *
   * @param org - Organization identifier
   * @param request - HTTP request object for context creation
   * @returns Promise resolving to an array of Subsystem objects
   */
  @Get()
  @OperationId('listSubsystems')
  @Security('jwt', ['System.Manage'])
  public async listSubsystems(
    @Path() org: string,
    @Request() request: any
  ): Promise<Subsystem[]> {
    const ctx = this.keystone.createContext(request);
    const records = await new SubsystemService().listSubsystemsByOrganization(
      ctx,
      org
    );
    return records
      .map((o) => removeEmpty(o))
      .map((o) => transformAllRefID(o, ['organization']))
      .map((o) => replaceKey(o, 'namespace', 'gatewayId'))
      .map((o) => removeKeys(o, ['id']));
  }

  /**
   * Deletes a subsystem from the specified organization. The subsystem can only
   * be deleted when it has no active connection requests and no gateway
   * configuration. Related OAS services are deleted with the subsystem.
   *
   * > `Required Scope:` System.Manage
   *
   * @summary Delete a subsystem
   *
   * @param org - Organization identifier
   * @param name - Subsystem name to delete
   * @param request - HTTP request object for context creation
   */
  @Delete('/{name}')
  @OperationId('deleteSubsystem')
  @Security('jwt', ['System.Manage'])
  public async delete(
    @Path() org: string,
    @Path() name: string,
    @Request() request: any
  ): Promise<BatchResult> {
    const context = this.keystone.createContext(request, true);

    return new SubsystemService().deleteSubsystem(context, org, name);
  }

  /**
   * Creates a gateway for the specified subsystem. This involves creating necessary configurations
   * and infrastructure to enable the subsystem to be hosted on a runtime group.
   *
   * The gateway is used to setup routing policies on the particular runtime group
   * for the subsystem (such as incoming connections from clients and outbound connections to services
   *
   * > `Required Scope:` System.Manage
   *
   * @summary Register a gateway for a subsystem
   *
   * @param org - Organization identifier
   * @param name - Subsystem name
   * @param body - Object containing the runtime group name to host the subsystem gateway
   * @param request - HTTP request object for context creation
   */
  @Put('/{name}/gateway')
  @OperationId('registerSubsystemGateway')
  @Security('jwt', ['System.Manage'])
  public async registerSubsystemGateway(
    @Path() org: string,
    @Path() name: string,
    @Body() body: { runtimeGroupName: string },
    @Request() request: any
  ): Promise<{ gatewayId: string }> {
    const context = this.keystone.createContext(request, true);

    const subsysService = new SubsystemService();
    const subsystem = await subsysService.findSubsystemByName(
      context,
      org,
      name
    );

    const client = GetSubsystemEntryForSubsystem(subsystem);

    const routePathPrefix = getRoutePathPrefix(client.clientId);

    const result = await CreateNamespaceForSubsystem(context, {
      subsystem: client,
      runtimeGroupName: body.runtimeGroupName,
      routePaths: [routePathPrefix],
    });

    assertEqual(
      client.gateway && client.gateway.id === result.name,
      true,
      'gatewayId',
      'Gateway ID mismatch after creation'
    );

    return { gatewayId: client.gateway!.id };
  }

  /**
   * Retrieves the subsystem-level RBAC role assignments (System Owner,
   * Technical Lead, Access Manager) for the specified subsystem.
   *
   * > `Required Scope:` System.Manage
   *
   * @summary Retrieve subsystem RBAC access
   *
   * @param org - Organization identifier
   * @param name - Subsystem name
   * @param request - HTTP request object for context creation
   * @returns Promise resolving to the subsystem's RBAC role membership
   */
  @Get('/{name}/access')
  @OperationId('getSubsystemAccess')
  @Security('jwt', ['System.Manage'])
  public async getAccess(
    @Path() org: string,
    @Path() name: string,
    @Request() request: any
  ): Promise<GroupMembership> {
    const context = this.keystone.createContext(request, true);

    const subsystem = await new SubsystemService().findSubsystemByName(
      context,
      org,
      name
    );
    const client = GetSubsystemEntryForSubsystem(subsystem);

    const prodEnv = await getGwaProductEnvironment(this.keystone.sudo(), false);
    const envConfig = prodEnv.issuerEnvConfig;

    const groupAccessService = new GroupAccessService(prodEnv.uma2);
    await groupAccessService.login(envConfig.clientId, envConfig.clientSecret);

    const membership = await groupAccessService.getGroupMembership(
      client.clientId
    );

    const members = membership?.members?.map(
      (m) => removeKeys(m, ['id', 'username']) as GroupMember
    );

    return {
      members: members ?? [],
    };
  }

  /**
   * Updates the subsystem-level RBAC role assignments (System Owner,
   * Technical Lead, Access Manager) for the specified subsystem. Replaces
   * the full membership for each role with what is provided.
   *
   * > `Required Scope:` System.Manage
   *
   * @summary Update subsystem RBAC access
   *
   * @param org - Organization identifier
   * @param name - Subsystem name
   * @param body - Desired RBAC role membership for the subsystem
   * @param request - HTTP request object for context creation
   */
  @Put('/{name}/access')
  @OperationId('putSubsystemAccess')
  @Security('jwt', ['System.Manage'])
  public async putAccess(
    @Path() org: string,
    @Path() name: string,
    @Body() body: { members: GroupMember[] },
    @Request() request: any
  ): Promise<void> {
    const context = this.keystone.createContext(request, true);

    const subsystem = await new SubsystemService().findSubsystemByName(
      context,
      org,
      name
    );
    const client = GetSubsystemEntryForSubsystem(subsystem);

    const prodEnv = await getGwaProductEnvironment(this.keystone.sudo(), false);
    const envConfig = prodEnv.issuerEnvConfig;

    const sysGroupAccessService = new SysGroupAccessService(prodEnv.uma2);
    await sysGroupAccessService.login(
      envConfig.clientId,
      envConfig.clientSecret
    );

    const changes = await sysGroupAccessService.createOrUpdateGroupAccess(
      'subsystem',
      {
        name: client.clientId,
        parent: '/systems',
        members: body.members,
      },
      ['idir']
    );

    const resolveDisplayName = await buildOrgAccessDisplayNameResolver(
      envConfig.issuerUrl,
      envConfig.clientId,
      envConfig.clientSecret
    );

    await logSubsystemAccessChanges(
      context,
      org,
      name,
      changes,
      resolveDisplayName
    ).catch((e) =>
      logger.error('[OrgActivity] subsystem access changes %s', e)
    );
  }
}
