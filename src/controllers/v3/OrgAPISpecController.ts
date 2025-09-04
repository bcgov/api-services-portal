import {
  Controller,
  Request,
  OperationId,
  Put,
  Path,
  Route,
  Security,
  Body, Tags
} from 'tsoa';
import { KeystoneService } from '../ioc/keystoneInjector';
import { inject, injectable } from 'tsyringe';
import { OrgAPISpecCreateInput } from './types-extra';
import { Logger } from '../../logger';
import { gql } from 'graphql-request';
import UpdateAPISpec from '../../services/workflow/update-api-spec';

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
  ): Promise<{id: string}> {
    const ctx = await this.keystone.createContextithUser(request, true);

    return await UpdateAPISpec(ctx, body.specUrl, body.productEnvAppId);
  }  
}

const createAccessRequest = gql`
  mutation OrgAccessRequestCreate ($data: OrgAccessRequestCreateInput) {
    orgCreateAccessRequest (data: $data) {
      application {
        appId
      }
      accessRequest {
        id
      }
    }
  }
`;

