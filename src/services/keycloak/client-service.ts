import { strict as assert } from 'assert';
import { Logger } from '../../logger';
import { default as KcAdminClient } from 'keycloak-admin';

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
    return lkup.length == 0 ? null : lkup[0];
  }

  public async isClient(clientId: string) {
    const lkup = await this.kcAdminClient.clients.find({ clientId: clientId });
    return lkup.length != 0;
  }

  public async findByClientId(clientId: string) {
    const lkup = await this.kcAdminClient.clients.find({ clientId: clientId });
    assert.strictEqual(lkup.length, 1, 'Client ID not found ' + clientId);
    return lkup[0];
  }

  public async lookupServiceAccountUserId(id: string) {
    const us = await this.kcAdminClient.clients.getServiceAccountUser({ id });
    logger.debug('[lookupServiceAccountUserId] (%s) RESULT %j', id, us);
    return us.id;
  }

  public async listRoles(id: string) {
    const roles = await this.kcAdminClient.clients.listRoles({
      id,
    });
    logger.debug('[listRoles] (%d) RESULT %j', id, roles);
    return roles;
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
