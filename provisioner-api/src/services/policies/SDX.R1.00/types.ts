export interface ConnectionRequest_SDX_R1_00 {
  clientId: string;
  serviceId: string;
  isApproved: boolean;
  scopes: string[];
  policyVersion: string;
  environment: string;
  requesterDetails: RequesterDetails;
  clientResources: ClientResources;
  serviceResources: ServiceResources;
}

export interface RequesterDetails {
  submissionId: string;
  requestor: string;
  client: {
    integrationId?: string;
    clientId: string;
    privacyZone: string;
  };
  service: {
    integrationId?: string;
    clientId: string;
    privacyZone: string;
  };
}

export interface ClientResources {
  gatewayPatterns: GatewayPatternInput[];
}

export interface GatewayPatternInput {
  pattern: string;
  parameters: Record<string, unknown>;
}

export interface ServiceResources {
  subsystemId: string;
  gatewayPatterns: GatewayPatternInput[];
}
