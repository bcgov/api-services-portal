import {
  Body,
  Controller,
  OperationId,
  Request,
  Put,
  Path,
  Route,
  Security,
} from 'tsoa';
import { KeystoneService } from './ioc/keystoneInjector';
import { inject, injectable } from 'tsyringe';
import { syncRecords } from '../batch/feed-worker';

@injectable()
@Route('/namespaces/{ns}/dataset')
@Security('jwt', ['Namespace.Manage'])
export class DatasetController extends Controller {
  private keystone: KeystoneService;
  constructor(@inject('KeystoneService') private _keystone: KeystoneService) {
    super();
    this.keystone = _keystone;
  }

  @Put()
  @OperationId('put-dataset')
  public async put(
    @Path() ns: string,
    @Body() body: any,
    @Request() request: any
  ): Promise<any> {
    return await syncRecords(
      this.keystone.createContext(request),
      'DraftDataset',
      request.body['name'],
      request.body
    );
  }
}
