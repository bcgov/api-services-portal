import { buildApp } from './app.js';
import { runAps4992Datafix } from './datafixes/aps-4992.js';

const app = await buildApp();
const apply = process.argv.includes('--apply');

try {
  await app.ready();
  const summary = await runAps4992Datafix({
    listConnections: () => app.clients.feed.listConnectionRequests(),
    listGrants: () => app.clients.feed.listConnectionClientGrants(),
    applyGrant: (grant) => app.clients.feed.putConnectionClientGrant(grant),
    apply,
    logger: app.log,
  });

  app.log.info(
    { mode: apply ? 'apply' : 'dry-run', summary },
    'APS-4992 migration finished'
  );
  if (summary.failed > 0) {
    process.exitCode = 1;
  }
} catch (err) {
  app.log.error({ err }, 'APS-4992 migration failed');
  process.exitCode = 1;
} finally {
  await app.close();
}
