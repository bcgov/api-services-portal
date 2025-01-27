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
  FormField,
  UploadedFile,
} from 'tsoa';
import { KeystoneService } from '../ioc/keystoneInjector';
import { inject, injectable } from 'tsyringe';
import {
  syncRecords,
  getRecords,
  parseJsonString,
  removeEmpty,
  removeKeys,
} from '../../batch/feed-worker';
import { GatewayRoute } from './types';
import { PublishResult } from './types-extra';

@injectable()
@Route('/gateways/{gatewayId}/services')
@Tags('Gateway Services')
export class GatewayController extends Controller {
  private keystone: KeystoneService;
  constructor(@inject('KeystoneService') private _keystone: KeystoneService) {
    super();
    this.keystone = _keystone;
  }

  @Put()
  @OperationId('publish-gateway-config')
  @Security('jwt', ['Gateway.Config'])
  public async put(
    @FormField() dryRun: boolean,
    @UploadedFile() configFile: Express.Multer.File
  ): Promise<PublishResult> {
    // stub - gwa-api implements this
    return { error: 'Stub - not implemented' };
  }

  /**
   * Get a summary of your Gateway Services
   * > `Required Scope:` Gateway.Manage
   *
   * @summary Get Gateway Services
   */
  @Get()
  @OperationId('get-gateway-routes')
  @Security('jwt', ['Namespace.Manage'])
  public async getServices(
    @Path() gatewayId: string,
    @Request() request: any
  ): Promise<GatewayRoute[]> {
    const ctx = this.keystone.createContext(request);
    const records = await getRecords(
      ctx,
      'GatewayRoute',
      'allGatewayRoutesByNamespace',
      ['plugins', 'service']
    );

    return records
      .map((o) => removeEmpty(o))
      .map((o) =>
        parseJsonString(o, ['tags', 'config', 'paths', 'hosts', 'methods'])
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
