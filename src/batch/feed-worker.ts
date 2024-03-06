import { strict as assert } from 'assert';
import {
  alwaysTrue,
  alwaysFalse,
  byKey,
  connectExclusiveList,
  connectExclusiveListCreate,
  connectExclusiveOne,
  connectMany,
  connectOne,
  mapNamespace,
  toStringDefaultArray,
  toString,
} from './transformations';
import { handleNameChange, handleUsernameChange } from './hooks';
import YAML from 'js-yaml';
import { BatchResult, BatchSyncException } from './types';
import {
  BatchService,
  BatchWhereClause,
  CompositeKeyValue,
} from '../services/keystone/batch-service';
import { Logger } from '../logger';

const { metadata } = require('./data-rules');

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
  'pre-lookup': { handleNameChange, handleUsernameChange },
} as any;

const transformations = {
  toStringDefaultArray: toStringDefaultArray,
  toString: toString,
  byKey: byKey,
  mapNamespace: mapNamespace,
  connectExclusiveList: connectExclusiveList,
  connectExclusiveListCreate: connectExclusiveListCreate,
  connectExclusiveOne: connectExclusiveOne,
  connectMany: connectMany,
  connectOne: connectOne,
  alwaysTrue: alwaysTrue,
  alwaysFalse: alwaysFalse,
} as any;

export const putFeedWorker = async (context: any, req: any, res: any) => {
  const entity = req.params['entity'];
  assert.strictEqual(entity in metadata, true);
  logger.info('putFeedWorker %s', entity);

  const md = metadata[entity];
  const refKey = md.refKey;

  // This assumption that "id" must be there is really due to the Feeder
  // sending payloads from Kong, CKAN, Prometheus
  // Using V2 of the Discovery API does not require this and the normal 'refKey'
  // can be used
  let eid;
  if ('id' in req.params) {
    eid = req.params['id'];
  } else if (refKey in req.body) {
    eid = req.body[refKey];
  } else {
    eid = req.body['id'];
  }
  const json = req.body;

  assert.strictEqual(
    eid === null ||
      typeof eid == 'undefined' ||
      json === null ||
      typeof json == 'undefined',
    false,
    'Either entity or ID are missing ' + eid + json
  );

  assert.strictEqual(
    typeof eid == 'string',
    true,
    `Unique ID (${eid}) is not a string! ` +
      JSON.stringify(req.params) +
      ' :: ' +
      JSON.stringify(req.body)
  );

  //const context = keystone.createContext({ skipAccessControl: true });
  const result = await syncRecords(context, entity, eid, json);
  res.status(result.status).json(result);
};

export const deleteFeedWorker = async (context: any, req: any, res: any) => {
  const feedEntity = req.params['entity'];
  const eid = req.params['id'];
  const json = req.body;

  assert.strictEqual(feedEntity in metadata, true);
  assert.strictEqual(
    eid === null || json === null || typeof json == 'undefined',
    false
  );

  res.json(deleteRecord(context, feedEntity, eid));
};

export const deleteRecord = async function (
  context: any,
  feedEntity: string,
  eid: string
): Promise<BatchResult> {
  const md = (metadata as any)[feedEntity];
  const entity = 'entity' in md ? md['entity'] : feedEntity;

  const batchService = new BatchService(context);

  const localRecord = await batchService.lookup(
    md.query,
    md.refKey,
    eid,
    md.sync
  );
  if (localRecord == null) {
    return { status: 404, result: 'not-found' };
  } else {
    const result = await batchService.remove(entity, localRecord.id);
    if (result == null) {
      return { status: 400, result: 'deletion-failed' };
    }
    return { status: 200, result: 'deleted', id: localRecord.id };
  }
};

export const getFeedWorker = async (context: any, req: any, res: any) => {
  const feedEntity = req.params['entity'];
  const refKey = req.params['refKey'];
  const refKeyValue = req.params['refKeyValue'];

  //const context = keystone.createContext({ skipAccessControl: true });
  const batchService = new BatchService(context);

  assert.strictEqual(feedEntity in metadata, true);
  assert.strictEqual(refKey === null || refKeyValue === null, false);

  const md = (metadata as any)[feedEntity];

  assert.strictEqual(md['sync'].includes(refKey), true, 'Unexpected ref key');

  const recordReferences = await batchService.list(
    md.query,
    refKey,
    refKeyValue,
    ['extForeignKey', 'extRecordHash']
  );
  res.json(recordReferences);
};

