
/********************************************/
/***** WARNING!!!! THIS IS AUTO-GENERATED ***/
/***** RUNING: npm run tsoa-gen-types     ***/
/********************************************/

export type DateTime = any;


/**
 * @tsoaModel
 *
 */  
export interface Organization {
  extForeignKey?: string; // Primary Key
  name?: string;
  sector?: string;
  title?: string;
  description?: string;
  extSource?: string;
  extRecordHash?: string;
  tags?: string[];
  orgUnits?: OrganizationUnit[];
}


/**
 * @tsoaModel
 *
 */  
export interface OrganizationUnit {
  extForeignKey?: string; // Primary Key
  name?: string;
  sector?: string;
  title?: string;
  description?: string;
  extSource?: string;
  extRecordHash?: string;
  tags?: string[];
}


/**
 * @tsoaModel
 *
 */  
export interface Dataset {
  extForeignKey?: string; // Primary Key
  name?: string;
  license_title?: string;
  security_class?: string;
  view_audience?: string;
  download_audience?: string;
  record_publish_date?: string;
  notes?: string;
  title?: string;
  isInCatalog?: string;
  extSource?: string;
  extRecordHash?: string;
  tags?: string[];
  organization?: OrganizationRefID;
  organizationUnit?: OrganizationUnitRefID;
}


/**
 * @tsoaModel
 *
 */  
export interface DraftDataset {
  name?: string; // Primary Key
  license_title?: string;
  security_class?: string;
  view_audience?: string;
  download_audience?: string;
  record_publish_date?: string;
  notes?: string;
  title?: string;
  isInCatalog?: string;
  tags?: string[];
  organization?: OrganizationRefID;
  organizationUnit?: OrganizationUnitRefID;
}


/**
 * @tsoaModel
 *
 */  
export interface Metric {
  name?: string; // Primary Key
  query?: string;
  day?: string;
  metric?: any; // toString
  values?: any; // toString
  service?: GatewayServiceRefID;
}


/**
 * @tsoaModel
 *
 */  
export interface Alert {
  name?: string; // Primary Key
}


/**
 * @tsoaModel
 *
 */  
export interface Namespace {
  extRefId?: string; // Primary Key
  name?: string;
}


/**
 * @tsoaModel
 *
 */  
export interface MemberRole {
  extRefId?: string; // Primary Key
  role?: string;
  user?: UserRefID;
}


/**
 * @tsoaModel
 *
 */  
export interface GatewayService {
  extForeignKey?: string; // Primary Key
  name?: string;
  namespace?: string;
  host?: string;
  extSource?: string;
  extRecordHash?: string;
  tags?: string[];
  plugins?: GatewayPlugin[];
}


/**
 * @tsoaModel
 *
 */  
export interface GatewayGroup {
  extForeignKey?: string; // Primary Key
  name?: string;
  namespace?: string;
  extSource?: string;
  extRecordHash?: string;
}


/**
 * @tsoaModel
 *
 */  
export interface GatewayRoute {
  extForeignKey?: string; // Primary Key
  name?: string;
  namespace?: string;
  extSource?: string;
  extRecordHash?: string;
  tags?: string[];
  methods?: string[];
  paths?: string[];
  hosts?: string[];
  service?: GatewayServiceRefID;
  plugins?: GatewayPlugin[];
}


/**
 * @tsoaModel
 *
 */  
export interface GatewayPlugin {
  extForeignKey?: string; // Primary Key
  name?: string;
  extSource?: string;
  extRecordHash?: string;
  tags?: string[];
  config?: any; // toString
  service?: GatewayServiceRefID;
  route?: GatewayRouteRefID;
}


/**
 * @tsoaModel
 *
 */  
export interface GatewayConsumer {
  extForeignKey?: string; // Primary Key
  username?: string;
  customId?: string;
  namespace?: string;
  extSource?: string;
  extRecordHash?: string;
  tags?: string[];
  aclGroups?: string[];
  plugins?: GatewayPlugin[];
}


/**
 * @tsoaModel
 *
 */  
export interface ServiceAccess {
  name?: string; // Primary Key
  active?: string;
  aclEnabled?: string;
  consumerType?: string;
  application?: ApplicationRefID;
  consumer?: GatewayConsumerRefID;
  productEnvironment?: EnvironmentRefID;
}


/**
 * @tsoaModel
 *
 */  
export interface Application {
  appId?: string; // Primary Key
  name?: string;
  description?: string;
  owner?: UserRefID;
  organization?: OrganizationRefID;
  organizationUnit?: OrganizationUnitRefID;
}


