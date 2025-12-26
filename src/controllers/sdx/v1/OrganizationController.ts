import {
  Controller,
  Request,
  OperationId,
  Path,
  Route,
  Query,
  Security,
  Body,
  Get,
  Tags,
  Post,
} from 'tsoa';
import { KeystoneService } from '../../ioc/keystoneInjector';
import { inject, injectable } from 'tsyringe';
import {
  parseJsonString,
  removeEmpty,
  removeKeys,
  parseBlobString,
  getRecord,
} from '../../../batch/feed-worker';
import { NamespaceService } from '../../../services/org-groups';
import {
  getGwaProductEnvironment,
  transformActivity,
} from '../../../services/workflow';
import { OrgNamespace } from '../../../services/org-groups/types';
import { getActivity } from '../../../services/keystone/activity';
import { Gateway, Organization } from '../../v3/types';
import { ActivityDetail } from '../../v3/types-extra';
import { assertEqual } from '../../ioc/assert';
import { gql } from 'graphql-request';
import { SDXRuntimeGroup } from './types';
import { Logger } from '../../../logger';
import {
  CreateNamespace,
  CreateNamespaceArgs,
} from '../../../services/workflow/create-namespace';

const logger = Logger('controllers.SDXOrganization');

@injectable()
@Route('/organizations')
@Tags('Organization Administration')
export class OrganizationController extends Controller {
  private keystone: KeystoneService;
  constructor(@inject('KeystoneService') private _keystone: KeystoneService) {
    super();
    this.keystone = _keystone;
  }

  /**
   * > `Required Scope:` Gateway.Assign
   */
  @Get('{org}/gateways')
  @OperationId('organization-gateways')
  @Security('jwt', ['Namespace.Assign'])
  public async listNamespaces(@Path() org: string): Promise<OrgNamespace[]> {
    const prodEnv = await getGwaProductEnvironment(this.keystone.sudo(), false);
    const envConfig = prodEnv.issuerEnvConfig;

    const svc = new NamespaceService(envConfig.issuerUrl);
    await svc.login(envConfig.clientId, envConfig.clientSecret);
    return await svc.listAssignedNamespacesByOrg(org);
  }

  /**
   * Create a gateway
   *
   * @summary Create Gateway
   * @param ns
   * @param request
   */
  @Post('{org}/gateways')
  @OperationId('organization-create-gateway')
  @Security('jwt', ['Namespace.Assign'])
  public async createGateway(
    @Path() org: string,
    @Request() request: any,
    @Body()
    vars: {
      runtimeGroup: string;
    }
  ): Promise<Gateway> {
    const context = this.keystone.createContext(request);

    // use the runtimeGroup to get the dataPlane info
    const runtimeGroup: SDXRuntimeGroup = await getRecord(
      context,
      'RuntimeGroup',
      vars.runtimeGroup,
      []
    );
    assertEqual(
      runtimeGroup && (runtimeGroup.organization as Organization).name === org,
      true,
      'runtimeGroup',
      'Not authorized to use runtime group'
    );

    const createArgs: CreateNamespaceArgs = {
      // displayName: `SDX ${runtimeGroup.name}`,
      org,
      orgEnabled: false,
      dataPlane: 'sdx-ap',
      domains: [runtimeGroup.host],
    };

    const newGateway = await CreateNamespace(context, createArgs);

    return {
      gatewayId: newGateway.name,
      displayName: newGateway.displayName,
    };
  }

  /**
   * > `Required Scope:` Gateway.Assign
   *
   * @summary Get administration activity for Gateways associated with this Organization
   * @param org
   * @param first
   * @param skip
   * @returns Activity[]
   */
  @Get('{org}/activity')
  @OperationId('org-gateway-activity')
  @Security('jwt', ['Namespace.Assign'])
  public async namespaceActivity(
    @Path() org: string,
    @Query() first: number = 20,
    @Query() skip: number = 0
  ): Promise<ActivityDetail[]> {
    const ctx = this.keystone.sudo();
    //const org = await getOrganizationUnit(ctx, orgUnit);
    //assert.strictEqual(org != null, true, 'Invalid Organization Unit');

    const prodEnv = await getGwaProductEnvironment(ctx, false);
    const envConfig = prodEnv.issuerEnvConfig;

    const svc = new NamespaceService(envConfig.issuerUrl);
    await svc.login(envConfig.clientId, envConfig.clientSecret);
    const assignedNamespaces = await svc.listAssignedNamespacesByOrg(org);
    const records = await getActivity(
      ctx,
      assignedNamespaces.map((n) => n.name),
      undefined,
      first > 100 ? 100 : first,
      skip
    );

    return transformActivity(records)
      .map((o) => removeKeys(o, ['id']))
      .map((o) => removeEmpty(o))
      .map((o) => parseJsonString(o, ['context']))
      .map((o) => parseBlobString(o));
  }
}

const createNS = gql`
  mutation CreateNamespace(
    $name: String
    $displayName: String
    $org: String
    $domains: String
    $dataPlane: String
  ) {
    createNamespace(
      name: $name
      displayName: $displayName
      org: $org
      domains: $domains
      dataPlane: $dataPlane
    ) {
      name
      displayName
    }
  }
`;
