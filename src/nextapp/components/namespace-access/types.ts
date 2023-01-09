export type Scope = {
  id: string;
  name: string;
};

export type AccessItem = {
  id?: string;
  name?: string;
  requesterName?: string;
  tickets?: string[];
  scopes: Scope[];
};
