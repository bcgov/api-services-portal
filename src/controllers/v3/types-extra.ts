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