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
import { getSubsystemRoles } from '../../../services/workflow/get-subsystem-roles';
import { putSubsystemAccess as putSubsystemAccessWorkflow } from '../../../services/workflow/put-subsystem-access';
import { SystemRoles } from '../../../services/org-groups/sys-group-access';
import { GroupMember } from '../../../services/org-groups/types';
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
   * Retrieves RBAC role membership (System Owner, Tech Lead, Access Manager)
   * for the specified subsystem.
   *
   * > `Required Scope:` System.Manage
   *
   * @summary Retrieve RBAC role membership for a subsystem
   *
   * @param org - Organization identifier
   * @param name - Subsystem name
   * @param request - HTTP request object for context creation
   */
  @Get('/{name}/access')
  @OperationId('getSubsystemAccess')
  @Security('jwt', ['System.Manage'])
  public async getSubsystemAccess(
    @Path() org: string,
    @Path() name: string,
    @Request() request: any
  ): Promise<GroupMember[]> {
    const ctx = this.keystone.createContext(request);

    const subsysService = new SubsystemService();
    const subsystem = await subsysService.findSubsystemByName(ctx, org, name);
    const client = GetSubsystemEntryForSubsystem(subsystem);

    return (await getSubsystemRoles(ctx, client.clientId)) ?? [];
  }

  /**
   * Changes RBAC role membership (System Owner, Tech Lead, Access Manager)
   * for the specified subsystem. This is a full sync: members omitted from
   * `members` are removed from any of these roles they currently hold, and
   * members included are granted exactly the roles listed.
   *
   * > `Required Scope:` System.Manage
   *
   * @summary Change RBAC role membership for a subsystem
   *
   * @param org - Organization identifier
   * @param name - Subsystem name
   * @param body - The complete desired set of role members
   * @param request - HTTP request object for context creation
   */
  @Put('/{name}/access')
  @OperationId('putSubsystemAccess')
  @Security('jwt', ['System.Manage'])
  public async putSubsystemAccess(
    @Path() org: string,
    @Path() name: string,
    @Body() body: { members: GroupMember[] },
    @Request() request: any
  ): Promise<void> {
    const allRoles: string[] = body.members.reduce(
      (acc: string[], m: GroupMember) => acc.concat(m.roles),
      []
    );
    const unsupported = [
      ...new Set(allRoles.filter((r) => !SystemRoles.includes(r))),
    ];
    assertEqual(
      unsupported.length === 0,
      true,
      'members',
      `Unsupported role(s): ${unsupported.join(', ')}. Supported roles: ${SystemRoles.join(', ')}`
    );

    const ctx = this.keystone.createContext(request, true);

    const subsysService = new SubsystemService();
    const subsystem = await subsysService.findSubsystemByName(ctx, org, name);
    const client = GetSubsystemEntryForSubsystem(subsystem);

    await putSubsystemAccessWorkflow(ctx, client.clientId, body.members);
  }
}
