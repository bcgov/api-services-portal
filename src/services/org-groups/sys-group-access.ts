import { Uma2WellKnown } from '../keycloak';
import { OrgAuthzService } from './authz';
import { NamespaceService } from './namespace';
import { OrganizationGroup, OrgGroupService } from './org-group-service';
import { GroupMembership, UserReference } from './types';
import { buildGroupAccess, buildUserReference } from './org-role';
import { strict as assert } from 'assert';
import { ValidateError } from 'tsoa';

export const SystemRoles = ['subsystem-owner', 'tech-lead', 'access-manager'];

export class SysGroupAccessService {
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
    type: 'subsystem' | 'runtime',
    groupMembership: GroupMembership,
    validIdentityProviders: string[] = [],
    syncMembers: boolean = true
  ): Promise<{
    granted: Record<string, string[]>;
    revoked: Record<string, string[]>;
  }> {
    const granted: Record<string, Set<string>> = {};
    const revoked: Record<string, Set<string>> = {};

    if (syncMembers && groupMembership.members?.length) {
      await this.assertMembersResolve(
        groupMembership.members.map((m) => m.member),
        validIdentityProviders
      );
    }

    const access = buildGroupAccess(
      groupMembership.name,
      groupMembership.parent,
      type,
      `${type === 'subsystem' ? 'sys' : 'rg'}/${groupMembership.name}`
    );

    // CreateIfMissing the Resource for the "org unit" (if this GroupAccess is for an Org Unit)
    // CreateIfMissing the Authorization Scopes for: GroupAccess.Manage, Namespace.Assign, Dataset.Manage
    await this.orgAuthzService.createIfMissingResource(type, access.name);

    for (const groupRole of access.roles.filter((r) =>
      SystemRoles.includes(r.name)
    )) {
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
          `${type === 'subsystem' ? 'sys' : 'rg'}/${orgGroup.name}`,
          'Invalid subsystem/runtime-group resource in permission'
        );
        await this.orgGroupService.createOrUpdateGroupPermission(
          orgGroup,
          perm.resource,
          perm.scopes
        );
      }

      if (syncMembers) {
        const diff = await this.orgGroupService.syncMembers(
          orgGroup,
          buildUserReference(groupRole.name, groupMembership.members),
          validIdentityProviders
        );
        for (const add of diff.additions) {
          if (!add.email) continue;
          granted[add.email] = granted[add.email] ?? new Set<string>();
          granted[add.email].add(groupRole.name);
        }
        for (const del of diff.deletions) {
          if (!del.email) continue;
          revoked[del.email] = revoked[del.email] ?? new Set<string>();
          revoked[del.email].add(groupRole.name);
        }
      }

      // TODO: Delete any Permissions that are no longer specified for the Policy
      // role.permissions = await this.orgGroupService.getPermissionsForGroupPolicy(
      //   groupPath
      // );
    }

    // TODO: Delete any Policies and Permissions that exist for Roles that were not defined
    return {
      granted: Object.keys(granted).reduce(
        (acc: Record<string, string[]>, email: string) => {
          acc[email] = [...granted[email]];
          return acc;
        },
        {}
      ),
      revoked: Object.keys(revoked).reduce(
        (acc: Record<string, string[]>, email: string) => {
          acc[email] = [...revoked[email]];
          return acc;
        },
        {}
      ),
    };
  }

  /**
   * Resolves every requested member against Keycloak before any group/policy/permission
   * mutations begin, so a partial member list never gets synced across roles when one
   * entry is invalid. Throws a 400 (tsoa ValidateError) naming the unresolved member(s).
   */
  private async assertMembersResolve(
    members: UserReference[],
    validIdentityProviders: string[]
  ): Promise<void> {
    const unique = [
      ...new Map(
        members.map((m) => [m.email ?? m.id, m])
      ).values(),
    ];

    const { unresolved } = await this.orgGroupService.resolveMembers(
      unique,
      validIdentityProviders
    );

    if (unresolved.length > 0) {
      throw new ValidateError(
        {
          members: {
            message: `Could not resolve member(s): ${unresolved
              .map((u) => u.email ?? u.id)
              .join(', ')}`,
          },
        },
        'Validation Failed'
      );
    }
  }
}
