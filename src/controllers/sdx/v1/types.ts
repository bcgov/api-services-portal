import { RuntimeGroup, Subsystem } from '../../../controllers/v3/types';
import {
  IServiceCatalogEntry,
  IServiceOperation,
} from '../../../services/gateway-patterns/catalog';

/**
 * @tsoaModel
 *
 */
export interface SDXSubsystem extends Subsystem {}

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
export interface SDXRuntimeGroup extends RuntimeGroup {}

/**
 * @tsoaModel
 *
 */
export interface RuntimeGroupInput {
  name: string;
  publicEndpoint?: string;
  privateEndpoint?: string;
}

/**
 * @tsoaModel
 *
 */
export interface ServiceOperation extends IServiceOperation {}

/**
 * @tsoaModel
 *
 */
export interface ServiceCatalogEntry extends IServiceCatalogEntry {}

/**
 * @tsoaModel
 *
 */
export interface OpenAPISpecInput {
  state?: string;
  spec: string;
  subsystem: string;
}
