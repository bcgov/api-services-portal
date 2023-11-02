import {
  Controller,
  Request,
  Delete,
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
  syncRecordsThrowErrors,
  getRecords,
  removeEmpty,
  removeKeys,
  parseJsonString,
  transformAllRefID,
  getRecord,
  deleteRecord,
} from '../../batch/feed-worker';
import { CredentialIssuer } from './types';
import { BatchResult } from '../../batch/types';
import { strict as assert } from 'assert';

@injectable()
@Route('/namespaces/{ns}/issuers')
@Tags('Authorization Profiles')
export class IssuerController extends Controller {
  private keystone: KeystoneService;
  constructor(@inject('KeystoneService') private _keystone: KeystoneService) {
    super();
    this.keystone = _keystone;
  }

  /**
   * Create or Update Authorization Profiles
   * > `Required Scope:` CredentialIssuer.Admin
   *
   * @summary Manage Authorization Profiles
   */
  @Put()
  @OperationId('put-issuer')
  @Security('jwt', ['CredentialIssuer.Admin'])
  public async put(
    @Path() ns: string,
    @Body() body: CredentialIssuer,
    @Request() request: any
  ): Promise<BatchResult> {
    return await syncRecordsThrowErrors(
      this.keystone.createContext(request),
      'CredentialIssuer',
      body['name'],
      body
    );
  }

  /**
   * Get Authorization Profiles setup in this namespace
   * > `Required Scope:` Namespace.Manage
   *
   * @summary Get Authorization Profiles
   */
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

  /**
   * Delete an Authorization Profile
   * > `Required Scope:` CredentialIssuer.Admin
   *
   * @summary Delete Profile
   */
  @Delete('/{name}')
  @OperationId('delete-issuer')
  @Security('jwt', ['CredentialIssuer.Admin'])
  public async delete(
    @Path() ns: string,
    @Path() name: string,
    @Request() request: any
  ): Promise<BatchResult> {
    const context = this.keystone.createContext(request);

    const current = await getRecord(context, 'CredentialIssuer', name);
    assert.strictEqual(current.namespace === ns, true, 'Issuer invalid');
    assert.strictEqual(current === null, false, 'Issuer not found');

    return await deleteRecord(context, 'CredentialIssuer', name);
  }
}
