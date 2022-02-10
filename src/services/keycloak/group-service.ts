import { strict as assert } from 'assert';
import { Logger } from '../../logger';
import KeycloakAdminClient, {
  default as KcAdminClient,
} from '@keycloak/keycloak-admin-client';
import GroupRepresentation from '@keycloak/keycloak-admin-client/lib/defs/groupRepresentation';
import UserRepresentation from '@keycloak/keycloak-admin-client/lib/defs/userRepresentation';
// import KeycloakAdminClient, { default as KcAdminClient } from 'keycloak-admin';
// import { RoleMappingPayload } from 'keycloak-admin/lib/defs/roleRepresentation';
// import GroupRepresentation from 'keycloak-admin/lib/defs/groupRepresentation';
// import UserRepresentation from 'keycloak-admin/lib/defs/userRepresentation';

const logger = Logger('kc.group');

export class KeycloakGroupService {
  private kcAdminClient: KeycloakAdminClient;

  constructor(issuerUrl: string) {
    const baseUrl = issuerUrl.substr(0, issuerUrl.indexOf('/realms'));
    const realmName = issuerUrl.substr(issuerUrl.lastIndexOf('/') + 1);
    logger.debug('%s %s', baseUrl, realmName);
    this.kcAdminClient = new KcAdminClient({ baseUrl, realmName });
  }

  public async login(
    clientId: string,
    clientSecret: string
  ): Promise<KeycloakGroupService> {
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

  public getAdminClient(): KeycloakAdminClient {
    return this.kcAdminClient;
  }

  // public async createIfMissingHierarchy(
  //   groupName: string,
  //   parentGroupNames: string[]
  // ) {
  //   let parentGroup = null;
  //   for (const parentGroupName of groupNames) {
  //     const groups = (await this.kcAdminClient.groups.find()).filter(
  //       (group: GroupRepresentation) => group.name == parentGroupName
  //     );

  //     parentGroup = groups[0];
  //   }
  // }

  public async createGroup(name: string) {
    logger.debug('[createGroup] %s', name);
    await this.kcAdminClient.groups.create({ name });
  }

  public async createIfMissing(parentGroupName: string, groupName: string) {
    const groups = (await this.kcAdminClient.groups.find()).filter(
      (group: GroupRepresentation) => group.name == parentGroupName
    );
    await this.createIfMissingForParentGroup(groups[0], groupName);
  }

  public async createIfMissingForParentGroup(
    parentGroup: GroupRepresentation,
    groupName: string
  ): Promise<GroupRepresentation> {
    const match = parentGroup.subGroups.filter(
      (group: GroupRepresentation) => group.name == groupName
    );
    if (match.length == 0) {
      logger.debug('[createIfMissing] CREATE %s...', groupName);
      const newGroup = await this.kcAdminClient.groups.setOrCreateChild(
        { id: parentGroup.id },
        {
          name: groupName,
        }
      );
      logger.info('[createIfMissing] CREATED %s', groupName);
      return newGroup;
    } else {
      logger.debug('[createIfMissing] EXISTS %s', groupName);
      return match[0];
    }
  }

  public async getAllGroups() {
    return await this.kcAdminClient.groups.find();
  }

  public async search(search: string) {
    return await this.kcAdminClient.groups.find({ search, first: 0, max: 500 });
  }

  public async getGroups(parentGroupName: string) {
    return (await this.kcAdminClient.groups.find()).filter(
      (group: GroupRepresentation) => group.name == parentGroupName
    );
  }

  public async getGroupById(id: string) {
    logger.debug('[getGroupById] %s', id);
    return await this.kcAdminClient.groups.findOne({ id });
  }

  public async getGroup(parentGroupName: string, groupName: string) {
    const groups = (await this.kcAdminClient.groups.find()).filter(
      (group: GroupRepresentation) => group.name == parentGroupName
    );
    if (
      groups[0].subGroups.filter(
        (group: GroupRepresentation) => group.name == groupName
      ).length == 0
    ) {
      logger.debug('[getGroup] MISSING %s', groupName);
      return null;
    } else {
      logger.debug('[getGroup] FOUND   %s', groupName);
      const grp = groups[0].subGroups.filter(
        (group: GroupRepresentation) => group.name == groupName
      )[0];
      return await this.kcAdminClient.groups.findOne({ id: grp.id });
    }
  }

  public async listMembers(id: string): Promise<UserRepresentation[]> {
    return await this.kcAdminClient.groups.listMembers({ id });
  }

  public async deleteGroup(id: string): Promise<void> {
    logger.debug('[deleteGroup] %s', id);
    await this.kcAdminClient.groups.del({ id });
  }
}