const syncListOfRecords = async function (
  keystone: any,
  transformInfo: any,
  records: any,
  parentRecord?: any
): Promise<BatchResult[]> {
  const result: BatchResult[] = [];
  if (records == null || typeof records == 'undefined') {
    return [];
  }
  const recordKey = 'refKey' in transformInfo ? transformInfo['refKey'] : 'id';

  for (const record of records) {
    result.push(
      await syncRecords(
        keystone,
        transformInfo.list,
        record[recordKey],
        record,
        true,
        parentRecord
      )
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

function buildQueryResponse(md: any, children: string[] = undefined): string[] {
  const relationshipFields = Object.keys(
    md.transformations
  ).filter((tranField: any) =>
    [
      'byKey',
      'connectOne',
      'connectExclusiveList',
      'connectExclusiveListCreate',
      'connectMany',
    ].includes(md.transformations[tranField].name)
  );
  const response = md.sync
    .filter((s: string) => !relationshipFields.includes(s))
    .slice();
  response.push(md.refKey);

  logger.debug('[buildQueryResponse] DRAFT (%s) %j', md.query, response);
  if (children) {
    relationshipFields.forEach((field: string) => {
      // populate the fields as well
      logger.debug('[buildQueryResponse] %s', md.transformations[field].list);
      const listToMatch = md.transformations[field].list;
      const mdRelField = Object.keys(metadata)
        .filter(
          (entity: string) =>
            (metadata as any)[entity].query === listToMatch ||
            entity === listToMatch
        )
        .map((entity) => (metadata as any)[entity])
        .pop();
      if (children.includes(field)) {
        children.splice(children.indexOf(field), 1);
        response.push(
          `${field} { id, ${buildQueryResponse(mdRelField, children)} }`
        );
      } else {
        const refKey =
          'refKey' in md.transformations[field]
            ? md.transformations[field].refKey
            : mdRelField.refKey;
        response.push(`${field} { id, ${refKey} }`);
      }
    });
  } else {
    relationshipFields.forEach((field: string) => {
      response.push(`${field} { id }`);
    });
  }
  if ('ownedBy' in md) {
    response.push(`${md.ownedBy} { id, namespace }`);
  }

  logger.debug('[buildQueryResponse] FINAL (%s) %j', md.query, response);
  return response;
}

export const getRecords = async function (
  context: any,
  feedEntity: string,
  query: string = undefined,
  children: string[] = undefined,
  where: BatchWhereClause = undefined
): Promise<any[]> {
  const md = (metadata as any)[feedEntity];

  const batchService = new BatchService(context);

  return await batchService.listAll(
    query ? query : md.query,
    buildQueryResponse(md, children),
    where
  );
};

export const getRecord = async function (
  context: any,
  feedEntity: string,
  eid: string,
  children: string[] = undefined
): Promise<any> {
  const md = (metadata as any)[feedEntity];

  const batchService = new BatchService(context);

  return await batchService.lookup(
    md.query,
    md.refKey,
    eid,
    buildQueryResponse(md, children)
  );
};

export const syncRecordsThrowErrors = async function (
  context: any,
  feedEntity: string,
  eid: string,
  json: any,
  children = false
): Promise<BatchResult> {
  const result = await syncRecords(context, feedEntity, eid, json, children);
  if (result.status !== 200) {
    throw new BatchSyncException(result);
  }
  return result;
};

export const syncRecords = async function (
  context: any,
  feedEntity: string,
  eid: string,
  json: any,
  children = false,
  parentRecord: any = undefined
): Promise<BatchResult> {
  const md = (metadata as any)[feedEntity];
  const entity = 'entity' in md ? md['entity'] : feedEntity;

  assert.strictEqual(
    children == false && md.childOnly === true,
    false,
    'This entity is only part of a child.'
  );

  const compositeKeyValues: CompositeKeyValue[] = [];
  if (md.compositeRefKey) {
    md.compositeRefKey.forEach((refKey: string | CompositeKeyValue) => {
      if (typeof refKey === 'string') {
        compositeKeyValues.push({ key: refKey, value: json[refKey] });
      } else {
        // if the value is missing, then ignore the composite value
        // and include the 'refKey' value
        const value = dot({ ...json, ...{ parent: parentRecord } }, refKey.key);
        compositeKeyValues.push({
          key: refKey.key,
          value: value,
          whereClause: refKey.whereClause,
        });
      }
    });
  } else {
    assert.strictEqual(
      typeof eid === 'string' && eid.length > 0,
      true,
      `Invalid ID for ${feedEntity} ${md.refKey} = ${eid || 'blank'}`
    );

    compositeKeyValues.push({ key: md.refKey, return: md.refKey, value: eid });
  }

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
      await hooks['pre-lookup'][hook](context, entity, md, eid, json);
    }
  }

  let childResults: BatchResult[] = [];

  const batchService = new BatchService(context);

  const localRecord = await batchService.lookupUsingCompositeKey(
    md.query,
    compositeKeyValues,
    buildQueryResponse(md)
  );
  if (localRecord == null) {
    try {
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
            // since localRecord is null, this is related to creating
            // and syncFirst is only used for `connectExclusiveList` or `connectExclusiveOne`
            // so we want the transformer to return a "create" statement
            if (transformInfo.name === 'connectExclusiveListCreate') {
            } else {
              const allIds = await syncListOfRecords(
                context,
                transformInfo,
                json[transformKey],
                json
              );
              logger.debug('CHILDREN [%s] %j', transformKey, allIds);
              childResults.push(...allIds);
              assert.strictEqual(
                allIds.filter((record) => record.status != 200).length,
                0,
                'Failed updating children'
              );
              assert.strictEqual(
                allIds.filter((record) => typeof record.ownedBy != 'undefined')
                  .length,
                0,
                'There are some child records that have exclusive ownership already!'
              );
              json[transformKey + '_ids'] = allIds.map((status) => status.id);
            }
          }
          if (transformInfo.filterByNamespace) {
            json['_namespace'] = parentRecord['namespace'];
          }
          const transformMutation = await transformations[transformInfo.name](
            context,
            transformInfo,
            null,
            json,
            transformKey,
            parentRecord
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
      if (eid) {
        data[md.refKey] = eid;
      }
      const nr = await batchService.create(entity, data);
      if (!nr.id) {
        logger.error('CREATE FAILED (%s) %j', nr, data);
        return {
          status: 400,
          result: 'create-failed',
          reason: nr.error,
          childResults,
        };
      } else {
        return { status: 200, result: 'created', id: nr.id, childResults };
      }
    } catch (ex) {
      logger.error('Caught exception %s', ex);
      return {
        status: 400,
        result: 'create-failed',
        reason: ex.message,
        childResults,
      };
    }
  } else {
    try {
      if (
        json.hasOwnProperty(md['refKey']) &&
        json[md['refKey']] != localRecord[md['refKey']]
      ) {
        throw new Error('Unexpected ' + md['refKey']);
      }
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
              context,
              transformInfo,
              json[transformKey],
              localRecord
            );

            logger.debug('CHILDREN [%s] %j', transformKey, allIds);
            childResults.push(...allIds);

            assert.strictEqual(
              allIds.filter((record) => record.status != 200).length,
              0,
              'Failed updating children'
            );
            logger.debug('%j', localRecord);
            assert.strictEqual(
              allIds.filter(
                (record) =>
                  typeof record.ownedBy != 'undefined' &&
                  record.ownedBy != localRecord.id
              ).length,
              0,
              'There are some child records that have ownership already (update not allowed)!'
            );

            json[transformKey + '_ids'] = allIds.map((status) => status.id);
          }
          if (transformInfo.filterByNamespace) {
            json['_namespace'] = parentRecord['namespace'];
          }
          const transformMutation = await transformations[transformInfo.name](
            context,
            transformInfo,
            localRecord,
            json,
            transformKey,
            parentRecord
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
        logger.debug('[%s] [%s] no update', entity, localRecord.id);
        const firstChildResult = childResults
          .filter((r) => r.result != 'no-change')
          .pop();
        return {
          status: 200,
          result: firstChildResult
            ? firstChildResult.result + '-child'
            : 'no-change',
          id: localRecord['id'],
          childResults,
          ownedBy:
            md.ownedBy && localRecord[md.ownedBy]
              ? localRecord[md.ownedBy].id
              : undefined,
        };
      }
      logger.info(
        '[%s] [%s] keys triggering update %j',
        entity,
        localRecord.id,
        Object.keys(data)
      );
      const nr = await batchService.update(entity, localRecord.id, data);
      if (!nr.id) {
        logger.error('UPDATE FAILED (%s) %j', nr, data);
        return {
          status: 400,
          result: 'update-failed',
          reason: nr.error,
          childResults,
        };
      } else {
        return {
          status: 200,
          result: 'updated',
          id: nr.id,
          childResults,
          ownedBy:
            md.ownedBy && localRecord[md.ownedBy]
              ? localRecord[md.ownedBy].id
              : undefined,
        };
      }
    } catch (ex) {
      logger.error('Caught exception %s', ex);
      return {
        status: 400,
        result: 'update-failed',
        reason: ex.message,
        childResults,
      };
    }
  }
};

