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
import { GroupAccess, GroupRole } from './types';
import { OrganizationGroup, OrgGroupService, OrgAuthzService } from './index';
import { leaf, parent, root, convertToOrgGroup } from './group-converter-utils';

const logger = Logger('group-access');

export class GroupAccessService {
  private orgGroupService;
  private orgAuthzService;

  constructor(uma2: Uma2WellKnown) {
    this.orgGroupService = new OrgGroupService(uma2.issuer);
    this.orgAuthzService = new OrgAuthzService(uma2);
  }

  async login(clientId: string, clientSecret: string) {
    await this.orgGroupService.login(clientId, clientSecret);
    await this.orgGroupService.backfillGroups();
    await this.orgAuthzService.login(clientId, clientSecret);
  }

  async createOrUpdateGroupAccess(access: GroupAccess): Promise<void> {
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
        if (perm.resource && perm.resource.startsWith('org/')) {
          assert.strictEqual(
            perm.resource,
            `org/${orgGroup.name}`,
            'Invalid organization resource in permission'
          );
        }
        await this.orgGroupService.createOrUpdateGroupPermission(
          orgGroup,
          perm.resource,
          perm.scopes
        );
      }

      await this.orgGroupService.syncMembers(orgGroup, groupRole.members);

      // TODO: Delete any Permissions that are no longer specified for the Policy
      // role.permissions = await this.orgGroupService.getPermissionsForGroupPolicy(
      //   groupPath
      // );
    }

    // TODO: Delete any Policies and Permissions that exist for Roles that were not defined
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
      const orgGroup = convertToOrgGroup(groupPath);
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
        members: [],
        permissions: [],
      };

      role.members = await this.orgGroupService.listMembersForLeafOnly(
        orgGroup
      );

      role.permissions = await this.orgGroupService.getPermissionsForGroupPolicy(
        orgGroup,
        role.name
      );

      groupAccess.roles.push(role);
    }
    return groupAccess;
  }
}
