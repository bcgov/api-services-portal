import {
  Controller,
  Request,
  OperationId,
  Get,
  Put,
  Path,
  Route,
  Security,
  Body,
  Tags,
  Delete,
  Query,
} from 'tsoa';
import { KeystoneService } from '../../ioc/keystoneInjector';
import { inject, injectable } from 'tsyringe';
import { SubsystemInput } from './types';
import { BatchResult } from '../../../batch/types';
import { SubsystemService } from '../../../services/batch/subsystem';
import { Subsystem } from '../../../services/batch/types';
import { CreateNamespaceForSubsystem } from '../../../services/workflow/create-namespace-sdx';
import { GetServiceClient } from '../../../services/gateway-patterns/catalog';
import { assertEqual } from '../../ioc/assert';

@injectable()
@Route('/organizations/{org}/subsystems')
@Tags('Subsystems')
export class OrgSubsystemController extends Controller {
  private keystone: KeystoneService;
  constructor(@inject('KeystoneService') private _keystone: KeystoneService) {
    super();
    this.keystone = _keystone;
  }

  /**
   * Create a new subsystem of an organization
   * > `Required Scope:` System.Manage
   */
  @Put()
  @OperationId('createSubsystem')
  @Security('jwt', ['System.Manage'])
  public async createSubsystem(
    @Path() org: string,
    @Body() body: SubsystemInput,
    @Request() request: any
  ): Promise<BatchResult> {
    const ctx = this.keystone.createContext(request);

    let input: Subsystem = {};
    Object.assign(input, body);
    input['organization'] = org;

    return new SubsystemService().upsertSubsystem(ctx, input);
  }

  /**
   * Retrieve the list of subsystems associated with a gateway
   * > `Required Scope:` System.Manage
   */
  @Get()
  @OperationId('listSubsystems')
  @Security('jwt', ['System.Manage'])
  public async listSubsystems(
    @Path() org: string,
    @Request() request: any
  ): Promise<Subsystem[]> {
    const ctx = this.keystone.createContext(request);
    return new SubsystemService().listSubsystemsByOrganization(ctx, org);
  }

  /**
   * A subsystem can be deleted if there are no services associated with it.
   * > `Required Scope:` System.Manage
   *
   * @summary Delete a subsystem
   * @param org
   * @param name
   * @param request
   * @example { force: false } body
   */
  @Delete('/{name}')
  @OperationId('deleteSubsystem')
  @Security('jwt', ['System.Manage'])
  public async delete(
    @Path() org: string,
    @Path() name: string,
    @Query('force') force: boolean,
    @Request() request: any
  ): Promise<BatchResult> {
    const context = this.keystone.createContext(request, true);

    return new SubsystemService().deleteSubsystem(context, org, name, force);
  }

  @Put('/{name}/gateway')
  @OperationId('registerSubsystemOnRuntimeGroup')
  @Security('jwt', ['System.Manage'])
  public async registerSubsystem(
    @Path() org: string,
    @Path() name: string,
    @Body() body: { runtimeGroupName: string },
    @Request() request: any
  ): Promise<{ gatewayId: string }> {
    const context = this.keystone.createContext(request, true);

    const client = await GetServiceClient(context, org, name);

    const result = await CreateNamespaceForSubsystem(context, {
      subsystem: client.subsystem,
      runtimeGroupName: body.runtimeGroupName,
    });

    assertEqual(
      client.subsystem.gateway.id === result.name,
      true,
      'gatewayId',
      'Gateway ID mismatch after creation'
    );

    return { gatewayId: client.subsystem.gateway.id };
  }
}
