import {
  Body,
  Controller,
  OperationId,
  Path,
  Post,
  Request,
  Route,
  Security,
  Tags,
} from 'tsoa';
import { inject, injectable } from 'tsyringe';
import YAML from 'yaml';
import { KeystoneService } from '../../ioc/keystoneInjector';
import { CreateNewKeyInput } from './types';
import { CreateNewKey } from '../../../services/workflow/sdx-org-keys';

@injectable()
@Route('/organizations/{org}/keys')
@Tags('Subsystems')
export class OrgKeysController extends Controller {
  private keystone: KeystoneService;
  constructor(@inject('KeystoneService') private _keystone: KeystoneService) {
    super();
    this.keystone = _keystone;
  }

  /**
   * Create a new key and CSR for an organization on a runtime group.
   * This will be used to sign messages that are transmitted through the runtime group.
   *
   * @summary Create a new key and CSR for an organization on a runtime group
   *
   * @param org
   * @param body
   * @param request
   */
  @Post()
  @OperationId('createNewKey')
  @Security('jwt', ['System.Manage'])
  public async createNewKey(
    @Path() org: string,
    @Body() body: CreateNewKeyInput,
    @Request() request: any
  ): Promise<any> {
    const context = this.keystone.createContext(request);

    // call the Edge Server endpoint for generating a new key pair
    const result = await CreateNewKey(context, org, body.runtimeGroupName);

    // Unusual way to return data, but this is due to the version of tsoa
    // being used and the need to return raw text instead of JSON
    request.res?.header('Content-Type', 'text/plain; charset=utf-8');
    request.res?.send(YAML.stringify(result));
    return '';
  }
}
