import fp from 'fastify-plugin';
import { buildClients, type Clients } from '../clients/index.js';

declare module 'fastify' {
  interface FastifyInstance {
    clients: Clients;
  }
}

export default fp(async (app) => {
  const clients = buildClients(app.log);
  app.decorate('clients', clients);
  app.log.info(
    {
      aps: clients.aps.baseUrl || 'unconfigured',
      sdx: clients.sdx.baseUrl || 'unconfigured',
      gwa: process.env.ENVIRONMENTS_CONFIG_FILE || 'unconfigured',
      css: clients.css.baseUrl || 'unconfigured',
      feed: process.env.FEED_URL || 'unconfigured',
      sdxOperator: process.env.ENVIRONMENTS_CONFIG_FILE || 'unconfigured',
    },
    'upstream clients registered'
  );
});
