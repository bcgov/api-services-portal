import {
  Body,
  Controller,
  Example,
  OperationId,
  Path,
  Put,
  Response,
  Request,
  Route,
  Security,
  SuccessResponse,
  Tags,
  Query,
} from 'tsoa';
import { inject, injectable } from 'tsyringe';
import { KeystoneService } from '../../ioc/keystoneInjector';
import { GetConfigUsingPattern } from '../../../services/gateway-patterns/evaluator';
import { CreateNamespaceForOrganization } from '../../../services/workflow/create-namespace-sdx';
import { GWAService } from '../../../services/gwaapi';
import YAML from 'js-yaml';
import getSubjectToken from '../../../auth/auth-token';
import { Logger } from '../../../logger';

const logger = Logger('OrgGatewaysController');

/**
 * @example {
 *   "pattern": "sdx-p2p-consumer.r1",
 *   "parameters": {
 *     "client_id": "LAB.MIN.FOOD.MY-UI",
 *     "service_id": "LAB.MIN.FOOD.CASE-MANAGEMENT.v1",
 *     "upstream_url": "httpbun.com"
 *   }
 * }
 */
interface GatewayPatternConfigRequest {
  pattern: string;
  parameters: { [key: string]: any };
}

interface UnauthorizedJSON {
  code: 'invalid_token';
  message: 'Missing authorization scope. (403)';
}

interface ValidateErrorJSON {
  code: 'validation_error';
  message: 'Invalid input';
  fields: { [name: string]: { message: string } };
}

@injectable()
@Route('/organizations/{org}')
@Tags('Gateways')
export class OrgGatewaysController extends Controller {
  private keystone: KeystoneService;
  constructor(@inject('KeystoneService') private _keystone: KeystoneService) {
    super();
    this.keystone = _keystone;
  }

  /**
   * Create a gateway for an organization.
   *
   * @summary Register a gateway for an organization
   *
   * @param org - Organization identifier
   * @param name - Runtime group name
   * @param request - HTTP request object for context creation
   */
  @Put('/gateway')
  @OperationId('registerOrganizationGateway')
  @Security('jwt', ['System.Manage'])
  public async registerOrganizationGateway(
    @Path() org: string,
    @Request() request: any
  ): Promise<{ gatewayId: string }> {
    // Create read-only Keystone context
    const context = this.keystone.createContext(request, true);

    // Create the namespace for the runtime group in the SDX edge environment
    const result = await CreateNamespaceForOrganization(context, {
      organization: org,
    });

    return { gatewayId: result.name };
  }
}
