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
import { KeystoneService } from '../ioc/keystoneInjector';
import { inject, injectable } from 'tsyringe';
import {
  syncRecords,
  getRecords,
  removeEmpty,
  removeKeys,
  transformAllRefID,
} from '../../batch/feed-worker';
import { Product } from './types';
import { BatchResult } from '../../batch/types';

@injectable()
@Route('/namespaces/{ns}/products')
@Tags('Products')
export class ProductController extends Controller {
  private keystone: KeystoneService;
  constructor(@inject('KeystoneService') private _keystone: KeystoneService) {
    super();
    this.keystone = _keystone;
  }

  @Put()
  @OperationId('put-product')
  @Security('jwt', ['Namespace.Manage'])
  public async put(
    @Path() ns: string,
    @Body() body: Product,
    @Request() request: any
  ): Promise<BatchResult> {
    return await syncRecords(
      this.keystone.createContext(request),
      'Product',
      body['appId'],
      body
    );
  }

  @Get()
  @OperationId('get-products')
  @Security('jwt', ['Namespace.Manage'])
  public async get(
    @Path() ns: string,
    @Request() request: any
  ): Promise<Product[]> {
    const ctx = this.keystone.createContext(request);
    const records: Product[] = await getRecords(
      ctx,
      'Product',
      'allProductsByNamespace',
      ['environments']
    );

    return records
      .map((o) => removeEmpty(o))
      .map((o) =>
        transformAllRefID(o, [
          'credentialIssuer',
          'dataset',
          'services',
          'legal',
        ])
      )
      .map((o) =>
        removeKeys(o, [
          'id',
          'namespace',
          'extSource',
          'extRecordHash',
          'extForeignKey',
        ])
      );
  }
}
