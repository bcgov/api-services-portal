import { strict as assert } from 'assert';
import { Logger } from '../../logger';
import {
  KeycloakClientPolicyService,
  KeycloakClientService,
  KeycloakGroupService,
  KeycloakUserService,
} from '../keycloak';
import {
  GroupRepresentation,
  ClientScopeRepresentation,
  PolicyRepresentation,
  UserRepresentation,
  DecisionStrategy,
  Logic,
} from '@packages/keycloak-admin-client';

import { root } from './group-converter-utils';
import { User } from '../keystone/types';
import { GroupPermission, UserReference } from './types';
import { Policy } from '../uma2';

const logger = Logger('org-groups');

enum RoleGroups {
  'organization-admin',
}

/**
 * OrganizationGroup describes a full Group path for managing role-based group access
 * Three typical scenarios:
 * - name: data-custodian
 * - name: ministry-of-citizens-services
 *   parent: /data-custodian
 * - name: databc
 *   parent: /data-custodian/ministry-of-citizens-services
 */
export interface OrganizationGroup {
  name: string;
  parent?: string;
}

interface PolicyGroupReference {
  id: string;
  extendChildren: boolean;
}

function throwError(msg: string) {
  throw new Error(msg);
}

/*
   Manage an Organization Hierarchy in Keycloak
   and its related Policies

   Follows the structure of: /<role>/<organization>/<organizationUnit>

 */
export class OrgGroupService {
  private clientId: string;
  private keycloakService;
  private userKeycloakService;
  private groups: GroupRepresentation[];

  constructor(issuerUrl: string) {
    logger.debug('[OrgGroupService] %s', issuerUrl);
    this.keycloakService = new KeycloakGroupService(issuerUrl);

    this.userKeycloakService = new KeycloakUserService(issuerUrl);
    this.userKeycloakService.useAdminClient(
      this.keycloakService.getAdminClient()
    );
  }

  public async login(
    _clientId: string,
    _clientSecret: string
  ): Promise<OrgGroupService> {
    this.clientId = _clientId;
    await this.keycloakService.login(_clientId, _clientSecret);
    logger.debug('[OrgGroupService] Login OK');
    return this;
  }

  public getValidRoles(): string[] {
    return Object.keys(RoleGroups).filter((item) => {
      return isNaN(Number(item));
    });
  }

  public async backfillGroups(): Promise<void> {
    this.groups = await this.keycloakService.getAllGroups();
  }

  public findGroup(id: string): string {
    return this.findGroupTraverse(id, this.groups);
  }

  private findGroupTraverse(id: string, groups: GroupRepresentation[]): string {
    if (typeof groups === 'undefined') {
      logger.error('[findGroupTraverse] Failed to find %s', id);
      return undefined;
    }
    const match = groups.filter((group) => group.id == id);
    if (match.length == 1) {
      return match[0].path;
    }
    return groups
      .map((group) => this.findGroupTraverse(id, group.subGroups))
      .filter((result) => result)
      .pop();
  }

  // public async getGroups(parentGroupName: string) {
  //   return await this.keycloakService.getGroups(parentGroupName);
  // }

  public async deleteGroup(orgGroup: OrganizationGroup): Promise<void> {
    const groupIds = this.getGroupBranchToLeaf(orgGroup);
    await this.keycloakService.deleteGroup(groupIds.pop().id);
  }

