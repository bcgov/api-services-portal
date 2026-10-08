const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

process.env.LOG_LEVEL = 'error';

const kong = require('../kong');

const NS = 'gw-1234';

/**
 * A fake Kong admin API. `entities` maps a collection (services, routes, ...)
 * to its records; collections may be split into pages to exercise `next`.
 */
function fakeKong({
  entities = {},
  pageSize = 100,
  pageDelayMs = 0,
  failWith = null,
} = {}) {
  const requests = [];
  const server = http.createServer(async (req, res) => {
    requests.push(req.url);
    if (failWith) {
      res.writeHead(failWith);
      return res.end();
    }
    const u = new URL(req.url, 'http://kong');
    const parts = u.pathname.split('/').filter(Boolean);

    if (parts[0] === 'consumers' && parts.length >= 2) {
      const consumer = (entities.consumers ?? []).find(
        (c) => c.id === parts[1] || c.username === parts[1]
      );
      if (!consumer) {
        res.writeHead(404);
        return res.end();
      }
      const body = parts.length === 2 ? consumer : { data: [], next: null };
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(body));
    }

    const all = entities[parts[0]] ?? [];
    const offset = Number(u.searchParams.get('offset') ?? 0);
    if (offset > 0 && pageDelayMs > 0) {
      // later pages arrive after the rest of the sync has moved on
      await new Promise((resolve) => setTimeout(resolve, pageDelayMs));
    }
    const data = all.slice(offset, offset + pageSize);
    let next = null;
    if (offset + pageSize < all.length) {
      u.searchParams.set('offset', String(offset + pageSize));
      next = `${u.pathname}?${u.searchParams.toString()}`;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ data, next }));
  });
  return { server, requests };
}

/** A fake Portal feed API that records upserts and deletions. */
function fakePortal() {
  const state = { current: {}, puts: [], deletes: [] };
  const server = http.createServer((req, res) => {
    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', () => {
      const parts = req.url.split('/').filter(Boolean); // feed, Entity, ...
      res.setHeader('Content-Type', 'application/json');
      if (req.method === 'GET' && parts[2] === 'namespace') {
        return res.end(JSON.stringify(state.current[parts[1]] ?? []));
      }
      if (req.method === 'PUT') {
        state.puts.push({ entity: parts[1], item: JSON.parse(body) });
        return res.end(JSON.stringify({ result: 'created' }));
      }
      if (req.method === 'DELETE') {
        state.deletes.push(`${parts[1]}:${parts[2]}`);
        return res.end(JSON.stringify({ result: 'deleted' }));
      }
      res.writeHead(404);
      res.end();
    });
  });
  return { server, state };
}

function listen(server) {
  return new Promise((resolve) =>
    server.listen(0, '127.0.0.1', () =>
      resolve(`http://127.0.0.1:${server.address().port}`)
    )
  );
}

const svc = (id) => ({ id, name: id, tags: [`ns.${NS}`] });
const route = (id) => ({ id, name: id, tags: [`ns.${NS}`] });

let servers;
let workingPath;

async function start(...defs) {
  const urls = [];
  for (const d of defs) {
    servers.push(d.server);
    urls.push(await listen(d.server));
  }
  return urls;
}

beforeEach(() => {
  servers = [];
  workingPath = fs.mkdtempSync(path.join(os.tmpdir(), 'feeder-test-'));
});

after(() => {});

async function stopAll() {
  await Promise.all(
    servers.map((s) => new Promise((resolve) => s.close(resolve)))
  );
  fs.rmSync(workingPath, { recursive: true, force: true });
}

test('namespace sync keeps services that exist on either Kong', async (t) => {
  t.after(stopAll);
  const aps = fakeKong({
    entities: { services: [svc('svc-aps')], routes: [route('rt-aps')] },
  });
  const sdx = fakeKong({
    entities: { services: [svc('svc-sdx')], routes: [route('rt-sdx')] },
  });
  const portal = fakePortal();
  portal.state.current = {
    GatewayService: [
      { extForeignKey: 'svc-aps' },
      { extForeignKey: 'svc-sdx' },
      { extForeignKey: 'svc-gone' },
    ],
    GatewayRoute: [{ extForeignKey: 'rt-aps' }, { extForeignKey: 'rt-sdx' }],
  };
  const [apsUrl, sdxUrl, portalUrl] = await start(aps, sdx, portal);

  await kong.scopedSync(
    { url: `${apsUrl},${sdxUrl}`, workingPath, destinationUrl: portalUrl },
    'namespace',
    NS
  );

  const upserted = portal.state.puts
    .filter((p) => p.entity === 'GatewayService')
    .map((p) => p.item.id)
    .sort();
  assert.deepEqual(upserted, ['svc-aps', 'svc-sdx']);
  assert.deepEqual(portal.state.deletes, ['GatewayService:svc-gone']);
});