/**
 * @tsoaModel
 * @example {
 *   "name": "my-new-product",
 *   "appId": "000000000000",
 *   "environments": [
 *     {
 *       "name": "dev",
 *       "active": false,
 *       "approval": false,
 *       "flow": "public",
 *       "appId": "00000000"
 *     }
 *   ]
 * }
 */  
export interface Product {
  appId?: string; // Primary Key
  name?: string;
  namespace?: string;
  dataset?: DraftDatasetRefID;
  environments?: Environment[];
}


/**
 * @tsoaModel
 * @example {
 *   "name": "dev",
 *   "active": false,
 *   "approval": false,
 *   "flow": "public",
 *   "appId": "00000000"
 * }
 */  
export interface Environment {
  appId?: string; // Primary Key
  name?: "dev" | "test" | "prod" | "other";
  active?: boolean;
  approval?: boolean;
  flow?: "public" | "authorization-code" | "client-credentials" | "kong-acl-only" | "kong-api-key-only" | "kong-api-key-acl";
  additionalDetailsToRequest?: string;
  services?: GatewayServiceRefID[];
  legal?: LegalRefID;
  credentialIssuer?: CredentialIssuerRefID;
}


/**
 * @tsoaModel
 *
 */  
export interface CredentialIssuer {
  name?: string; // Primary Key
  namespace?: string;
  description?: string;
  flow?: "client-credentials";
  clientRegistration?: "managed";
  mode?: "auto";
  authPlugin?: string;
  clientAuthenticator?: "client-secret" | "client-jwt" | "client-jwt-jwks-url";
  instruction?: string;
  oidcDiscoveryUrl?: string;
  initialAccessToken?: string;
  clientId?: string;
  clientSecret?: string;
  resourceType?: string;
  resourceAccessScope?: string;
  apiKeyName?: string;
  availableScopes?: string[];
  resourceScopes?: string[];
  clientRoles?: string[];
  clientMappers?: string[];
  environmentDetails?: any; // toString
  owner?: UserRefID;
}


/**
 * @tsoaModel
 * @example {
 *   "externalLink": "https://externalsite/my_content",
 *   "title": "my_content",
 *   "description": "Summary of what my content is",
 *   "content": "Markdown content",
 *   "order": 0,
 *   "isPublic": true,
 *   "isComplete": true,
 *   "tags": [
 *     "tag1",
 *     "tag2"
 *   ]
 * }
 */  
export interface Content {
  externalLink?: string; // Primary Key
  title?: string;
  description?: string;
  content?: string;
  githubRepository?: string;
  readme?: string;
  order?: number;
  isPublic?: boolean;
  isComplete?: boolean;
  namespace?: string;
  publishDate?: string;
  slug?: string;
  tags?: string[];
}


/**
 * @tsoaModel
 *
 */  
export interface ContentBySlug {
  slug?: string; // Primary Key
  externalLink?: string;
  title?: string;
  description?: string;
  content?: string;
  githubRepository?: string;
  readme?: string;
  order?: string;
  isPublic?: string;
  isComplete?: string;
  publishDate?: string;
  tags?: string[];
}


/**
 * @tsoaModel
 *
 */  
export interface Legal {
  reference?: string; // Primary Key
  title?: string;
  link?: string;
  document?: string;
  version?: string;
  active?: string;
}


/**
 * @tsoaModel
 *
 */  
export interface Activity {
  extRefId?: string; // Primary Key
  type?: string;
  name?: string;
  action?: "add" | "update" | "create" | "delete" | "validate" | "publish";
  result?: "" | "received" | "failed" | "completed" | "success";
  message?: string;
  refId?: string;
  namespace?: string;
  blob?: string;
  updatedAt?: DateTime;
  createdAt?: DateTime;
  actor?: UserRefID;
}


/**
 * @tsoaModel
 *
 */  
export interface User {
  username?: string; // Primary Key
  name?: string;
  email?: string;
}


/**
 * @tsoaModel
 *
 */  
export interface Blob {
  ref?: string; // Primary Key
  blob?: string;
}

/**
 * @tsoaModel
 */  
export type ApplicationRefID = string

/**
 * @tsoaModel
 */  
export type CredentialIssuerRefID = string

/**
 * @tsoaModel
 */  
export type DraftDatasetRefID = string

/**
 * @tsoaModel
 */  
export type EnvironmentRefID = string

/**
 * @tsoaModel
 */  
export type GatewayConsumerRefID = string

/**
 * @tsoaModel
 */  
export type GatewayRouteRefID = string

/**
 * @tsoaModel
 */  
export type GatewayServiceRefID = string

/**
 * @tsoaModel
 */  
export type LegalRefID = string

/**
 * @tsoaModel
 */  
export type OrganizationRefID = string

/**
 * @tsoaModel
 */  
export type OrganizationUnitRefID = string

/**
 * @tsoaModel
 */  
export type UserRefID = string