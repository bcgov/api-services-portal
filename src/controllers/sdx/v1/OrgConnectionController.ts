import {
  Body,
  Controller,
  Delete,
  Get,
  OperationId,
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
  removeEmpty,
  removeKeys,
  transformAllRefID,
} from '../../../batch/feed-worker';
import { assertEqual } from '../../ioc/assert';
import { ConnectionService } from '../../../services/batch/connection-service';

@injectable()
@Route('/organizations/{org}/connections')
@Tags('Connections')
export class OrgConnectionController extends Controller {
  private keystone: KeystoneService;

  constructor(@inject('KeystoneService') private _keystone: KeystoneService) {
    super();
    this.keystone = _keystone;
  }

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
      .map((o) =>
        transformAllRefID(o, ['clientOrganization', 'serviceOrganization'])
      )
      .map((o) => removeKeys(o, ['slug']));
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
    const connection = await service.getConnectionById(ctx, id);
    const organizationMemberId = org.split('-').pop();

    assertEqual(
      connection.clientId.includes(`.${organizationMemberId}.`) ||
        connection.serviceId.includes(`.${organizationMemberId}.`),
      true,
      'organization',
      'Not authorized to access this connection request'
    );

    return await service.deleteConnection(ctx, id);
  }
}