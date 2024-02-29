/*
Wire up directly with Keycloak and use the Services
To run:
npm run intg-build
npm run ts-watch
node dist/test/integrated/batchworker/testsuite/run.js
*/

import InitKeystone from '../../keystonejs/init';
import { removeKeys, syncRecords } from '../../../../batch/feed-worker';
import yaml from 'js-yaml';
import { strict as assert } from 'assert';

import testdata from './testdata';
import mongoose from 'mongoose';
import { Logger } from '../../../../logger';

const logger = Logger('testsuite');

function equalPayload(a: any, e: any) {
  assert.strictEqual(
    yaml.dump(a, { indent: 2, lineWidth: 100 }),
    yaml.dump(e, { indent: 2, lineWidth: 100 })
  );
}

function testHeading(index: number, name: string) {
  console.log('\x1b[33m --------------------------------------------- \x1b[0m');
  console.log('\x1b[33m ' + index + ' ' + name + ' \x1b[0m');
  console.log('\x1b[33m --------------------------------------------- \x1b[0m');
}

async function cleanupDatabase() {
  const db = new mongoose.Mongoose();
  const _mongoose = await db.connect(process.env.MONGO_URL, {
    user: process.env.MONGO_USER,
    pass: process.env.MONGO_PASSWORD,
  });

  for (const collection of ['products', 'environments', 'datasets']) {
    await _mongoose.connection.collection(collection).deleteMany({});
  }
  await _mongoose.disconnect();
}

(async () => {
  const keystone = await InitKeystone();
  console.log('K = ' + keystone);

  const ns = 'refactortime';
  const skipAccessControl = false;

  const identity = {
    id: null,
    username: 'sample_username',
    namespace: ns,
    roles: JSON.stringify(['api-owner']),
    scopes: [],
    userId: null,
  } as any;

  const ctx = keystone.createContext({
    skipAccessControl,
    authentication: { item: identity },
  });

  await cleanupDatabase();

  let index = 1;
  for (const test of testdata.tests) {
    const json = test.data;
    testHeading(index++, test.name);
    try {
      const res = await syncRecords(ctx, test.entity, null, json);
      equalPayload(removeKeys(res, ['id', 'ownedBy']), test.expected.payload);
    } catch (e) {
      logger.error(e.message);
      if (
        !test.expected.exception ||
        test.expected.exception != `${e.message}`
      ) {
        throw e;
      }
    }
  }

  testHeading(index, 'DONE');

  await keystone.disconnect();
})();
