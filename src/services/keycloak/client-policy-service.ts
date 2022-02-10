import { strict as assert } from 'assert';
import { Logger } from '../../logger';
import KeycloakAdminClient, {
  default as KcAdminClient,
} from '@keycloak/keycloak-admin-client';
import { PolicyQuery } from '@keycloak/keycloak-admin-client/lib/resources/clients';
import PolicyRepresentation from '@keycloak/keycloak-admin-client/lib/defs/policyRepresentation';
import ResourceServerRepresentation from '@keycloak/keycloak-admin-client/lib/defs/resourceServerRepresentation';

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
    return await this.kcAdminClient.clients
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
    logger.debug('[listPermissionsByResource] %s', id);
    const permissions = await this.kcAdminClient.clients
      .listPermissionsByResource({ id, resourceId })
      .catch((e: any) => {
        logger.error('Err %s', JSON.stringify(e, null, 3));
        throw e;
      });

    for (const perm of permissions) {
      perm.scopes = await this.kcAdminClient.clients.getAssociatedScopes({
        id,
        permissionId: perm.id,
      });
    }

    for (const perm of permissions) {
      perm.policies = await (this.kcAdminClient
        .clients as any).getAssociatedPolicies({
        id,
        permissionId: perm.id,
      });
    }

    return permissions;
  }

  public async findPermissionByName(
    id: string,
    name: string
  ): Promise<PolicyRepresentation> {
    logger.debug('[findPermissionByName] %s', name);
    const lkup = await this.kcAdminClient.clients
      .findPermissions({ id, name })
      .catch((e: any) => {
        logger.error('Err %s', JSON.stringify(e, null, 3));
        throw e;
      });
    assert.strictEqual(lkup.length, 1, 'Permission not found ' + name);

    return await this.enrichWithAssociations(id, lkup[0]);
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
