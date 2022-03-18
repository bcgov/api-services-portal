import { strict as assert } from 'assert';
import { Logger } from '../../logger';
import KeycloakAdminClient, {
  default as KcAdminClient,
} from '@keycloak/keycloak-admin-client';
import { PolicyQuery } from '@keycloak/keycloak-admin-client/lib/resources/clients';
import PolicyRepresentation from '@keycloak/keycloak-admin-client/lib/defs/policyRepresentation';
import ResourceServerRepresentation from '@keycloak/keycloak-admin-client/lib/defs/resourceServerRepresentation';
import ResourceRepresentation from '@keycloak/keycloak-admin-client/lib/defs/resourceRepresentation';
import ScopeRepresentation from '@keycloak/keycloak-admin-client/lib/defs/scopeRepresentation';

//import KeycloakAdminClient, { default as KcAdminClient } from 'keycloak-admin';
// import { RoleMappingPayload } from 'keycloak-admin/lib/defs/roleRepresentation';
// import GroupRepresentation from 'keycloak-admin/lib/defs/groupRepresentation';
// import PolicyRepresentation from 'keycloak-admin/lib/defs/policyRepresentation';
// import { PolicyQuery } from 'keycloak-admin/lib/resources/clients';

const logger = Logger('kc.policy');

export class KeycloakClientPolicyService {
  private kcAdminClient: KeycloakAdminClient;

  constructor(issuerUrl: string) {
    if (issuerUrl != null) {
      const baseUrl = issuerUrl.substr(0, issuerUrl.indexOf('/realms'));
      const realmName = issuerUrl.substr(issuerUrl.lastIndexOf('/') + 1);
      logger.debug('%s %s', baseUrl, realmName);
      this.kcAdminClient = new KcAdminClient({ baseUrl, realmName });
    }
  }

  public useAdminClient(_kcAdminClient: KeycloakAdminClient) {
    this.kcAdminClient = _kcAdminClient;
    return this;
  }

  public async login(
    clientId: string,
    clientSecret: string
  ): Promise<KeycloakClientPolicyService> {
    logger.debug('[login] %s', clientId);

    await this.kcAdminClient
      .auth({
        grantType: 'client_credentials',
        clientId: clientId,
        clientSecret: clientSecret,
      })
      .catch((err: any) => {
        logger.error('[login] Login failed %s', err);
        throw err;
      });
    return this;
  }

  public async listPolicies(
    id: string,
    query?: PolicyQuery
  ): Promise<PolicyRepresentation[]> {
    logger.debug('[listPolicies] %s', id);
    return this.kcAdminClient.clients
      .listPolicies({ ...{ id, max: 1000 }, ...query })
      .catch((e: any) => {
        logger.error('Err %s', JSON.stringify(e, null, 3));
        throw e;
      });
  }

  public async listPermissionsByResource(
    id: string,
    resourceId: string
  ): Promise<ResourceServerRepresentation[]> {
    logger.debug('[listPermissionsByResource] %s %s', id, resourceId);
    const permissions: any = await this.kcAdminClient.clients
      .listPolicies({ id, resource: resourceId })
      .catch((e: any) => {
        logger.error('Err %s', JSON.stringify(e, null, 3));
        throw e;
      });
    logger.debug('[listPermissionsByResource] %j', permissions);

    for (const perm of permissions) {
      perm.scopes = await this.kcAdminClient.clients.getAssociatedScopes({
        id,
        permissionId: perm.id,
      });
    }

    for (const perm of permissions) {
      perm.resources = await this.kcAdminClient.clients.getAssociatedResources({
        id,
        permissionId: perm.id,
      });
      assert.strictEqual(
        perm.resources.filter(
          (r: ResourceRepresentation) => r._id != resourceId
        ).length,
        0,
        'Permission search inconsistent!'
      );
    }

    for (const perm of permissions) {
      perm.policies = await (this.kcAdminClient
        .clients as any).getAssociatedPolicies({
        id,
        permissionId: perm.id,
      });
    }

    logger.debug('[listPermissionsByResource] %j', permissions);
    return permissions;
  }

  public async findPolicyById(
    id: string,
    type: string,
    policyId: string
  ): Promise<any> {
    logger.debug('[findPolicyById] c=%s p=%s', id, policyId);

    const policy = (await this.kcAdminClient.clients.findOnePolicy({
      id,
      type,
      policyId,
    })) as unknown;
    logger.debug('[findPolicyById] RESULT %j', policy);
    return policy;
  }

