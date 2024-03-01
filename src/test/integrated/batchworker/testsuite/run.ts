/*
Wire up directly with Keycloak and use the Services
To run:
npm run intg-build
npm run ts-watch
node dist/test/integrated/batchworker/testsuite/run.js
*/

import InitKeystone from '../../keystonejs/init';
import {
  removeKeys,
  syncRecords,
  getRecords,
} from '../../../../batch/feed-worker';
import yaml from 'js-yaml';
import { strict as assert } from 'assert';

import testdata from './testdata';
import mongoose from 'mongoose';
import { Logger } from '../../../../logger';
import { BatchWhereClause } from '@/services/keystone/batch-service';

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

  for (const collection of ['products', 'environments', 'datasets', 'legals']) {
    await _mongoose.connection.collection(collection).deleteMany({});
  }
  await _mongoose.disconnect();
}

(async () => {
  const keystone = await InitKeystone();
  console.log('K = ' + keystone);

  const ns = 'refactortime';
  const skipAccessControl = true;

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
    const json: any = test.data;
    testHeading(index++, test.name);
    try {
      if ((test.method || 'PUT') === 'PUT') {
        const res = await syncRecords(
          ctx,
          test.entity,
          json[test.refKey],
          json
        );
        equalPayload(removeKeys(res, ['id', 'ownedBy']), test.expected.payload);
      } else {
        const where: BatchWhereClause = test.whereClause;
        const records: any[] = await getRecords(
          ctx,
          test.entity,
          null,
          test.responseFields,
          where
        );
        const payload = records.map((o) => removeKeys(o, ['id', 'appId']));
        equalPayload(payload, test.expected.payload);
      }
    } catch (e) {
      logger.error(e.message);
      if (
        !test.expected?.exception ||
        test.expected?.exception != `${e.message}`
      ) {
        throw e;
      }
    }
  }

  testHeading(index, 'DONE');

  await keystone.disconnect();
})();
