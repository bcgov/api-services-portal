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
} from 'tsoa';
import { KeystoneService } from '../../ioc/keystoneInjector';
import { inject, injectable } from 'tsyringe';
import { SDXSubsystem, SubsystemInput } from './types';
import { BatchResult } from '../../../batch/types';
import { SubsystemService } from '../../../services/batch/subsystem';
import { Subsystem } from '../../../services/batch/types';

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
   */
  @Put()
  @OperationId('createSubsystem')
  @Security('jwt', [])
  public async createSubsystem(
    @Path() org: string,
    @Body() body: SubsystemInput,
    @Request() request: any
  ): Promise<BatchResult> {
    const ctx = this.keystone.createContext(request);

    let input: Subsystem = {};
    Object.assign(input, body);
    input['organization'] = org;

    return new SubsystemService().createSubsystem(ctx, input);
  }

  /**
   * Retrieve the list of subsystems associated with a gateway
   */
  @Get()
  @OperationId('listSubsystems')
  @Security('jwt', [])
  public async listSubsystems(
    @Path() org: string,
    @Request() request: any
  ): Promise<SDXSubsystem[]> {
    const ctx = this.keystone.createContext(request);
    return new SubsystemService().listSubsystemsByOrganization(ctx, org);
  }

  /**
   * A subsystem can be deleted if there are no services associated with it.
   *
   * @summary Delete a subsystem
   * @param org
   * @param name
   * @param request
   * @example { force: false } body
   */
  @Delete('/{name}')
  @OperationId('deleteSubsystem')
  @Security('jwt', [])
  public async delete(
    @Path() org: string,
    @Path() name: string,
    @Body() body: { force: boolean },
    @Request() request: any
  ): Promise<BatchResult> {
    const context = this.keystone.createContext(request, true);

    return new SubsystemService().deleteSubsystem(
      context,
      org,
      name,
      body.force
    );
  }

  // /**
  //  * Update subsystem's gateway permissions
  //  *
  //  * @summary Update subsystem gateway permissions
  //  * @param org
  //  * @param name
  //  * @param request
  //  */
  // @Put('/{name}/gateway')
  // @OperationId('updateSubsystemGatewayPermissions')
  // @Security('jwt', [])
  // public async updateGatewayPermissions(
  //   @Path() org: string,
  //   @Path() name: string,
  //   @Body() body: { runtimeGroup: string },
  //   @Request() request: any
  // ): Promise<{ gatewayId: string; displayName: string }> {
  //   const context = this.keystone.createContext(request, true);

  //   return new SubsystemService().createSubsystemGateway(
  //     context,
  //     org,
  //     name,
  //     body.runtimeGroup
  //   );
  // }
}
