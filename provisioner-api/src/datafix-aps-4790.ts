import { buildApp } from './app.js';
import { runAps4790Datafix } from './datafixes/aps-4790.js';

const app = await buildApp();

try {
  await app.ready();
  const summary = await runAps4790Datafix({
    listConnections: () => app.clients.feed.listConnectionRequests(),
    applyConnection: (id, connection) =>
      app.controllers.connections.onConnectionRequestChange(
        id,
        connection,
        'apply'
      ),
    logger: app.log,
  });

  if (summary.failed > 0) {
    process.exitCode = 1;
  }
} catch (err) {
  app.log.error({ err }, 'APS-4790 datafix failed');
  process.exitCode = 1;
} finally {
  await app.close();
}
