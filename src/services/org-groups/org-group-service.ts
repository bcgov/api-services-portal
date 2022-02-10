import { strict as assert } from 'assert';
import { Logger } from '../../logger';
import KeycloakAdminClient, {
  default as KcAdminClient,
} from '@keycloak/keycloak-admin-client';
import {
  KeycloakClientPolicyService,
  KeycloakClientService,
  KeycloakGroupService,
} from '../keycloak';
import GroupRepresentation from '@keycloak/keycloak-admin-client/lib/defs/groupRepresentation';
import ClientScopeRepresentation from '@keycloak/keycloak-admin-client/lib/defs/clientScopeRepresentation';
import PolicyRepresentation, {
  DecisionStrategy,
  Logic,
} from '@keycloak/keycloak-admin-client/lib/defs/policyRepresentation';
import UserRepresentation from '@keycloak/keycloak-admin-client/lib/defs/userRepresentation';
import ResourceServerRepresentation from '@keycloak/keycloak-admin-client/lib/defs/resourceServerRepresentation';

const logger = Logger('org-groups');

enum RoleGroups {
  'data-custodians',
  'test',
}

interface OrganizationGroup {
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
  private groups: GroupRepresentation[];

  constructor(issuerUrl: string) {
    this.keycloakService = new KeycloakGroupService(issuerUrl);
  }

  public async login(
    _clientId: string,
    _clientSecret: string
  ): Promise<OrgGroupService> {
    this.clientId = _clientId;
    await this.keycloakService.login(_clientId, _clientSecret);
    return this;
  }

  public async backfillGroups(): Promise<void> {
    this.groups = await this.keycloakService.getAllGroups();
  }

  // public async getGroups(parentGroupName: string) {
  //   return await this.keycloakService.getGroups(parentGroupName);
  // }

  public async deleteGroup(orgGroup: OrganizationGroup) {
    const groupIds = this.getGroupBranchToLeaf(orgGroup);
    await this.keycloakService.deleteGroup(groupIds.pop().id);
  }

  public async createGroupIfMissing(
    orgGroup: OrganizationGroup
  ): Promise<void> {
    logger.debug('[createIfMissing] %s', orgGroup);

    if (orgGroup.parent) {
      const parts = orgGroup.parent.split('/');
      if (parts.length > 3) {
        throwError(
          `Only two levels of organization structure are supported ${orgGroup.parent}`
        );
      } else if (parts.length == 2 || parts.length == 3) {
        // parts: /<role>/<org>/<orgunit>
        let rootGroup: GroupRepresentation = this.groups.filter(
          (group: GroupRepresentation) => group.name == parts[1]
        )[0];

        parts.push(orgGroup.name);

        for (let i = 2; i < parts.length; i++) {
          const groupMatch = rootGroup.subGroups.filter(
            (group: GroupRepresentation) => group.name == parts[i]
          );
          if (groupMatch.length == 1) {
            rootGroup = groupMatch[0];
          } else {
            const newGroup = await this.keycloakService.createIfMissingForParentGroup(
              rootGroup,
              parts[i]
            );
            rootGroup = await this.keycloakService.getGroupById(newGroup.id);
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
        }
      } else {
        throwError(`Invalid organization role ${orgGroup.name}`);
      }
    }
  }

  public async createOrUpdateGroupPermission(
    orgGroup: OrganizationGroup,
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

    const name = this.getGroupPermissionName(orgGroup, resourceName);

    const permissionPolicy = await clientPolicyService.findPolicyByName(
      cid,
      name
    );

    logger.debug(
      '[createOrUpdateGroupPermission] Exists? %j',
      permissionPolicy
    );

    const resource = await clientService.findResourceByName(cid, resourceName);

    const scopes = resource.scopes
      .filter((scope: ClientScopeRepresentation) =>
        scopeNames.includes(scope.name)
      )
      .map((c) => c.id);

    const resources = [(resource as any)._id];

    const policies = [
      (
        await clientPolicyService.findPolicyByName(
          cid,
          this.getGroupPolicyName(orgGroup)
        )
      ).id,
    ];

    const permission: any = {
      decisionStrategy: DecisionStrategy.UNANIMOUS,
      logic: Logic.POSITIVE,
      name,
      policies,
      resources,
      scopes,
      type: 'scope',
    };

    if (permissionPolicy) {
      logger.debug(
        'Updating permission (%s) %j',
        permissionPolicy.id,
        permission
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

  public listGroups(orgGroup: OrganizationGroup): GroupRepresentation[] {
    const branches = this.getGroupBranches(orgGroup);
    const isLeaf = (index: number) => index + 1 == branches.length;

    return this.getGroupBranches(orgGroup).map((group, index) =>
      this.traverseGroupBranches(group, isLeaf(index))
    );
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
    const maskedGroup: { name: string; subGroups?: any } = {
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

  public async listMembers(
    orgGroup: OrganizationGroup
  ): Promise<UserRepresentation[]> {
    const groupIds = this.getGroupBranchToLeaf(orgGroup);
    let allGroupMembers: UserRepresentation[] = [];
    for (const group of groupIds) {
      const groupMembers = await this.keycloakService.listMembers(group.id);
      allGroupMembers = [
        ...allGroupMembers,
        ...groupMembers.filter(
          (u) => this.isExistingInList(u, allGroupMembers) == false
        ),
      ];
    }
    return allGroupMembers.map((user) => ({
      id: user.id,
      username: user.username,
      email: user.email,
    }));
  }

  private isExistingInList(
    user: UserRepresentation,
    allGroupMembers: UserRepresentation[]
  ): boolean {
    return allGroupMembers.filter((u) => u.id === user.id).length == 1;
  }

  private getGroupPolicyName(orgGroup: OrganizationGroup): string {
    return `group${orgGroup.parent}/${orgGroup.name}-policy`.replace(
      /\//g,
      '-'
    );
  }

  private getGroupPermissionName(
    orgGroup: OrganizationGroup,
    resourceName: string
  ): string {
    return `${resourceName} permission for group ${orgGroup.parent}/${orgGroup.name}`;
  }

  private getGroupPolicyDescription(orgGroup: OrganizationGroup): string {
    return `Group '${orgGroup.parent}' / '${orgGroup.name}' Policy`;
  }

  private getGroupBranchToLeaf(
    orgGroup: OrganizationGroup
  ): PolicyGroupReference[] {
    return this.getGroupBranches(orgGroup).map((group) => ({
      id: group.id,
      extendChildren: false,
    }));
  }

  private getGroupBranches(orgGroup: OrganizationGroup): GroupRepresentation[] {
    const hierarchy: GroupRepresentation[] = [];

    const parts = orgGroup.parent ? orgGroup.parent.split('/') : [''];
    parts.push(orgGroup.name);

    let rootGroup: GroupRepresentation = this.groups.filter(
      (group: GroupRepresentation) => group.name == parts[1]
    )[0];

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
