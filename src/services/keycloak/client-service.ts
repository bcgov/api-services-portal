import { strict as assert } from 'assert';
import { Logger } from '../../logger';
import { default as KcAdminClient } from 'keycloak-admin';
import RoleRepresentation from 'keycloak-admin/lib/defs/groupRepresentation';

const logger = Logger('kc.client');

export class KeycloakClientService {
  private issuerUrl: string;
  private accessToken: string;
  private kcAdminClient: any;
  private session: boolean = false;

  constructor(issuerUrl: string, accessToken?: string) {
    this.issuerUrl = issuerUrl;
    this.accessToken = accessToken;
    if (issuerUrl != null) {
      const baseUrl = issuerUrl.substr(0, issuerUrl.indexOf('/realms'));
      const realmName = issuerUrl.substr(issuerUrl.lastIndexOf('/') + 1);
      this.kcAdminClient = new KcAdminClient({ baseUrl, realmName });
    }
  }
  public async list() {
    return await this.kcAdminClient.clients.find();
  }

  public async searchForClientId(clientId: string) {
    const lkup = await this.kcAdminClient.clients.find({ clientId: clientId });
    logger.debug(
      '[searchForClientId] (%s) RESULT %j',
      clientId,
      lkup.length == 0 ? null : lkup[0]
    );
    return lkup.length == 0 ? null : lkup[0];
  }

  public async isClient(clientId: string) {
    const lkup = await this.kcAdminClient.clients.find({ clientId: clientId });
    return lkup.length != 0;
  }

  public async findByClientId(clientId: string) {
    const lkup = await this.kcAdminClient.clients.find({ clientId: clientId });
    assert.strictEqual(lkup.length, 1, 'Client ID not found ' + clientId);
    //logger.debug('[findByClientId] (%s) RESULT %j', clientId, lkup[0]);
    return lkup[0];
  }

  public async lookupServiceAccountUserId(id: string) {
    const us = await this.kcAdminClient.clients.getServiceAccountUser({ id });
    logger.debug('[lookupServiceAccountUserId] (%s) RESULT %j', id, us);
    return us.id;
  }

  public async listRoles(id: string): Promise<RoleRepresentation[]> {
    const roles = await this.kcAdminClient.clients.listRoles({
      id,
    });
    logger.debug('[listRoles] (%s) RESULT %j', id, roles);
    return roles;
  }

  public async syncRoles(id: string, add: string[], del: string[]) {
    logger.debug('[syncRoles] %s A=%j D=%j', id, add, del);
    for (const roleName of add) {
      await this.kcAdminClient.clients.createRole({
        id,
        name: roleName,
      });
      logger.debug('[syncRoles] %s %j ADDED', id, roleName);
    }
    for (const roleName of del) {
      await this.kcAdminClient.clients.delRole({ id, roleName });
      logger.debug('[syncRoles] %s %j DELETED', id, roleName);
    }
  }

  public async findUsersWithRole(id: string, roleName: string) {
    logger.debug('[findUsersWithRole] (%s) FIND %s', id, roleName);
    const users = await this.kcAdminClient.clients.findUsersWithRole({
      id,
      roleName,
    });
    logger.debug('[findUsersWithRole] (%s) RESULT %j', id, users);
    return users;
  }

  public async listDefaultScopes(id: string) {
    logger.debug('[listDefaultScopes] For %s', id);
    const scopes = await this.kcAdminClient.clients.listDefaultClientScopes({
      id,
    });
    logger.debug('[listDefaultScopes] RESULT %j', scopes);
    return scopes;
  }

  public async listDefaultClientScopes() {
    logger.debug('[listDefaultClientScopes]');
    const scopes = await this.kcAdminClient.clientScopes.listDefaultClientScopes();
    logger.debug('[listDefaultClientScopes] RESULT %j', scopes);
    return scopes;
  }

  public async login(clientId: string, clientSecret: string): Promise<void> {
    await this.kcAdminClient
      .auth({
        grantType: 'client_credentials',
        clientId: clientId,
        clientSecret: clientSecret,
      })
      .catch((err: any) => {
        console.log('Login failed ' + err);
        throw err;
      });
    this.session = true;
  }
}
