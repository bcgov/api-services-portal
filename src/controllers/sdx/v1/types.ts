/**
 * @tsoaModel
 *
 */
export interface SubsystemInput {
  name: string;
  description?: string;
  environments?: string[];
}

/**
 * @tsoaModel
 *
 */
export interface OpenAPISpecInput {
  spec: string;
  subsystem: string;
  environments?: string[];
}

/**
 * @tsoaModel
 *
 */
export interface RuntimeGroupInput {
  name: string;
  sdxEndpoint?: string;
  consumerEndpoint?: string;
  hostedOrganizations?: string[];
}

/**
 * @tsoaModel
 *
 */
export interface CreateNewKeyInput {
  runtimeGroupName: string;
}

export interface GatewayPattern {
  pattern: string;
  parameters: Record<string, any>;
}

/**
 * @tsoaModel
 *
 */
export interface ConnectionRequestInput {
  clientId: string;
  serviceId: string;
  isApproved?: boolean;
  isActive?: boolean;
  environment?: 'lab' | 'mck' | 'dev' | 'tst' | 'prd' | 'sbx';
  policyVersion?: string;
  requesterDetails?: any;
  clientResources?: any;
  serviceResources?: any;
  provisionerStatus?: {
    message: string;
    status: 'pending' | 'provisioned' | 'failed';
  };
}

export interface ExpressRequest extends Express.Request {}
