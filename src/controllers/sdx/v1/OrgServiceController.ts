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
  Delete,
  Query,
} from 'tsoa';
import { assertEqual } from '../../ioc/assert';
import { KeystoneService } from '../../ioc/keystoneInjector';
import { inject, injectable } from 'tsyringe';
import { ServiceCatalogEntry } from './types';
import { BatchResult } from '../../../batch/types';
import {
  deleteRecordByInternalId,
  getRecordById,
  syncRecordsThrowErrors,
} from '../../../batch/feed-worker';
import {
  LoadOpenAPISpec,
  OpenAPISpecInput,
} from '../../../services/workflow/openapi-spec-loader';
import {
  GetCatalog,
  GetCatalogById,
} from '../../../services/gateway-patterns/catalog';
import YAML from 'yaml';
import { OpenAPISpecService } from '../../../services/batch/oas-service';

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
   * > `Required Scope:` System.Manage
   */
  @Put()
  @OperationId('createOASService')
  @Security('jwt', ['System.Manage'])
  public async createOASService(
    @Path() org: string,
    @FormField() subsystem: string,
    @UploadedFile() configFile: Express.Multer.File,
    @Request() request: any
  ): Promise<BatchResult> {
    const context = this.keystone.createContext(request);

    const input: OpenAPISpecInput = {
      organization: org,
      subsystem,
      spec: configFile.buffer.toString('utf-8'),
      state: 'active',
    };

    const final = await LoadOpenAPISpec(context, input);

    const result = await syncRecordsThrowErrors(
      context,
      'OpenAPISpec',
      undefined,
      final
    );
    if (result.result === 'created') {
      const { name } = await getRecordById(context, 'OpenAPISpec', result.id!);
      result.refKey = name;
    }
    return result;
  }

  /**
   * Retrieve the list of oas-services associated with an organization
   * > `Required Scope:` System.Manage
   */
  @Get()
  @OperationId('listOrganizationOASServices')
  @Security('jwt', ['System.Manage'])
  public async listOrganizationServices(
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
   * > `Required Scope:` System.Manage
   */
  @Get('/{id}')
  @OperationId('getOrganizationOASService')
  @Security('jwt', ['System.Manage'])
  public async getOrganizationOASService(
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

    return entry;
  }

  /**
   * Retrieve the Service OpenAPI Specification in JSON format
   * > `Required Scope:` System.Manage
   */
  @Get('/{id}/oas-spec')
  @OperationId('getOrganizationServiceSpec')
  @Security('jwt', ['System.Manage'])
  public async getOrganizationServiceSpec(
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

  /**
   * Delete an OAS Service
   * > `Required Scope:` System.Manage
   *
   * @summary Delete an OAS Service
   * @param org
   * @param id
   * @param force
   * @param request
   * @example { force: false } body
   */
  @Delete('/{id}')
  @OperationId('deleteOrganizationOASService')
  @Security('jwt', ['System.Manage'])
  public async delete(
    @Path('id') id: string,
    @Query('force') force: boolean,
    @Request() request: any
  ): Promise<BatchResult> {
    const context = this.keystone.createContext(request, true);

    const spec = await new OpenAPISpecService().findOpenAPISpecByName(
      context,
      id
    );

    return await deleteRecordByInternalId(context, 'OpenAPISpec', spec.id);
  }
}
