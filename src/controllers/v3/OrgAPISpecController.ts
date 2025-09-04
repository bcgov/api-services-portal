import {
  Controller,
  Request,
  OperationId,
  Put,
  Path,
  Route,
  Security,
  Body,
  Tags,
  Get,
} from 'tsoa';
import { KeystoneService } from '../ioc/keystoneInjector';
import { inject, injectable } from 'tsyringe';
import { OrgAPISpecCreateInput } from './types-extra';
import { Logger } from '../../logger';
import { gql } from 'graphql-request';
import { UpdateAPISpec, GetAPISpecsByOrg } from '../../services/workflow/api-specs';

const logger = Logger('controllers.OrgAPISpec');

@injectable()
@Route('/organizations')
@Tags('Organizations')
export class OrgAPISpecController extends Controller {
  private keystone: KeystoneService;
  constructor(@inject('KeystoneService') private _keystone: KeystoneService) {
    super();
    this.keystone = _keystone;
  }

  /**
   * Update API Specification for a Product Environment
   * > `Required Scope:` Namespace.Assign
   *
   * @summary Manage Access Requests
   * @param ns
   * @param body
   * @param request
   */
  @Put('/{org}/api_specs')
  @OperationId('organization-put-access-requests')
  @Security('jwt', ['Namespace.Assign'])
  public async put(
    @Path() org: string,
    @Body() body: OrgAPISpecCreateInput,
    @Request() request: any
  ): Promise<{ id: string }> {
    const ctx = await this.keystone.createContextithUser(request, true);

    const result = await UpdateAPISpec(ctx, body.specUrl, body.productEnvAppId);
    logger.debug('OrgAPISpecController: %j', result);
    return { id: result.id };
  }

  @Get('/{org}/api_specs')
  @OperationId('organization-get-api-specs')
  @Security('jwt', ['Namespace.Assign'])
  public async get(
    @Path() org: string,
    @Request() request: any
  ): Promise<{ prodEnvId: string; spec: string }> {
    const ctx = await this.keystone.createContextithUser(request, true);
    const result = await GetAPISpecsByOrg(ctx, org);
    logger.debug('OrgAPISpecController: %j', result);
    return result;
  }
}
