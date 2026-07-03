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
   * > `Required Scope:` System.Manage
   *
   * @param org
   * @param input
   * @param request
   * @returns
   */
  @Put()
  @OperationId('upsertConnection')
  @Security('jwt', ['System.Manage'])
  public async upsertConnection(
    @Path() org: string,
    @Body() input: ConnectionRequestInput,
    @Request() request: any
  ): Promise<BatchResult> {
    const ctx = this.keystone.createContext(request);

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

    return new ConnectionService().upsertConnection(ctx, org, {
      clientId: input.clientId,
      serviceId: input.serviceId,
      isApproved: input.isApproved,
    });
  }

  @Get()
  @OperationId('listConnections')
  @Security('jwt', ['System.Manage'])
  public async listConnections(
    @Path() org: string,
    @Request() request: any
  ): Promise<ConnectionRequest[]> {
    const ctx = this.keystone.createContext(request);
    const records = await new ConnectionService().listConnectionsByOrganization(
      ctx,
      org
    );

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

  @Delete('/{id}')
  @OperationId('deleteConnection')
  @Security('jwt', ['System.Manage'])
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
