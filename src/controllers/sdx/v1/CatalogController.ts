import {
  Controller,
  Request,
  Response,
  OperationId,
  Get,
  Route,
  Security,
  Tags,
  Example,
  SuccessResponse,
  Path,
} from 'tsoa';
import { KeystoneService } from '../../ioc/keystoneInjector';
import { inject, injectable } from 'tsyringe';
import {
  GetCatalog,
  GetCatalogByName,
  ServiceCatalogEntry,
} from '../../../services/gateway-patterns/catalog';
import YAML from 'yaml';

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

  /**
   * Retrieve the list of services available in the SDX service catalog.
   */
  @Get('/services')
  @OperationId('listServiceCatalog')
  @Security('jwt', [])
  @SuccessResponse('200', 'OK')
  @Example<ServiceCatalogEntry[]>([
    {
      name: 'oas-service-123',
      title: 'Sample OAS Service',
      version: '1.0.0',
      summary: 'A sample OpenAPI service',
      description:
        'This is a sample service defined by an OpenAPI specification.',
      subsystem: {
        name: 'sample-subsystem',
        locator: 'LAB.GOV.123456789.sample-subsystem',
        organization: {
          name: 'sample-organization',
        },
        member: {
          memberClass: 'GOV',
          memberId: '123456789',
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
  public async listCatalog(
    @Request() request: any
  ): Promise<ServiceCatalogEntry[]> {
    const ctx = this.keystone.createContext(request);
    return await GetCatalog(ctx);
  }

  /**
   * Retrieve the Service Details
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
