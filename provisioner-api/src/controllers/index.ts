import type { Services } from '../services/index.js';
import { ResourceServerController } from './resource-server-controller.js';
import { IntegrationController } from './integration-controller.js';
import { PatternsController } from './patterns-controller.js';
import { FastifyBaseLogger } from 'fastify/types/logger.js';
import { ConnectionsController } from './connections-controller.js';
import { GatewayController } from './gateway-controller.js';
import { RuntimeGroupsController } from './runtime-groups-controller.js';

export interface Controllers {
  resourceServer: ResourceServerController;
  integration: IntegrationController;
  patterns: PatternsController;
  connections: ConnectionsController;
  gateway: GatewayController;
  runtimeGroups: RuntimeGroupsController;
}

export function buildControllers(
  services: Services,
  logger?: FastifyBaseLogger
): Controllers {
  return {
    resourceServer: new ResourceServerController(services, logger),
    integration: new IntegrationController(services, logger),
    patterns: new PatternsController(services, logger),
    connections: new ConnectionsController(services, logger),
    gateway: new GatewayController(services, logger),
    runtimeGroups: new RuntimeGroupsController(services, logger),
  };
}
