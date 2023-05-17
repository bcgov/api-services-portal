import 'crypto';
import FormData from 'form-data';
import { strict as assert } from 'assert';
import { Logger } from '../../logger';
import KeycloakAdminClient, {
  default as KcAdminClient,
} from '@keycloak/keycloak-admin-client';
import ClientScopeRepresentation from '@keycloak/keycloak-admin-client/lib/defs/clientScopeRepresentation';
import CertificateRepresentation from '@keycloak/keycloak-admin-client/lib/defs/certificateRepresentation';
import RoleRepresentation from '@keycloak/keycloak-admin-client/lib/defs/roleRepresentation';
import ClientRepresentation from '@keycloak/keycloak-admin-client/lib/defs/clientRepresentation';

const logger = Logger('kc.client');

export class KeycloakClientService {
  private kcAdminClient: KeycloakAdminClient;
  private session: boolean = false;

  constructor(issuerUrl: string, accessToken?: string) {
    if (issuerUrl != null) {
      const baseUrl = issuerUrl.substr(0, issuerUrl.indexOf('/realms'));
      const realmName = issuerUrl.substr(issuerUrl.lastIndexOf('/') + 1);
      this.kcAdminClient = new KcAdminClient({ baseUrl, realmName });
    }
  }

  public useAdminClient(_kcAdminClient: KeycloakAdminClient) {
    this.kcAdminClient = _kcAdminClient;
    return this;
  }

  public async list(search: string = undefined) {
    return this.kcAdminClient.clients.find({ search: true, clientId: search });
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
    return lkup[0];
  }

  public async findOne(id: string) {
    return await this.kcAdminClient.clients.findOne({ id });
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
    logger.debug('[listRoles] (%s) RESULT %j', id, roles);
    return roles;
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

  public async listDefaultScopes(
    id: string
  ): Promise<ClientScopeRepresentation[]> {
    logger.debug('[listDefaultScopes] For %s', id);
    const scopes = await this.kcAdminClient.clients.listDefaultClientScopes({
      id,
    });
    logger.debug('[listDefaultScopes] RESULT %j', scopes);
    return scopes;
  }

  public async findResourceByName(id: string, name: string) {
    const lkup = await (
      await this.kcAdminClient.clients.listResources({ id, name })
    ).filter((r) => r.name === name);
    assert.strictEqual(lkup.length, 1, 'Resource not found ' + name);
    logger.debug('[findResourceByName] [%s] Found - %s', name, lkup[0]._id);
    logger.debug('[findResourceByName] [%s] Found - %j', name, lkup[0]);
    return lkup[0];
  }

  public async regenerateSecret(id: string): Promise<string> {
    const cred = await this.kcAdminClient.clients.generateNewClientSecret({
      id,
    });
    logger.debug('[regenerateSecret] CID=%s %s', id, cred.type);
    return cred.value;
  }

  public async updateJwksUrl(
    client: ClientRepresentation,
    jwksUrl: string
  ): Promise<void> {
    client.attributes['jwks.url'] = jwksUrl;
    client.attributes['jwt.credential.public.key'] = '';
    client.attributes['use.jwks.url'] = 'true';

    await this.kcAdminClient.clients.update({ id: client.id }, client);
  }

  public async updateCertificate(
    client: ClientRepresentation,
    certificate: string
  ): Promise<void> {
    client.attributes['jwks.url'] = '';
    client.attributes['jwt.credential.public.key'] = certificate;
    client.attributes['use.jwks.url'] = 'false';

    await this.kcAdminClient.clients.update({ id: client.id }, client);
  }

  public async uploadCertificate(
    id: string,
    publicKey: string
  ): Promise<CertificateRepresentation> {
    const formData = new FormData();
    formData.append('keystoreFormat', 'Public Key PEM');
    formData.append('file', publicKey);

    const uploadCertificate = this.kcAdminClient.clients.makeUpdateRequest<
      { id: string; attr: string },
      any
    >({
      method: 'POST',
      path: '/{id}/certificates/{attr}/upload-certificate',
      urlParamKeys: ['id', 'attr'],
      headers: {
        'Content-Type': `multipart/form-data; boundary=${
          (formData as any)._boundary
        }`,
      },
    });

    const cred = await uploadCertificate(
      {
        id,
        attr: 'jwt.credential',
      },
      formData
    );
    logger.debug('[uploadCertificate] CID=%s %j', id, cred);

    return cred;
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

  public async findRealmClientScopes(): Promise<ClientScopeRepresentation[]> {
    return this.kcAdminClient.clientScopes.find();
  }

  public async addClientScopeMappings(
    consumerClientId: string,
    rolesClient: ClientRepresentation,
    roles: RoleRepresentation[]
  ) {
    const consumerClient = await this.findByClientId(consumerClientId);

    logger.debug(
      '[addClientScopeMappings] %s %j',
      consumerClientId,
      roles.map((r) => r.name)
    );
    await this.kcAdminClient.clients.addClientScopeMappings(
      { id: consumerClient.id, client: rolesClient.id },
      roles
    );
  }
}
