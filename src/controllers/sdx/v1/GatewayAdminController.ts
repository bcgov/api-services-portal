import {
  Controller,
  Request,
  Response,
  OperationId,
  Get,
  Put,
  Path,
  Route,
  Security,
  Body,
  Tags,
  Example,
  ValidateError,
  SuccessResponse,
} from 'tsoa';
import { KeystoneService } from '../../ioc/keystoneInjector';
import { inject, injectable } from 'tsyringe';
import { GetCatalog } from '../../../services/gateway-patterns/catalog';
import { SDXCatalogEntry, SDXSubsystem } from './types';
import { BatchResult } from '../../../batch/types';
import {
  getRecords,
  removeEmpty,
  removeKeys,
  replaceKey,
  syncRecordsThrowErrors,
} from '../../../batch/feed-worker';

@injectable()
@Route('/gateways/{gatewayId}')
@Tags('Administration')
export class GatewayAdminController extends Controller {
  private keystone: KeystoneService;
  constructor(@inject('KeystoneService') private _keystone: KeystoneService) {
    super();
    this.keystone = _keystone;
  }

  @Put('/subsystems')
  @OperationId('create-subsystem')
  @Security('jwt', ['Namespace.Manage'])
  public async createSubsystem(
    @Path() gatewayId: string,
    @Body() body: SDXSubsystem,
    @Request() request: any
  ): Promise<BatchResult> {
    body['gatewayId'] = gatewayId;
    return await syncRecordsThrowErrors(
      this.keystone.createContext(request),
      'Subsystem',
      undefined,
      replaceKey(body, 'gatewayId', 'namespace')
    );
  }

  @Get('/subsystems')
  @OperationId('list-gateway-subsystems')
  @Security('jwt', [])
  public async listSubsystems(
    @Path() gatewayId: string,
    @Request() request: any
  ): Promise<SDXSubsystem[]> {
    const ctx = this.keystone.createContext(request);
    const records: SDXSubsystem[] = await getRecords(
      ctx,
      'Subsystem',
      'allSubsystemsByNamespace',
      []
    );

    return records
      .map((o) => removeEmpty(o))
      .map((o) => removeKeys(o, ['id', 'namespace']));
  }
}