  public async findPermissionsMatchingPolicy(
    id: string,
    roleName: string,
    policyName: string
  ): Promise<PolicyRepresentation[]> {
    logger.debug('[findPermissionByName] r=%s p=%s', roleName, policyName);
    const result = [];
    // first find permissions that have 'roleName' in the name
    const lkup: PolicyRepresentation[] = await this.kcAdminClient.clients
      .findPermissions({ id, name: roleName })
      .catch((e: any) => {
        logger.error('Err %s', JSON.stringify(e, null, 3));
        throw e;
      });

    // then for each, look up the policies and do an exact match
    // of the 'policyName' to the policy name
    for (const perm of lkup) {
      const policies = await (this.kcAdminClient
        .clients as any).getAssociatedPolicies({
        id,
        permissionId: perm.id,
      });
      logger.debug('[findPermissionByName] Associated %j', policies);

      if (policies.length == 1 && policies[0].name === policyName) {
        await this.enrichWithAssociations(id, perm);

        assert.strictEqual(
          perm.type,
          'scope',
          `Permission Type Unexpected ${perm.type}`
        );
        assert.strictEqual(
          perm.logic,
          'POSITIVE',
          `Permission Logic Unexpected ${perm.logic}`
        );
        assert.strictEqual(
          perm.decisionStrategy,
          'UNANIMOUS',
          `Permission Decision Unexpected ${perm.decisionStrategy}`
        );
        assert.strictEqual(
          perm.config.policies.length,
          1,
          `Permission Policy Count Error ${perm.config.policies.length}`
        );
        assert.strictEqual(
          perm.config.resources.length,
          1,
          `Permission Resource Count Error ${perm.config.resources.length}`
        );

        result.push(perm);
      }
    }
    return result;
  }

  public async findPermissionByName(
    id: string,
    name: string
  ): Promise<PolicyRepresentation> {
    const lkup = await this.findPermissionsByName(id, name);
    assert.strictEqual(
      lkup.length,
      1,
      'Unexpected number of permissions returned ' + lkup.length
    );
    return lkup[0];
  }

  public async findPermissionsByName(
    id: string,
    name: string
  ): Promise<PolicyRepresentation[]> {
    logger.debug('[findPermissionByName] %s', name);
    const lkup: PolicyRepresentation[] = await this.kcAdminClient.clients
      .findPermissions({ id, name })
      .catch((e: any) => {
        logger.error('Err %s', JSON.stringify(e, null, 3));
        throw e;
      });

    for (const perm of lkup) {
      await this.enrichWithAssociations(id, perm);

      assert.strictEqual(
        perm.type,
        'scope',
        `Permission Type Unexpected ${perm.type}`
      );
      assert.strictEqual(
        perm.logic,
        'POSITIVE',
        `Permission Logic Unexpected ${perm.logic}`
      );
      assert.strictEqual(
        perm.decisionStrategy,
        'UNANIMOUS',
        `Permission Decision Unexpected ${perm.decisionStrategy}`
      );
      assert.strictEqual(
        perm.config.policies.length,
        1,
        `Permission Policy Count Error ${perm.config.policies.length}`
      );
      assert.strictEqual(
        perm.config.resources.length <= 1,
        true,
        `Permission Resource Count Error ${perm.config.resources.length}`
      );
    }
    return lkup;
  }

  public async getAllClientAuthzScopes(
    id: string
  ): Promise<ScopeRepresentation[]> {
    logger.debug('[getAllScopes] %s', id);
    return await this.kcAdminClient.clients.listAllScopes({ id });
  }

  public async findPolicyByName(
    id: string,
    name: string
  ): Promise<PolicyRepresentation> {
    logger.debug('[findPolicyByName] %s', name);
    const policy = await this.kcAdminClient.clients
      .findPolicyByName({ id, name })
      .catch((e: any) => {
        logger.error('Err %s', JSON.stringify(e, null, 3));
        throw e;
      });
    logger.debug('[findPolicyByName] %j', policy);
    return policy;
  }

  public async createOrUpdatePolicy(
    id: string,
    policy: PolicyRepresentation
  ): Promise<PolicyRepresentation> {
    logger.debug('[createOrUpdatePolicy] %s (client %s)', policy.name, id);
    const response = await this.kcAdminClient.clients.createOrUpdatePolicy({
      id,
      policyName: policy.name,
      policy,
    });
    logger.debug('[createOrUpdatePolicy] RESULT %j', response);
    return response;
  }

  public async createPermission(
    id: string,
    policy: PolicyRepresentation
  ): Promise<PolicyRepresentation> {
    logger.debug('[createPermission] %s (client %s)', policy.name, id);
    const response = await this.kcAdminClient.clients.createPermission(
      { id, type: policy.type },
      policy
    );
    logger.debug('[createPermission] RESULT %j', response);
    return response;
  }

  public async updatePermission(
    id: string,
    permissionId: string,
    policy: PolicyRepresentation
  ): Promise<void> {
    logger.debug('[updatePermission] %s (client %s)', policy.name, id);
    await this.kcAdminClient.clients.updatePermission(
      { id, type: policy.type, permissionId },
      policy
    );
  }

  private async enrichWithAssociations(
    id: string,
    perm: PolicyRepresentation
  ): Promise<PolicyRepresentation> {
    if (!('config' in perm)) {
      perm.config = {};
    }
    perm.config.scopes = await this.kcAdminClient.clients.getAssociatedScopes({
      id,
      permissionId: perm.id,
    });
    perm.config.policies = await (this.kcAdminClient
      .clients as any).getAssociatedPolicies({
      id,
      permissionId: perm.id,
    });
    perm.config.resources = await (this.kcAdminClient
      .clients as any).getAssociatedResources({
      id,
      permissionId: perm.id,
    });
    return perm;
  }
}
