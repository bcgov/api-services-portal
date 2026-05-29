import fp from 'fastify-plugin';
import { buildServices, type Services } from '../services/index.js';

declare module 'fastify' {
  interface FastifyInstance {
    services: Services;
  }
}

export default fp(async (app) => {
  app.decorate('services', buildServices(app.clients));
});
