import { buildApp } from './app.js';
import { runAps4995Datafix } from './datafixes/aps-4995.js';

const app = await buildApp();
const apply = process.argv.includes('--apply');

try {
  await app.ready();
  const summary = await runAps4995Datafix({
    listConnections: () => app.clients.feed.listConnectionRequests(),
    previewConnection: (id, connection) =>
      app.controllers.connections.onConnectionRequestChange(
        id,
        connection,
        'preview'
      ),
    applyConnection: (id, connection) =>
      app.controllers.connections.onConnectionRequestChange(
        id,
        connection,
        'apply'
      ),
    apply,
    logger: app.log,
  });

  if (summary.failed > 0) process.exitCode = 1;
} catch (err) {
  app.log.error({ err }, 'APS-4995 R1 enforcement migration failed');
  process.exitCode = 1;
} finally {
  await app.close();
}