test('namespace sync skips cleanup when a Kong cannot be read', async (t) => {
  t.after(stopAll);
  const aps = fakeKong({ entities: { services: [svc('svc-aps')] } });
  const sdx = fakeKong({ failWith: 500 });
  const portal = fakePortal();
  portal.state.current = {
    GatewayService: [
      { extForeignKey: 'svc-aps' },
      { extForeignKey: 'svc-gone' },
    ],
  };
  const [apsUrl, sdxUrl, portalUrl] = await start(aps, sdx, portal);

  await kong.scopedSync(
    { url: `${apsUrl},${sdxUrl}`, workingPath, destinationUrl: portalUrl },
    'namespace',
    NS
  );

  assert.deepEqual(
    portal.state.puts
      .filter((p) => p.entity === 'GatewayService')
      .map((p) => p.item.id),
    ['svc-aps']
  );
  assert.deepEqual(portal.state.deletes, []);
});

test('namespace sync with a single Kong still removes deleted services', async (t) => {
  t.after(stopAll);
  const aps = fakeKong({ entities: { services: [svc('svc-aps')] } });
  const portal = fakePortal();
  portal.state.current = {
    GatewayService: [
      { extForeignKey: 'svc-aps' },
      { extForeignKey: 'svc-gone' },
    ],
  };
  const [apsUrl, portalUrl] = await start(aps, portal);

  await kong.scopedSync(
    { url: apsUrl, workingPath, destinationUrl: portalUrl },
    'namespace',
    NS
  );

  assert.deepEqual(portal.state.deletes, ['GatewayService:svc-gone']);
});

test('namespace sync reads every page before cleaning up', async (t) => {
  t.after(stopAll);
  const services = [svc('svc-1'), svc('svc-2'), svc('svc-3')];
  const aps = fakeKong({
    entities: { services },
    pageSize: 1,
    pageDelayMs: 300,
  });
  const portal = fakePortal();
  portal.state.current = {
    GatewayService: services.map((s) => ({ extForeignKey: s.id })),
  };
  const [apsUrl, portalUrl] = await start(aps, portal);

  await kong.scopedSync(
    { url: apsUrl, workingPath, destinationUrl: portalUrl },
    'namespace',
    NS
  );

  assert.deepEqual(
    portal.state.puts
      .filter((p) => p.entity === 'GatewayService')
      .map((p) => p.item.id)
      .sort(),
    ['svc-1', 'svc-2', 'svc-3']
  );
  assert.deepEqual(portal.state.deletes, []);
});

test('consumer sync finds the consumer on whichever Kong has it', async (t) => {
  t.after(stopAll);
  const aps = fakeKong();
  const sdx = fakeKong({
    entities: {
      consumers: [{ id: 'c-1', username: 'client-1', tags: ['sdx'] }],
    },
  });
  const portal = fakePortal();
  const [apsUrl, sdxUrl, portalUrl] = await start(aps, sdx, portal);

  await kong.scopedSync(
    { url: `${apsUrl},${sdxUrl}`, workingPath, destinationUrl: portalUrl },
    'consumer',
    'c-1'
  );

  assert.deepEqual(
    portal.state.puts.map((p) => `${p.entity}:${p.item.username}`),
    ['GatewayConsumer:client-1']
  );
});

test('full sync reads from every Kong in the list', async (t) => {
  t.after(stopAll);
  const aps = fakeKong({ entities: { services: [svc('svc-aps')] } });
  const sdx = fakeKong({ entities: { services: [svc('svc-sdx')] } });
  const portal = fakePortal();
  const [apsUrl, sdxUrl, portalUrl] = await start(aps, sdx, portal);

  await kong.sync({
    url: `${apsUrl},${sdxUrl}`,
    workingPath,
    destinationUrl: portalUrl,
  });

  assert.ok(aps.requests.includes('/services'));
  assert.ok(sdx.requests.includes('/services'));
  assert.deepEqual(
    portal.state.puts
      .filter((p) => p.entity === 'GatewayService')
      .map((p) => p.item.id)
      .sort(),
    ['svc-aps', 'svc-sdx']
  );
  assert.deepEqual(fs.readdirSync(workingPath), []);
});
