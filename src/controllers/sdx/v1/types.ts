/**
 * @tsoaModel
 *
 */
export interface SubsystemInput {
  name: string;
  description?: string;
  integrationId?: string;
}

/**
 * @tsoaModel
 *
 */
export interface OpenAPISpecInput {
  spec: string;
  subsystem: string;
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
}

export interface ExpressRequest extends Express.Request {}
