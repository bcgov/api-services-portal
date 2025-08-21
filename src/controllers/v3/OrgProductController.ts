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
export class OrgProductController extends Controller {
  private keystone: KeystoneService;
  constructor(@inject('KeystoneService') private _keystone: KeystoneService) {
    super();
    this.keystone = _keystone;
  }

  /**
   * Get metadata about Datasets that are available by API for this organization
   * > `Required Scope:` Dataset.Manage
   *
   * @summary Get Organization Datasets
   */
  @Get('/{org}/products')
  @OperationId('organization-products')
  @Security('jwt', ['Dataset.Manage'])
  public async getProducts(
    @Path() org: string,
    @Request() request: any
  ): Promise<Dataset[]> {
    const ctx = this.keystone.createContext(request);

    const batchClause = {
      query: '$org: String',
      clause: '{ organization: { name: $org } }',
      variables: { org },
    };

    const records = await getRecords(
      ctx,
      'Product',
      undefined,
      [],
      batchClause
    );

    return records
      .map((o) => removeEmpty(o))
      .map((o) => transformAllRefID(o, ['organization', 'organizationUnit']))
      .map((o) =>
        removeKeys(o, [
          'id'
        ])
      );
  }


  /**
   * Manage Products for APIs that will appear on the API Directory
   * > `Required Scope:` Namespace.Manage
   *
   * @summary Manage Products
   * @param ns
   * @param body
   * @param request
   */
  @Put('/{org}/products')
  @OperationId('organization-put-product')
  @Security('jwt', ['Dataset.Manage'])
  public async put(
    @Path() org: string,
    @Body() body: Product,
    @Request() request: any
  ): Promise<BatchResult> {
    // TODO: Make sure namespace is allowed for this org

    return await syncRecordsThrowErrors(
      this.keystone.createContext(request),
      'Product',
      body['appId'],
      body
    );
  }  
}
