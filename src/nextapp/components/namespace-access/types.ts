export type Scope = {
  id: string;
  name: string;
};

export type AccessItem = {
  requesterName: string;
  tickets: string[];
  scopes: Scope[];
};
