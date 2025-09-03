import {
  Controller,
  Request,
  OperationId,
  Put,
  Path,
  Route,
  Security,
  Body,
  Get,
  Tags,
  FieldErrors,
  ValidateError,
  Delete,
} from 'tsoa';
import { KeystoneService } from '../ioc/keystoneInjector';
import { inject, injectable } from 'tsyringe';
import { BatchResult } from '../../batch/types';
import { Product } from './types';
import { getGwaProductEnvironment, revokeAllConsumerAccess } from '../../services/workflow';
import { getOrgNamespaces } from '../../services/workflow/get-namespaces';
import { getAccessRequestByNamespaceServiceAccess, getAccessRequestsByNamespace } from '../../services/keystone';
import { OrgAccessRequest, OrgAccessRequestCreateInput } from './types-extra';
import { OrgAccessRequestCreate } from '../../services/workflow/org-access-request';
import { Logger } from '../../logger';
import { gql } from 'graphql-request';
import { data } from 'msw/lib/types/context';
import { getAccessRequest } from '../../services/keystone/access-request';
import { assert } from 'console';

const logger = Logger('controllers.OrgAccessReq');

@injectable()
@Route('/organizations')
@Tags('API Directory (Administration)')
export class OrgAccessRequestsController extends Controller {
  private keystone: KeystoneService;
  constructor(@inject('KeystoneService') private _keystone: KeystoneService) {
    super();
    this.keystone = _keystone;
  }

  /**
   * Get Access Requests that are available by API for this organization
   * > `Required Scope:` Namespace.Assign
   *
   * @summary Get Organization Access Requests
   */
  @Get('/{org}/access_requests')
  @OperationId('organization-access-requests')
  @Security('jwt', ['Namespace.Assign'])
  public async getRequests(
    @Path() org: string,
    @Request() request: any
  ): Promise<OrgAccessRequest[]> {
    const ctx = this.keystone.createContext(request, true);

    const prodEnv = await getGwaProductEnvironment(ctx, false);

    const nsList = await getOrgNamespaces(org, prodEnv);

    const records = await getAccessRequestsByNamespace(ctx, nsList.map((n) => n.name));
    // return records
    //   .map((o) => removeEmpty(o))
    //   .map((o) => transformAllRefID(o, ['organization', 'organizationUnit']))
    //   .map((o) =>
    //     replaceKey(o, 'gatewayId', 'namespace')
    //   );
    return records as any
  }


  /** Delete Access Request
   * > `Required Scope:` Namespace.Assign
   */
  @Delete('/{org}/access_requests/{id}')
  @OperationId('organization-delete-access-request')
  @Security('jwt', ['Namespace.Assign'])
  public async deleteRequest( 
    @Path() org: string,
    @Path() id: string,
    @Request() request: any
  ): Promise<{}> {
    const ctx = this.keystone.createContext(request, true);

    const accessRequest = await getAccessRequest(ctx, id);

    const ns = accessRequest.productEnvironment.product.namespace;

    const revoke = await revokeAllConsumerAccess(ctx, ns, accessRequest.serviceAccess.id);
    logger.debug('Revoke Result %j', revoke);

    return {};
  }


  /**
   * Manage Access Requests for APIs that will appear on the API Directory
   * > `Required Scope:` Namespace.Assign
   *
   * @summary Manage Access Requests
   * @param ns
   * @param body
   * @param request
   */
  @Put('/{org}/access_requests')
  @OperationId('organization-put-access-requests')
  @Security('jwt', ['Namespace.Assign'])
  public async put(
    @Path() org: string,
    @Body() body: OrgAccessRequestCreateInput,
    @Request() request: any
  ): Promise<{id: string}> {

    body.org = org;

    const result = await this.keystone.executeGraphQL({
      context: this.keystone.createContext(request),
      query: createAccessRequest,
      variables: { data: body },
    });
    logger.debug('Result %j', result);
    if (result.errors) {
      const errors: FieldErrors = {};
      result.errors.forEach((err: any, ind: number) => {
        errors[`d${ind}`] = { message: err.message };
      });
      logger.error('%j', result);
      throw new ValidateError(errors, 'Unable to create Access Request');
    }
    return {
      id: result.data.orgAccessRequest.id,
    };

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

