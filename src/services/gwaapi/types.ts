export interface KongPlugin {
  name: string;
  config: any;
  service?: KongObjectID;
  route?: KongObjectID;
}

export interface KongObjectID {
  id: string;
}
