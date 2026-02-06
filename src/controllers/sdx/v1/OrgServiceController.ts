import {
  Controller,
  Delete,
  FormField,
  Get,
  OperationId,
  Path,
  Put,
  Request,
  Route,
  Security,
  Tags,
  UploadedFile,
} from 'tsoa';
import { inject, injectable } from 'tsyringe';
import YAML from 'yaml';
import {
  deleteRecordByInternalId,
  getRecordById,
  syncRecordsThrowErrors,
} from '../../../batch/feed-worker';
import { BatchResult } from '../../../batch/types';
import { OpenAPISpecService } from '../../../services/batch/oas-service';
import {
  GetCatalog,
  GetCatalogByName,
  ServiceCatalogEntry,
} from '../../../services/gateway-patterns/catalog';
import {
  LoadOpenAPISpec,
  OpenAPISpecInput,
} from '../../../services/workflow/openapi-spec-loader';
import { assertEqual } from '../../ioc/assert';
import { KeystoneService } from '../../ioc/keystoneInjector';

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
   * Retrieve an oas-service associated with an organization
   * > `Required Scope:` System.Manage
   */
  @Get('/{name}')
  @OperationId('getOrganizationOASService')
  @Security('jwt', ['System.Manage'])
  public async getOrganizationOASService(
    @Path() org: string,
    @Path('name') name: string,
    @Request() request: any
  ): Promise<ServiceCatalogEntry> {
    const ctx = this.keystone.createContext(request);

    const entry = await GetCatalogByName(ctx, name, false);
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
  @Get('/{name}/oas-spec')
  @OperationId('getOrganizationServiceSpec')
  @Security('jwt', ['System.Manage'])
  public async getOrganizationServiceSpec(
    @Path() org: string,
    @Path('name') name: string,
    @Request() request: any
  ): Promise<any> {
    const ctx = this.keystone.createContext(request);

    const entry = await GetCatalogByName(ctx, name, true);

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
   * @param name
   * @param request
   * @example { force: false } body
   */
  @Delete('/{name}')
  @OperationId('deleteOrganizationOASService')
  @Security('jwt', ['System.Manage'])
  public async delete(
    @Path() org: string,
    @Path('name') name: string,
    @Request() request: any
  ): Promise<BatchResult> {
    const context = this.keystone.createContext(request, true);

    const entry = await new OpenAPISpecService().findOpenAPISpecByName(
      context,
      name
    );
    assertEqual(
      entry && entry.subsystem.organization.name === org,
      true,
      'organization',
      'Not authorized to access this service'
    );

    return await deleteRecordByInternalId(context, 'OpenAPISpec', entry.id);
  }
}
