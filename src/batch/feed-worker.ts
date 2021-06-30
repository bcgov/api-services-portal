import { strict as assert } from 'assert';
import {
  alwaysTrue,
  alwaysFalse,
  connectExclusiveList,
  connectMany,
  connectOne,
  mapNamespace,
  toStringDefaultArray,
  toString,
} from './transformations';
import { handleNameChange } from './hooks';
import union from 'lodash/union';
import { metadata } from './data-rules';
import { BatchResult } from './types';
import { BatchService } from '../services/keystone/batch-service';
import { Logger } from '../logger';

export function dot(value: any, _key: string) {
  let returnedValue = value;
  for (const key of _key.split('.')) {
    if (returnedValue == null || typeof returnedValue === 'undefined') {
      return null;
    }
    returnedValue = returnedValue[key];
  }
  return returnedValue;
}

const logger = Logger('batch.worker');

const hooks = {
  'pre-lookup': { handleNameChange: handleNameChange },
} as any;

const transformations = {
  toStringDefaultArray: toStringDefaultArray,
  toString: toString,
  mapNamespace: mapNamespace,
  connectExclusiveList: connectExclusiveList,
  connectMany: connectMany,
  connectOne: connectOne,
  alwaysTrue: alwaysTrue,
  alwaysFalse: alwaysFalse,
} as any;

// const importFeedWorker = async (keystone: any, entity: string, json: any) => {
//     const eid = json['id']
//     console.log(JSON.stringify(json, null, 4))

//     assert.strictEqual(entity in metadata, true)
//     assert.strictEqual(eid === null || json === null || typeof json == 'undefined', false, "Either entity or ID are missing " + eid + json)

//     assert.strictEqual(typeof eid == 'string', true, 'Unique ID is not a string! ' + JSON.stringify(json))

//     const result = await syncRecords(keystone, entity, eid, json)
//     return result
// }

export const putFeedWorker = async (keystone: any, req: any, res: any) => {
  const entity = req.params['entity'];
  const eid = 'id' in req.params ? req.params['id'] : req.body['id'];
  const json = req.body;

  assert.strictEqual(entity in metadata, true);
  assert.strictEqual(
    eid === null || json === null || typeof json == 'undefined',
    false,
    'Either entity or ID are missing ' + eid + json
  );

  assert.strictEqual(
    typeof eid == 'string',
    true,
    'Unique ID is not a string! ' +
      JSON.stringify(req.params) +
      ' :: ' +
      JSON.stringify(req.body)
  );

  const context = keystone.createContext({ skipAccessControl: true });
  const result = await syncRecords(context, entity, eid, json);
  res.status(result.status).json(result);
};

export const deleteFeedWorker = async (keystone: any, req: any, res: any) => {
  const feedEntity = req.params['entity'];
  const eid = req.params['id'];
  const json = req.body;
  const context = keystone.createContext({ skipAccessControl: true });
  const batchService = new BatchService(context);

  assert.strictEqual(feedEntity in metadata, true);
  assert.strictEqual(
    eid === null || json === null || typeof json == 'undefined',
    false
  );

  const md = (metadata as any)[feedEntity];

  const entity = 'entity' in md ? md['entity'] : feedEntity;

  const localRecord = await batchService.lookup(
    md.query,
    md.refKey,
    eid,
    md.sync
  );
  if (localRecord == null) {
    res.json({ result: 'not-found' });
  } else {
    const nr = await batchService.remove(entity, localRecord.id);
    res.json({ result: 'deleted' });
  }
};

const syncListOfRecords = async function (
  keystone: any,
  entity: string,
  records: any
): Promise<BatchResult[]> {
  const result: BatchResult[] = [];
  if (records == null || typeof records == 'undefined') {
    return [];
  }
  for (const record of records) {
    result.push(
      await syncRecords(keystone, entity, record['id'], record, true)
    );
  }
  return result;
};

// const lookupListOfRecords = async function (keystone: any, entity: string, records: any) {
//     const result = []
//     if (records == null || typeof(records) == 'undefined') {
//         return []
//     }
//     for (const record of records) {
//         const fieldKey = 'key' in transformInfo ? transformInfo['key'] : _fieldKey
//         const lkup = await lookup(keystone, transformInfo['list'], transformInfo['refKey'], dot(inputData, fieldKey), [])
//         result.push(lkup['id'])
//     }
//     return result
// }

function buildQueryResponse(md: any): string[] {
  const relationshipFields = Object.keys(
    md.transformations
  ).filter((tranField: any) =>
    ['connectOne', 'connectExclusiveList', 'connectMany'].includes(
      md.transformations[tranField].name
    )
  );
  const response = md.sync
    .filter((s: string) => !relationshipFields.includes(s))
    .slice();
  logger.debug('[buildQueryResponse] DRAFT (%s) %j', md.query, response);
  relationshipFields.forEach((field: string) => {
    response.push(`${field} { id }`);
  });
  logger.debug('[buildQueryResponse] FINAL (%s) %j', md.query, response);
  return response;
}

