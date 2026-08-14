/**
 * Types for the SDX Member API (`/ds/api/sdx/v1`), translated from its
 * OpenAPI 3.0 component schemas. Hand-maintained to mirror the upstream spec.
 */

/** Reference to an organization by its identifier. */
export type OrganizationRefID = string;

export interface SubsystemEntry {
  name: string;
  description?: string;
  clientId: string;
  privacyZone?: string;
  organization?: {
    orgUnit?: string;
    title?: string;
    description?: string;
    name: string;
  };
  member?: {
    memberId: string;
    memberClass: string;
  };
  gateway?: {
    permissions?: {
      domains: string[];
      dataPlane: string;
    };
    id: string;
  };
  integrationClientIds: string[];
  runtimeGroups?: SubsystemRuntimeGroup[];
}

export interface SubsystemRuntimeGroup {
  consumerEndpoint?: string;
  sdxEndpoint?: string;
  host: string;
  name: string;
  environment: string;
}

export interface ServiceCatalogOperation {
  scopes?: { name: string; description?: string }[];
  path: string;
  method: string;
  summary: string;
  operationId: string;
}

export interface ServiceCatalogEntry {
  name: string;
  title: string;
  version: string;
  summary?: string;
  description: string;
  environment: string;
  operations: ServiceCatalogOperation[];
  spec?: string;
  subsystem: SubsystemEntry;
}

/** Result of a batched provisioning operation, possibly nested. */
export interface BatchResult {
  status: number;
  result: string;
  reason?: string;
  id?: string;
  refKey?: string;
  ownedBy?: string;
  childResults?: BatchResult[];
}

// modified from what the OpenAPI spec has
export interface ConnectionRequestInput {
  clientId: string;
  serviceId: string;
  isApproved?: boolean;
  isActive?: boolean;
  environment?: string;
  policyVersion?: string;
  requesterDetails?: any;
  clientResources?: any;
  serviceResources?: any;
  provisionerStatus?: ProvisionerStatus;
}

export interface ConnectionRequest {
  id?: string;
  clientId?: string;
  serviceId?: string;
  isApproved?: boolean;
  isActive?: boolean;
  policyVersion?: string;
  environment?: string;
  requesterDetails?: any;
  clientResources?: any;
  serviceResources?: any;
  provisionerStatus?: ProvisionerStatus;
}

export interface ProvisionerStatus {
  status: 'pending' | 'provisioned' | 'failed';
  message?: string;
}

export interface GatewayPatternConfigRequest {
  pattern: string;
  parameters: Record<string, unknown>;
}

export interface CreateNewKeyInput {
  runtimeGroupName: string;
}

export interface RuntimeGroupInput {
  name: string;
  sdxEndpoint?: string;
  consumerEndpoint?: string;
  hostedOrganizations?: string[];
}

export interface RuntimeGroup {
  name?: string;
  host?: string;
  environment?: string;
  sdxEndpoint?: string;
  consumerEndpoint?: string;
  gatewayId?: string;
  organization?: OrganizationRefID;
  hostedOrganizations?: OrganizationRefID[];
}

export interface SubsystemInput {
  name: string;
  description?: string;
  environments?: string[];
}

export interface Subsystem {
  name?: string;
  description?: string;
  gatewayId?: string;
  environments?: string[];
  organization?: OrganizationRefID;
}

/** Response of the gateway-registration operations. */
export interface GatewayIdResponse {
  gatewayId: string;
}

/** Response of the runtime-group one-time-token operation. */
export interface OneTimeTokenResponse {
  token: string;
}

/** `action` query parameter for `generateConfigFromPattern`. */
export type PatternAction = 'preview' | 'apply' | 'remove';

/** `filter` query parameter for `listRuntimeGroups`. */
export type RuntimeGroupFilter = 'owned' | 'available';
