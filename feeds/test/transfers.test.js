const { test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

process.env.LOG_LEVEL = 'error';

const { transfers } = require('../utils/transfers');

/**
 * A fake paged API. Kong style (default) answers `{ data, next }`; CKAN style
 * answers `{ result }` and pages with `limit`/`offset` until a page is empty.
 * Every page after the first waits `pageDelayMs`, and `failOffset` fails the
 * page starting at that offset.
 */
function fakeApi({
  records = [],
  pageSize = 2,
  style = 'kong',
  pageDelayMs = 0,
  failOffset = null,
} = {}) {
  const requests = [];
  const server = http.createServer(async (req, res) => {
    requests.push(req.url);
    const u = new URL(req.url, 'http://api');
    const offset = Number(u.searchParams.get('offset') ?? 0);
    const limit = Number(u.searchParams.get('limit') ?? pageSize);
    if (offset > 0 && pageDelayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, pageDelayMs));
    }
    if (offset === failOffset) {
      res.writeHead(500);
      return res.end();
    }
    const page = records.slice(offset, offset + limit);
    let body;
    if (style === 'ckan') {
      body = { result: page };
    } else {
      let next = null;
      if (offset + limit < records.length) {
        u.searchParams.set('offset', String(offset + limit));
        next = `${u.pathname}?${u.searchParams.toString()}`;
      }
      body = { data: page, next };
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(body));
  });
  return { server, requests };
}

function listen(server) {
  return new Promise((resolve) =>
    server.listen(0, '127.0.0.1', () =>
      resolve(`http://127.0.0.1:${server.address().port}`)
    )
  );
}

const ids = (n, prefix = 'rec') =>
  Array.from({ length: n }, (_, i) => ({ id: `${prefix}-${i}` }));

const pageFiles = (dir, filename) =>
  fs
    .readdirSync(dir)
    .filter((f) => new RegExp(`^${filename}-\\d+\\.json$`).test(f))
    .sort();

/** Write `count` one-record pages of `filename`, as an earlier run would. */
const writePages = (filename, count, prefix) => {
  for (let i = 0; i < count; i++) {
    fs.writeFileSync(
      `${workingPath}/${filename}-${i}.json`,
      JSON.stringify({ data: [{ id: `${prefix}-${i}` }], next: null })
    );
  }
};

const stagingDirs = () =>
  fs.readdirSync(workingPath).filter((f) => f.startsWith('.staging-'));

let server;
let workingPath;

beforeEach(() => {
  server = null;
  workingPath = fs.mkdtempSync(path.join(os.tmpdir(), 'feeder-xfer-test-'));
});

afterEach(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  fs.rmSync(workingPath, { recursive: true, force: true });
});

test('copy resolves only after every Kong page is written', async () => {
  const api = fakeApi({ records: ids(7), pageSize: 2, pageDelayMs: 50 });
  server = api.server;
  const baseUrl = await listen(server);
  const exceptions = [];
  const xfer = transfers(workingPath, baseUrl, exceptions);

  await xfer.copy('/services', 'gw-services');

  assert.deepEqual(exceptions, []);
  assert.deepEqual(pageFiles(workingPath, 'gw-services'), [
    'gw-services-0.json',
    'gw-services-1.json',
    'gw-services-2.json',
    'gw-services-3.json',
  ]);
  assert.deepEqual(
    xfer.get_json_content('gw-services').data.map((r) => r.id),
    ids(7).map((r) => r.id)
  );
});

test('copy resolves only after every CKAN offset page is written', async () => {
  const api = fakeApi({
    records: ids(5),
    style: 'ckan',
    pageDelayMs: 50,
  });
  server = api.server;
  const baseUrl = await listen(server);
  const exceptions = [];
  const xfer = transfers(workingPath, baseUrl, exceptions);

  await xfer.copy('/api/action/group_list?limit=2&offset=0', 'group-keys');

  assert.deepEqual(exceptions, []);
  // 3 pages of records, then the empty page that ends the chain
  assert.equal(api.requests.length, 4);
  assert.deepEqual(
    xfer.get_list_ids('group-keys').data.map((r) => r.id),
    ids(5).map((r) => r.id)
  );
});

test('a failed later page keeps the previous pages', async () => {
  writePages('gw-plugins', 3, 'old');
  const api = fakeApi({
    records: ids(6),
    pageSize: 2,
    pageDelayMs: 50,
    failOffset: 4,
  });
  server = api.server;
  const baseUrl = await listen(server);
  const exceptions = [];
  const xfer = transfers(workingPath, baseUrl, exceptions);

  await xfer.copy('/plugins', 'gw-plugins');

  // the error is recorded before copy resolves
  assert.equal(exceptions.length, 1);
  assert.equal(exceptions[0].filename, 'gw-plugins');
  // pages 0 and 1 were fetched, but none replace the previous run's pages
  assert.deepEqual(
    xfer.get_json_content('gw-plugins').data.map((r) => r.id),
    ['old-0', 'old-1', 'old-2']
  );
  assert.deepEqual(stagingDirs(), []);
});

test('copy removes pages left over from an earlier run', async () => {
  // an earlier run wrote 5 pages of records that have since been deleted
  for (let i = 0; i < 5; i++) {
    fs.writeFileSync(
      `${workingPath}/gw-services-${i}.json`,
      JSON.stringify({ data: [{ id: `stale-${i}` }], next: null })
    );
  }
  fs.writeFileSync(
    `${workingPath}/gw-routes-0.json`,
    JSON.stringify({ data: [{ id: 'route-0' }], next: null })
  );
  const api = fakeApi({ records: ids(3), pageSize: 2 });
  server = api.server;
  const baseUrl = await listen(server);
  const xfer = transfers(workingPath, baseUrl, []);

  await xfer.copy('/services', 'gw-services');

  assert.deepEqual(pageFiles(workingPath, 'gw-services'), [
    'gw-services-0.json',
    'gw-services-1.json',
  ]);
  assert.deepEqual(
    xfer.get_json_content('gw-services').data.map((r) => r.id),
    ['rec-0', 'rec-1', 'rec-2']
  );
  // other entities' pages are left alone
  assert.deepEqual(pageFiles(workingPath, 'gw-routes'), ['gw-routes-0.json']);
  assert.deepEqual(stagingDirs(), []);
});

test('a failed first page keeps the previous page', async () => {
  // e.g. a failed CKAN organization_show keeps that org's file from last run
  fs.mkdirSync(`${workingPath}/orgs`);
  writePages('orgs/org-1', 1, 'old');
  const api = fakeApi({ records: ids(3), failOffset: 0 });
  server = api.server;
  const baseUrl = await listen(server);
  const exceptions = [];
  const xfer = transfers(workingPath, baseUrl, exceptions);

  await xfer.copy('/api/3/action/organization_show?id=org-1', 'orgs/org-1');

  assert.equal(exceptions.length, 1);
  assert.deepEqual(xfer.get_file_list('orgs'), ['org-1-0.json']);
  assert.deepEqual(
    xfer.get_json_content('orgs/org-1').data.map((r) => r.id),
    ['old-0']
  );
  assert.deepEqual(stagingDirs(), []);
});
