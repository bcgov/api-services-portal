import { Scalars } from '../../services/keystone/types';

/**
 * @tsoaModel
 */
export interface ActivityDetail {
  id?: string;
  message: string;
  params: { [key: string]: string };
  activityAt: Scalars['DateTime'];
  blob?: any;
}

/**
 * @tsoaModel
 */
export interface PublishResult {
  message?: string;
  results?: string;
  error?: string;
}

/**
 * @tsoaModel
 * @example {
 *   "environmentAppId": "23C4F461",
 *   "application": { "name": "notify-tenant-a", "description": "Tenant A" },
 *   "labels": { "issued-by": "notify" },
 *   "controls": { "aclGroups": ["notify-tenant-a"] }
 * }
 */
export interface IssueGatewayConsumerRequest {
  /** Environment.appId from GET /gateways/{gateway}/products */
  environmentAppId: string;
  application: IssueGatewayConsumerApplication;
  /** Optional labels for filtering on the Consumers page, e.g. { "issued-by": "notify" } */
  labels?: { [key: string]: string };
  /** Optional controls; validity depends on the environment flow */
  controls?: IssueGatewayConsumerControls;
}

/**
 * @tsoaModel
 */
export interface IssueGatewayConsumerApplication {
  /**
   * Reuse an existing Application in this gateway (multi-env).
   * When set, name/description are ignored.
   */
  appId?: string;
  /** Required when creating a new Application */
  name?: string;
  description?: string;
}

/**
 * @tsoaModel
 */
export interface IssueGatewayConsumerControls {
  defaultClientScopes?: string[];
  defaultOptionalScopes?: string[];
  roles?: string[];
  aclGroups?: string[];
  clientGenCertificate?: boolean;
  clientCertificate?: string;
  jwksUrl?: string;
  plugins?: IssueGatewayConsumerPlugin[];
}

/**
 * @tsoaModel
 */
export interface IssueGatewayConsumerPlugin {
  name: string;
  config?: { [key: string]: any };
  service?: { name?: string };
  route?: { name?: string };
}

/**
 * Credential response modeled on NewCredential.
 * Fields present depend on flow / authenticator.
 *
 * @tsoaModel
 * @example {
 *   "flow": "kong-api-key-acl",
 *   "clientId": "23C4F461-A1B2C3D4E5F",
 *   "apiKey": "abcdef0123456789"
 * }
 */
export interface GatewayConsumerCredential {
  flow: string;
  clientId?: string;
  clientSecret?: string;
  issuer?: string;
  tokenEndpoint?: string;
  apiKey?: string;
  clientPublicKey?: string;
  clientPrivateKey?: string;
}
