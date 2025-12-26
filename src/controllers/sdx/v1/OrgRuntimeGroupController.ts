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
} from 'tsoa';
import { KeystoneService } from '../../ioc/keystoneInjector';
import { inject, injectable } from 'tsyringe';
import { RuntimeGroupInput, SDXRuntimeGroup } from './types';
import { BatchResult } from '../../../batch/types';
import {
  getRecords,
  removeEmpty,
  removeKeys,
  syncRecordsThrowErrors,
} from '../../../batch/feed-worker';
import { RuntimeGroup } from '@/controllers/v3/types';

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
   */
  @Put()
  @OperationId('createRuntimeGroup')
  @Security('jwt', [])
  public async createRuntimeGroup(
    @Path() org: string,
    @Body() body: RuntimeGroupInput,
    @Request() request: any
  ): Promise<BatchResult> {
    let input: RuntimeGroup = {};
    Object.assign(input, body);
    input['organization'] = org;

    // host should be based on a standard format for edge servers
    input['host'] = `${input['name']}.min.citz.servers.sdx`;

    return await syncRecordsThrowErrors(
      this.keystone.createContext(request, true),
      'RuntimeGroup',
      input['name'],
      input
    );
  }

  /**
   * Retrieve the list of runtime groups associated with an organization
   */
  @Get()
  @OperationId('listRuntimeGroups')
  @Security('jwt', [])
  public async listRuntimeGroups(
    @Path() org: string,
    @Request() request: any
  ): Promise<SDXRuntimeGroup[]> {
    const ctx = this.keystone.createContext(request, true);
    const batchClause = {
      query: '$org: String',
      clause: '{ organization: { name: $org } }',
      variables: { org },
    };
    const records: SDXRuntimeGroup[] = await getRecords(
      ctx,
      'RuntimeGroup',
      'allRuntimeGroups',
      [],
      batchClause
    );

    return records.map((o) => removeEmpty(o)).map((o) => removeKeys(o, ['id']));
  }
}
