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
} from 'tsoa';
import { assertEqual } from '../../ioc/assert';
import { KeystoneService } from '../../ioc/keystoneInjector';
import { inject, injectable } from 'tsyringe';
import { ServiceCatalogEntry } from './types';
import { BatchResult } from '../../../batch/types';
import { syncRecordsThrowErrors } from '../../../batch/feed-worker';
import { LoadOpenAPISpec } from '../../../services/workflow/openapi-spec-loader';
import {
  GetCatalog,
  GetCatalogById,
} from '../../../services/gateway-patterns/catalog';
import { BackfillSubsystemDetails } from '../../../services/gateway-patterns/runtime-group';
import YAML from 'yaml';

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
  @OperationId('createOASService')
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
  @OperationId('listOASServices')
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
  @OperationId('getOASService')
  @Security('jwt', [])
  public async getOASService(
    @Path('id') id: string,
    @Path() org: string,
    @Request() request: any
  ): Promise<ServiceCatalogEntry> {
    const ctx = this.keystone.createContext(request);

    const entry = await GetCatalogById(ctx, id, false);
    assertEqual(
      entry && entry.subsystem.organization.name === org,
      true,
      'organization',
      'Not authorized to access this service'
    );

    return await BackfillSubsystemDetails(ctx, entry);
  }

  /**
   * Retrieve the Service OpenAPI Specification in JSON format
   */
  @Get('/{id}/oas-spec.json')
  @OperationId('getOASServiceSpec')
  @Security('jwt', [])
  public async getOASServiceSpec(
    @Path('id') id: string,
    @Path() org: string,
    @Request() request: any
  ): Promise<any> {
    const ctx = this.keystone.createContext(request);

    const entry = await GetCatalogById(ctx, id, true);

    assertEqual(
      entry && entry.subsystem.organization.name === org,
      true,
      'organization',
      'Not authorized to access this service'
    );

    return YAML.parse(entry.spec);
  }
}