  public async getGroupPermissionsByResource(resourceId: string) {
    logger.debug('[getGroupPermissionsByResource] %s', resourceId);
    const clientService = new KeycloakClientService(null).useAdminClient(
      this.keycloakService.getAdminClient()
    );

    const clientPolicyService = new KeycloakClientPolicyService(
      null
    ).useAdminClient(this.keycloakService.getAdminClient());

    const cid = (await clientService.findByClientId(this.clientId)).id;

    //const resource = await clientService.findResourceByName(cid, resourceName);

    const permissions = await clientPolicyService.listPermissionsByResource(
      cid,
      resourceId
    );

    const result: Policy[] = [];

    for (const permission of permissions) {
      const policy = await clientPolicyService.findPolicyById(
        cid,
        permission.policies[0].type,
        permission.policies[0].id
      );

      const groupIds: string[] = policy.groups.map((g: any) => g.id);

      const members = await this.listMembersOfGroups(groupIds);

      const groups = groupIds.map((gid) => this.findGroup(gid));

      const perm: Policy = {
        id: policy.id,
        name: policy.name,
        type: policy.type,
        logic: policy.logic,
        decisionStrategy: permission.decisionStrategy,
        owner: cid,
        description: policy.description,
        scopes: permission.scopes.map((s) => s.name),
        users: members.map((u) => u.email),
        groups: groups.sort(),
      };

      result.push(perm);
    }
    return result;
  }

  public async createGroupIfMissing(
    orgGroup: OrganizationGroup
  ): Promise<void> {
    logger.debug('[createIfMissing] %s', orgGroup);

    if (orgGroup.parent) {
      const parts = orgGroup.parent.split('/');
      if (parts.length > 4) {
        throwError(
          `Only three levels of organization structure are supported ${orgGroup.parent}`
        );
      } else if (parts.length == 2 || parts.length == 3 || parts.length == 4) {
        // parts: /<role>/<org>/<orgunit>
        const rootGroups: GroupRepresentation[] = this.groups.filter(
          (group: GroupRepresentation) => group.name == parts[1]
        );

        let rootGroup: GroupRepresentation;

        if (rootGroups.length == 0) {
          logger.debug(
            "[createGroupIfMissing] Root '%s' not found - creating",
            parts[1]
          );
          const newGroupName = parts[1];
          if (newGroupName in RoleGroups) {
            const newGroup = await this.keycloakService.createRootGroup(
              newGroupName
            );
            await this.backfillGroups();
            rootGroup = await this.keycloakService.getGroupById(newGroup.id);
          } else {
            throwError(`Invalid organization role ${newGroupName}`);
          }
        } else {
          rootGroup = rootGroups[0];
        }

        parts.push(orgGroup.name);
        for (let i = 2; i < parts.length; i++) {
          const groupMatch = rootGroup.subGroups.filter(
            (group: GroupRepresentation) => group.name == parts[i]
          );
          if (groupMatch.length == 1) {
            rootGroup = groupMatch[0];
          } else {
            const {
              created,
              id,
            } = await this.keycloakService.createIfMissingForParentGroup(
              rootGroup,
              parts[i]
            );
            created && (await this.backfillGroups());
            rootGroup = await this.keycloakService.getGroupById(id);
          }
        }
      }
    } else {
      if (orgGroup.name in RoleGroups) {
        // parent is blank, name is a role
        if (
          this.groups.filter(
            (grp: GroupRepresentation) => grp.name == orgGroup.name
          ).length == 0
        ) {
          await this.keycloakService.createGroup(orgGroup.name);

          // refresh cached list of groups
          await this.backfillGroups();
        }
      } else {
        throwError(`Invalid organization role ${orgGroup.name}`);
      }
    }
  }

  public async createOrUpdateOrgPermission(
    orgGroup: OrganizationGroup,
    scopeNames: string[]
  ): Promise<void> {
    const policyName = this.getGroupPolicyName(orgGroup);
    const resourceName = `org/${orgGroup.name}`;
    const permissionName = this.getGroupPermissionName(orgGroup, resourceName);
    await this.createOrUpdatePermission(
      policyName,
      permissionName,
      resourceName,
      scopeNames
    );
  }

  public async createOrUpdateGroupPermission(
    orgGroup: OrganizationGroup,
    resourceName: string,
    scopeNames: string[]
  ): Promise<void> {
    const policyName = this.getGroupPolicyName(orgGroup);
    const permissionName = this.getGroupPermissionName(orgGroup, resourceName);
    await this.createOrUpdatePermission(
      policyName,
      permissionName,
      resourceName,
      scopeNames
    );
  }

