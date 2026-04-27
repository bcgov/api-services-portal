import {
  Body,
  Controller,
  Delete,
  FormField,
  Get,
  OperationId,
  Path,
  Put,
  Query,
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
import { Logger } from '../../../logger';
import { ExpressRequest } from './types';

const logger = Logger('controller.gateway-service');

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
   * Creates or updates an OAS service for the specified organization.
   * The OAS service is defined by an OpenAPI specification file uploaded as part of the request.
   *
   * This endpoint processes the specification, creates necessary configurations, and registers
   * the service within the SDX environment.
   *
   * > `Required Scope:` System.Manage
   *
   * @summary Create or update an OAS service
   *
   * @param org - Organization identifier
   * @param subsystem - Subsystem name under which the service will be categorized
   * @param request - HTTP request object for context creation
   */
  @Put()
  @OperationId('createOASService')
  @Security('jwt', ['System.Manage'])
  public async createOASService(
    @Path() org: string,
    @Query() subsystem: string,
    @Body() body: any,
    @Request() request: ExpressRequest & { rawBody: Buffer }
  ): Promise<BatchResult> {
    const context = this.keystone.createContext(request);

    const rawBody = request.rawBody?.toString('utf-8') || '';

    logger.debug(
      `Received request to create/update OAS service for org ${org} and subsystem ${subsystem}`
    );
    logger.debug(
      'Raw request body (size %s) (truncated to 100 chars): %s',
      rawBody.length,
      rawBody.substring(0, 100)
    );

    const input: OpenAPISpecInput = {
      organization: org,
      subsystem,
      spec: rawBody,
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
   * Retrieves a list of OAS services associated with the specified organization. Each service entry includes
   * details such as its name, title, version, summary, description, and associated subsystem information.
   *
   * > `Required Scope:` System.Manage
   *
   * @summary Retrieve a list of OAS services
   * @param org - Organization identifier
   * @param request - HTTP request object for context creation
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
   * Retrieves the details of a specific OAS service associated with the specified organization.
   *
   * > `Required Scope:` System.Manage
   *
   * @summary Retrieve an OAS service
   * @param org - Organization identifier
   * @param name - OAS service name
   * @param request - HTTP request object for context creation
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
   * Retrieves the OpenAPI specification of a specific OAS service in JSON format. This allows clients to
   * obtain the full specification details for a service, which can be used for various purposes such as
   * client generation, documentation, or analysis.
   *
   * > `Required Scope:` System.Manage
   *
   * @summary Retrieve a Service OpenAPI Specification in JSON format
   * @param org - Organization identifier
   * @param name - OAS service name
   * @param request - HTTP request object for context creation
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
   * > `Required Scope:` System.Manage
   *
   * @summary Delete an OAS service
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
