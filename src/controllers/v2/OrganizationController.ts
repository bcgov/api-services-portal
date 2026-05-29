import {
  Controller,
  Delete,
  OperationId,
  Put,
  Path,
  Route,
  Query,
  Request,
  Security,
  Body,
  Get,
  Tags,
} from 'tsoa';
import { KeystoneService } from '../ioc/keystoneInjector';
import { assertEqual } from '../ioc/assert';
import { inject, injectable } from 'tsyringe';
import {
  parseJsonString,
  removeEmpty,
  removeKeys,
  parseBlobString,
} from '../../batch/feed-worker';
import {
  GroupAccessService,
  NamespaceService,
} from '../../services/org-groups';
import {
  getGwaProductEnvironment,
  transformActivity,
} from '../../services/workflow';
import {
  GroupAccess,
  GroupMembership,
  OrgNamespace,
} from '../../services/org-groups/types';
import {
  getOrganization,
  getOrganizations,
  getOrganizationUnit,
} from '../../services/keystone';
import { getActivity } from '../../services/keystone/activity';
import {
  buildOrgAccessDisplayNameResolver,
  logOrganizationAccessChanges,
  OrgActivityService,
} from '../../services/workflow/org-activity';
import { Logger } from '../../logger';
import { isParent } from '../../services/org-groups/group-converter-utils';
import { ActivityDetail } from './types-extra';

const logger = Logger('v2.OrganizationController');

@injectable()
@Route('/organizations')
@Tags('Organizations')
export class OrganizationController extends Controller {
  private keystone: KeystoneService;
  constructor(@inject('KeystoneService') private _keystone: KeystoneService) {
    super();
    this.keystone = _keystone;
  }

  @Get()
  @OperationId('organization-list')
  public async listOrganizations(): Promise<any[]> {
    const orgs = await getOrganizations(this.keystone.sudo());
    return orgs.map((o) => ({
      name: o.name,
      title: o.title,
      description: o.description,
    }));
  }

  @Get('{org}')
  @OperationId('organization-units')
  public async listOrganizationUnits(@Path() org: string): Promise<any> {
    const orgs = await getOrganizations(this.keystone.sudo());
    const match = orgs.filter((o) => o.name === org).pop();
    assertEqual(
      typeof match === 'undefined',
      false,
      'org',
      'Organization not found.'
    );

    return {
      orgUnits: match.orgUnits.map((o) => ({
        name: o.name,
        title: o.title,
        description: o.description,
      })),
    };
  }

  /**
   * > `Required Scope:` GroupAccess.Manage
   */
  @Get('{org}/roles')
  @OperationId('get-organization-roles')
  @Security('jwt', ['GroupAccess.Manage'])
  public async getPolicies(@Path() org: string): Promise<GroupAccess> {
    const prodEnv = await getGwaProductEnvironment(this.keystone.sudo(), false);
    const envConfig = prodEnv.issuerEnvConfig;

    const groupAccessService = new GroupAccessService(prodEnv.uma2);
    await groupAccessService.login(envConfig.clientId, envConfig.clientSecret);

    return await groupAccessService.getGroupAccess(org);
  }

  /**
   * > `Required Scope:` GroupAccess.Manage
   */
  @Get('{org}/access')
  @OperationId('get-organization-access')
  @Security('jwt', ['GroupAccess.Manage'])
  public async get(@Path() org: string): Promise<GroupMembership> {
    const prodEnv = await getGwaProductEnvironment(this.keystone.sudo(), false);
    const envConfig = prodEnv.issuerEnvConfig;

    const groupAccessService = new GroupAccessService(prodEnv.uma2);
    await groupAccessService.login(envConfig.clientId, envConfig.clientSecret);

    return await groupAccessService.getGroupMembership(org);
  }

  /**
   * > `Required Scope:` GroupAccess.Manage
   */
  @Put('{org}/access')
  @OperationId('put-organization-access')
  @Security('jwt', ['GroupAccess.Manage'])
  public async put(
    @Path() org: string,
    @Body() body: GroupMembership,
    @Request() request: any
  ): Promise<void> {
    // must match either the 'name' or one of the parent nodes
    assertEqual(
      org === body.name || isParent(body.parent, org),
      true,
      'org',
      'Organization mismatch'
    );

    const prodEnv = await getGwaProductEnvironment(this.keystone.sudo(), false);
    const envConfig = prodEnv.issuerEnvConfig;

    const groupAccessService = new GroupAccessService(prodEnv.uma2);
    await groupAccessService.login(envConfig.clientId, envConfig.clientSecret);

    const changes = await groupAccessService.createOrUpdateGroupAccess(body, [
      'idir',
    ]);

    const activityCtx = this.keystone.createContext(request, true);
    const orgActivity = new OrgActivityService(activityCtx, org);

    const newRolesByEmail = new Map<string, string[]>();
    for (const member of body.members || []) {
      if (!member?.member?.email) continue;
      newRolesByEmail.set(member.member.email, member.roles);
    }

    const resolveDisplayName = await buildOrgAccessDisplayNameResolver(
      envConfig.issuerUrl,
      envConfig.clientId,
      envConfig.clientSecret
    );

    await logOrganizationAccessChanges(
      orgActivity,
      changes,
      newRolesByEmail,
      resolveDisplayName
    ).catch((e) =>
      logger.error('[OrgActivity] organization access changes %s', e)
    );
  }