  public async deletePermission(permissionName: string): Promise<void> {
    const clientService = new KeycloakClientService(null).useAdminClient(
      this.keycloakService.getAdminClient()
    );

    const clientPolicyService = new KeycloakClientPolicyService(
      null
    ).useAdminClient(this.keycloakService.getAdminClient());

    // Assume that the client we are authenticating with is the Resource Server
    const cid = (await clientService.findByClientId(this.clientId)).id;

    await clientPolicyService.deletePermissionByName(cid, permissionName);
  }

  public async createOrUpdatePermission(
    policyName: string,
    permissionName: string,
    resourceName: string,
    scopeNames: string[]
  ): Promise<void> {
    const clientService = new KeycloakClientService(null).useAdminClient(
      this.keycloakService.getAdminClient()
    );

    const clientPolicyService = new KeycloakClientPolicyService(
      null
    ).useAdminClient(this.keycloakService.getAdminClient());

    // Assume that the client we are authenticating with is the Resource Server
    const cid = (await clientService.findByClientId(this.clientId)).id;

    const permissionPolicies: PolicyRepresentation[] = await clientPolicyService.findPermissionsByName(
      cid,
      permissionName
    );
    const permissionPolicy =
      permissionPolicies.length == 0 ? undefined : permissionPolicies[0];

    logger.debug('[createOrUpdatePermission] Exists? %j', permissionPolicy);

    let scopes: string[];
    let resources: string[] = [];

    if (resourceName) {
      const resource = await clientService.findResourceByName(
        cid,
        resourceName
      );

      resources = [(resource as any)._id];

      scopes = resource.scopes
        .filter((scope: ClientScopeRepresentation) =>
          scopeNames.includes(scope.name)
        )
        .map((c) => c.id);
    } else {
      const allScopes = await clientPolicyService.getAllClientAuthzScopes(cid);
      scopes = allScopes
        .filter((scope) => scopeNames.includes(scope.name))
        .map((c) => c.id);
    }

    const policies: string[] = [
      (await clientPolicyService.findPolicyByName(cid, policyName)).id,
    ];

    assert.strictEqual(
      typeof policies[0] != 'undefined',
      true,
      'Policy not found - ' + policyName
    );

    const permission: any = {
      decisionStrategy: DecisionStrategy.UNANIMOUS,
      logic: Logic.POSITIVE,
      name: permissionName,
      policies,
      resources,
      scopes,
      type: 'scope',
    };

    if (permissionPolicy) {
      logger.debug(
        'Updating permission (PolicyID=%s) %j',
        permissionPolicy.id,
        permission
      );
      const existingPolicyId = (permissionPolicy.config
        .policies[0] as PolicyRepresentation).id;

      assert.strictEqual(
        existingPolicyId,
        policies[0],
        `Permission (${permissionName}) has different policy assigned, unable to update (Existing ${existingPolicyId} != ${policies[0]})`
      );
      await clientPolicyService.updatePermission(
        cid,
        permissionPolicy.id,
        permission
      );
    } else {
      logger.debug('Creating permission %j', permission);
      await clientPolicyService.createPermission(cid, permission);
    }
  }

  public async createOrUpdateGroupPolicy(
    orgGroup: OrganizationGroup
  ): Promise<void> {
    const clientService = new KeycloakClientService(null).useAdminClient(
      this.keycloakService.getAdminClient()
    );

    const clientPolicyService = new KeycloakClientPolicyService(
      null
    ).useAdminClient(this.keycloakService.getAdminClient());

    const groups = this.getGroupBranchToLeaf(orgGroup);

    const name = this.getGroupPolicyName(orgGroup);

    const policy: any = {
      decisionStrategy: DecisionStrategy.UNANIMOUS,
      groups,
      logic: Logic.POSITIVE,
      type: 'group',
      name,
      description: this.getGroupPolicyDescription(orgGroup),
    };

    // Assume that the client we are authenticating with is the Resource Server
    const cid = (await clientService.findByClientId(this.clientId)).id;
    await clientPolicyService.createOrUpdatePolicy(cid, policy);
  }

