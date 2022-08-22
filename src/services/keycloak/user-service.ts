import { strict as assert } from 'assert';
import { Logger } from '../../logger';

import KeycloakAdminClient, {
  default as KcAdminClient,
} from '@keycloak/keycloak-admin-client';
import { RoleMappingPayload } from '@keycloak/keycloak-admin-client/lib/defs/roleRepresentation';

const logger = Logger('kc.user');

export class KeycloakUserService {
  private kcAdminClient: any;

  constructor(issuerUrl: string) {
    const baseUrl = issuerUrl.substr(0, issuerUrl.indexOf('/realms'));
    const realmName = issuerUrl.substr(issuerUrl.lastIndexOf('/') + 1);
    logger.debug('%s %s', baseUrl, realmName);
    this.kcAdminClient = new KcAdminClient({ baseUrl, realmName });
  }

  // public async findOne(id: string) {
  //   logger.debug('[findOne] %s', id);
  //   const user = await this.kcAdminClient.users.findOne({
  //     id,
  //   });
  //   logger.debug('[findOne] : %j', user);
  //   return user;
  // }

  public async lookupUserByUsername(username: string) {
    logger.debug('[lookupUserByUsername] %s', username);
    const users = await this.kcAdminClient.users.find({
      exact: true,
      username: username,
    });
    logger.debug('[lookupUserByUsername] : %j', users);
    assert.strictEqual(users.length, 1, 'User not found ' + username);
    return users[0].id;
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
}
