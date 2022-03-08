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

@injectable()
@Route('/namespaces/{ns}/issuers')
@Security('jwt', ['CredentialIssuer.Admin'])
export class IssuerController extends Controller {
  private keystone: KeystoneService;
  constructor(@inject('KeystoneService') private _keystone: KeystoneService) {
    super();
    this.keystone = _keystone;
  }

  @Put()
  @OperationId('put-issuer')
  public async put(
    @Path() ns: string,
    @Body() body: any,
    @Request() request: any
  ): Promise<any> {
    return await syncRecords(
      this.keystone.createContext(request),
      'CredentialIssuer',
      body['name'],
      body
    );
  }
}
