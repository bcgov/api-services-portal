import 'crypto';
import { strict as assert } from 'assert';
import { Logger } from '../../logger';
import KcAdminClient from '@packages/keycloak-admin-client';
import KeycloakAdminClient from '@keycloak/keycloak-admin-client/lib';
import ClientScopeRepresentation from '@keycloak/keycloak-admin-client/lib/defs/clientScopeRepresentation';
import { KeycloakUserService } from './user-service';
import { EnvironmentContext } from '../workflow/get-namespaces';
import { KeycloakClientService } from './client-service';
import RoleRepresentation from '@keycloak/keycloak-admin-client/lib/defs/roleRepresentation';

const logger = Logger('kc.roles');

const hasRole = (roles: any, name: string) =>
  roles.filter((urole: any) => urole.name === name).length != 0;

export class KeycloakClientRolesService {
  private kcAdminClient: KeycloakAdminClient;
  private kcClientService: KeycloakClientService;
  private kcUserService: KeycloakUserService;

  constructor(issuerUrl: string) {
    if (issuerUrl != null) {
      const baseUrl = issuerUrl.substr(0, issuerUrl.indexOf('/realms'));
      const realmName = issuerUrl.substr(issuerUrl.lastIndexOf('/') + 1);
      this.kcAdminClient = new KcAdminClient({ baseUrl, realmName });
      this.kcUserService = new KeycloakUserService(issuerUrl);
      this.kcClientService = new KeycloakClientService(issuerUrl);
    }
  }

  public async login(
    clientId: string,
    clientSecret: string
  ): Promise<KeycloakClientRolesService> {
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

    this.kcUserService.useAdminClient(this.kcAdminClient);
    this.kcClientService.useAdminClient(this.kcAdminClient);
    return this;
  }

  public async syncAssignedRoles(
    clientId: string,
    clientRoles: string[],
    consumerUsername: string
  ): Promise<string[]> {
    const changeList: string[] = [];

    const client = await this.kcClientService.findByClientId(clientId);

    const availableRoles = await this.kcClientService.listRoles(client.id);

    const selectedRoles = availableRoles
      .filter((r: any) => clientRoles.includes(r.name))
      .map((r: any) => ({ id: r.id, name: r.name }));

    assert.strictEqual(
      selectedRoles.length,
      clientRoles.length,
      'Role not found for client'
    );

    logger.debug('[] selected %j', selectedRoles);

    const isClient = await this.kcClientService.isClient(consumerUsername);

    if (isClient) {
      const consumerClient = await this.kcClientService.findByClientId(
        consumerUsername
      );
      const userId = await this.kcClientService.lookupServiceAccountUserId(
        consumerClient.id
      );

      const currentRoles = await this.kcUserService.listUserClientRoles(
        userId,
        client.id
      );

      const addRoles = selectedRoles
        .filter((role) => !hasRole(currentRoles, role.name))
        .map((role) => ({ id: role.id, name: role.name }));

      const delRoles = currentRoles
        .filter((role: any) => !hasRole(selectedRoles, role.name))
        .map((role: any) => ({ id: role.id, name: role.name }));

      changeList.push(...addRoles.map((r: any) => `Role Add ${r.name}`));
      changeList.push(...delRoles.map((r: any) => `Role Remove ${r.name}`));

      await this.kcUserService.syncUserClientRoles(
        userId,
        client.id,
        addRoles,
        delRoles
      );
    } else {
      const userId = await this.kcUserService.lookupUserByUsername(
        consumerUsername
      );

      const userRoles = await this.kcUserService.listUserClientRoles(
        userId,
        client.id
      );

      const addRoles = selectedRoles
        .filter(
          (role) =>
            userRoles.filter((urole: any) => urole.name === role.name).length ==
            0
        )
        .map((role) => ({ id: role.id, name: role.name }));

      const delRoles = userRoles
        .filter((urole: any) => selectedRoles.includes(urole.name) == false)
        .map((role: any) => ({ id: role.id, name: role.name }));

      changeList.push(...addRoles.map((r: any) => `Role Add ${r.name}`));
      changeList.push(...delRoles.map((r: any) => `Role Remove ${r.name}`));

      await this.kcUserService.syncUserClientRoles(
        userId,
        client.id,
        addRoles,
        delRoles
      );
    }
    return changeList;
  }

  public async addClientScopeMappings(
    consumerClientId: string,
    rolesClientId: string
  ): Promise<void> {
    const rolesClient = await this.kcClientService.findByClientId(
      rolesClientId
    );

    const roles = await this.kcClientService.listRoles(rolesClient.id);

    return this.kcClientService.addClientScopeMappings(
      consumerClientId,
      rolesClient,
      roles
    );
  }

  public async syncRoles(
    clientId: string,
    clientRoles: string[]
  ): Promise<string[]> {
    const changeList: string[] = [];
    const client = await this.kcClientService.findOne(clientId);

    const availableRoles = await this.kcClientService.listRoles(client.id);

    // Add any new Roles
    await Promise.all(
      clientRoles
        .filter(
          (role) =>
            availableRoles.filter((arole) => arole.name === role).length == 0
        )
        .map(async (roleName) => {
          changeList.push(`Role Add ${roleName}`);

          return this.kcAdminClient.clients.createRole({
            id: client.id,
            name: roleName,
          });
        })
    );

    // Remove any old Roles
    await Promise.all(
      availableRoles
        .filter(
          (role) =>
            clientRoles.filter((arole) => arole === role.name).length == 0
        )
        .map(async (role) => {
          changeList.push(`Role Remove ${role.name}`);

          return this.kcAdminClient.clients.delRole({
            id: client.id,
            roleName: role.name,
          });
        })
    );

    if (changeList.length > 0) {
      logger.info('[syncRoles] %s : Changes: %j', clientId, changeList);
    }
    return [];
  }
}
