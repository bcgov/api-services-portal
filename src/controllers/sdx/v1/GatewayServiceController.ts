import {
  Controller,
  Request,
  OperationId,
  Get,
  Put,
  Path,
  Route,
  Security,
  Tags,
  FormField,
  UploadedFile,
  SuccessResponse,
} from 'tsoa';
import { KeystoneService } from '../../ioc/keystoneInjector';
import { inject, injectable } from 'tsyringe';
import { ServiceCatalogEntry } from './types';
import { BatchResult } from '../../../batch/types';
import { syncRecordsThrowErrors } from '../../../batch/feed-worker';
import { LoadOpenAPISpec } from '../../../services/workflow/openapi-spec-loader';
import { GetCatalog } from '../../../services/gateway-patterns/catalog';
import { BackfillSubsystemDetails } from '../../../services/gateway-patterns/runtime-group';

@injectable()
@Route('/organizations/{org}/oas-services')
@Tags('Services')
export class GatewayServiceController extends Controller {
  private keystone: KeystoneService;
  constructor(@inject('KeystoneService') private _keystone: KeystoneService) {
    super();
    this.keystone = _keystone;
  }

  /**
   * Create a new service for an organization
   */
  @Put()
  @OperationId('create-oas-service')
  @Security('jwt', [])
  public async createOASService(
    @Path() org: string,
    @FormField() subsystem: string,
    @UploadedFile() configFile: Express.Multer.File,
    @Request() request: any
  ): Promise<BatchResult> {
    const context = this.keystone.createContext(request);

    const input: any = {};
    input['organization'] = org;
    input['subsystem'] = subsystem;
    input['spec'] = configFile.buffer.toString('utf-8');
    input['state'] = 'active';

    const final = await LoadOpenAPISpec(context, { ...input });

    return await syncRecordsThrowErrors(
      context,
      'OpenAPISpec',
      undefined,
      final
    );
  }

  /**
   * Retrieve the list of oas-services associated with an organization
   */
  @Get()
  @OperationId('list-gateway-oas-services')
  @Security('jwt', [])
  public async listOASServices(
    @Path() org: string,
    @Request() request: any
  ): Promise<ServiceCatalogEntry[]> {
    const ctx = this.keystone.createContext(request);

    const batchClause = {
      query: '$org: String',
      clause: '{ organization: { name: $org } }',
      variables: { org },
    };
    return await GetCatalog(ctx, false, batchClause);
  }

  /**
   * Retrieve an oas-services associated with an organization
   */
  @Get('/{id}')
  @OperationId('get-gateway-oas-service')
  @Security('jwt', [])
  public async getOASServices(
    @Path('id') id: string,
    @Path() org: string,
    @Request() request: any
  ): Promise<ServiceCatalogEntry> {
    const ctx = this.keystone.createContext(request);

    const batchClause = {
      query: '$id: String,$org: String',
      clause: '{ name: $id, organization: { name: $org } }',
      variables: { id, org },
    };
    const entry = await GetCatalog(ctx, false, batchClause);
    return await BackfillSubsystemDetails(ctx, entry[0]);
  }

  /**
   * Retrieve the Service OpenAPI Specification in YAML format
   */
  @Get('/{id}/oas-spec')
  @OperationId('get-gateway-oas-service-spec')
  @Security('jwt', [])
  public async getOASServiceSpec(
    @Path('id') id: string,
    @Path() org: string,
    @Request() request: any
  ): Promise<any> {
    const ctx = this.keystone.createContext(request);

    const batchClause = {
      query: '$id: String,$org: String',
      clause: '{ name: $id, organization: { name: $org } }',
      variables: { id, org },
    };
    const entry = await GetCatalog(ctx, true, batchClause);

    this.setHeader('Content-Type', 'application/yaml');
    return entry[0].spec;
  }
}
