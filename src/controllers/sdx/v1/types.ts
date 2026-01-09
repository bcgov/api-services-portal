/**
 * @tsoaModel
 *
 */
export interface SubsystemInput {
  name: string;
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