export const syncRecords = async function (
  keystone: any,
  feedEntity: string,
  eid: string,
  json: any,
  children = false
): Promise<BatchResult> {
  const md = (metadata as any)[feedEntity];
  const entity = 'entity' in md ? md['entity'] : feedEntity;

  assert.strictEqual(
    children == false && md.childOnly === true,
    false,
    'This entity is only part of a child.'
  );

  const batchService = new BatchService(keystone);

  // pre-lookup hook that can be used to handle special cases,
  // such as for Kong, cleaning up records where the service or route has been renamed
  //
  if ('hooks' in md) {
    for (const hook of md['hooks']) {
      assert.strictEqual(
        hook in hooks['pre-lookup'],
        true,
        `Hook ${hook} missing!`
      );
      await hooks['pre-lookup'][hook](keystone, entity, md, eid, json);
    }
  }

  const localRecord = await batchService.lookup(
    md.query,
    md.refKey,
    eid,
    buildQueryResponse(md)
  );
  if (localRecord == null) {
    const data: any = {};
    for (const field of md.sync) {
      if (field in json) {
        data[field] = json[field];
      }
    }

    if ('transformations' in md) {
      for (const transformKey of Object.keys(md.transformations)) {
        const transformInfo = md.transformations[transformKey];
        if (transformInfo.syncFirst) {
          // handle these children independently first - return a list of IDs
          const allIds = await syncListOfRecords(
            keystone,
            transformInfo.list,
            json[transformKey]
          );
          logger.debug('CHILDREN [%s] %j', transformKey, allIds);
          assert.strictEqual(
            allIds.filter((record) => record.status != 200).length,
            0,
            'Failed updating children'
          );
          json[transformKey + '_ids'] = allIds.map((status) => status.id);
        }
        const transformMutation = await transformations[transformInfo.name](
          keystone,
          transformInfo,
          null,
          json,
          transformKey
        );
        if (transformMutation != null) {
          logger.debug(
            ' -- Updated [' +
              transformKey +
              '] ' +
              JSON.stringify(data[transformKey]) +
              ' to ' +
              JSON.stringify(transformMutation)
          );
          data[transformKey] = transformMutation;
        }
      }
    }
    data[md.refKey] = eid;
    const nr = await batchService.create(entity, data);
    if (nr == null) {
      logger.error('CREATE FAILED (%s) %j', nr, data);
      return { status: 400, result: 'create-failed' };
    } else {
      return { status: 200, result: 'created', id: nr };
    }
  } else {
    const transformKeys =
      'transformations' in md ? Object.keys(md.transformations) : [];
    const data: any = {};

    for (const field of md.sync) {
      if (!transformKeys.includes(field)) {
        logger.debug(
          ' -- changed? (%s) %j -> %j',
          field,
          localRecord[field],
          json[field]
        );
        if (field in json && json[field] !== localRecord[field]) {
          logger.debug(' -- updated');
          data[field] = json[field];
        }
      }
    }

    if ('transformations' in md) {
      for (const transformKey of transformKeys) {
        logger.debug(' -- changed trans? (%s)', transformKey);
        // unset transformKey from data[]
        delete data[transformKey];
        const transformInfo = md.transformations[transformKey];
        if (transformInfo.syncFirst) {
          // handle these children independently first - return a list of IDs
          const allIds = await syncListOfRecords(
            keystone,
            transformInfo.list,
            json[transformKey]
          );
          logger.debug('CHILDREN [%s] %j', transformKey, allIds);
          assert.strictEqual(
            allIds.filter((record) => record.status != 200).length,
            0,
            'Failed updating children'
          );
          json[transformKey + '_ids'] = allIds.map((status) => status.id);
        }

        const transformMutation = await transformations[transformInfo.name](
          keystone,
          transformInfo,
          localRecord,
          json,
          transformKey
        );
        if (transformMutation && transformMutation != null) {
          logger.debug(
            ' -- updated trans (%s) %j -> %j',
            transformKey,
            localRecord[transformKey],
            transformMutation
          );
          data[transformKey] = transformMutation;
        }
      }
    }
    if (Object.keys(data).length === 0) {
      return { status: 200, result: 'no-change', id: localRecord['id'] };
    }
    logger.debug('keys triggering update %j', Object.keys(data));
    const nr = await batchService.update(entity, localRecord.id, data);
    if (nr == null) {
      logger.error('UPDATE FAILED (%s) %j', nr, data);
      return { status: 400, result: 'update-failed' };
    } else {
      return { status: 200, result: 'updated', id: nr };
    }
  }
};
