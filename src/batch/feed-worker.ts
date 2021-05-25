import { strict as assert } from 'assert'
import { 
    alwaysTrue,
    connectExclusiveList,
    connectMany,
    connectOne,
    mapNamespace, 
    toStringDefaultArray, 
    toString 
} from './transformations'
import { metadata } from './data-rules'
import { BatchService } from '../services/keystone/batch-service'
import { Logger } from '../logger'

export function dot (value: any, _key: string) {
    let returnedValue = value
    for (const key of _key.split('.')) {
        if (returnedValue == null || typeof returnedValue === "undefined") {
            return null
        }
        returnedValue = returnedValue[key]
    }
    return returnedValue
}

const logger = Logger('batch.worker')

const transformations = {
    "toStringDefaultArray": toStringDefaultArray,
    "toString": toString,
    "mapNamespace": mapNamespace,
    "connectExclusiveList": connectExclusiveList,
    "connectMany": connectMany,
    "connectOne": connectOne,
    "alwaysTrue": alwaysTrue,
} as any


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
    const entity = req.params['entity']
    const eid = 'id' in req.params ? req.params['id'] : req.body['id']
    const json = req.body

    assert.strictEqual(entity in metadata, true)
    assert.strictEqual(eid === null || json === null || typeof json == 'undefined', false, "Either entity or ID are missing " + eid + json)

    assert.strictEqual(typeof eid == 'string', true, 'Unique ID is not a string! ' + JSON.stringify(req.params) + " :: " + JSON.stringify(req.body))

    const result = await syncRecords(keystone, entity, eid, json)
    res.status(result.status).json(result)
}

export const deleteFeedWorker = async (keystone: any, req: any, res: any) => {
    const entity = req.params['entity']
    const eid = req.params['id']
    const json = req.body
    const batchService = new BatchService(keystone)

    assert.strictEqual(entity in metadata, true)
    assert.strictEqual(eid === null || json === null || typeof json == 'undefined', false)

    const md = (metadata as any)[entity]

    const localRecord = await batchService.lookup(md.query, md.refKey, eid, md.sync)
    if (localRecord == null) {
        res.json({result: 'not-found'})
    } else {
        const nr = await batchService.remove(entity, localRecord.id)
        res.json({result: 'deleted'})
    }
}


const syncListOfRecords = async function (keystone: any, entity: string, records: any) {
    const result = []
    if (records == null || typeof(records) == 'undefined') {
        return []
    }
    for (const record of records) {
        result.push( await syncRecords(keystone, entity, record['id'], record, true))
    }
    return result
}

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

export const syncRecords = async function (keystone: any, entity: string, eid: string, json: any, children = false) {
    const md = (metadata as any)[entity]

    assert.strictEqual(children == false && md.childOnly === true, false, 'This entity is only part of a child.')

    const batchService = new BatchService(keystone)

    const localRecord = await batchService.lookup(md.query, md.refKey, eid, md.sync)
    if (localRecord == null) {
        const data:any = {}
        for (const field of md.sync) {
            if (field in json) {
                data[field] = json[field]
            }
        }

        if ('transformations' in md) {
            for (const transformKey of Object.keys(md.transformations)) {
                const transformInfo = md.transformations[transformKey]
                if (transformInfo.syncFirst) {
                    // handle these children independently first - return a list of IDs
                    const allIds = await syncListOfRecords (keystone, transformInfo.list, json[transformKey])
                    logger.debug("All IDS " + allIds)
                    json[transformKey + "_ids"] = allIds.map(status => status.id)
                }
                const transformMutation = await transformations[transformInfo.name](keystone, transformInfo, null, json, transformKey)
                if (transformMutation != null) {
                    logger.debug(" -- Updated [" + transformKey + "] " + JSON.stringify(data[transformKey]) + " to " + JSON.stringify(transformMutation))
                    data[transformKey] = transformMutation
                }
            }
        }
        data[md.refKey] = eid
        logger.debug("CREATING " + JSON.stringify(data))
        const nr = await batchService.create(entity, data)
        logger.debug("--> RESULT " + nr)
        if (nr == null) {
            logger.error("CREATE FAILED (%s) %j", nr, data)
            return {status: 400, result: 'create-failed'}
        } else {
            return {status: 200, result: 'created', id: nr}
        }
    } else {
        const transformKeys = 'transformations' in md ? Object.keys(md.transformations) : []
        const data:any = {}

        for (const field of md.sync) {
            if (!transformKeys.includes(field)) {
                logger.debug("Changed? " + field)
                logger.debug(" -- " + JSON.stringify(json[field]) + " == " + JSON.stringify(localRecord[field]))
                if (field in json && json[field] !== localRecord[field]) {
                    logger.debug(" -- updated")
                    data[field] = json[field]
                }
            }
        }
        
        if ('transformations' in md) {
            for (const transformKey of transformKeys) {
                logger.debug("Changed? " + transformKey)
                // unset transformKey from data[] 
                delete data[transformKey]
                const transformInfo = md.transformations[transformKey]
                if (transformInfo.syncFirst) {
                    // handle these children independently first - return a list of IDs
                    const allIds = await syncListOfRecords (keystone, transformInfo.list, json[transformKey])
                    logger.debug("All IDS FOR " + transformInfo.list + " :: " + JSON.stringify(allIds, null, 3))
                    json[transformKey + "_ids"] = allIds.map(status => status.id)
                }

                const transformMutation = await transformations[transformInfo.name](keystone, transformInfo, localRecord, json, transformKey)
                if (transformMutation != null) {
                    logger.debug(" -- updated [" + transformKey + "] " + JSON.stringify(localRecord[transformKey]) + " to " + JSON.stringify(transformMutation))
                    data[transformKey] = transformMutation
                }
            }
        }
        logger.debug(Object.keys(data))
        if (Object.keys(data).length === 0) {
            return {status: 200, result: 'no-change', id: localRecord['id']}
        }
        logger.debug("UPDATING " + JSON.stringify(data))
        const nr = await batchService.update(entity, localRecord.id, data)
        logger.debug("--> RESULT " + nr)
        if (nr == null) {
            logger.error("UPDATE FAILED (%s) %j", nr, data)
            return {status: 400, result: 'update-failed'}
        } else {
            return {status: 200, result: 'updated', id: nr}
        }
    }
}
