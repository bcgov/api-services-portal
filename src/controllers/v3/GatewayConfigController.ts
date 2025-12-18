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
  Example,
} from 'tsoa';
import { KeystoneService } from '../ioc/keystoneInjector';
import { inject, injectable } from 'tsyringe';
import { GetConfigUsingPattern } from '../../services/gateway-patterns/evaluator';
import { TsoaErrorWrapper } from '../types';

interface GatewayPatternConfigRequest {
  pattern: string;
  parameters: { [key: string]: string };
}

@injectable()
@Route('/gateways/{gatewayId}')
@Tags('Gateways')
export class GatewayConfigController extends Controller {
  private keystone: KeystoneService;
  constructor(@inject('KeystoneService') private _keystone: KeystoneService) {
    super();
    this.keystone = _keystone;
  }

  @Put('/pattern')
  @OperationId('get-config-using-pattern')
  @Security('jwt', [])
  @Example<GatewayPatternConfigRequest>({
    pattern: 'simple-service.r1',
    parameters: {
      service_name: 'my-service',
      service_url: 'https://httpbun.com',
    },
  })
  public async put(
    @Path() gatewayId: string,
    @Body() body: GatewayPatternConfigRequest,
    @Request() request: any
  ): Promise<any> {
    // always inject the gatewayId as a parameter
    body.parameters.gateway_id = gatewayId;

    const ctx = this.keystone.createContext(request);

    try {
      return await GetConfigUsingPattern(ctx, body);
    } catch (error) {
      throw new TsoaErrorWrapper(error);
    }
  }
}
