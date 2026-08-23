export type DateTime = any;

export interface Activity {
  id?: string; // Primary Key
  type?: string;
  name?: string;
  action?: 'add' | 'update' | 'create' | 'delete' | 'validate' | 'publish';
  result?: '' | 'received' | 'failed' | 'completed' | 'success';
  message?: string;
  refId?: string;
  gatewayId?: string;
  blob?: [{ id: string; blob: string }]; // JSON blob stored as string
  filterKey1?: string;
  filterKey2?: string;
  filterKey3?: string;
  filterKey4?: string;
  updatedAt?: DateTime;
  createdAt?: DateTime;
  context?: any; // toString
  actor?: string;
}

export interface Application {
  name: string;
  description?: string;
  namespace: string;
}

export interface ProvisionerStatus {
  status: 'pending' | 'provisioned' | 'failed';
  message?: string;
  endpoint?: string;
  spec?: string;
  [information: string]: unknown;
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
  provisionerStatus?: ProvisionerStatus | string;
}

export interface ConnectionProvisionerStatusUpdate {
  clientId: string;
  serviceId: string;
  provisionerStatus: ProvisionerStatus;
}
