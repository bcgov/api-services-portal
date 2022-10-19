import { strict as assert } from 'assert';
import { Logger } from '../../logger';
import KeycloakAdminClient, {
  default as KcAdminClient,
} from '@keycloak/keycloak-admin-client';
import {
  KeycloakClientPolicyService,
  KeycloakClientService,
  KeycloakGroupService,
  Uma2WellKnown,
} from '../keycloak';
import GroupRepresentation from '@keycloak/keycloak-admin-client/lib/defs/groupRepresentation';
import ClientScopeRepresentation from '@keycloak/keycloak-admin-client/lib/defs/clientScopeRepresentation';
import PolicyRepresentation, {
  DecisionStrategy,
  Logic,
} from '@keycloak/keycloak-admin-client/lib/defs/policyRepresentation';
import UserRepresentation from '@keycloak/keycloak-admin-client/lib/defs/userRepresentation';
import ResourceServerRepresentation from '@keycloak/keycloak-admin-client/lib/defs/resourceServerRepresentation';
import { GroupAccess, GroupMember, GroupMembership, GroupRole } from './types';
import { OrganizationGroup, OrgGroupService, OrgAuthzService } from './index';
import { leaf, parent, root, convertToOrgGroup } from './group-converter-utils';
import { buildGroupAccess, buildUserReference } from './org-role';
import { NamespaceService } from './namespace';

const logger = Logger('group-access');

export class GroupAccessService {
  private orgGroupService;
  private orgAuthzService;
  private namespaceService;

  constructor(uma2: Uma2WellKnown) {
    this.orgGroupService = new OrgGroupService(uma2.issuer);
    this.orgAuthzService = new OrgAuthzService(uma2);
    this.namespaceService = new NamespaceService(uma2.issuer);
  }

  async login(clientId: string, clientSecret: string) {
    await this.orgGroupService.login(clientId, clientSecret);
    await this.orgGroupService.backfillGroups();
    await this.orgAuthzService.login(clientId, clientSecret);
    await this.namespaceService.login(clientId, clientSecret);
  }

  async createOrUpdateGroupAccess(
    groupMembership: GroupMembership,
    validIdentityProviders: string[]
  ): Promise<void> {
    const access = buildGroupAccess(
      groupMembership.name,
      groupMembership.parent,
      'organization',
      `org/${groupMembership.name}`
    );

    // CreateIfMissing the Resource for the "org unit" (if this GroupAccess is for an Org Unit)
    // CreateIfMissing the Authorization Scopes for: GroupAccess.Manage, Namespace.Assign, Dataset.Manage
    await this.orgAuthzService.createIfMissingResource(access.name);

    for (const groupRole of access.roles) {
      const parent = access.parent ? access.parent : '';
      const orgGroup: OrganizationGroup = {
        name: access.name,
        parent: `/${groupRole.name}${parent}`,
      };
      // assert.strictEqual(
      //   groupRole.permissions && parent != '',
      //   true,
      //   'Permissions are only supported at the leaf (org unit) level.'
      // );

      await this.orgGroupService.createGroupIfMissing(orgGroup);

      await this.orgGroupService.createOrUpdateGroupPolicy(orgGroup);

      for (const perm of groupRole.permissions) {
        assert.strictEqual(
          perm.resource,
          `org/${orgGroup.name}`,
          'Invalid organization resource in permission'
        );
        await this.orgGroupService.createOrUpdateGroupPermission(
          orgGroup,
          perm.resource,
          perm.scopes
        );
      }

      await this.orgGroupService.syncMembers(
        orgGroup,
        buildUserReference(groupRole.name, groupMembership.members),
        validIdentityProviders
      );

      // TODO: Delete any Permissions that are no longer specified for the Policy
      // role.permissions = await this.orgGroupService.getPermissionsForGroupPolicy(
      //   groupPath
      // );
    }

    // TODO: Delete any Policies and Permissions that exist for Roles that were not defined
  }

