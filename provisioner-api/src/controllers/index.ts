import type { Services } from '../services/index.js';
import { SubsystemController } from './subsystem-controller.js';
import { ResourceController } from './resource-controller.js';
import { FastifyBaseLogger } from 'fastify/types/logger.js';

export { SubsystemController, ResourceController };

export interface Controllers {
  subsystem: SubsystemController;
  resource: ResourceController;
}

export function buildControllers(
  services: Services,
  logger?: FastifyBaseLogger
): Controllers {
  return {
    subsystem: new SubsystemController(services, logger),
    resource: new ResourceController(services, logger),
  };
}
