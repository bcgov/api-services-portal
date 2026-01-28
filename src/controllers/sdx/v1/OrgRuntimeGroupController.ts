/**
 * Controller for managing runtime groups within organizations.
 * Runtime groups are used to organize and manage gateway instances in the SDX environment.
 * All endpoints require System.Manage scope for authorization.
 */

import {
  Controller,
  Request,
  OperationId,
  Get,
  Put,
  Path,
  Route,
  Security,
  Body,
  Tags,
  Delete,
  Query,
} from 'tsoa';
import { KeystoneService } from '../../ioc/keystoneInjector';
import { inject, injectable } from 'tsyringe';
import { BatchResult } from '../../../batch/types';
import {
  deleteRecordByInternalId,
  getRecords,
  removeEmpty,
  removeKeys,
  replaceKey,
  syncRecordsThrowErrors,
  transformAllRefID,
} from '../../../batch/feed-worker';
import { RuntimeGroup } from '../../../services/batch/types';
import { RuntimeGroupInput } from './types';
import { assertEqual } from '../../ioc/assert';
import { RuntimeGroupService } from '../../../services/batch/runtime-group';
import { CreateNamespaceForRuntimeGroup } from '../../../services/workflow/create-namespace-sdx';

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
   * Create a new runtime group for an organization
   *
   * Creates or updates a runtime group configuration for the specified organization.
   * The runtime group defines settings for gateway instances including hosting details,
   * endpoints, and network configuration.
   *
   * > `Required Scope:` System.Manage
   *
   * @param org - Organization identifier
   * @param body - Runtime group configuration details
   * @param request - HTTP request object for context creation
   * @returns Promise resolving to BatchResult with operation status
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

    // Prepare runtime group input with organization assignment
    let input: RuntimeGroup = {};
    Object.assign(input, body);
    input['organization'] = org;

    const service = new RuntimeGroupService();

    // Create or update the runtime group
    return service.upsertRuntimeGroup(ctx, input);
  }

  /**
   * Retrieve the list of runtime groups associated with an organization
   *
   * Returns either runtime groups owned by the organization or runtime groups
   * available/hosted for the organization, depending on the filter parameter.
   *
   * > `Required Scope:` System.Manage
   *
   * @param org - Organization identifier
   * @param filter - Filter type: 'owned' returns runtime groups owned by the org,
   *                 'available' returns runtime groups hosted/available to the org
   * @param request - HTTP request object for context creation
   * @returns Promise resolving to array of RuntimeGroup objects
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
      return service.listHostedRuntimeGroupsForOrganization(ctx, org);
    } else {
      return service.listRuntimeGroupsByOrganization(ctx, org);
    }
  }

  /**
   * Delete a runtime group
   *
   * A runtime group can be deleted if there are no gateways associated with it.
   * Use the force parameter to override and delete even if gateways exist (use with caution).
   *
   * > `Required Scope:` System.Manage
   *
   * @param org - Organization identifier
   * @param name - Runtime group name to delete
   * @param force - If true, force deletion even if gateways are associated
   * @param request - HTTP request object for context creation
   * @returns Promise resolving to BatchResult with deletion status
   * @example force=false
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
   * Register a gateway for a runtime group
   *
   * Creates a namespace and gateway configuration for the specified runtime group.
   * This operation sets up the necessary infrastructure for the runtime group to
   * handle API gateway traffic in the SDX edge environment.
   *
   * > `Required Scope:` System.Manage
   *
   * @param org - Organization identifier
   * @param name - Runtime group name
   * @param request - HTTP request object for context creation
   * @returns Promise resolving to object containing the created gateway ID
   * @throws Error if runtime group doesn't belong to the organization
   * @throws Error if gateway ID mismatch occurs after creation
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
}
