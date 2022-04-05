// Take the 'RolePermissionsTemplate'
import { PredefinedRolePermissions } from '.';
import { GroupAccess, GroupMember, UserReference } from './types';

export function buildGroupAccess(
  name: string,
  parent: string,
  resourceType: string,
  resource: string
): GroupAccess {
  const groupAccess: GroupAccess = {
    name,
    parent,
    roles: [],
  };

  Object.keys(PredefinedRolePermissions).forEach((roleName) => {
    const permissions = PredefinedRolePermissions[roleName].permissions
      .filter((p) => p.resourceType === resourceType)
      .map((p) => ({
        resource,
        scopes: p.scopes,
      }));
    groupAccess.roles.push({
      name: roleName,
      permissions,
    });
  });

  return groupAccess;
}

export function buildUserReference(
  role: string,
  members: GroupMember[]
): UserReference[] {
  return members.filter((m) => m.roles.includes(role)).map((m) => m.member);
}
