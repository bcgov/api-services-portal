export interface MockQuery {
  name: string;
  params: Map<string, string>;
  data: any;
}

export const mockQueries: MockQuery[] = [];

export const get = (name: string) =>
  mockQueries.filter((m) => m.name === name).pop();
