import fp from 'fastify-plugin';
import { buildControllers, type Controllers } from '../controllers/index.js';

declare module 'fastify' {
  interface FastifyInstance {
    controllers: Controllers;
  }
}

export default fp(async (app) => {
  app.decorate('controllers', buildControllers(app.services, app.log));
});
