import {
  Body,
  Controller,
  OperationId,
  Path,
  Post,
  Put,
  Query,
  Request,
  Route,
  Security,
  Tags,
  SuccessResponse,
} from 'tsoa';
import { inject, injectable } from 'tsyringe';
import { KeystoneService } from '../ioc/keystoneInjector';
import { Logger } from '../../logger';
import {
  issueGatewayCredential,
  regenerateGatewayCredential,
} from '../../services/workflow';
import {
  GatewayConsumerCredential,
  IssueGatewayConsumerRequest,
} from './types-extra';
import { strict as assert } from 'assert';

const logger = Logger('controllers.GatewayConsumers');

@injectable()
@Route('/gateways/{gatewayId}/consumers')
@Tags('Gateway Consumers')
export class GatewayConsumersController extends Controller {
  private keystone: KeystoneService;
  constructor(@inject('KeystoneService') private _keystone: KeystoneService) {
    super();
    this.keystone = _keystone;
  }

  /**
   * Issue a new consumer credential for a product environment in this gateway.
   *
   * Creates Application (owner optional), Consumer and ServiceAccess records.
   * Applications can be reused across environments by passing `application.appId`.
   *
   * > `Required Scope:` CredentialIssuer.Generate
   *
   * @summary Issue consumer credential
   */
  @Post()
  @OperationId('issue-gateway-consumer')
  @SuccessResponse('201', 'Created')
  @Security('jwt', ['CredentialIssuer.Generate'])
  public async issue(
    @Path() gatewayId: string,
    @Body() body: IssueGatewayConsumerRequest,
    @Request() request: any
  ): Promise<GatewayConsumerCredential> {
    logger.debug('[issue] gateway=%s body=%j', gatewayId, body);

    const ctx = this.keystone.createContext(request, true);
    const credential = await issueGatewayCredential(ctx, gatewayId, {
      environmentAppId: body.environmentAppId,
      application: body.application || {},
      labels: body.labels,
      controls: body.controls as any,
    });

    this.setStatus(201);
    return credential;
  }

  /**
   * Regenerate credentials in place for an existing consumer (same clientId).
   *
   * Currently the only supported action is `regenerate`.
   * DELETE / revoke via API is a follow-up; revoke via the Consumers page for now.
   *
   * > `Required Scope:` CredentialIssuer.Generate
   *
   * @summary Regenerate consumer credential
   * @param action Must be `regenerate`
   */
  @Put('{clientId}')
  @OperationId('regenerate-gateway-consumer')
  @Security('jwt', ['CredentialIssuer.Generate'])
  public async regenerate(
    @Path() gatewayId: string,
    @Path() clientId: string,
    @Query() action: 'regenerate',
    @Request() request: any
  ): Promise<GatewayConsumerCredential> {
    assert.strictEqual(
      action,
      'regenerate',
      `Unsupported action '${action}'. Only 'regenerate' is supported.`
    );

    logger.debug(
      '[regenerate] gateway=%s clientId=%s action=%s',
      gatewayId,
      clientId,
      action
    );

    const ctx = this.keystone.createContext(request, true);
    return regenerateGatewayCredential(ctx, gatewayId, clientId);
  }
}
