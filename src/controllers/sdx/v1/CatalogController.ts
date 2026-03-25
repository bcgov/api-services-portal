import {
  Controller,
  Example,
  Get,
  OperationId,
  Path,
  Request,
  Response,
  Route,
  Security,
  SuccessResponse,
  Tags,
} from 'tsoa';
import { inject, injectable } from 'tsyringe';
import YAML from 'yaml';
import { removeEmpty, removeKeys } from '../../../batch/feed-worker';
import { SubsystemService } from '../../../services/batch/subsystem';
import {
  GetCatalog,
  GetCatalogByName,
  GetSubsystemEntryForSubsystem,
  ServiceCatalogEntry,
  SubsystemEntry,
} from '../../../services/gateway-patterns/catalog';
import {
  getOrganizationMemberDetails,
  getOrganizations,
} from '../../../services/keystone/organization';
import { KeystoneService } from '../../ioc/keystoneInjector';

interface MissingCredentialsJSON {
  code: 'credentials_required' | 'invalid_token';
  message:
    | 'No authorization token was found'
    | 'Missing authorization scope. (403)';
}

@injectable()
@Route('/catalog')
@Tags('Catalog')
export class CatalogController extends Controller {
  private keystone: KeystoneService;
  constructor(@inject('KeystoneService') private _keystone: KeystoneService) {
    super();
    this.keystone = _keystone;
  }

  @Get('/organizations')
  @OperationId('organization-list')
  public async listOrganizations(): Promise<any[]> {
    const orgs = await getOrganizations(this.keystone.sudo());
    return orgs
      .map((o) => ({
        name: o.name,
        title: o.title,
        description: o.description,
        member: getOrganizationMemberDetails(o.tags),
      }))
      .filter((o) => o.member !== undefined)
      .map((o) => removeEmpty(o));
  }

  /**
   *
   * @returns
   */
  @Get('/subsystems')
  @OperationId('subsystems-list')
  public async listSubsystems(): Promise<SubsystemEntry[]> {
    const ctx = this.keystone.sudo();
    const records = await new SubsystemService().listSubsystems(ctx);
    const result = await Promise.all(
      records.map(async (o) => GetSubsystemEntryForSubsystem(o))
    );
    return result
      .map((o) => removeEmpty(o))
      .map((o) => removeKeys(o, ['gateway']))
      .map((o) => o as SubsystemEntry);
  }

  /**
   * Retrieve a list of services available in the SDX service catalog.
   *
   * @summary List of services in catalog
   */
  @Get('/services')
  @OperationId('listServiceCatalog')
  @SuccessResponse('200', 'OK')
  @Example<ServiceCatalogEntry[]>([
    {
      name: 'LAB.MIN.CITZ.SAMPLE-API.v1',
      title: 'Sample OAS Service',
      version: '1.0.0',
      summary: 'A sample OpenAPI service',
      description:
        'This is a sample service defined by an OpenAPI specification.',
      subsystem: {
        name: 'SAMPLE-SUBSYS',
        description: 'A sample subsystem for demonstration purposes',
        clientId: 'LAB.MIN.CITZ.SAMPLE-SUBSYS',
        organization: {
          name: 'sample-organization',
        },
        member: {
          memberClass: 'MIN',
          memberId: 'CITZ',
        },
      },
      operations: [
        {
          method: 'GET',
          path: '/users',
          operationId: 'getUsers',
          summary: 'Retrieve a list of users',
          scopes: ['users.read'],
        },
      ],
    },
  ])
  @Response<MissingCredentialsJSON>(401, 'Unauthorized', {
    code: 'credentials_required',
    message: 'No authorization token was found',
  })
  public async listCatalog(): Promise<ServiceCatalogEntry[]> {
    const ctx = this.keystone.sudo();
    const result = await GetCatalog(ctx);
    result.map((o) => removeKeys(o, ['gateway']));
    return result;
  }

  /**
   * Retrieve details for a specific service in the catalog by name.
   *
   * @summary Retrieve details for a service
   * @param name - Service name
   */
  @Get('/services/{name}')
  @OperationId('getOASService')
  @Security('jwt', [])
  public async getOASService(
    @Path('name') name: string,
    @Request() request: any
  ): Promise<ServiceCatalogEntry> {
    const ctx = this.keystone.createContext(request);
    return await GetCatalogByName(ctx, name, false);
  }

  /**
   * Retrieve the Service OpenAPI Specification in JSON format
   *
   * @summary Retrieve a Service OpenAPI Specification in JSON format
   * @param name - Service name
   */
  @Get('/services/{name}/oas-spec')
  @OperationId('getOASServiceSpec')
  public async getOASServiceSpec(
    @Path('name') name: string,
    @Request() request: any
  ): Promise<any> {
    const ctx = this.keystone.sudo();
    const entry = await GetCatalogByName(ctx, name, true);
    return YAML.parse(entry.spec);
  }
}
