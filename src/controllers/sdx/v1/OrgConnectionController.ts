import {
  Body,
  Controller,
  Delete,
  Get,
  OperationId,
  Patch,
  Path,
  Put,
  Request,
  Route,
  Security,
  Tags,
} from 'tsoa';
import { inject, injectable } from 'tsyringe';
import { BatchResult } from '../../../batch/types';
import { ConnectionRequest } from '../../../services/batch/types';
import { KeystoneService } from '../../ioc/keystoneInjector';
import { ConnectionRequestInput } from './types';
import {
  parseJsonString,
  removeEmpty,
  removeKeys,
  transformAllRefID,
} from '../../../batch/feed-worker';
import { ConnectionService } from '../../../services/batch/connection-service';
import { Logger } from '../../../logger';
import {
  getGwaProductEnvironment,
  getPermittedNamespaceNames,
  injectResSvrAccessTokenToContext,
} from '../../../services/workflow';

const logger = Logger('controller.org-connection');

@injectable()
@Route('/organizations/{org}/connections')
@Tags('Connections')
export class OrgConnectionController extends Controller {
  private keystone: KeystoneService;

  constructor(@inject('KeystoneService') private _keystone: KeystoneService) {
    super();
    this.keystone = _keystone;
  }

  /**
   * Add or update a connection request
   * > `Required Scope:` System.Manage or Subsystem.Manage
   *
   * @param org
   * @param input
   * @param request
   * @returns
   */
  @Put()
  @OperationId('upsertConnection')
  @Security('jwt', ['System.Manage', 'Subsystem.Manage'])
  public async upsertConnection(
    @Path() org: string,
    @Body() input: ConnectionRequestInput,
    @Request() request: any
  ): Promise<BatchResult> {
    const ctx = this.keystone.createContext(request);

    // For R0 policy, force the requester details to be the user making this request
    if (input.policyVersion === 'SDX.R0.00' && input.requesterDetails) {
      input.requesterDetails.requester = {
        name: request.user.name,
        email: request.user.email,
      };
    }

    return new ConnectionService().upsertConnection(ctx, org, input);
  }

  /**
   * Update a connection request approval setting `isApproved`
   * > `Required Scope:` Connection.Manage
   *
   * @param org
   * @param input
   * @param request
   * @returns
   */
  @Put('/approval')
  @OperationId('updateConnectionApproval')
  @Security('jwt', ['Connection.Manage'])
  public async updateConnectionApproval(
    @Path() org: string,
    @Body() input: ConnectionRequestInput,
    @Request() request: any
  ): Promise<BatchResult> {
    const ctx = this.keystone.createContext(request, true);

    const data: ConnectionRequestInput = {
      clientId: input.clientId,
      serviceId: input.serviceId,
      isApproved: input.isApproved,
    };
    if (input.isActive !== null) {
      data['isActive'] = input.isActive;
    }

    return new ConnectionService().upsertConnection(ctx, org, data);
  }

  /**
   * List connection requests for the specified organization.
   *
   * Callers with org-wide `System.Manage` see every connection touching the org. Callers who
   * only hold `Connection.Manage` and/or `Subsystem.Manage` (no `System.Manage`) instead see
   * only connections for services belonging to the subsystem gateways they've been granted
   * either of those scopes on.
   *
   * > `Required Scope:` System.Manage, Connection.Manage, or Subsystem.Manage
   *
   * @param org
   * @param request
   * @returns
   */
  @Get()
  @OperationId('listConnections')
  @Security('jwt', ['System.Manage', 'Connection.Manage', 'Subsystem.Manage'])
  public async listConnections(
    @Path() org: string,
    @Request() request: any
  ): Promise<ConnectionRequest[]> {
    const ctx = this.keystone.createContext(request);
    const connectionService = new ConnectionService();

    const callerScopes = request.user.scope || [];
    const hasOrgWideAccess = callerScopes.includes('System.Manage');

    let records;
    if (hasOrgWideAccess) {
      records = await connectionService.listConnectionsByOrganization(ctx, org);
    } else {
      const envCtx = await getGwaProductEnvironment(ctx, true);
      await injectResSvrAccessTokenToContext(envCtx);
      const namespaces = await getPermittedNamespaceNames(envCtx, [
        'Connection.Manage',
        'Subsystem.Manage',
      ]);
      if (namespaces.length === 0) {
        return [];
      }
      records = await connectionService.listConnectionsByServiceNamespaces(
        ctx,
        org,
        namespaces
      );
    }

    return records
      .map((o) => removeEmpty(o))
      .map((o) => removeKeys(o, ['slug']))
      .map((o) =>
        parseJsonString(o, [
          'requesterDetails',
          'clientResources',
          'serviceResources',
          'provisionerStatus',
        ])
      )
      .map((o) =>
        transformAllRefID(o, ['clientOrganization', 'serviceOrganization'])
      );
  }

  /**
   * Delete a connection request
   * > `Required Scope:` System.Manage or Subsystem.Manage
   *
   * @param org
   * @param id
   * @param request
   * @returns
   */
  @Delete('/{id}')
  @OperationId('deleteConnection')
  @Security('jwt', ['System.Manage', 'Subsystem.Manage'])
  public async deleteConnection(
    @Path() org: string,
    @Path('id') id: string,
    @Request() request: any
  ): Promise<BatchResult> {
    const ctx = this.keystone.createContext(request, true);
    const service = new ConnectionService();

    return await service.deleteConnection(ctx, org, id);
  }
}
