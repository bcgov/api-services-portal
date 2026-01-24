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

@injectable()
@Route('/organizations/{org}/runtime-groups')
@Tags('Runtime Groups')
export class RuntimeGroupController extends Controller {
  private keystone: KeystoneService;
  constructor(@inject('KeystoneService') private _keystone: KeystoneService) {
    super();
    this.keystone = _keystone;
  }

  /**
   * Create a new runtime group for an organization
   * > `Required Scope:` System.Manage
   */
  @Put()
  @OperationId('createRuntimeGroup')
  @Security('jwt', ['System.Manage'])
  public async createRuntimeGroup(
    @Path() org: string,
    @Body() body: RuntimeGroupInput,
    @Request() request: any
  ): Promise<BatchResult> {
    const ctx = this.keystone.createContext(request);

    let input: RuntimeGroup = {};
    Object.assign(input, body);
    input['organization'] = org;

    const service = new RuntimeGroupService();

    return service.upsertRuntimeGroup(ctx, input);
  }

  /**
   * Retrieve the list of runtime groups associated with an organization
   * > `Required Scope:` System.Manage
   */
  @Get()
  @OperationId('listRuntimeGroups')
  @Security('jwt', ['System.Manage'])
  public async listRuntimeGroups(
    @Path() org: string,
    @Query('filter') filter: 'owned' | 'available' = 'owned',
    @Request() request: any
  ): Promise<RuntimeGroup[]> {
    const ctx = this.keystone.createContext(request, true);

    const service = new RuntimeGroupService();

    if (filter === 'available') {
      return service.listHostedRuntimeGroupsForOrganization(ctx, org);
    } else {
      return service.listRuntimeGroupsByOrganization(ctx, org);
    }
  }

  /**
   * A runtime group can be deleted if there are no gateways associated with it.
   * > `Required Scope:` System.Manage
   *
   * @summary Delete a runtime group
   * @param org
   * @param name
   * @param request
   * @example { force: false } body
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
    const context = this.keystone.createContext(request, true);

    const service = new RuntimeGroupService();

    return service.deleteRuntimeGroup(context, org, name, force);
  }
}
