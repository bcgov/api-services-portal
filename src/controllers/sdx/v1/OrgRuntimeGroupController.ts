/**
 * Controller for managing runtime groups within organizations.
 * Runtime groups are used to organize and manage gateway instances in the SDX environment.
 * All endpoints require System.Manage scope for authorization.
 */

import {
  Body,
  Controller,
  Delete,
  Get,
  OperationId,
  Path,
  Post,
  Put,
  Query,
  Request,
  Route,
  Security,
  Tags,
} from 'tsoa';
import { inject, injectable } from 'tsyringe';
import { BatchResult } from '../../../batch/types';
import { RuntimeGroupService } from '../../../services/batch/runtime-group';
import { RuntimeGroup } from '../../../services/batch/types';
import { CreateNamespaceForRuntimeGroup } from '../../../services/workflow/create-namespace-sdx';
import { assertEqual } from '../../ioc/assert';
import { KeystoneService } from '../../ioc/keystoneInjector';
import { RuntimeGroupInput } from './types';
import {
  removeEmpty,
  transformArrayKeyToString,
} from '../../../batch/feed-worker';

/**
 * Runtime Group Controller
 *
 * Provides REST API endpoints for managing runtime groups within organizations.
 * Runtime groups are used to configure and manage gateway instances across different
 * environments and hosting configurations.
 */
@injectable()
@Route('/organizations/{org}/runtime-groups')
@Tags('Runtime Groups')
export class RuntimeGroupController extends Controller {
  private keystone: KeystoneService;

  /**
   * Constructor initializes the controller with Keystone service for context creation.
   * @param _keystone - KeystoneService instance injected via dependency injection
   */
  constructor(@inject('KeystoneService') private _keystone: KeystoneService) {
    super();
    this.keystone = _keystone;
  }

  /**
   * Creates or updates a runtime group configuration for the specified organization.
   * The runtime group defines settings for gateway instances including hosting details,
   * endpoints, and network configuration.
   *
   * > `Required Scope:` System.Manage
   *
   * @summary Create or update a runtime group
   *
   * @param org - Organization identifier
   * @param body - Runtime group configuration details
   * @param request - HTTP request object for context creation
   */
  @Put()
  @OperationId('createRuntimeGroup')
  @Security('jwt', ['System.Manage'])
  public async createRuntimeGroup(
    @Path() org: string,
    @Body() body: RuntimeGroupInput,
    @Request() request: any
  ): Promise<BatchResult> {
    // Create Keystone context for authentication and authorization
    const ctx = this.keystone.createContext(request);

    const service = new RuntimeGroupService();

    // Verify the runtime group belongs to the specified organization
    // if it exists
    await service.checkRuntimeGroup(ctx, org, body.name);

    // Prepare runtime group input with organization assignment
    let input: RuntimeGroup = {};
    Object.assign(input, body);
    input['organization'] = org;

    // Create or update the runtime group
    return service.upsertRuntimeGroup(ctx, input);
  }

  /**
   * Returns either runtime groups owned by the organization or runtime groups
   * available/hosted for the organization, depending on the filter parameter.
   *
   * > `Required Scope:` System.Manage
   *
   * @summary Retrieve a list of runtime groups
   *
   * @param org - Organization identifier
   * @param filter - Filter type: 'owned' returns runtime groups owned by the org,
   *                 'available' returns runtime groups hosted/available to the org
   * @param request - HTTP request object for context creation
   */
  @Get()
  @OperationId('listRuntimeGroups')
  @Security('jwt', ['System.Manage'])
  public async listRuntimeGroups(
    @Path() org: string,
    @Query('filter') filter: 'owned' | 'available' = 'owned',
    @Request() request: any
  ): Promise<RuntimeGroup[]> {
    // Create read-only Keystone context
    const ctx = this.keystone.createContext(request, true);

    const service = new RuntimeGroupService();

    // Return filtered runtime groups based on the specified filter
    if (filter === 'available') {
      const records = await service.listHostedRuntimeGroupsForOrganization(
        ctx,
        org
      );
      return records
        .map((o) => removeEmpty(o))
        .map((o) =>
          transformArrayKeyToString(o, 'hostedOrganizations', 'name')
        );
    } else {
      const records = await service.listRuntimeGroupsByOrganization(ctx, org);
      return records
        .map((o) => removeEmpty(o))
        .map((o) =>
          transformArrayKeyToString(o, 'hostedOrganizations', 'name')
        );
    }
  }

  /**
   * A runtime group can be deleted if there are no gateways associated with it.
   * Use the force parameter to override and delete even if gateways exist (use with caution).
   *
   * > `Required Scope:` System.Manage
   *
   * @summary Delete a runtime group
   *
   * @param org - Organization identifier
   * @param name - Runtime group name to delete
   * @param force - If true, force deletion even if gateways are associated
   * @param request - HTTP request object for context creation
   */
  @Delete('/{name}')
  @OperationId('deleteRuntimeGroup')
  @Security('jwt', ['System.Manage'])
  public async delete(
    @Path() org: string,
    @Path() name: string,
    @Query('force') force: boolean,
    @Request() request: any
  ): Promise<BatchResult> {
    // Create read-only Keystone context
    const context = this.keystone.createContext(request, true);

    const service = new RuntimeGroupService();

    // Delete the runtime group (with force option if specified)
    return service.deleteRuntimeGroup(context, org, name, force);
  }

  /**
   * Creates a gateway for the specified runtime group. This involves creating necessary configurations
   * and infrastructure to enable the runtime group gateway configuration to be hosted on its self.
   *
   * The gateway is used to setup default routing policies for the runtime group (such as a default DENY).
   *
   * > `Required Scope:` System.Manage
   *
   * @summary Register a gateway for a runtime group
   *
   * @param org - Organization identifier
   * @param name - Runtime group name
   * @param request - HTTP request object for context creation
   */
  @Put('/{name}/gateway')
  @OperationId('registerRuntimeGroupGateway')
  @Security('jwt', ['System.Manage'])
  public async registerRuntimeGroupGateway(
    @Path() org: string,
    @Path() name: string,
    @Request() request: any
  ): Promise<{ gatewayId: string }> {
    // Create read-only Keystone context
    const context = this.keystone.createContext(request, true);

    const service = new RuntimeGroupService();

    // Verify the runtime group belongs to the specified organization
    const rg = await service.findRuntimeGroupByName(context, org, name);

    // Create the namespace for the runtime group in the SDX edge environment
    const result = await CreateNamespaceForRuntimeGroup(context, {
      organization: org,
      runtimeGroupName: name,
    });

    // Ensure the created namespace matches the expected gateway ID
    assertEqual(
      rg.namespace === result.name,
      true,
      'gatewayId',
      'Gateway ID mismatch after creation'
    );

    return { gatewayId: rg.namespace };
  }

  /**
   * Generates a one-time-use token for a new certificate during a CSR
   *
   * > `Required Scope:` System.Manage
   *
   * @summary Generate a one-time-use token for a runtime group
   *
   * @param org - Organization identifier
   * @param name - Runtime group name
   * @param request - HTTP request object for context creation
   */
  @Post('/{name}/tokens')
  @OperationId('generateOneTimeUseToken')
  @Security('jwt', ['System.Manage'])
  public async generateOneTimeUseToken(
    @Path() org: string,
    @Path() name: string,
    @Request() request: any
  ): Promise<{ token: string }> {
    // Create Keystone context with access control disabled
    const context = this.keystone.createContext(request, true);

    const service = new RuntimeGroupService();

    const token = await service.generateCertSignRequestToken(context, name);

    return { token };
  }
}