export const applyTransformationsToNewCreation = async (
  keystone: any,
  transformInfo: any,
  inputData: any,
  parentRecord: any
) => {
  if (!inputData) {
    return;
  }
  const feedEntity = transformInfo['list'];

  const md = (metadata as any)[feedEntity];
  logger.debug('[applyTransformations] %j', md);
  logger.debug('[applyTransformations] parent %j', parentRecord);
  logger.debug('[applyTransformations] input  %j', inputData);

  const transformKeys =
    'transformations' in md ? Object.keys(md.transformations) : [];

  for (const inputDataRecord of inputData) {
    for (const transformKey of transformKeys) {
      logger.debug(
        ' -- (applyTransformations) changed trans? (%s)',
        transformKey
      );
      const transformInfo = md.transformations[transformKey];

      if (transformInfo.filterByNamespace && parentRecord) {
        inputDataRecord['_namespace'] = parentRecord['namespace'];
      }

      const transformMutation = await transformations[transformInfo.name](
        keystone,
        transformInfo,
        null,
        inputDataRecord,
        transformKey
      );
      delete inputDataRecord['_namespace'];
      if (transformMutation && transformMutation != null) {
        logger.debug(
          ' -- (applyTransformations) trans (%s) %j',
          transformKey,
          transformMutation
        );
        inputDataRecord[transformKey] = transformMutation;
      }
    }
  }
};

