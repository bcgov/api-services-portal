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
} from 'tsoa';
import { strict as assert } from 'assert';
import { KeystoneService } from './ioc/keystoneInjector';
import { inject, injectable } from 'tsyringe';
import { syncRecords } from '../batch/feed-worker';
import { GroupAccessService, NamespaceService } from '../services/org-groups';
import { getGwaProductEnvironment } from '../services/workflow';
import { GroupAccess, OrgNamespace } from '../services/org-groups/types';
import { getOrganizations } from '../services/keystone';
//import { GroupAccess } from '@/services/org-groups/types';

@injectable()
@Route('/organizations')
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
    return orgs.filter((o) => o.name === org).pop().orgUnits;
  }

  @Get('{org}/access')
  @OperationId('get-organization-access')
  @Security('jwt-org', ['GroupAccess.Manage'])
  public async get(@Path() org: string): Promise<any> {
    const prodEnv = await getGwaProductEnvironment(this.keystone.sudo(), false);
    const envConfig = prodEnv.issuerEnvConfig;

    const groupAccessService = new GroupAccessService(prodEnv.uma2);
    await groupAccessService.login(envConfig.clientId, envConfig.clientSecret);

    return await groupAccessService.getGroupAccess(org);
  }

  @Put('{org}/access')
  @OperationId('put-organization-access')
  @Security('jwt-org', ['GroupAccess.Manage'])
  public async put(@Path() org: string, @Body() body: any): Promise<void> {
    assert.strictEqual(org, body.name, 'Organization mismatch');

    const prodEnv = await getGwaProductEnvironment(this.keystone.sudo(), false);
    const envConfig = prodEnv.issuerEnvConfig;

    const groupAccessService = new GroupAccessService(prodEnv.uma2);
    await groupAccessService.login(envConfig.clientId, envConfig.clientSecret);

    await groupAccessService.createOrUpdateGroupAccess(body as GroupAccess);
  }

  @Get('{org}/namespaces')
  @OperationId('organization-namespaces')
  @Security('jwt-org', ['Namespace.Assign'])
  public async listNamespaces(@Path() org: string): Promise<any[]> {
    const prodEnv = await getGwaProductEnvironment(this.keystone.sudo(), false);
    const envConfig = prodEnv.issuerEnvConfig;

    const svc = new NamespaceService(envConfig.issuerUrl);
    await svc.login(envConfig.clientId, envConfig.clientSecret);
    return await svc.listAssignedNamespacesByOrg(org);
  }

  @Put('{org}/{orgUnit}/namespaces/{ns}')
  @OperationId('assign-namespace-to-organization')
  @Security('jwt-org', ['Namespace.Assign'])
  public async assignNamespace(
    @Path() org: string,
    @Path() orgUnit: string,
    @Path() ns: string
  ): Promise<void> {
    const prodEnv = await getGwaProductEnvironment(this.keystone.sudo(), false);
    const envConfig = prodEnv.issuerEnvConfig;

    const svc = new NamespaceService(envConfig.issuerUrl);
    await svc.login(envConfig.clientId, envConfig.clientSecret);
    await svc.assignNamespaceToOrganization(ns, org, orgUnit);
  }

  @Delete('{org}/{orgUnit}/namespaces/{ns}')
  @OperationId('unassign-namespace-from-organization')
  @Security('jwt-org', ['Namespace.Assign'])
  public async unassignNamespace(
    @Path() org: string,
    @Path() orgUnit: string,
    @Path() ns: string
  ): Promise<void> {
    const prodEnv = await getGwaProductEnvironment(this.keystone.sudo(), false);
    const envConfig = prodEnv.issuerEnvConfig;

    const svc = new NamespaceService(envConfig.issuerUrl);
    await svc.login(envConfig.clientId, envConfig.clientSecret);
    await svc.unassignNamespaceFromOrganization(ns, org, orgUnit);
  }

  // @Get('{org}/datasets')
  // @Put('{org}/datasets')
}

/**
 * export PAYLOAD='{"name":"databc","parent":"/ministry-citizens-services","roles":[{"name":"data-custodians","members":[{"id":"2bb26c01-d781-427e-8078-4351f5ada064","username":"platform","email":"platform@nowhere"}],"permissions":[{"resource":"orgcontrol","scopes":["Namespace.View"]}]}]}'
 * curl -v -H "Content-Type: application/json" http://localhost:3000/ds/api/organizations/databc/access -X PUT -d $PAYLOAD
 *
 * curl -v http://localhost:3000/ds/api/organizations/databc/access


 * curl -v http://localhost:3000/ds/api/organizations
* */
