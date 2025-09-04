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

export interface GatewayAdd {
  gatewayId?: string; // Primary Key
  displayName?: string;
  org?: string;
  domains?: string;
  dataPlane?: string;
}

export interface OrgAccessRequestCreateInput {
  org?: string;
  orgMemberId: string;
  userId?: string;
  consumerProductEnvAppId: string;
  providerProductEnvAppId: string;
  businessProcess: string;
  accessPointDN: string;
  optionalClientScopes: string[];
}

export interface OrgAccessRequest {
  id: string;
  name: string;
  isApproved: boolean;
  isIssued: boolean;
  isComplete: boolean;
  requestor: {
    name: string;
    username: string;
  };
  application: {
    name: string;
    appId: string;
    namespace: string;
  };
  productEnvironment: {
    name: string;
    appId: string;
    flow: string;
    product: {
      namespace: string;
      openapiSpecs: string[];
      name: string;
    };
  };
  serviceAccess: {      
    id: string;
    consumer: {
      username: string;
      tags: string[];
    };
  };
  createdAt: Scalars['DateTime'];
}