  public async getGroupPathsByGroupName(name: string): Promise<string[]> {
    // traverse to find exact name matches
    const groups = await this.keycloakService.search(name);
    return this.traverse(groups, name, []);
  }

  private traverse(
    groups: GroupRepresentation[],
    name: string,
    paths: string[]
  ): string[] {
    const matches = groups.filter((g) => g.name === name);
    if (matches.length > 0) {
      paths.push(...matches.map((g) => g.path));
    } else {
      groups.forEach((g) => this.traverse(g.subGroups, name, paths));
    }
    return paths;
  }

  public listGroups(orgGroup: OrganizationGroup): GroupRepresentation[] {
    const branches = this.getGroupBranches(orgGroup);
    const isLeaf = (index: number) => index + 1 == branches.length;

    return this.getGroupBranches(orgGroup).map((group, index) =>
      this.traverseGroupBranches(group, isLeaf(index))
    );
  }

  public async getPermissionsForGroupPolicy(
    orgGroup: OrganizationGroup,
    permSearchTerm: string
  ): Promise<GroupPermission[]> {
    const clientService = new KeycloakClientService(null).useAdminClient(
      this.keycloakService.getAdminClient()
    );

    const clientPolicyService = new KeycloakClientPolicyService(
      null
    ).useAdminClient(this.keycloakService.getAdminClient());

    const cid = (await clientService.findByClientId(this.clientId)).id;

    const permissions = await clientPolicyService.findPermissionsMatchingPolicy(
      cid,
      permSearchTerm,
      this.getGroupPolicyName(orgGroup)
    );

    logger.debug('PERMS %j', permissions);
    return permissions.map((perm) => ({
      resource: perm.config.resources[0].name,
      scopes: perm.config.scopes.map((sc: any) => sc.name),
    }));
  }

  public async getGroupPermissions(
    orgGroup: OrganizationGroup,
    resources: string[]
  ): Promise<PolicyRepresentation[]> {
    const clientService = new KeycloakClientService(null).useAdminClient(
      this.keycloakService.getAdminClient()
    );

    const clientPolicyService = new KeycloakClientPolicyService(
      null
    ).useAdminClient(this.keycloakService.getAdminClient());

    const cid = (await clientService.findByClientId(this.clientId)).id;

    const permissions: PolicyRepresentation[] = [];

    for (const resourceName of resources) {
      const name = this.getGroupPermissionName(orgGroup, resourceName);

      const resourcePermission = await clientPolicyService.findPermissionByName(
        cid,
        name
      );
      permissions.push(resourcePermission);
    }
    return permissions;
  }

  private traverseGroupBranches(
    group: GroupRepresentation,
    isLeaf: boolean
  ): GroupRepresentation {
    const maskedGroup: { id: string; name: string; subGroups?: any } = {
      id: group.id,
      name: group.name,
    };

    if (isLeaf) {
      maskedGroup.subGroups = [];
      group.subGroups.forEach((subGroup) => {
        maskedGroup.subGroups.push(this.traverseGroupBranches(subGroup, false));
      });
    }

    return maskedGroup;
  }

  public async listMembers(orgGroup: OrganizationGroup): Promise<User[]> {
    const groupIds = this.getGroupBranchToLeaf(orgGroup);
    return this.listMembersOfGroups(groupIds.map((g) => g.id));
  }

  public async listMembersOfGroups(groupIds: string[]): Promise<User[]> {
    let allGroupMembers: UserRepresentation[] = [];
    for (const groupId of groupIds) {
      const groupMembers = await this.keycloakService.listMembers(groupId);
      allGroupMembers = [
        ...allGroupMembers,
        ...groupMembers?.filter(
          (u) => this.isExistingInList(u, allGroupMembers) == false
        ),
      ];
    }
    return allGroupMembers.map((user) => ({
      id: user.id,
      email: user.email,
    }));
  }

