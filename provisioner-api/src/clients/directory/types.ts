/**
 * Types for the APS Directory API v3 (`/ds/api/v3`), translated from its
 * OpenAPI 3.0 component schemas. Hand-maintained to mirror the upstream spec.
 */

export type OrganizationRefID = string;
export type OrganizationUnitRefID = string;
export type GatewayServiceRefID = string;
export type GatewayRouteRefID = string;
export type DraftDatasetRefID = string;
export type LegalRefID = string;
export type CredentialIssuerRefID = string;
export type RefID = string;

export interface DatasetContact {
  name?: string;
  email?: string;
  role?: 'pointOfContact';
}

export interface DatasetResource {
  id?: string;
  name?: string;
  format?: 'openapi-json' | 'json';
  url?: string;
}

export interface Dataset {
  extForeignKey?: string;
  name?: string;
  license_title?: string;
  security_class?: string;
  view_audience?: string;
  download_audience?: string;
  record_publish_date?: string;
  notes?: string;
  title?: string;
  isInCatalog?: string;
  isDraft?: string;
  contacts?: DatasetContact[];
  resources?: DatasetResource[];
  extSource?: string;
  extRecordHash?: string;
  tags?: string[];
  organization?: OrganizationRefID;
  organizationUnit?: OrganizationUnitRefID;
}

export type DatasetSecurityClass =
  | 'HIGH-CABINET'
  | 'HIGH-CONFIDENTIAL'
  | 'HIGH-SENSITIVITY'
  | 'MEDIUM-SENSITIVITY'
  | 'MEDIUM-PERSONAL'
  | 'LOW-SENSITIVITY'
  | 'LOW-PUBLIC'
  | 'PUBLIC'
  | 'PROTECTED A'
  | 'PROTECTED B'
  | 'PROTECTED C';

export type DatasetAudience =
  | 'Public'
  | 'Government'
  | 'Named users'
  | 'Government and Business BCeID';

export interface DraftDataset {
  name?: string;
  license_title?: string;
  security_class?: DatasetSecurityClass;
  view_audience?: DatasetAudience;
  download_audience?: DatasetAudience;
  record_publish_date?: string;
  notes?: string;
  title?: string;
  isInCatalog?: boolean;
  isDraft?: boolean;
  contacts?: DatasetContact[];
  resources?: DatasetResource[];
  tags?: string[];
  organization?: OrganizationRefID;
  organizationUnit?: OrganizationUnitRefID;
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

export interface GatewayPatternConfigRequest {
  pattern: string;
  parameters: Record<string, string>;
}

export interface Gateway {
  gatewayId?: string;
  displayName?: string;
}

export interface ActivityDetail {
  id?: string;
  message: string;
  params: Record<string, string>;
  activityAt: unknown;
  blob?: unknown;
}

export interface PublishResult {
  message?: string;
  results?: string;
  error?: string;
}

export interface GatewayPlugin {
  extForeignKey?: string;
  name?: string;
  extSource?: string;
  extRecordHash?: string;
  tags?: string[];
  config?: unknown;
  service?: GatewayServiceRefID;
  route?: GatewayRouteRefID;
}

export interface GatewayRoute {
  extForeignKey?: string;
  name?: string;
  gatewayId?: string;
  extSource?: string;
  extRecordHash?: string;
  tags?: string[];
  methods?: string[];
  paths?: string[];
  hosts?: string[];
  service?: GatewayServiceRefID;
  plugins?: GatewayPlugin[];
}

export interface IssuerEnvironmentConfig {
  environment?: string;
  exists?: boolean;
  issuerUrl?: string;
  clientRegistration?: 'anonymous' | 'managed' | 'iat';
  clientId?: string;
  clientSecret?: string;
  initialAccessToken?: string;
}

export interface CredentialIssuer {
  name?: string;
  gatewayId?: string;
  description?: string;
  flow?: 'client-credentials';
  mode?: 'auto';
  authPlugin?: string;
  clientAuthenticator?: 'client-secret' | 'client-jwt' | 'client-jwt-jwks-url';
  instruction?: string;
  environmentDetails?: IssuerEnvironmentConfig[];
  resourceType?: string;
  resourceAccessScope?: string;
  isShared?: boolean;
  apiKeyName?: string;
  availableScopes?: string[];
  resourceScopes?: string[];
  clientRoles?: string[];
  clientMappers?: string[];
  inheritFrom?: RefID;
  owner?: RefID;
}

export interface OrganizationUnit {
  extForeignKey?: string;
  name?: string;
  sector?: string;
  title?: string;
  description?: string;
  extSource?: string;
  extRecordHash?: string;
  tags?: string[];
}

export interface Organization {
  extForeignKey?: string;
  name?: string;
  sector?: string;
  title?: string;
  description?: string;
  extSource?: string;
  extRecordHash?: string;
  tags?: string[];
  orgUnits?: OrganizationUnit[];
}

export interface GroupPermission {
  resource?: string;
  scopes: string[];
}

export interface GroupRole {
  name: string;
  permissions: GroupPermission[];
}

export interface GroupAccess {
  name?: string;
  parent?: string;
  roles: GroupRole[];
}

export interface UserReference {
  id?: string;
  email?: string;
}

export interface GroupMember {
  member: UserReference;
  roles: string[];
}

export interface GroupMembership {
  name?: string;
  parent?: string;
  members?: GroupMember[];
}

export interface OrgNamespace {
  name: string;
  orgUnit: string;
  enabled: boolean;
  permDataPlane?: string;
  permDomains?: string[];
  updatedAt: number;
}

export interface Environment {
  appId?: string;
  name?: 'dev' | 'test' | 'prod' | 'sandbox' | 'other';
  active?: boolean;
  approval?: boolean;
  flow?:
    | 'public'
    | 'protected-externally'
    | 'authorization-code'
    | 'client-credentials'
    | 'kong-acl-only'
    | 'kong-api-key-only'
    | 'kong-api-key-acl';
  additionalDetailsToRequest?: string;
  services?: GatewayServiceRefID[];
  legal?: LegalRefID;
  credentialIssuer?: CredentialIssuerRefID;
}

export interface Product {
  appId?: string;
  name?: string;
  description?: string;
  gatewayId?: string;
  dataset?: DraftDatasetRefID;
  environments?: Environment[];
  organization?: OrganizationRefID;
}

/** Endpoint summary returned by `get-gateway-links`. */
export interface GatewayLink {
  host: string;
}

/** Result envelope for namespace assign/unassign operations. */
export interface AssignResult {
  result: string;
}

/** `type` path parameter for `GetNewID`. */
export type IdentifierType =
  | 'environment'
  | 'product'
  | 'application'
  | 'gateway';

/** Input for publishing a Kong declarative config to a gateway. */
export interface PublishGatewayConfigInput {
  /** Kong declarative config document (YAML or JSON). */
  configFile: string | Blob | Uint8Array;
  /** When true, validate without applying. */
  dryRun?: boolean;
  /** Filename advertised for the uploaded config (defaults to `config.yaml`). */
  filename?: string;
}
