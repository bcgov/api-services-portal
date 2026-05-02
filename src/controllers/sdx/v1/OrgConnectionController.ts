import {
  Body,
  Controller,
  Delete,
  Get,
  OperationId,
  Path,
  Put,
  Query,
  Request,
  Route,
  Security,
  Tags,
} from 'tsoa';
import { inject, injectable } from 'tsyringe';
import { BatchResult } from '../../../batch/types';
import { SubsystemService } from '../../../services/batch/subsystem';
import { ConnectionRequest, Subsystem } from '../../../services/batch/types';
import {
  EnrichWithRuntimeGroup,
  GetSubsystemEntryForSubsystem,
  SubsystemEntry,
} from '../../../services/gateway-patterns/catalog';
import { CreateNamespaceForSubsystem } from '../../../services/workflow/create-namespace-sdx';
import { assertEqual } from '../../ioc/assert';
import { KeystoneService } from '../../ioc/keystoneInjector';
import { ConnectionRequestInput, SubsystemInput } from './types';
import {
  removeEmpty,
  removeKeys,
  replaceKey,
  transformAllRefID,
} from '../../../batch/feed-worker';
import { getRoutePathPrefix } from '../../../services/utils';
import {
  ConnectionRequestUpdateParams,
  ConnectionService,
} from '../../../services/batch/connection-service';
import { Logger } from '../../../logger';
import { OpenAPISpecService } from '../../../services/batch/oas-service';

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
}