  public async listMembersForLeafOnly(
    orgGroup: OrganizationGroup
  ): Promise<UserReference[]> {
    const groupIds = this.getGroupBranchToLeaf(orgGroup);
    const group = groupIds[groupIds.length - 1];
    const groupMembers = await this.keycloakService.listMembers(group.id);
    return groupMembers.map((user) => ({
      id: user.id,
      username: user.username,
      email: user.email,
    }));
  }

  public async syncMembers(
    orgGroup: OrganizationGroup,
    memberEmails: UserReference[],
    validIdentityProviders: string[]
  ) {
    const groupIds = this.getGroupBranchToLeaf(orgGroup);
    const group = groupIds[groupIds.length - 1];

    logger.debug(
      '[syncMembers] %s (%s) %j',
      orgGroup.name,
      group.id,
      memberEmails
    );

    const currentMembers = (await this.listMembersForLeafOnly(orgGroup)).map(
      (u) => u.id
    );
    const desiredMembers = (
      await Promise.all(
        memberEmails.map((u) =>
          this.userKeycloakService.lookupUserIdByEmail(
            u.email,
            false,
            validIdentityProviders
          )
        )
      )
    ).filter((s) => s);

    const deletions = currentMembers.filter((u) => !desiredMembers.includes(u));
    const additions = desiredMembers.filter((u) => !currentMembers.includes(u));

    for (const userId of deletions) {
      await this.keycloakService.delMemberFromGroup(userId, group.id);
    }

    for (const userId of additions) {
      await this.keycloakService.addMemberToGroup(userId, group.id);
    }

    if (deletions.length == 0 && additions.length == 0) {
      logger.debug('[syncMembers] %s no updated needed.', orgGroup.name);
    }
  }

  private isExistingInList(
    user: UserRepresentation,
    allGroupMembers: UserRepresentation[]
  ): boolean {
    return allGroupMembers.filter((u) => u.id === user.id).length == 1;
  }

  public getGroupPolicyName(orgGroup: OrganizationGroup): string {
    return `group${orgGroup.parent}/${orgGroup.name}-policy`.replace(
      /\//g,
      '-'
    );
  }

  // public getOrgPermissionName(
  //   _: OrganizationGroup,
  //   resourceName: string
  // ): string {
  //   return `${resourceName} Group Access`;
  // }

  public getGroupPermissionName(
    orgGroup: OrganizationGroup,
    resourceName: string
  ): string {
    assert.strictEqual(
      root(orgGroup.parent) === '',
      false,
      `Did not get a role from ${orgGroup.parent}`
    );
    return `Access to '${resourceName}' services for role ${root(
      orgGroup.parent
    )}`;
  }

  private getGroupPolicyDescription(orgGroup: OrganizationGroup): string {
    return `Group '${orgGroup.parent}' / '${orgGroup.name}' Policy`;
  }

  private getGroupBranchToLeaf(
    orgGroup: OrganizationGroup
  ): PolicyGroupReference[] {
    const groupBranches = this.getGroupBranches(orgGroup);
    // extend to children to true on leaf
    return groupBranches.map((group) => ({
      id: group.id,
      extendChildren: false,
    }));
  }

  private getGroupBranches(orgGroup: OrganizationGroup): GroupRepresentation[] {
    const hierarchy: GroupRepresentation[] = [];

    const parts = orgGroup.parent ? orgGroup.parent.split('/') : [''];
    parts.push(orgGroup.name);

    const rootGroups: GroupRepresentation[] = this.groups.filter(
      (group: GroupRepresentation) => group.name == parts[1]
    );

    if (rootGroups.length == 0) {
      return [];
    }
    let rootGroup = rootGroups[0];

    hierarchy.push(rootGroup);

    for (let i = 2; i < parts.length; i++) {
      const groupMatch = rootGroup.subGroups.filter(
        (group: GroupRepresentation) => group.name == parts[i]
      );
      if (groupMatch.length == 1) {
        rootGroup = groupMatch[0];
        hierarchy.push(rootGroup);
      } else {
        throw new Error(`Group missing ${parts[i]}`);
      }
    }
    return hierarchy;
  }
}
