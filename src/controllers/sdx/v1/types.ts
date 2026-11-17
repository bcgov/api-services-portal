import { SubsystemIntegration } from '../../v3/types';

/**
 * @tsoaModel
 *
 */
export interface SubsystemInput {
  name: string;
  description?: string;
  privacyZone?: string;
  environments?: string[];
  integrations?: SubsystemIntegration[];
}

/**
 * @tsoaModel
 *
 */
export interface OpenAPISpecInput {
  spec: string;
  subsystem: string;
  environment?: string;
}

/**
 * @tsoaModel
 *
 */
export interface RuntimeGroupInput {
  name: string;
  environment: string;
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
  environment: string;
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
  environment?: string;
  policyVersion?: string;
  requesterDetails?: any;
  /** Managed security settings are read-only on existing SDX.R1.00 connections. */
  clientResources?: any;
  /** Managed security settings are read-only on existing SDX.R1.00 connections. */
  serviceResources?: any;
  proposedConfiguration?: {
    policyVersion?: string;
    environment?: string;
    requesterDetails?: any;
    clientResources?: any;
    serviceResources?: any;
  };
  lifecycleIntent?: {
    action: 'activate' | 'deactivate' | 'retry' | 'revoke';
    operationId: string;
    phase: 'provision' | 'deprovision' | 'delete';
  };
  provisionerStatus?: {
    message: string;
    status:
      | 'pending'
      | 'provisioned'
      | 'deprovisioning'
      | 'deprovisioned'
      | 'failed';
    operation?: 'provision' | 'deprovision';
    operationId?: string;
    endpoint?: string;
    spec?: string;
  };
}

export interface ConnectionLifecycleActionInput {
  action: 'activate' | 'deactivate' | 'retry' | 'revoke';
  confirmAbandonRevoke?: boolean;
}

export interface ExpressRequest extends Express.Request {}
