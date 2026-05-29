import fp from 'fastify-plugin';
import { buildClients, type Clients } from '../clients/index.js';

declare module 'fastify' {
  interface FastifyInstance {
    clients: Clients;
  }
}

export default fp(async (app) => {
  const clients = buildClients();
  app.decorate('clients', clients);
  app.log.info(
    {
      aps: clients.aps.baseUrl || 'unconfigured',
      sdx: clients.sdx.baseUrl || 'unconfigured',
      gwa: clients.gwa.baseUrl || 'unconfigured',
      css: clients.css.baseUrl || 'unconfigured',
    },
    'upstream clients registered'
  );
});
