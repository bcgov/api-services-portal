import { strict as assert } from 'assert';
import { Logger } from '../../logger';

import KeycloakAdminClient, {
  default as KcAdminClient,
} from '@keycloak/keycloak-admin-client';
import { RoleMappingPayload } from '@keycloak/keycloak-admin-client/lib/defs/roleRepresentation';
import { checkKeystoneStatus } from '../checkKeystoneStatus';
import UserRepresentation from '@keycloak/keycloak-admin-client/lib/defs/userRepresentation';

const logger = Logger('kc.user');

export class KeycloakUserService {
  private kcAdminClient: any;

  constructor(issuerUrl: string) {
    const baseUrl = issuerUrl.substr(0, issuerUrl.indexOf('/realms'));
    const realmName = issuerUrl.substr(issuerUrl.lastIndexOf('/') + 1);
    logger.debug('%s %s', baseUrl, realmName);
    this.kcAdminClient = new KcAdminClient({ baseUrl, realmName });
  }

  public useAdminClient(client: KcAdminClient) {
    this.kcAdminClient = client;
    return this;
  }

  public async lookupUserByUsername(username: string) {
    logger.debug('[lookupUserByUsername] %s', username);
    const users = await this.kcAdminClient.users.find({
      exact: true,
      username,
    });
    logger.debug('[lookupUserByUsername] : %j', users);
    assert.strictEqual(users.length, 1, 'User not found ' + username);
    return users[0].id;
  }

  public async lookupUserById(id: string): Promise<UserRepresentation> {
    logger.debug('[lookupUserById] %s', id);
    const user = await this.kcAdminClient.users.findOne({
      id,
    });
    logger.debug('[lookupUserById] : %j', user);
    return user;
  }

  public async lookupUserIdByEmail(
    email: string,
    verified: boolean,
    identityProviders: string[]
  ): Promise<string> {
    return (await this.lookupUserByEmail(email, verified, identityProviders))
      .id;
  }

  public async lookupUserByEmail(
    email: string,
    verified: boolean,
    identityProviders: string[]
  ): Promise<UserRepresentation> {
    const user = (await this.lookupUsersByEmail(email, verified))
      .filter(async (user) => {
        const userWithAttributes = await this.lookupUserById(user.id);
        return identityProviders.includes(
          userWithAttributes.attributes.identity_provider
        );
      })
      .pop();
    assert.strictEqual(
      Boolean(user),
      true,
      `No suitable match for ${identityProviders.join(',')} : ${email}`
    );
    return user;
  }

  public async lookupUsersByEmail(
    email: string,
    verified: boolean
  ): Promise<UserRepresentation[]> {
    logger.debug('[lookupUserByEmail] %s', email);
    const users = (
      await this.kcAdminClient.users.find({
        exact: true,
        email,
      })
    )
      .filter((user: UserRepresentation) => user.enabled)
      .filter(
        (user: UserRepresentation) => verified == false || user.emailVerified
      );
    logger.debug('[lookupUserByEmail] : %j', users);
    assert.strictEqual(
      users.length > 0,
      true,
      'No suitable match for ' + email
    );
    return users;
  }

  public async login(
    clientId: string,
    clientSecret: string
  ): Promise<KeycloakUserService> {
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

  public async listUserClientRoles(id: string, clientUniqueId: string) {
    logger.debug('[listUserClientRoles] (%s) Client %s', id, clientUniqueId);
    const userRoles = await this.kcAdminClient.users.listClientRoleMappings({
      id,
      clientUniqueId,
    });
    logger.debug('[listUserClientRoles] (%s) RESULT %j', id, userRoles);
    return userRoles;
  }

  public async syncUserClientRoles(
    id: string,
    clientUniqueId: string,
    addRoles: RoleMappingPayload[],
    delRoles: RoleMappingPayload[]
  ) {
    logger.debug(
      '[syncUserClientRoles] (%s) %s : ADD:%j DEL:%j',
      id,
      clientUniqueId,
      addRoles,
      delRoles
    );
    if (addRoles.length > 0) {
      await this.kcAdminClient.users.addClientRoleMappings({
        id,
        clientUniqueId,
        roles: addRoles,
      });
    }
    if (delRoles.length > 0) {
      await this.kcAdminClient.users.delClientRoleMappings({
        id,
        clientUniqueId,
        roles: delRoles,
      });
    }
    logger.debug('[syncUserClientRoles] %s OK', id);
  }

  public async disableUser(id: string): Promise<void> {
    logger.debug('[disableUser] %s', id);
    await this.kcAdminClient.users.update(
      { id },
      {
        enabled: false,
      }
    );
  }
}
