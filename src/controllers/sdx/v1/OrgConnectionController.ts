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
import {
  ConnectionClientGrant,
  ConnectionRequest,
} from '../../../services/batch/types';
import {
  ConnectionClientGrantApprovalInput,
  ConnectionClientGrantInput,
} from '../../../services/batch/connection-client-grant-types';
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
import { assertEqual, assertIsDefined } from '../../ioc/assert';
import {
  getGwaProductEnvironment,
  getPermittedNamespaceNames,
  injectResSvrAccessTokenToContext,
} from '../../../services/workflow';
import { ConnectionClientGrantService } from '../../../services/batch/connection-client-grant-service';

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

    const connectionService = new ConnectionService();

    // For R0 policy, the requester is the user who created the request
    const existing = await connectionService.findConnection(
      ctx.createContext({ skipAccessControl: true }),
      input.clientId,
      input.serviceId
    );

    return connectionService.upsertConnection(
      ctx,
      org,
      connectionService.applyR0Requester(input, existing, request.user)
    );
  }

  /**
   * Approve a connection request (`isApproved: true`), or withdraw the approval of an
   * approved connection (`isApproved: false`).
   *
   * To reject a pending request, delete it with
   * `DELETE /organizations/{org}/connections/{id}`.
   *
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
    const connectionService = new ConnectionService();

    // Approval only applies to an existing request; the upsert must not create one
    const existing = await connectionService.findConnection(
      ctx,
      input.clientId,
      input.serviceId
    );
    assertIsDefined(existing, 'clientId', 'Connection request not found');
    assertEqual(
      input.isApproved === false && !existing.isApproved,
      false,
      'isApproved',
      'A pending connection request is rejected by deleting it (DELETE /organizations/{org}/connections/{id})'
    );

    const data: ConnectionRequestInput = {
      clientId: input.clientId,
      serviceId: input.serviceId,
      isApproved: input.isApproved,
    };
    if (input.isActive !== null) {
      data['isActive'] = input.isActive;
    }

    return connectionService.upsertConnection(ctx, org, data);
  }

  /**
   * List connection requests for the specified organization.
   *
   * Callers with org-wide `System.Manage` see every connection touching the org. Callers who
   * only hold `Connection.Manage` and/or `Subsystem.Manage` (no `System.Manage`) instead see
   * only connections for services belonging to the subsystem gateways they've been granted
   * either of those scopes on.
   *
   * `provisionerStatus` describes the most recent provisioning attempt. Deactivating a
   * connection does not overwrite that history; use `isActive` as the authoritative current
   * lifecycle state.
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
   * List the OAuth-client scope grants associated with a shared connection.
   *
   * > `Required Scope:` System.Manage, Connection.Manage, or Subsystem.Manage
   */
  @Get('/{connectionId}/grants')
  @OperationId('listConnectionClientGrants')
  @Security('jwt', ['System.Manage', 'Connection.Manage', 'Subsystem.Manage'])
  public async listConnectionClientGrants(
    @Path() org: string,
    @Path() connectionId: string,
    @Request() request: any
  ): Promise<ConnectionClientGrant[]> {
    const ctx = this.keystone.createContext(request, true);
    return await new ConnectionClientGrantService().listGrants(
      ctx,
      org,
      connectionId
    );
  }

  /**
   * Retrieve one OAuth-client scope grant from a shared connection.
   *
   * > `Required Scope:` System.Manage, Connection.Manage, or Subsystem.Manage
   */
  @Get('/{connectionId}/grants/{grantId}')
  @OperationId('getConnectionClientGrant')
  @Security('jwt', ['System.Manage', 'Connection.Manage', 'Subsystem.Manage'])
  public async getConnectionClientGrant(
    @Path() org: string,
    @Path() connectionId: string,
    @Path() grantId: string,
    @Request() request: any
  ): Promise<ConnectionClientGrant> {
    const ctx = this.keystone.createContext(request, true);
    return await new ConnectionClientGrantService().getGrant(
      ctx,
      org,
      connectionId,
      grantId
    );
  }

  /**
   * Create or update the requested scopes for one CSS integration and OAuth
   * client. Changing the scope set always returns the grant to pending.
   *
   * > `Required Scope:` System.Manage or Subsystem.Manage
   */
  @Put('/{connectionId}/grants')
  @OperationId('upsertConnectionClientGrant')
  @Security('jwt', ['System.Manage', 'Subsystem.Manage'])
  public async upsertConnectionClientGrant(
    @Path() org: string,
    @Path() connectionId: string,
    @Body() input: ConnectionClientGrantInput,
    @Request() request: any
  ): Promise<BatchResult> {
    const ctx = this.keystone.createContext(request, true);
    return await new ConnectionClientGrantService().upsertGrant(
      ctx,
      org,
      connectionId,
      input
    );
  }

  /**
   * Approve or reject one OAuth-client scope grant without changing the
   * shared subsystem-to-service connection approval.
   *
   * > `Required Scope:` Connection.Manage
   */
  @Put('/{connectionId}/grants/{grantId}/approval')
  @OperationId('updateConnectionClientGrantApproval')
  @Security('jwt', ['Connection.Manage'])
  public async updateConnectionClientGrantApproval(
    @Path() org: string,
    @Path() connectionId: string,
    @Path() grantId: string,
    @Body() input: ConnectionClientGrantApprovalInput,
    @Request() request: any
  ): Promise<BatchResult> {
    const ctx = this.keystone.createContext(request, true);
    return await new ConnectionClientGrantService().updateGrantApproval(
      ctx,
      org,
      connectionId,
      grantId,
      input.status
    );
  }

  /**
   * Delete a connection request
   * > `Required Scope:` System.Manage, Subsystem.Manage, or Connection.Manage
   *
   * @param org
   * @param id
   * @param request
   * @returns
   */
  @Delete('/{id}')
  @OperationId('deleteConnection')
  @Security('jwt', ['System.Manage', 'Subsystem.Manage', 'Connection.Manage'])
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