  /**
   * > `Required Scope:` Namespace.Assign
   */
  @Get('{org}/namespaces')
  @OperationId('organization-namespaces')
  @Security('jwt', ['Namespace.Assign'])
  public async listNamespaces(@Path() org: string): Promise<OrgNamespace[]> {
    const prodEnv = await getGwaProductEnvironment(this.keystone.sudo(), false);
    const envConfig = prodEnv.issuerEnvConfig;

    const svc = new NamespaceService(envConfig.issuerUrl);
    await svc.login(envConfig.clientId, envConfig.clientSecret);
    return await svc.listAssignedNamespacesByOrg(org);
  }

  /**
   * Assign a Namespace to an Organization Unit.
   *
   * Only Organizations sourced from the BC Data Catalogue
   * (`extSource: "ckan"`) may be assigned to a Namespace.  Organizations
   * sourced from SDX or created as "custom" entries are intentionally
   * rejected so that namespace-to-organization mappings stay aligned
   * with the authoritative public-body data registry.  This mirrors the
   * filter applied to the _Add Organization_ dropdown in the UI so
   * direct API callers cannot bypass it.
   *
   * > `Required Scope:` Namespace.Assign
   */
  @Put('{org}/{orgUnit}/namespaces/{ns}')
  @OperationId('assign-namespace-to-organization')
  @Security('jwt', ['Namespace.Assign'])
  public async assignNamespace(
    @Path() org: string,
    @Path() orgUnit: string,
    @Path() ns: string,
    @Query() enable = true
  ): Promise<{ result: string }> {
    const ctx = this.keystone.sudo();
    const orgLookup = await getOrganizationUnit(ctx, orgUnit);
    assertEqual(
      orgLookup != null && orgLookup.name === org,
      true,
      'org',
      'Invalid Organization'
    );

    const parentOrg = await getOrganization(ctx, org);
    assertEqual(
      parentOrg.extSource === 'ckan',
      true,
      'org',
      'Only ckan-sourced Organizations may be assigned to a namespace'
    );

    const prodEnv = await getGwaProductEnvironment(ctx, false);
    const envConfig = prodEnv.issuerEnvConfig;

    const svc = new GroupAccessService(prodEnv.uma2);
    await svc.login(envConfig.clientId, envConfig.clientSecret);
    const answer = await svc.assignNamespace(ns, org, orgUnit, enable);
    return {
      result: answer
        ? 'namespace-assigned'
        : 'no-update-namespace-already-assigned',
    };
  }

  /**
   * > `Required Scope:` Namespace.Assign
   */
  @Delete('{org}/{orgUnit}/namespaces/{ns}')
  @OperationId('unassign-namespace-from-organization')
  @Security('jwt', ['Namespace.Assign'])
  public async unassignNamespace(
    @Path() org: string,
    @Path() orgUnit: string,
    @Path() ns: string
  ): Promise<{ result: string }> {
    const ctx = this.keystone.sudo();
    const orgLookup = await getOrganizationUnit(ctx, orgUnit);
    assertEqual(
      orgLookup != null && orgLookup.name === org,
      true,
      'org',
      'Invalid Organization'
    );

    const prodEnv = await getGwaProductEnvironment(ctx, false);
    const envConfig = prodEnv.issuerEnvConfig;

    const svc = new GroupAccessService(prodEnv.uma2);
    await svc.login(envConfig.clientId, envConfig.clientSecret);
    const answer = await svc.unassignNamespace(ns, org, orgUnit);
    return {
      result: answer
        ? 'namespace-unassigned'
        : 'no-update-namespace-not-assigned',
    };
  }

  /**
   * > `Required Scope:` Namespace.Assign
   *
   * @summary Get Namespace Activity for namespaces associated with this Organization Unit
   * @param orgUnit
   * @param first
   * @param skip
   * @returns Activity[]
   */
  @Get('{org}/activity')
  @OperationId('org-namespace-activity')
  @Security('jwt', ['Namespace.Assign'])
  public async namespaceActivity(
    @Path() org: string,
    @Query() first = 20,
    @Query() skip = 0
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
