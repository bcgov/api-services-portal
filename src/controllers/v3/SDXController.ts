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
import { CatalogEntry, GetCatalog } from '../../services/sdx/sdx-catalog';
import {
  GatewayPatternConfig,
  GetConfigUsingPattern,
} from '../../services/sdx/gateway-patterns';

@injectable()
@Route('/sdx')
@Tags('SDX')
export class SDXController extends Controller {
  private keystone: KeystoneService;
  constructor(@inject('KeystoneService') private _keystone: KeystoneService) {
    super();
    this.keystone = _keystone;
  }

  @Put('/{gatewayId}/config-from-pattern')
  @OperationId('get-config-from-sdx-pattern')
  @Security('jwt', [])
  public async put(
    @Path() gatewayId: string,
    @Body() body: GatewayPatternConfig,
    @Request() request: any
  ): Promise<any> {
    const ctx = this.keystone.createContext(request);
    return await GetConfigUsingPattern(ctx, body);
  }

  @Get()
  @OperationId('get-catalog')
  @Security('jwt', [])
  public async getCatalog(@Request() request: any): Promise<CatalogEntry[]> {
    const ctx = this.keystone.createContext(request);

    return await GetCatalog(ctx);
  }
}
