import { Controller, Request, Put, Path, Route, Security } from 'tsoa';
import { KeystoneService } from './ioc/keystoneInjector';
import { inject, injectable } from 'tsyringe';
import { syncRecords } from '../batch/feed-worker';

@injectable()
@Route('/namespaces/{ns}/datasets')
@Security('jwt', ['Namespace.Manage'])
export class DatasetController extends Controller {
  private keystone: KeystoneService;
  constructor(@inject('KeystoneService') private _keystone: KeystoneService) {
    super();
    this.keystone = _keystone;
  }

  @Put()
  public async put(@Path() ns: string, @Request() request: any): Promise<any> {
    return await syncRecords(
      this.keystone.createContext(request),
      'DraftDataset',
      request.body['id'],
      request.body
    );
  }
}
