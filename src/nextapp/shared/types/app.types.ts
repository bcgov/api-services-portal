export interface UserData {
  sub: string;
  name: string;
  businessName: string;
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

export interface RequestControls {
  defaultClientScopes?: string[];
  aclGroups?: string[];
  //    plugins?: ConsumerPlugin[]
}

export interface DocumentationArticle {
  id: string;
  content: string;
  publishDate: string;
  githubRepository: string | null;
  readme: string | null;
  description: string;
  slug: string;
  title: string;
  tags: string[];
}
