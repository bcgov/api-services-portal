import {
  Controller,
  Request,
  OperationId,
  Put,
  Path,
  Route,
  Security,
  Body,
  Get,
  Tags,
  Delete,
} from 'tsoa';
import { strict as assert } from 'assert';
import { KeystoneService } from '../ioc/keystoneInjector';
import { inject, injectable } from 'tsyringe';
import {
  syncRecordsThrowErrors,
  getRecords,
  parseJsonString,
  removeEmpty,
  removeKeys,
  transformAllRefID,
  deleteRecord,
  replaceKey,
} from '../../batch/feed-worker';
import { BatchResult } from '../../batch/types';
import { Dataset, DraftDataset } from './types';
import { Product } from './types';

@injectable()
@Route('/organizations')
@Tags('API Directory (Administration)')
export class OrgAccessRequestsController extends Controller {
  private keystone: KeystoneService;
  constructor(@inject('KeystoneService') private _keystone: KeystoneService) {
    super();
    this.keystone = _keystone;
  }

  /**
   * Get Access Requests that are available by API for this organization
   * > `Required Scope:` Namespace.Assign
   *
   * @summary Get Organization Access Requests
   */
  @Get('/{org}/access_requests')
  @OperationId('organization-access-requests')
  @Security('jwt', ['Namespace.Assign'])
  public async getRequests(
    @Path() org: string,
    @Request() request: any
  ): Promise<Dataset[]> {
    const ctx = this.keystone.createContext(request);

    // get list of namespaces for this org
    // then get access requests for those namespaces
    // const batchClause = {
    //   query: '$org: String',
    //   clause: '{ organization: { name: $org } }',
    //   variables: { org },
    // };

    // const records = await getRecords(
    //   ctx,
    //   'Product',
    //   undefined,
    //   ['environments'],
    //   batchClause
    // );

    // return records
    //   .map((o) => removeEmpty(o))
    //   .map((o) => transformAllRefID(o, ['organization', 'organizationUnit']))
    //   .map((o) =>
    //     removeKeys(o, [
    //       'id'
    //     ])
    //   );
    return [];
  }


  /**
   * Manage Access Requests for APIs that will appear on the API Directory
   * > `Required Scope:` Namespace.Assign
   *
   * @summary Manage Access Requests
   * @param ns
   * @param body
   * @param request
   */
  @Put('/{org}/gateways/{gatewayId}/access_requests')
  @OperationId('organization-put-access-requests')
  @Security('jwt', ['Namespace.Assign'])
  public async put(
    @Path() gatewayId: string,
    @Path() org: string,
    @Body() body: Product,
    @Request() request: any
  ): Promise<BatchResult> {
    // TODO: Make sure namespace is allowed for this org
    // body['gatewayId'] = gatewayId;
    // body['organization'] = org;

    // return await syncRecordsThrowErrors(
    //   this.keystone.createContext(request, true),
    //   'Product',
    //   body['appId'],
    //   replaceKey(body, 'gatewayId', 'namespace')
    // );
    return { status: 400, result: 'Not implemented'}
  }  
}
