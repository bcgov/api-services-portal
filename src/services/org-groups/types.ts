export interface GroupMembership {
  name?: string;
  parent?: string;
  members?: GroupMember[];
}
export interface GroupAccess {
  name?: string;
  parent?: string;
  roles: GroupRole[];
}

export interface GroupMember {
  member: UserReference;
  roles: string[];
}

export interface GroupRole {
  name: string;
  permissions: GroupPermission[];
}

export interface GroupPermission {
  resource?: string;
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
