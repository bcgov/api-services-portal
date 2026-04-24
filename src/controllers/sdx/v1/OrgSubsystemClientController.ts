import {
  Controller,
  Get,
  OperationId,
  Path,
  Request,
  Route,
  Security,
  Tags,
} from 'tsoa';
import { inject, injectable } from 'tsyringe';
import { SubsystemService } from '../../../services/batch/subsystem';
import {
  EnrichWithRuntimeGroup,
  GetSubsystemEntryForSubsystem,
  SubsystemEntry,
} from '../../../services/gateway-patterns/catalog';
import { KeystoneService } from '../../ioc/keystoneInjector';
import { getOrganization } from '../../../services/keystone/organization';
import { Logger } from '../../../logger';

const logger = Logger('controller.org-subsystem-client');

@injectable()
@Route('/organizations/{org}/clients')
@Tags('Subsystems')
export class OrgSubsystemClientController extends Controller {
  private keystone: KeystoneService;
  constructor(@inject('KeystoneService') private _keystone: KeystoneService) {
    super();
    this.keystone = _keystone;
  }

  /**
   * Retrieves the list of subsystems in a format suitable for catalog display.
   * Each subsystem entry includes details such as its name, associated gateway information,
   * and configuration settings.
   *
   * > `Required Scope:` System.Manage
   *
   * @summary Retrieve a list of subsystem clients
   *
   * @param org - Organization identifier
   * @param request - HTTP request object for context creation
   * @returns Promise resolving to an array of Subsystem objects
   */
  @Get()
  @OperationId('listSubsystemClients')
  @Security('jwt', ['System.Manage'])
  public async listSubsystemClients(
    @Path() org: string,
    @Request() request: any
  ): Promise<SubsystemEntry[]> {
    const ctx = this.keystone.createContext(request);

    const organization = await getOrganization(ctx, org);

    const subsystems =
      await new SubsystemService().listSubsystemsByOrganization(ctx, org);
    subsystems.forEach((subsystem) => {
      subsystem.organization = organization;
    });

    const subsystemEntries: SubsystemEntry[] = [];

    for (const subsystem of subsystems) {
      const subsystemEntry = GetSubsystemEntryForSubsystem(subsystem);

      await EnrichWithRuntimeGroup(ctx, subsystemEntry, true);
      if (subsystemEntry.runtimeGroup) {
        subsystemEntries.push(subsystemEntry);
      }
    }
    return subsystemEntries;
  }

  /**
   * Retrieves the details of a specific subsystem in a format suitable for catalog display.
   * This includes enriched information such as associated runtime group details and gateway information.
   *
   * > `Required Scope:` System.Manage
   *
   * @summary Retrieve a subsystem in catalog format
   * @param org - Organization identifier
   * @param name - Subsystem name
   * @param request - HTTP request object for context creation
   */
  @Get('/{name}')
  @OperationId('getSubsystemClient')
  @Security('jwt', ['System.Manage'])
  public async getSubsystemClient(
    @Path() org: string,
    @Path() name: string,
    @Request() request: any
  ): Promise<SubsystemEntry> {
    const context = this.keystone.createContext(request, true);

    const subsysService = new SubsystemService();
    const subsystem = await subsysService.findSubsystemByName(
      context,
      org,
      name
    );

    const subsystemEntry = GetSubsystemEntryForSubsystem(subsystem);

    await EnrichWithRuntimeGroup(context, subsystemEntry);

    return subsystemEntry;
  }
}
