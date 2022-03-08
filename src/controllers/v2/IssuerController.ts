import {
  Controller,
  Request,
  Get,
  OperationId,
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
  parseJsonString,
  transformAllRefID,
} from '../../batch/feed-worker';
import { CredentialIssuer } from './types';
import { BatchResult } from '../../batch/types';

@injectable()
@Route('/namespaces/{ns}/issuers')
@Tags('Authorization Profiles')
export class IssuerController extends Controller {
  private keystone: KeystoneService;
  constructor(@inject('KeystoneService') private _keystone: KeystoneService) {
    super();
    this.keystone = _keystone;
  }

  @Put()
  @OperationId('put-issuer')
  @Security('jwt', ['CredentialIssuer.Admin'])
  public async put(
    @Path() ns: string,
    @Body() body: CredentialIssuer,
    @Request() request: any
  ): Promise<BatchResult> {
    return await syncRecords(
      this.keystone.createContext(request),
      'CredentialIssuer',
      body['name'],
      body
    );
  }

  @Get()
  @OperationId('get-issuers')
  @Security('jwt', ['Namespace.Manage'])
  public async get(
    @Path() ns: string,
    @Request() request: any
  ): Promise<CredentialIssuer[]> {
    const ctx = this.keystone.createContext(request);
    const records = await getRecords(
      ctx,
      'CredentialIssuer',
      'allCredentialIssuersByNamespace',
      []
    );

    return records
      .map((o) => removeEmpty(o))
      .map((o) => transformAllRefID(o, ['owner']))
      .map((o) =>
        parseJsonString(o, [
          'availableScopes',
          'resourceScopes',
          'clientRoles',
          'clientMappers',
          'environmentDetails',
        ])
      )
      .map((o) =>
        removeKeys(o, [
          'id',
          'namespace',
          'extSource',
          'extForeignKey',
          'extRecordHash',
        ])
      );
  }

  // /issuers/<issuer>/applications
  // - any applications configured with this Authorization Profile
  // Add to the GatewayConfig the plugins to protect this

  // /issuers/<issuer>/applications/<appid>/clients
  // - any clients configured for this <appid>

  // {ns}/applications
  // - applications available
}
