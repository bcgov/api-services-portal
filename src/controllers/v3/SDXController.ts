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
  ValidateError,
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
import { GetConfigUsingPattern } from '../../services/sdx/gateway-patterns';
import { assertEqual } from '../ioc/assert';

interface GatewayPatternConfigRequest {
  pattern: string;
  delete?: boolean;
  parameters: any;
}

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
    @Body() body: GatewayPatternConfigRequest,
    @Request() request: any
  ): Promise<any> {
    const ctx = this.keystone.createContext(request);
    try {
      return await GetConfigUsingPattern(ctx, body);
    } catch (error) {
      assertEqual(true, true, 'input', error.message);
    }
  }

  @Get('/catalog')
  @OperationId('get-catalog')
  @Security('jwt', [])
  public async getCatalog(@Request() request: any): Promise<CatalogEntry[]> {
    const ctx = this.keystone.createContext(request);
    return await GetCatalog(ctx);
  }
}
