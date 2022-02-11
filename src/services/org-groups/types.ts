export interface GroupAccess {
  name: string;
  parent?: string;
  roles: GroupRole[];
}

export interface GroupRole {
  name: string;
  permissions: GroupPermission[];
  members: UserReference[];
}

export interface GroupPermission {
  resource: string;
  scopes: string[];
}

export interface UserReference {
  id?: string;
  username: string;
  email?: string;
}

export interface OrgNamespace {
  name: string;
  orgUnit: string;
}
