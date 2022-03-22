import {
  Controller,
  Request,
  Delete,
  OperationId,
  Put,
  Path,
  Route,
  Query,
  Security,
  Body,
  Get,
  Tags,
} from 'tsoa';
import { strict as assert } from 'assert';
import { KeystoneService } from '../ioc/keystoneInjector';
import { inject, injectable } from 'tsyringe';
import {
  syncRecords,
  getRecords,
  parseJsonString,
  removeEmpty,
  removeKeys,
  transformAllRefID,
} from '../../batch/feed-worker';
import {
  GroupAccessService,
  NamespaceService,
} from '../../services/org-groups';
import { getGwaProductEnvironment } from '../../services/workflow';
import { GroupAccess, OrgNamespace } from '../../services/org-groups/types';
import { getOrganizations, getOrganizationUnit } from '../../services/keystone';
import { getActivity } from '../../services/keystone/activity';
import { Activity } from './types';

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
  public async listOrganizationUnits(@Path() org: string): Promise<any[]> {
    const orgs = await getOrganizations(this.keystone.sudo());
    return orgs
      .filter((o) => o.name === org)
      .pop()
      .orgUnits.map((o) => ({
        name: o.name,
        title: o.title,
        description: o.description,
      }));
  }

  /**
   * > `Required Scope:` GroupAccess.Manage
   */
  @Get('{org}/access')
  @OperationId('get-organization-access')
  @Security('jwt', ['GroupAccess.Manage'])
  public async get(@Path() org: string): Promise<GroupAccess> {
    const prodEnv = await getGwaProductEnvironment(this.keystone.sudo(), false);
    const envConfig = prodEnv.issuerEnvConfig;

    const groupAccessService = new GroupAccessService(prodEnv.uma2);
    await groupAccessService.login(envConfig.clientId, envConfig.clientSecret);

    return await groupAccessService.getGroupAccess(org);
  }

  /**
   * > `Required Scope:` GroupAccess.Manage
   */
  @Put('{org}/access')
  @OperationId('put-organization-access')
  @Security('jwt', ['GroupAccess.Manage'])
  public async put(
    @Path() org: string,
    @Body() body: GroupAccess
  ): Promise<void> {
    assert.strictEqual(org, body.name, 'Organization mismatch');

    const prodEnv = await getGwaProductEnvironment(this.keystone.sudo(), false);
    const envConfig = prodEnv.issuerEnvConfig;

    const groupAccessService = new GroupAccessService(prodEnv.uma2);
    await groupAccessService.login(envConfig.clientId, envConfig.clientSecret);

    await groupAccessService.createOrUpdateGroupAccess(body as GroupAccess);
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
   * > `Required Scope:` Namespace.Assign
   */
  @Put('{org}/{orgUnit}/namespaces/{ns}')
  @OperationId('assign-namespace-to-organization')
  @Security('jwt', ['Namespace.Assign'])
  public async assignNamespace(
    @Path() org: string,
    @Path() orgUnit: string,
    @Path() ns: string
  ): Promise<{ result: string }> {
    const ctx = this.keystone.sudo();
    const orgLookup = await getOrganizationUnit(ctx, orgUnit);
    assert.strictEqual(
      orgLookup != null && orgLookup.name === org,
      true,
      'Invalid Organization'
    );

    const prodEnv = await getGwaProductEnvironment(ctx, false);
    const envConfig = prodEnv.issuerEnvConfig;

    const svc = new NamespaceService(envConfig.issuerUrl);
    await svc.login(envConfig.clientId, envConfig.clientSecret);
    const answer = await svc.assignNamespaceToOrganization(ns, org, orgUnit);
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
    assert.strictEqual(
      orgLookup != null && orgLookup.name === org,
      true,
      'Invalid Organization'
    );

    const prodEnv = await getGwaProductEnvironment(ctx, false);
    const envConfig = prodEnv.issuerEnvConfig;

    const svc = new NamespaceService(envConfig.issuerUrl);
    await svc.login(envConfig.clientId, envConfig.clientSecret);
    const answer = await svc.unassignNamespaceFromOrganization(
      ns,
      org,
      orgUnit
    );
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
    @Query() first: number = 20,
    @Query() skip: number = 0
  ): Promise<Activity[]> {
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
      first > 50 ? 50 : first,
      skip
    );
    return records
      .map((o) => removeEmpty(o))
      .map((o) => transformAllRefID(o, ['blob']))
      .map((o) => parseJsonString(o, ['context', 'blob']));
  }
}
