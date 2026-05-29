import type { Services } from '../services/index.js';
import { SubsystemController } from './subsystem-controller.js';

export { SubsystemController };

export interface Controllers {
  subsystem: SubsystemController;
}

export function buildControllers(services: Services): Controllers {
  return {
    subsystem: new SubsystemController(services),
  };
}
