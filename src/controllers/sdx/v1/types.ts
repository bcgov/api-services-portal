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

/**
 * @tsoaModel
 *
 */
export interface ConnectionRequestInput {
  clientId: string;
  serviceId: string;
  isApproved?: boolean;
  isActive?: boolean;
  requesterDetails?: any;
  clientResources?: any;
  serviceResources?: any;
}

export interface ExpressRequest extends Express.Request {}
