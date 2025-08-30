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
} from 'tsoa';
import { KeystoneService } from '../ioc/keystoneInjector';
import { inject, injectable } from 'tsyringe';
import { BatchResult } from '../../batch/types';
import { Product } from './types';
import { getGwaProductEnvironment } from '../../services/workflow';
import { getOrgNamespaces } from '../../services/workflow/get-namespaces';
import { getAccessRequestsByNamespace } from '../../services/keystone';
import { OrgAccessRequest } from './types-extra';

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
  ): Promise<OrgAccessRequest[]> {
    const ctx = this.keystone.createContext(request, true);

    const prodEnv = await getGwaProductEnvironment(ctx, false);

    const nsList = await getOrgNamespaces(org, prodEnv);

    const records = await getAccessRequestsByNamespace(ctx, nsList.map((n) => n.name));
    // return records
    //   .map((o) => removeEmpty(o))
    //   .map((o) => transformAllRefID(o, ['organization', 'organizationUnit']))
    //   .map((o) =>
    //     replaceKey(o, 'gatewayId', 'namespace')
    //   );
    return records as any
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
  @Put('/{org}/access_requests')
  @OperationId('organization-put-access-requests')
  @Security('jwt', ['Namespace.Assign'])
  public async put(
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
