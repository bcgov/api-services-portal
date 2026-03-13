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
import { KeystoneService } from '../ioc/keystoneInjector';
import { inject, injectable } from 'tsyringe';
import { GetConfigUsingPattern } from '../../services/gateway-patterns/evaluator';

/**
 * @example {
 *  "pattern": "simple-service.r1",
 *  "parameters": {
 *    "service_name": "my-service",
 *    "service_url": "https://httpbun.com"
 *  }
 * }
 */
interface GatewayPatternConfigRequest {
  pattern: string;
  parameters: { [key: string]: string };
}

/** 401: invalid or missing token */
interface UnauthorizedJSON {
  code: 'invalid_token';
  message: string;
}

/** 403: valid token but missing required scope */
interface ForbiddenJSON {
  code: 'permission_denied';
  message: string;
}

interface ValidateErrorJSON {
  code: 'validation_error';
  message: 'Invalid input';
  fields: { [name: string]: { message: string } };
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

  /**
   * > `Required Scope:` GatewayConfig.Publish
   *
   * @summary Generate gateway config from pre-defined patterns
   */
  @Put('/pattern')
  @OperationId('generate-config-from-pattern')
  @Security('jwt', ['GatewayConfig.Publish'])
  @SuccessResponse('200', 'OK')
  @Example<any>({
    documents: [
      {
        kind: 'GatewayService',
        name: 'sdx.my-service',
        routes: [],
      },
    ],
  })
  @Response<UnauthorizedJSON>(401, 'Unauthorized', {
    code: 'invalid_token',
    message: 'Invalid or missing token',
  })
  @Response<ForbiddenJSON>(403, 'Forbidden', {
    code: 'permission_denied',
    message: 'Missing required scope',
  })
  @Response<ValidateErrorJSON>(422, 'Validation Failed', {
    code: 'validation_error',
    message: 'Invalid input',
    fields: {
      pattern: {
        message: 'unsupported pattern',
      },
    },
  })
  public async generateConfigFromPattern(
    @Path() gatewayId: string,
    @Body() body: GatewayPatternConfigRequest,
    @Request() request: any
  ): Promise<any> {
    // always inject the gatewayId as a parameter
    body.parameters.gateway_id = gatewayId;

    const ctx = this.keystone.createContext(request);

    return await GetConfigUsingPattern(ctx, body);
  }
}
