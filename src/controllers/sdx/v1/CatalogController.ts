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
  IServiceCatalogEntry,
} from '../../../services/gateway-patterns/catalog';

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
  @OperationId('list-service-catalog')
  @Security('jwt', [])
  @SuccessResponse('200', 'OK')
  @Example<IServiceCatalogEntry[]>([
    {
      id: 'oas-service-123',
      title: 'Sample OAS Service',
      version: '1.0.0',
      summary: 'A sample OpenAPI service',
      description:
        'This is a sample service defined by an OpenAPI specification.',
      subsystem: {
        name: 'sample-subsystem',
        organization: {
          name: 'sample-organization',
        },
      },
      state: 'active',
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
  ): Promise<IServiceCatalogEntry[]> {
    const ctx = this.keystone.createContext(request);
    return await GetCatalog(ctx);
  }

  /**
   * Retrieve the Service Details
   */
  @Get('/services/{id}')
  @OperationId('get-oas-service')
  @Security('jwt', [])
  public async getOASService(
    @Path('id') id: string,
    @Request() request: any
  ): Promise<any> {
    const ctx = this.keystone.createContext(request);

    const batchClause = {
      query: '$id: String',
      clause: '{ name: $id }',
      variables: { id },
    };
    const entry = await GetCatalog(ctx, false, batchClause);
    return entry[0];
  }

  /**
   * Retrieve the Service OpenAPI Specification in YAML format
   */
  @Get('/services/{id}/oas-spec')
  @OperationId('get-oas-service-spec')
  @Security('jwt', [])
  public async getOASServiceSpec(
    @Path('id') id: string,
    @Request() request: any
  ): Promise<any> {
    const ctx = this.keystone.createContext(request);

    const batchClause = {
      query: '$id: String',
      clause: '{ name: $id }',
      variables: { id },
    };
    const entry = await GetCatalog(ctx, true, batchClause);

    this.setHeader('Content-Type', 'application/yaml');
    return entry[0].spec;
  }
}