export const removeEmpty = (obj: object) => {
  Object.entries(obj).forEach(
    ([key, val]) =>
      (val && typeof val === 'object' && removeEmpty(val)) ||
      ((val === null || val === '') && delete (obj as any)[key])
  );
  return obj;
};

export const removeKeys = (obj: object, keys: string[]) => {
  Object.entries(obj).forEach(
    ([key, val]) =>
      (keys.includes(key) && delete (obj as any)[key]) ||
      (val && typeof val === 'object' && removeKeys(val, keys))
  );
  return obj;
};

export const removeAllButKeys = (obj: object, keys: string[]) => {
  Object.entries(obj).forEach(
    ([key, val]) =>
      (!keys.includes(key) && delete (obj as any)[key]) ||
      (val && typeof val === 'object' && removeKeys(val, keys))
  );
  return obj;
};

export const parseJsonString = (obj: any, keys: string[]) => {
  Object.entries(obj).forEach(
    ([key, val]) =>
      (val && typeof val === 'object' && parseJsonString(val, keys)) ||
      (keys.includes(key) && (obj[key] = JSON.parse(obj[key])))
  );
  return obj;
};

export const parseBlobString = (obj: any, keys: string[] = ['blob']) => {
  Object.entries(obj).forEach(
    ([key, val]) =>
      keys.includes(key) &&
      obj[key] &&
      (obj[key] =
        obj['type'] === 'json'
          ? JSON.parse(Object.values(val).pop())
          : YAML.loadAll(Object.values(val).pop()))
  );
  return obj;
};

export const transformAllRefID = (obj: any, keys: string[]) => {
  Object.entries(obj).forEach(
    ([key, val]) =>
      (val && keys.includes(key) && (obj[key] = Object.values(val).pop())) ||
      (val && typeof val === 'object' && transformAllRefID(val, keys))
  );
  return obj;
};

export const transformArrayKeyToString = (
  obj: any,
  arrayKey: string,
  childKey: string
) => {
  Object.entries(obj).forEach(
    ([key, val]) =>
      (val &&
        arrayKey === key &&
        (obj[key] = (val as any).map((v: any) => v[childKey]))) ||
      (val &&
        typeof val === 'object' &&
        transformArrayKeyToString(val, arrayKey, childKey))
  );
  return obj;
};
