import type { Services } from '../services/index.js';
import { SubsystemController } from './subsystem-controller.js';
import { PatternsController } from './patterns-controller.js';
import { FastifyBaseLogger } from 'fastify/types/logger.js';
import { ConnectionsController } from './connections-controller.js';

export interface Controllers {
  subsystem: SubsystemController;
  patterns: PatternsController;
  connections: ConnectionsController;
}

export function buildControllers(
  services: Services,
  logger?: FastifyBaseLogger
): Controllers {
  return {
    subsystem: new SubsystemController(services, logger),
    patterns: new PatternsController(services, logger),
    connections: new ConnectionsController(services, logger),
  };
}
