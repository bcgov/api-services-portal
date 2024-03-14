const { logger } = require('./logger');
const express = require('express');
const fetch = require('node-fetch');
const YAML = require('js-yaml');
const assert = require('assert').strict;
var multer = require('multer');
var storage = multer.memoryStorage();
var upload = multer({ storage: storage });

const app = express();
const port = 6000;

const replay = require('./utils/replay');
const push = require('./utils/push');
require('dotenv').config();

assert.strictEqual(
  'WORKING_PATH' in process.env,
  true,
  'WORKING_PATH must be set'
);
assert.strictEqual(
  'DESTINATION_URL' in process.env,
  true,
  'DESTINATION_URL must be set'
);

const config = {
  kong: {
    destinationUrl: process.env.DESTINATION_URL,
    workingPath: process.env.WORKING_PATH + '/kong',
    url: process.env.KONG_ADMIN_URL,
  },
  ckan: {
    destinationUrl: process.env.DESTINATION_URL,
    workingPath: process.env.WORKING_PATH + '/ckan',
    url: process.env.CKAN_URL,
  },
  ckan_org: {
    destinationUrl: process.env.DESTINATION_URL,
    workingPath: process.env.WORKING_PATH + '/ckan',
    url: process.env.CKAN_URL,
  },
  keycloak: {
    destinationUrl: process.env.DESTINATION_URL,
    workingPath: process.env.WORKING_PATH + '/keycloak',
    url: process.env.KC_URL,
    username: process.env.KC_USERNAME,
    password: process.env.KC_PASSWORD,
  },
  github: {
    destinationUrl: process.env.DESTINATION_URL,
    workingPath: process.env.WORKING_PATH + '/github',
    token: process.env.GITHUB_TOKEN,
  },
  prometheus: {
    destinationUrl: process.env.DESTINATION_URL,
    workingPath: process.env.WORKING_PATH + '/prometheus',
    url: process.env.PROM_URL,
  },
};

const ckan = require('./ckan');

const sources = {
  kong: require('./kong'),
  ckan,
  ckan_org: { sync: ckan.syncOrgs },
  prometheus: require('./prometheus'),
};

app.get('/health', (req, res) => {
  res.send('up');
});

// Schedule a periodic trigger of the sync and feed
app.get('/sync/:source/', (req, res) => {
  const source = req.params.source;
  assert.strictEqual(source in sources, true, 'Invalid source ' + source);
  sources[source].sync(config[source]);
  res.send({ state: 'processing' });
});

app.put('/forceSync/:source/:scope/:scopeKey', async (req, res) => {
  const source = req.params.source;
  const scope = req.params.scope;
  const scopeKey = req.params.scopeKey;
  assert.strictEqual(source in sources, true, 'Invalid source ' + source);
  await sources[source].scopedSync(config[source], scope, scopeKey);
  res.send({ state: 'synced' });
});

// Replay an existing feeds file
app.get('/replay/', (req, res) => {
  replay({
    workingPath: process.env.WORKING_PATH,
    destinationUrl: process.env.DESTINATION_URL,
    source: null,
  });
  res.send({ state: 'processing' });
});

app.get('/replay/:source', (req, res) => {
  replay({
    workingPath: process.env.WORKING_PATH,
    destinationUrl: process.env.DESTINATION_URL,
    source: source,
  });
  res.send({ state: 'processing' });
});

// curl http://localhost:6000/push -F "yaml=@values.yaml"
app.post(
  '/push',
  upload.fields([
    { name: 'yaml', maxCount: 1 },
    { name: 'content', maxCount: 1 },
  ]),
  async (req, res) => {
    const data = YAML.loadAll(req.files['yaml'][0].buffer.toString('utf-8'));
    if ('content' in req.files) {
      console.log('CONTENT');
      data[0].record['content'] =
        req.files['content'][0].buffer.toString('utf-8');
    }
    await push({
      workingPath: process.env.WORKING_PATH,
      destinationUrl: process.env.DESTINATION_URL,
      items: data,
    })
      .then(() => res.send({ state: 'pushed' }))
      .catch((err) => {
        console.log(err);
        res.status(400).send({ state: 'failed' });
      });
  }
);

app.use((err, req, res, next) => {
  if (err) {
    console.error(err.stack);
    res
      .status(400)
      .send({ error: 'Oops.. there was a problem accepting this request!' });
  } else {
    next();
  }
});

const runTimedJob = function (source, frequencyMinutes, params) {
  console.log(
    `[${source}] STARTING JOB FOR ${source} - every ${frequencyMinutes} minutes - params ${JSON.stringify(
      params
    )}`
  );
  const job = (source, frequencyMinutes) => {
    sources[source].sync(config[source], params);
    console.log(`[${source}] SLEEPING FOR ${frequencyMinutes} minutes`);
    setTimeout(
      job,
      frequencyMinutes * 60 * 1000,
      source,
      frequencyMinutes,
      params
    );
  };
  setTimeout(job, frequencyMinutes * 60 * 1000, source, frequencyMinutes);
};

if (process.env.SCHEDULE == 'true') {
  runTimedJob('prometheus', 120, { numDays: 1 });
  runTimedJob('prometheus', 24 * 60 + 5, { numDays: 5 });
  runTimedJob('kong', 1 * 60, {});
  runTimedJob('ckan', 24 * 60 + 30, {});
  runTimedJob('ckan_org', 24 * 60, {});
}

app.listen(port, () => {
  logger.info(`Listening at http://localhost:${port}`);
});

process.on('SIGINT', () => process.exit(0));
