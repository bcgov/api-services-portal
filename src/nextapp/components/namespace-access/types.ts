export type Scope = {
  id: string;
  name: string;
};

export type AccessItem = {
  id?: string;
  name?: string;
  requesterName?: string;
  requesterEmail?: string;
  tickets?: string[];
  scopes: Scope[];
};
