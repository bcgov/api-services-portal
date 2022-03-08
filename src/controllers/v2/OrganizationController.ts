import {
  Controller,
  Request,
  Delete,
  OperationId,
  Put,
  Path,
  Route,
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
} from '../../batch/feed-worker';
import {
  GroupAccessService,
  NamespaceService,
} from '../../services/org-groups';
import { getGwaProductEnvironment } from '../../services/workflow';
import { GroupAccess, OrgNamespace } from '../../services/org-groups/types';
import { getOrganizations, getOrganizationUnit } from '../../services/keystone';
import { BatchResult } from '../../batch/types';
// import {
//   DraftDatasetData,
//   OrganizationData,
//   OrganizationUnitData,
// } from './types';
//import { GroupAccess } from '@/services/org-groups/types';

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

  @Put('{orgUnit}/namespaces/{ns}')
  @OperationId('assign-namespace-to-organization')
  @Security('jwt', ['Namespace.Assign'])
  public async assignNamespace(
    @Path() orgUnit: string,
    @Path() ns: string
  ): Promise<void> {
    const ctx = this.keystone.sudo();
    const org = await getOrganizationUnit(ctx, orgUnit);
    assert.strictEqual(org != null, true, 'Invalid Organization');

    const prodEnv = await getGwaProductEnvironment(ctx, false);
    const envConfig = prodEnv.issuerEnvConfig;

    const svc = new NamespaceService(envConfig.issuerUrl);
    await svc.login(envConfig.clientId, envConfig.clientSecret);
    await svc.assignNamespaceToOrganization(ns, org.name, orgUnit);
  }

  @Delete('{orgUnit}/namespaces/{ns}')
  @OperationId('unassign-namespace-from-organization')
  @Security('jwt', ['Namespace.Assign'])
  public async unassignNamespace(
    @Path() orgUnit: string,
    @Path() ns: string
  ): Promise<void> {
    const ctx = this.keystone.sudo();
    const org = await getOrganizationUnit(ctx, orgUnit);
    assert.strictEqual(org != null, true, 'Invalid Organization');

    const prodEnv = await getGwaProductEnvironment(ctx, false);
    const envConfig = prodEnv.issuerEnvConfig;

    const svc = new NamespaceService(envConfig.issuerUrl);
    await svc.login(envConfig.clientId, envConfig.clientSecret);
    await svc.unassignNamespaceFromOrganization(ns, org.name, orgUnit);
  }
}

/**
 * export PAYLOAD='{"name":"databc","parent":"/ministry-citizens-services","roles":[{"name":"data-custodians","members":[{"id":"2bb26c01-d781-427e-8078-4351f5ada064","username":"platform","email":"platform@nowhere"}],"permissions":[{"resource":"orgcontrol","scopes":["Namespace.View"]}]}]}'
 * curl -v -H "Content-Type: application/json" http://localhost:3000/ds/api/organizations/databc/access -X PUT -d $PAYLOAD
 *
 * curl -v http://localhost:3000/ds/api/organizations/databc/access


 * curl -v http://localhost:3000/ds/api/organizations
* */
