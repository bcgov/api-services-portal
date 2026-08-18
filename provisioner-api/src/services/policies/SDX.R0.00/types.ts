export interface ClientResources {
  comment?: string;
  gatewayPatterns: Record<string, Record<string, unknown>>;
}

export interface ServiceResources {
  comment?: string;
  gatewayPatterns: Record<string, Record<string, unknown>>;
}
