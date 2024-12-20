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
  private allGroups: any = undefined;
  private kcAdminClient: KeycloakAdminClient;
  private clientId: string;
  private clientSecret: string;
  private lastAuthTime: number = 0;
  private readonly AUTH_TIMEOUT = 280 * 1000; // 280 seconds (slightly less than typical 5 min token lifetime)

  constructor(issuerUrl: string) {
    const baseUrl = issuerUrl.substr(0, issuerUrl.indexOf('/realms'));
    const realmName = issuerUrl.substr(issuerUrl.lastIndexOf('/') + 1);
    logger.debug('%s %s', baseUrl, realmName);
    this.kcAdminClient = new KcAdminClient({ baseUrl, realmName });
  }

  private async ensureAuthenticated(): Promise<void> {
    if (this.clientId && (Date.now() - this.lastAuthTime > this.AUTH_TIMEOUT)) {
      logger.debug('[ensureAuthenticated] Re-authenticating due to timeout');
      await this.login(this.clientId, this.clientSecret);
    }
  }

  public async cacheGroups() {
    this.allGroups = await this.getAllGroups();
  }

  public async login(
    clientId: string,
    clientSecret: string,
    retryAttempts: number = 3
  ): Promise<KeycloakGroupService> {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    
    const result = await this._login(retryAttempts);
    this.lastAuthTime = Date.now();
    return result;
  }

  private async _login(retryAttempts: number): Promise<KeycloakGroupService> {
    logger.debug('[login] %s', this.clientId);

    for (let attempt = 1; attempt <= retryAttempts; attempt++) {
      try {
        await this.kcAdminClient
          .auth({
            grantType: 'client_credentials',
            clientId: this.clientId,
            clientSecret: this.clientSecret,
          });
        return this;
      } catch (err: any) {
        if (attempt === retryAttempts) {
          logger.error('[login] Login failed after %d attempts: %s', retryAttempts, err);
          throw err;
        }
        logger.warn('[login] Attempt %d failed, retrying: %s', attempt, err);
        // Add exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100));
      }
    }
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

  public async updateGroup(group: GroupRepresentation): Promise<void> {
    await this.ensureAuthenticated();
    logger.debug('[updateGroup] %j', group);
    await this.kcAdminClient.groups.update({ id: group.id }, group);
  }

  public async createIfMissing(
    parentGroupName: string,
    groupName: string
  ): Promise<void> {
    const groups = (await this.kcAdminClient.groups.find()).filter(
      (group: GroupRepresentation) => group.name == parentGroupName
    );
    await this.createIfMissingForParentGroup(groups[0], groupName);
  }

  public async createRootGroup(groupName: string) {
    logger.debug('[createRootGroup] %s', groupName);

    const result = await this.kcAdminClient.groups.create({
      name: groupName,
    } as GroupRepresentation);
    logger.debug('[createRootGroup] Result %j', result);
    return result;
  }

  public async createIfMissingForParentGroup(
    parentGroup: GroupRepresentation,
    groupName: string
  ): Promise<{ created: boolean; id: string }> {
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
      return { created: true, id: newGroup.id };
    } else {
      logger.debug('[createIfMissing] EXISTS %s', groupName);
      return { created: false, id: match[0].id };
    }
  }

  public async getAllGroups() {
    return this.kcAdminClient.groups.find();
  }

  public async search(
    search: string,
    briefRepresentation: boolean = true
  ): Promise<GroupRepresentation[]> {
    const result = await this.kcAdminClient.groups.find({
      search,
      first: 0,
      max: 500,
      briefRepresentation,
    });
    logger.debug('[search] %j', result);
    return result;
  }

  public async findByName(
    root: string,
    name: string,
    briefRepresentation: boolean = true
  ) {
    const result = await this.search(name, briefRepresentation);
    const selectedBranch = result.filter((g) => g.name === root);
    if (selectedBranch.length == 0) {
      logger.error('[findByName] %s - not found', root);
      return null;
    }
    return this.searchTree(selectedBranch, name, 'name', false);
  }

  public async getGroups(
    parentGroupName: string,
    briefRepresentation: boolean = true
  ) {
    return (
      await this.kcAdminClient.groups.find({ briefRepresentation })
    ).filter((group: GroupRepresentation) => group.name == parentGroupName);
  }

  public async getGroupById(id: string) {
    logger.debug('[getGroupById] %s', id);
    return this.kcAdminClient.groups.findOne({ id });
  }

  public async hasGroup(parentGroupName: string, groupName: string) {
    const listOfGroups = this.allGroups
      ? this.allGroups
      : await this.kcAdminClient.groups.find();
    const groups = listOfGroups.filter(
      (group: GroupRepresentation) => group.name == parentGroupName
    );
    if (
      groups[0].subGroups.filter(
        (group: GroupRepresentation) => group.name == groupName
      ).length == 0
    ) {
      return false;
    } else {
      return true;
    }
  }

  public async getGroup(parentGroupName: string, groupName: string) {
    const listOfGroups = this.allGroups
      ? this.allGroups
      : await this.kcAdminClient.groups.find();
    const groups = listOfGroups.filter(
      (group: GroupRepresentation) => group.name == parentGroupName
    );
    if (
      groups[0].subGroups.filter(
        (group: GroupRepresentation) => group.name == groupName
      ).length == 0
    ) {
      logger.error('[getGroup] MISSING %s', groupName);
      return null;
    } else {
      logger.debug('[getGroup] FOUND   %s', groupName);
      const grp = groups[0].subGroups.filter(
        (group: GroupRepresentation) => group.name == groupName
      )[0];
      const group = await this.kcAdminClient.groups.findOne({ id: grp.id });
      logger.debug('[getGroup] FOUND   %j', group);
      return group;
    }
  }

  public async listMembers(id: string): Promise<UserRepresentation[]> {
    return this.kcAdminClient.groups.listMembers({ id });
  }

  public async addMemberToGroup(id: string, groupId: string): Promise<string> {
    logger.debug('[addMemberToGroup] %s from %s', id, groupId);
    return this.kcAdminClient.users.addToGroup({ id, groupId });
  }

  public async delMemberFromGroup(
    id: string,
    groupId: string
  ): Promise<string> {
    logger.debug('[delMemberFromGroup] %s from %s', id, groupId);
    return this.kcAdminClient.users.delFromGroup({ id, groupId });
  }

  public async lookupMemberByEmail(email: string): Promise<string> {
    const foundUsers = await this.kcAdminClient.users.find({
      email,
      exact: true,
    });
    if (foundUsers.length == 0) {
      logger.warn('[lookupMemberByEmail] User not found %s', email);
    }
    return foundUsers.length == 0 ? null : foundUsers[0].id;
  }

  public async deleteGroup(id: string): Promise<void> {
    logger.debug('[deleteGroup] %s', id);
    await this.kcAdminClient.groups.del({ id });
  }

  private searchTree(tree: any, value: string, key = 'id', reverse = false) {
    const stack = [tree[0]];
    while (stack.length) {
      const node = stack[reverse ? 'pop' : 'shift']();
      if (node[key] === value) return node;
      node.subGroups && stack.push(...node.subGroups);
    }
    return null;
  }
}
