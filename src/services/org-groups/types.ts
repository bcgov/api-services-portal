import { User } from '../keystone/types';

export interface OrganizationGroupAccess {
  name: string;
  parent?: string;
  roles: GroupRole[];
}

export interface GroupRole {
  name: string;
  permissions: GroupPermission[];
  members: User[];
}

export interface GroupPermission {
  resource: string;
  scopes: string[];
}
