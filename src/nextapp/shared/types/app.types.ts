export interface UserData {
  sub: string;
  name: string;
  username: string;
  roles: string[];
  namespace: string | null;
  email: string;
  groups: string | null;
  userId: string;
}

export interface NamespaceData {
  id: string;
  name: string;
}
