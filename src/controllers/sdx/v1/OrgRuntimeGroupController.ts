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
    let input: RuntimeGroup = {};
    Object.assign(input, body);
    input['organization'] = org;

    // host should be based on a standard format for edge servers
    input['host'] = `${input['name']}.servers.sdx`;

    return await syncRecordsThrowErrors(
      this.keystone.createContext(request, true),
      'RuntimeGroup',
      input['name'],
      input
    );
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
    @Request() request: any
  ): Promise<RuntimeGroup[]> {
    const ctx = this.keystone.createContext(request, true);
    const batchClause = {
      query: '$org: String',
      clause: '{ organization: { name: $org } }',
      variables: { org },
    };
    const records: RuntimeGroup[] = await getRecords(
      ctx,
      'RuntimeGroup',
      'allRuntimeGroups',
      [],
      batchClause
    );

    return records
      .map((o) => removeEmpty(o))
      .map((o) => transformAllRefID(o, ['organization']))
      .map((o) => replaceKey(o, 'namespace', 'gatewayId'))
      .map((o) => removeKeys(o, ['id']));
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

    const entry = await new RuntimeGroupService().findRuntimeGroupByName(
      context,
      name
    );
    assertEqual(
      entry && entry.organization.name === org,
      true,
      'organization',
      'Not authorized to access this runtime group'
    );

    return await deleteRecordByInternalId(context, 'RuntimeGroup', entry.id);
  }
}
