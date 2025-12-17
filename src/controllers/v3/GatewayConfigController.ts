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
} from 'tsoa';
import { KeystoneService } from '../ioc/keystoneInjector';
import { inject, injectable } from 'tsyringe';
import { GetConfigUsingPattern } from '../../services/gateway-patterns/evaluator';

interface GatewayPatternConfigRequest {
  pattern: string;
  delete?: boolean;
  parameters: any;
}

@injectable()
@Route('/gateways/{gatewayId}')
@Tags('SDX')
export class GatewayConfigController extends Controller {
  private keystone: KeystoneService;
  constructor(@inject('KeystoneService') private _keystone: KeystoneService) {
    super();
    this.keystone = _keystone;
  }

  @Put('/pattern')
  @OperationId('get-config-using-pattern')
  @Security('jwt', [])
  public async put(
    @Path() gatewayId: string,
    @Body() body: GatewayPatternConfigRequest,
    @Request() request: any
  ): Promise<any> {
    if (body.parameters.gateway_id != gatewayId) {
      throw new Error(
        `gateway_id parameter ${body.parameters.gateway_id} does not match path gatewayId ${gatewayId}`
      );
    }
    const ctx = this.keystone.createContext(request);
    return await GetConfigUsingPattern(ctx, body);
  }
}
