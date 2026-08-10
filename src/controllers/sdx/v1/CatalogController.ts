import { assertAndRaiseValidateError } from '../../../services/gateway-patterns/evaluator';
import {
  Controller,
  Example,
  Get,
  OperationId,
  Path,
  Query,
  Request,
  Response,
  Route,
  SuccessResponse,
  Tags,
} from 'tsoa';
import { inject, injectable } from 'tsyringe';
import YAML from 'yaml';
import {
  parseBlobString,
  parseJsonString,
  removeEmpty,
  removeKeys,
} from '../../../batch/feed-worker';
import { getOrgActivity } from '../../../services/keystone/activity';
import { transformActivity } from '../../../services/workflow';
import { ActivityDetail } from '../../v3/types-extra';
import { SubsystemService } from '../../../services/batch/subsystem';
import {
  EnrichWithAccess,
  GetCatalog,
  GetCatalogByName,
  GetScopes,
  GetSubsystemEntryForSubsystem,
  ParseClientId,
  ResourceScopeEntry,
  ServiceCatalogEntry,
  SubsystemEntry,
} from '../../../services/gateway-patterns/catalog';
import {
  getOrganizationMemberDetails,
  getOrganizations,
} from '../../../services/keystone/organization';
import { KeystoneService } from '../../ioc/keystoneInjector';
import assert from 'assert';
import { ResourceScope } from '../../../services/workflow/openapi-spec-loader';

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
   * Retrieve public organization-level activity for the SDX catalog.
   *
   * @summary List public organization activity
   * @param organization Optional organization name filter
   * @param first Maximum records to return (capped at 100)
   * @param skip Records to skip for pagination
   */
  @Get('/activity')
  @OperationId('listPublicActivity')
  public async listOrgActivity(
    @Query() organization?: string,
    @Query() first: number = 20,
    @Query() skip: number = 0
  ): Promise<ActivityDetail[]> {
    const ctx = this.keystone.sudo();
    const records = await getOrgActivity(
      ctx,
      organization,
      first > 100 ? 100 : first,
      skip,
      true
    );

    return transformActivity(records)
      .map((o) => removeKeys(o, ['id', 'namespace', 'subject_email']))
      .map((o) => removeEmpty(o))
      .map((o) => parseJsonString(o, ['context']))
      .map((o) => parseBlobString(o));
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
        publicBodyId: o.publicBodyId,
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
  public async listSubsystems(
    @Query() integrationClientId?: string
  ): Promise<SubsystemEntry[]> {
    const ctx = this.keystone.sudo();
    let records;
    if (integrationClientId) {
      // lookup the subsystem using the client id
      const intg = await new SubsystemService().lookupSubsystemIntegration(
        ctx,
        integrationClientId
      );

      records = await new SubsystemService().listSubsystemsByIntegration(
        ctx,
        intg.id
      );
    } else {
      records = await new SubsystemService().listSubsystems(ctx);
    }
    const result = await Promise.all(
      records.map(async (o) => GetSubsystemEntryForSubsystem(o))
    );
    return result
      .map((o) => removeEmpty(o))
      .map((o) => removeKeys(o, ['gateway']))
      .map((o) => o as SubsystemEntry);
  }

  /**
   *
   * @returns
   */
  @Get('/subsystems/{name}')
  @OperationId('get-subsystem')
  public async getSubsystem(
    @Path('name') name: string,
    @Query('includeAccess') includeAccess: boolean = false
  ): Promise<SubsystemEntry> {
    const subsystemService = new SubsystemService();
    const ctx = this.keystone.sudo();
    const subsystem = await subsystemService.findSubsystemByClientId(ctx, name);
    const result = GetSubsystemEntryForSubsystem(subsystem);

    const client = ParseClientId(name);
    assert.strictEqual(
      result.member.memberClass,
      client.member.memberClass,
      'Member class does not matchh'
    );

    if (includeAccess) {
      await EnrichWithAccess(ctx, result);
    }

    return removeKeys(removeEmpty(result), []) as SubsystemEntry;
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
      environment: 'lab',
      title: 'Sample OAS Service',
      version: '1.0.0',
      specVersion: 'openapi-3.1.0',
      summary: 'A sample OpenAPI service',
      description:
        'This is a sample service defined by an OpenAPI specification.',
      subsystem: {
        name: 'SAMPLE-SUBSYS',
        description: 'A sample subsystem for demonstration purposes',
        clientId: 'MIN.CITZ.SAMPLE-SUBSYS',
        organization: {
          name: 'sample-organization',
        },
        member: {
          memberClass: 'MIN',
          memberId: 'CITZ',
        },
        integrationClientIds: ['client-x-12343'],
      },
      operations: [
        {
          method: 'GET',
          path: '/users',
          operationId: 'getUsers',
          summary: 'Retrieve a list of users',
          scopes: [
            {
              name: 'sdpr:case:read',
              description: 'Permission to read case information',
            },
          ] as ResourceScope[],
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
   * Retrieve a list of resource scopes registered in the SDX service catalog.
   *
   * @summary List of resource scopes in catalog
   */
  @Get('/scopes')
  @OperationId('listScopeCatalog')
  @SuccessResponse('200', 'OK')
  @Example<ResourceScopeEntry[]>([
    {
      name: 'sdpr:case:read',
      description: 'Permission to read case information',
      namespace: 'sdpr',
      resourceType: 'case',
      action: 'read',
      services: [
        {
          name: 'LAB.MIN.CITZ.SAMPLE-API.v1',
          environment: 'lab',
          specVersion: '1.0.0',
          version: '1.0.0',

          operationIds: ['getUsers'],
          subsystem: {
            name: 'SAMPLE-SUBSYS',
            description: 'A sample subsystem for demonstration purposes',
            clientId: 'MIN.CITZ.SAMPLE-SUBSYS',
            organization: {
              name: 'sample-organization',
            },
            member: {
              memberClass: 'MIN',
              memberId: 'CITZ',
            },
            integrationClientIds: ['client-x-12343'], // TODO: need to populate this field based on the connections for this service
          },
        },
      ],
    },
  ])
  @Response<MissingCredentialsJSON>(401, 'Unauthorized', {
    code: 'credentials_required',
    message: 'No authorization token was found',
  })
  public async listCatalogScopes(): Promise<ResourceScopeEntry[]> {
    const ctx = this.keystone.sudo();
    const result = await GetScopes(ctx);
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
  public async getOASService(
    @Path('name') name: string,
    @Request() request: any
  ): Promise<ServiceCatalogEntry> {
    const ctx = this.keystone.sudo();
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
