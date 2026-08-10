import {
  Body,
  Controller,
  Delete,
  Get,
  OperationId,
  Path,
  Put,
  Query,
  Request,
  Route,
  Security,
  Tags
} from 'tsoa';
import { inject, injectable } from 'tsyringe';
import YAML from 'yaml';
import {
  getRecordById,
  syncRecordsThrowErrors,
} from '../../../batch/feed-worker';
import { BatchResult } from '../../../batch/types';
import { Logger } from '../../../logger';
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
import {
  getGwaProductEnvironment,
  getPermittedNamespaceNames,
  injectResSvrAccessTokenToContext,
} from '../../../services/workflow';
import { assertEqual, assertIsDefined } from '../../ioc/assert';
import { KeystoneService } from '../../ioc/keystoneInjector';
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
   * > `Required Scope:` System.Manage or Subsystem.Manage
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
  @Security('jwt', ['Subsystem.Manage'])
  public async createOASService(
    @Path() org: string,
    @Query() subsystem: string,
    @Query() environment: string,
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

    assertEqual(
      rawBody.length > 0,
      true,
      'body',
      'No body content found in request'
    );

    const input: OpenAPISpecInput = {
      organization: org,
      subsystem,
      spec: rawBody,
      state: 'active',
      environment,
    };

    const final = await LoadOpenAPISpec(context, input);

    const result = await syncRecordsThrowErrors(
      context,
      'OpenAPISpec',
      undefined,
      final
    );
    if (result.result === 'created') {
      const { name: serviceName } = await getRecordById(
        context,
        'OpenAPISpec',
        result.id!
      );
      result.refKey = serviceName;
    }
    return result;
  }

  /**
   * Retrieves a list of OAS services associated with the specified organization. Each service entry includes
   * details such as its name, title, version, summary, description, and associated subsystem information.
   *
   * Callers with org-wide `System.Manage` see every service in the organization. Callers who
   * only hold `Subsystem.Manage` (no `System.Manage`) instead see only the services whose
   * gateway they've been granted `Subsystem.Manage` on.
   *
   * > `Required Scope:` System.Manage or Subsystem.Manage
   *
   * @summary Retrieve a list of OAS services
   * @param org - Organization identifier
   * @param request - HTTP request object for context creation
   */
  @Get()
  @OperationId('listOrganizationOASServices')
  @Security('jwt', ['System.Manage'])
  @Security('jwt', ['Subsystem.Manage'])
  public async listOrganizationServices(
    @Path() org: string,
    @Request() request: any
  ): Promise<ServiceCatalogEntry[]> {
    const ctx = this.keystone.createContext(request);

    const callerScopes = (request.oauth_user?.scope || '').split(' ');
    const hasOrgWideAccess = callerScopes.includes('System.Manage');

    if (hasOrgWideAccess) {
      const batchClause = {
        query: '$org: String',
        clause: '{ organization: { name: $org } }',
        variables: { org },
      };
      return await GetCatalog(ctx, false, batchClause);
    }

    const envCtx = await getGwaProductEnvironment(ctx, true);
    await injectResSvrAccessTokenToContext(envCtx);
    const namespaces = await getPermittedNamespaceNames(envCtx, [
      'Subsystem.Manage',
    ]);
    if (namespaces.length === 0) {
      return [];
    }

    const batchClause = {
      query: '$org: String, $namespaces: [String]',
      clause: '{ organization: { name: $org }, namespace_in: $namespaces }',
      variables: { org, namespaces },
    };
    return await GetCatalog(ctx, false, batchClause);
  }

  /**
   * Retrieves the details of a specific OAS service associated with the specified organization.
   *
   * > `Required Scope:` System.Manage or Subsystem.Manage
   *
   * @summary Retrieve an OAS service
   * @param org - Organization identifier
   * @param name - OAS service name
   * @param request - HTTP request object for context creation
   */
  @Get('/{name}')
  @OperationId('getOrganizationOASService')
  @Security('jwt', ['System.Manage'])
  @Security('jwt', ['Subsystem.Manage'])
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
   * > `Required Scope:` System.Manage or Subsystem.Manage
   *
   * @summary Retrieve a Service OpenAPI Specification in JSON format
   * @param org - Organization identifier
   * @param name - OAS service name
   * @param request - HTTP request object for context creation
   */
  @Get('/{name}/oas-spec')
  @OperationId('getOrganizationServiceSpec')
  @Security('jwt', ['System.Manage'])
  @Security('jwt', ['Subsystem.Manage'])
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

    assertIsDefined(
      entry.spec,
      'spec',
      'No OpenAPI specification found for this service'
    );
    return YAML.parse(entry.spec);
  }

  /**
   * Deletes an OAS service.  Must have no active connection requests.
   *
   * > `Required Scope:` System.Manage or Subsystem.Manage
   *
   * @summary Delete an OAS service
   * @param org - Organization identifier
   * @param name - OAS service name to delete
   * @param request - HTTP request object for context creation
   */
  @Delete('/{name}')
  @OperationId('deleteOrganizationOASService')
  @Security('jwt', ['System.Manage'])
  @Security('jwt', ['Subsystem.Manage'])
  public async delete(
    @Path() org: string,
    @Path('name') name: string,
    @Request() request: any
  ): Promise<BatchResult> {
    const context = this.keystone.createContext(request, true);
    const oasService = new OpenAPISpecService();
    const serviceSpec = await oasService.findOpenAPISpecByName(context, name);
    const result = await oasService.deleteOASService(
      context,
      org,
      name,
      serviceSpec
    );

    return result;
  }
}
