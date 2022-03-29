import {
  Controller,
  Request,
  OperationId,
  Put,
  Path,
  Route,
  Security,
  Body,
} from 'tsoa';
import { KeystoneService } from '../ioc/keystoneInjector';
import { inject, injectable } from 'tsyringe';
import { syncRecords } from '../../batch/feed-worker';
import { Environment } from '@/services/keystone/types';

@injectable()
@Route('/namespaces/{ns}/products')
@Security('jwt', ['Namespace.Manage'])
export class ProductController extends Controller {
  private keystone: KeystoneService;
  constructor(@inject('KeystoneService') private _keystone: KeystoneService) {
    super();
    this.keystone = _keystone;
  }

  @Put()
  @OperationId('put-product')
  public async put(
    @Path() ns: string,
    @Body() body: any,
    @Request() request: any
  ): Promise<any> {
    // transform to be compatible with V2 of this API
    body.environments?.forEach((e: Environment) => {
      e.appId = e.id;
    });
    return await syncRecords(
      this.keystone.createContext(request),
      'Product',
      body['appId'],
      body
    );
  }
}