  async assignNamespace(
    namespace: string,
    org: string,
    orgUnit: string
  ): Promise<boolean> {
    if (
      await this.namespaceService.assignNamespaceToOrganization(
        namespace,
        org,
        orgUnit
      )
    ) {
      const access = buildGroupAccess(
        orgUnit,
        `/ca.bc.gov/${org}`,
        'namespace',
        namespace
      );

      for (const groupRole of access.roles) {
        const parent = access.parent ? access.parent : '';
        const orgGroup: OrganizationGroup = {
          name: access.name,
          parent: `/${groupRole.name}${parent}`,
        };

        for (const perm of groupRole.permissions) {
          await this.orgGroupService.createOrUpdateGroupPermission(
            orgGroup,
            perm.resource,
            perm.scopes
          );
        }
      }
      return true;
    } else {
      return false;
    }
  }

  async unassignNamespace(namespace: string, org: string, orgUnit: string) {
    if (
      await this.namespaceService.unassignNamespaceFromOrganization(
        namespace,
        org,
        orgUnit
      )
    ) {
      const access = buildGroupAccess(
        orgUnit,
        `/ca.bc.gov/${org}`,
        'namespace',
        namespace
      );

      for (const groupRole of access.roles) {
        const parent = access.parent ? access.parent : '';
        const orgGroup: OrganizationGroup = {
          name: access.name,
          parent: `/${groupRole.name}${parent}`,
        };

        for (const perm of groupRole.permissions) {
          const permissionName = this.orgGroupService.getGroupPermissionName(
            orgGroup,
            perm.resource
          );
          await this.orgGroupService.deletePermission(permissionName);
        }
      }
      return true;
    } else {
      return false;
    }
  }

  async getGroupAccess(groupAccessName: string): Promise<GroupAccess> {
    // format: /<role>/<organization>/<orgUnit>
    const fullGroupPaths = await this.orgGroupService.getGroupPathsByGroupName(
      groupAccessName
    );

    if (fullGroupPaths.length == 0) {
      return undefined;
    }

    const groupAccess: GroupAccess = {
      name: leaf(fullGroupPaths[0]),
      parent: parent(fullGroupPaths[0]),
      roles: [],
    };

    for (const groupPath of fullGroupPaths) {
      logger.debug('[getGroupAccess] Evaluate %s', groupPath);
      const orgGroup: OrganizationGroup = convertToOrgGroup(groupPath);
      assert.strictEqual(
        orgGroup.name,
        groupAccess.name,
        'Group ' +
          groupAccessName +
          ' mismatched group. ' +
          `${orgGroup.name} != ${groupAccess.name}`
      );

      const role: GroupRole = {
        name: root(groupPath),
        permissions: [],
      };

      role.permissions = await this.orgGroupService.getPermissionsForGroupPolicy(
        orgGroup,
        role.name
      );

      groupAccess.roles.push(role);
    }
    return groupAccess;
  }

  async getGroupMembership(groupAccessName: string): Promise<GroupMembership> {
    // format: /<role>/<orgN>/<organization>/<orgUnit>
    const fullGroupPaths = await this.orgGroupService.getGroupPathsByGroupName(
      groupAccessName
    );

    if (fullGroupPaths.length == 0) {
      return undefined;
    }

    const groupMembership: GroupMembership = {
      name: leaf(fullGroupPaths[0]),
      parent: parent(fullGroupPaths[0]),
      members: [],
    };

    const members: { [email: string]: GroupMember } = {};

    for (const groupPath of fullGroupPaths) {
      logger.debug('[getGroupAccess] Evaluate %s', groupPath);
      const orgGroup: OrganizationGroup = convertToOrgGroup(groupPath);
      assert.strictEqual(
        orgGroup.name,
        groupMembership.name,
        'Group ' +
          groupAccessName +
          ' mismatched group. ' +
          `${orgGroup.name} != ${groupMembership.name}`
      );

      const roleMembers = await this.orgGroupService.listMembersForLeafOnly(
        orgGroup
      );

      roleMembers.forEach((userRef) => {
        if (userRef.email in members) {
          members[userRef.email].roles.push(root(fullGroupPaths[0]));
        } else {
          members[userRef.email] = {
            member: userRef,
            roles: [root(fullGroupPaths[0])],
          };
        }
      });
    }
    groupMembership.members = Object.values(members);

    return groupMembership;
  }
}
