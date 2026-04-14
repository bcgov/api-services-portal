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
  EnrichWithRuntimeGroup,
  GetSubsystemEntryForSubsystem,
  SubsystemEntry,
} from '../../../services/gateway-patterns/catalog';
import { CreateNamespaceForSubsystem } from '../../../services/workflow/create-namespace-sdx';
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
  @OperationId('createSubsystem')
  @Security('jwt', ['System.Manage'])
  public async createSubsystem(
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
   * Deletes a subsystem from the specified organization. The subsystem can only be deleted
   * if there are no services associated with it.
   * If the `force` query parameter is set to true, the subsystem will be deleted along
   * with all associated services.
   *
   * > `Required Scope:` System.Manage
   *
   * @summary Delete a subsystem
   *
   * @param org - Organization identifier
   * @param name - Subsystem name to delete
   * @param request - HTTP request object for context creation
   * @param force - If true, force deletion even if associated services exist (use with caution)
   * @example { force: false } body
   */
  @Delete('/{name}')
  @OperationId('deleteSubsystem')
  @Security('jwt', ['System.Manage'])
  public async delete(
    @Path() org: string,
    @Path() name: string,
    @Query('force') force: boolean,
    @Request() request: any
  ): Promise<BatchResult> {
    const context = this.keystone.createContext(request, true);

    return new SubsystemService().deleteSubsystem(context, org, name, force);
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
      routePaths: [routePathPrefix ]
    });

    assertEqual(
      client.gateway.id === result.name,
      true,
      'gatewayId',
      'Gateway ID mismatch after creation'
    );

    return { gatewayId: client.gateway.id };
  }
}
