import { RuntimeGroup } from '../../../controllers/v3/types';

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
  state?: string;
  spec: string;
  subsystem: string;
}

/**
 * @tsoaModel
 *
 */
export interface RuntimeGroupInput {
  name: string;
  publicEndpoint?: string;
  privateEndpoint?: string;
}
