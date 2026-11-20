import {
  Body,
  Controller,
  Delete,
  Get,
  OperationId,
  Patch,
  Path,
  Post,
  Put,
  Query,
  Request,
  Route,
  Security,
  Tags,
} from '@tsoa/runtime';
import { inject, injectable } from 'tsyringe';
import { BatchResult } from '../../../batch/types';
import { ConnectionRequest } from '../../../services/batch/types';
import { KeystoneService } from '../../ioc/keystoneInjector';
import {
  ConnectionApprovalInput,
  ConnectionLifecycleActionInput,
  ConnectionRequestInput,
} from './types';
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

const logger = Logger('controller.org-connection');
const {
  lifecycleActionAvailability,
} = require('../../../services/batch/connection-lifecycle');

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
   * Approve a connection request (`isApproved: true`). Pass `isActive: true`
   * to approve and activate an initial request in the same update. For an
   * approved connection with proposed changes, true promotes the proposal and
   * false discards it while preserving the approved connection and runtime state.
   *
   * To reject an initial pending request, delete it with
   * `DELETE /organizations/{org}/connections/{id}`. Use the lifecycle endpoint
   * to revoke an approved connection.
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
    @Body() input: ConnectionApprovalInput,
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
    let proposal: Record<string, unknown> = {};
    try {
      proposal =
        typeof existing.proposedConfiguration === 'string'
          ? JSON.parse(existing.proposedConfiguration || '{}')
          : existing.proposedConfiguration || {};
    } catch {
      proposal = {};
    }
    if (existing.isApproved && Object.keys(proposal).length > 0) {
      return connectionService.decideProposedConfiguration(
        ctx,
        org,
        input.clientId,
        input.serviceId,
        input.isApproved === true
      );
    }
    assertEqual(
      input.isApproved === false && !existing.isApproved,
      false,
      'isApproved',
      'A pending connection request is rejected by deleting it (DELETE /organizations/{org}/connections/{id})'
    );
    assertEqual(
      input.isApproved === false && existing.isApproved,
      false,
      'isApproved',
      'Use Revoke to permanently remove an approved connection'
    );

    const data: ConnectionRequestInput = {
      clientId: input.clientId,
      serviceId: input.serviceId,
      isApproved: input.isApproved,
    };
    // Preserve explicit false and omit absent values when approving.
    if (typeof input.isActive === 'boolean') {
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
   * `provisionerStatus` describes the current provisioning or deprovisioning operation.
   * Use the lifecycle endpoint for explicit Activate, Deactivate, Retry, and Revoke actions.
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
          'proposedConfiguration',
          'lifecycleIntent',
          'provisionerStatus',
        ])
      )
      .map((o) =>
        transformAllRefID(o, ['clientOrganization', 'serviceOrganization'])
      )
      .map((o) => ({
        ...o,
        lifecycleActions: lifecycleActionAvailability(o),
      }));
  }

  /**
   * Run an explicit connection lifecycle action.
   *
   * Activate provisions the approved configuration. Deactivate removes runtime
   * access while retaining approval. Retry resumes the failed operation. Use
   * `DELETE /organizations/{org}/connections/{id}?action=revoke` to revoke access.
   *
   * > `Required Scope:` System.Manage, Subsystem.Manage, or Connection.Manage
   */
  @Post('/{id}/lifecycle')
  @OperationId('runConnectionLifecycleAction')
  @Security('jwt', ['System.Manage', 'Subsystem.Manage', 'Connection.Manage'])
  public async runConnectionLifecycleAction(
    @Path() org: string,
    @Path('id') id: string,
    @Body() input: ConnectionLifecycleActionInput,
    @Request() request: any
  ): Promise<BatchResult> {
    const ctx = this.keystone.createContext(request, true);
    return await new ConnectionService().lifecycleConnection(
      ctx,
      org,
      id,
      input
    );
  }

  /**
   * Delete a pending connection request, or revoke an approved connection when
   * `action=revoke`. Revoke removes access and deletes the record only after
   * cleanup is verified; repeating it resumes or confirms a completed revoke.
   *
   * > `Required Scope:` System.Manage, Subsystem.Manage, or Connection.Manage
   */
  @Delete('/{id}')
  @OperationId('deleteConnection')
  @Security('jwt', ['System.Manage', 'Subsystem.Manage', 'Connection.Manage'])
  public async deleteConnection(
    @Path() org: string,
    @Path('id') id: string,
    @Request() request: any,
    @Query() action?: 'revoke'
  ): Promise<BatchResult> {
    const ctx = this.keystone.createContext(request, true);
    const service = new ConnectionService();

    return action === 'revoke'
      ? await service.revokeConnection(ctx, org, id)
      : await service.deleteConnection(ctx, org, id);
  }
}
