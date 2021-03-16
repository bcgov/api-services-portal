/*
/feed/entity/id

PUT:
- See if the record already exists, if so perform a comparison and update if necessary
- If not, insert the record

curl -v http://localhost:3000/feed/Organization/1 -X PUT -d '{"name":"sample-org","sector":"private","title":"good title for sample","tags":[]}' -H "Content-Type: application/json"
curl -v http://localhost:3000/feed/Organization/1 -X DELETE
*/
const assert = require('assert').strict;

/*
Takes as an argument: (keystone, fieldKey, inputData)

Each returns an object with the field and the mutation.

connectExclusiveList: data: { orgUnits: { disconnectAll: true, connect: ids.map(id => { return { id: id} }) } }

connectRelatedList: data: { orgUnits: { disconnectAll: true, connect: ids.map(id => { return { id: id} }) } }

connectOne: data: { organization: { connect: { id: $orgId } } }

HANDLING:

loadFirst: Should sync the children before dealing with the parent
*/

function dot (value, _key) {
    let returnedValue = value
    for (key of _key.split('.')) {
        if (returnedValue == null || typeof returnedValue === "undefined") {
            return null
        }
        returnedValue = returnedValue[key]
    }
    return returnedValue
}

const transformations = {
    "toString": (keystone, transformInfo, currentData, inputData, key) => currentData != null && currentData[key] === JSON.stringify(inputData[key]) ? null:JSON.stringify(inputData[key]),
    "mapNamespace": (keystone, transformInfo, currentData, inputData, key) => {
        if (inputData['tags'] != null) {
            const val = inputData['tags'].filter(tag => tag.startsWith('ns.') && tag.indexOf('.', 3) == -1).map(tag => tag.substring(3))[0]
            return currentData != null && currentData[key] === val ? null : val
        } else {
            return null
        }
    },
    "connectExclusiveList": (keystone, transformInfo, currentData, inputData, fieldKey) => {
        console.log("IDs = "+ inputData[fieldKey + "_ids"])
        return {
            disconnectAll: true,
            connect: inputData[fieldKey + "_ids"].map(id => { return { id: id}})
        }
    },
    "connectRelatedList": (keystone, transformInfo, currentData, inputData, fieldKey) => {},
    "connectOne": async (keystone, transformInfo, currentData, inputData, _fieldKey) => {
        const fieldKey = 'key' in transformInfo ? transformInfo['key'] : _fieldKey
        const user = await lookup(keystone, transformInfo['list'], transformInfo['refKey'], dot(inputData, fieldKey), [])
        if (user == null) {
            console.log("NO! Lookup failed!")
            return { disconnectAll: true }
        } else {
            return { connect: { id: user['id'] } }
        }
    },
    "alwaysTrue": (keystone, transformInfo, currentData, inputData, fieldKey) => true,
}

const metadata = {
    'Organization': {
        sync: ['name', 'sector', 'title', 'tags', 'description', 'orgUnits'],
        refKey: 'bcdc_id',
        query: 'allOrganizations',
        transformations: {
            tags: {name: "toString"},
            orgUnits: {name: "connectExclusiveList", list: "OrganizationUnit", syncFirst: true},
        }
    },
    'OrganizationUnit': {
        query: 'allOrganizationUnits',
        refKey: 'bcdc_id',
        sync: ['name', 'sector', 'title', 'tags', 'description'],
        transformations: {
            tags: {name: "toString"},
        }
    },
    'Dataset': {
        query: 'allDatasets',
        refKey: 'bcdc_id',
        sync: ['name', 'sector', 'license_title', 'view_audience', 'notes', 'title', 'organization', 'organizationUnit', 'isInCatalog'],
        transformations: {
            organization: {name: "connectOne", key: 'org', list: "allOrganizations", refKey: 'bcdc_id' },
            organizationUnit: {name: "connectOne", key: 'sub_org', list: "allOrganizationUnits", refKey: 'bcdc_id'},
            isInCatalog: {name: "alwaysTrue"}
        }
    },
    'Metric': {
        query: 'allMetrics',
        refKey: 'name',
        sync: ['query', 'day', 'metric', 'values'],
        transformations: {
            metric: {name:"toString"},
            values: {name:"toString"},
            service: {name: "connectOne", key: "metric.service", list: "allGatewayServices", refKey: 'name' },
        }
    },
    'Alert': {
        query: 'allAlerts',
        refKey: 'name',
        sync: ['name'],
        transformations: {
        }
    },
    'Namespace': {
        query: 'allNamespaces',
        refKey: 'extRefId',
        sync: ['name'],
        transformations: {
            members: {name: "connectExclusiveList", list: "Member", syncFirst: true},
        }
    },
    'MemberRole': {
        query: 'allMemberRoles',
        refKey: 'extRefId',
        sync: ['role', 'user'],
        transformations: {
            user: {name: "connectOne", key: "metric.service", list: "allUsers", refKey: 'name' },
        }
    },
    'GatewayService': {
        query: 'allGatewayServices',
        refKey: 'kongServiceId',
        sync: ['name', 'namespace', 'host', 'tags', 'plugins'],
        transformations: {
            tags: {name:"toString"},
            namespace: {name:"mapNamespace"},
            plugins: {name: "connectExclusiveList", list: "GatewayPlugin", syncFirst: true},
            // routes: {name: "connectExclusiveList", list: "GatewayRoute", loadFirst: true}
        }
    },
    'GatewayGroup': {
        query: 'allGatewayGroups',
        refKey: 'extRefId',
        sync: ['name', 'namespace'],
        transformations: {
        }
    },    
    'GatewayRoute': {
        childOnly: false,
        query: 'allGatewayRoutes',
        refKey: 'kongRouteId',
        sync: ['name', 'namespace', 'methods', 'paths', 'hosts', 'tags', 'plugins'],
        transformations: {
            tags: {name: "toString"},
            methods: {name: "toString"},
            paths: {name: "toString"},
            hosts: {name: "toString"},
            namespace: {name:"mapNamespace"},
            service: {name: "connectOne", key: "service.id", list: "allGatewayServices", refKey: 'kongServiceId' },
            plugins: {name: "connectExclusiveList", list: "GatewayPlugin", syncFirst: true},
        }
    },
    'GatewayPlugin': {
        childOnly: true,
        query: 'allGatewayPlugins',
        refKey: 'kongPluginId',
        sync: ['name', 'tags', 'config'],
        transformations: {
            tags: {name: "toString"},
            config: {name: "toString"},
            service: {name: "connectOne", list: "allGatewayServices", refKey: 'kongServiceId' },
            route: {name: "connectOne", list: "allGatewayRoutes", refKey: 'kongRouteId' },
        }
    },
    'GatewayConsumer': {
        query: 'allGatewayConsumers',
        refKey: 'kongConsumerId',
        sync: ['username', 'tags', 'customId', 'namespace', 'aclGroups', 'plugins'],
        transformations: {
            tags: {name: "toString"},
            aclGroups: {name: "toString"},
            namespace: {name:"mapNamespace"},
            plugins: {name: "connectExclusiveList", list: "GatewayPlugin", syncFirst: true}
        }
    },
    'Application': {
        query: 'allApplications',
        refKey: 'name',
        sync: [ 'description'],
        transformations: {
            owner: {name: "connectOne", list: "allUsers", refKey: 'username' },
        }
    },
    'Content': {
        query: 'allContents',
        refKey: 'externalLink',
        sync: ['title', 'description', 'content', 'githubRepository', 'readme']
    },
    'Activity': {
        query: 'allActivities',
        refKey: 'extRefId',
        sync: ['type', 'name', 'action', 'result', 'message', 'refId', 'namespace', 'actor'],
        transformations: {
            actor: {name: "connectOne", list: "allUsers", refKey: 'username' },
        }
    },
    'User': {
        query: 'allUsers',
        refKey: 'username',
        sync: ['name', 'username', 'email']
    },
}

const putFeedWorker = async (keystone, req, res) => {
    const entity = req.params['entity']
    const eid = 'id' in req.params ? req.params['id'] : req.body['id']
    const json = req.body
    console.log(JSON.stringify(json, null, 4))


    assert.strictEqual(entity in metadata, true)
    assert.strictEqual(eid === null || json === null || typeof json == 'undefined', false, "Either entity or ID are missing " + eid + json)

    assert.strictEqual(typeof eid == 'string', true, 'Unique ID is not a string! ' + JSON.stringify(req.params) + " :: " + JSON.stringify(req.body))

    const result = await syncRecords(keystone, entity, eid, json)
    res.status(result.status).json(result)
}

const deleteFeedWorker = async (keystone, req, res) => {
    const entity = req.params['entity']
    const eid = req.params['id']
    const json = req.body

    assert.strictEqual(entity in metadata, true)
    assert.strictEqual(eid === null || json === null || typeof json == 'undefined', false)

    const md = metadata[entity]

    const localRecord = await lookup(keystone, md.query, md.refKey, eid, md.sync)
    console.log(localRecord)
    if (localRecord == null) {
        res.json({result: 'not-found'})
    } else {
        const nr = await remove(keystone, entity, localRecord.id)
        console.log("--> RESULT " + JSON.stringify(nr))
        res.json({result: 'deleted'})
    }
}

const lookup = async function (keystone, query, refKey, eid, fields) {
    const result = await keystone.executeGraphQL({
        context: keystone.createContext({ skipAccessControl: true }),
        query: `query($id: String) {
          ${query}(where: { ${refKey} : $id }) {
            id, ${fields.join(',')}
          }
        }`,
        variables: { id: eid }
    })
    console.log("QUERY : " + refKey + " == " + eid)
    console.log(JSON.stringify(result, null, 3))
    if (result['data'][query].length > 1) {
        throw Error('Expecting zero or one rows ' + query + ' ' + refKey + ' ' + eid)
    }
    return result['data'][query].length == 0 ? null : result['data'][query][0]
}

const create = async function (keystone, entity, data) {
    console.log("CREATE MUTATION: " + JSON.stringify(data, null, 3))
    const result = await keystone.executeGraphQL({
        context: keystone.createContext({ skipAccessControl: true }),
        query: `mutation ($data: ${entity}CreateInput) {
          create${entity}(data: $data) {
            id
          }
        }`,
        variables: { data: data }
    })
    console.log(JSON.stringify(result, null, 3))
    return 'errors' in result ? null : result['data'][`create${entity}`].id
}

const update = async function (keystone, entity, id, data) {
    const result = await keystone.executeGraphQL({
        context: keystone.createContext({ skipAccessControl: true }),
        query: `mutation ($id: ID!, $data: ${entity}UpdateInput) {
          update${entity}(id: $id, data: $data) {
            id
          }
        }`,
        variables: { id: id, data: data }
    })
    console.log(JSON.stringify(result, null, 3))
    return 'errors' in result ? null : result['data'][`update${entity}`].id
}

const remove = async function (keystone, entity, id) {
    const result = await keystone.executeGraphQL({
        context: keystone.createContext({ skipAccessControl: true }),
        query: `mutation ($id: ID!) {
          delete${entity}(id: $id)
        }`,
        variables: { id: id }
    })
    console.log(JSON.stringify(result, null, 3))
    return 'errors' in result ? null : result['data'][`delete${entity}`]
}

const syncListOfRecords = async function (keystone, entity, records) {
    const result = []
    for (record of records) {
        result.push( await syncRecords(keystone, entity, record['id'], record, true))
    }
    return result
}

const syncRecords = async function (keystone, entity, eid, json, children = false) {
    const md = metadata[entity]

    assert.strictEqual(children == false && md.childOnly === true, false, 'This entity is only part of a child.')

    const localRecord = await lookup(keystone, md.query, md.refKey, eid, md.sync)
    if (localRecord == null) {
        const data = {}
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
                    console.log("All IDS " + allIds)
                    json[transformKey + "_ids"] = allIds.map(status => status.id)
                }
                const transformMutation = await transformations[transformInfo.name](keystone, transformInfo, null, json, transformKey)
                if (transformMutation != null) {
                    data[transformKey] = transformMutation
                }
            }
        }
        data[md.refKey] = eid
        console.log("CREATING " + JSON.stringify(data))
        const nr = await create(keystone, entity, data)
        console.log("--> RESULT " + nr)
        if (nr == null) {
            return {status: 400, result: 'create-failed'}
        } else {
            return {status: 200, result: 'created', id: nr}
        }
    } else {
        const data = {}
        const transformKeys = Object.keys(md.transformations)

        for (const field of md.sync) {
            if (!transformKeys.includes(field)) {
                console.log("Changed? " + field)
                console.log(" -- " + JSON.stringify(json[field]) + " == " + JSON.stringify(localRecord[field]))
                if (field in json && json[field] !== localRecord[field]) {
                    console.log(" -- updated")
                    data[field] = json[field]
                }
            }
        }
        if ('transformations' in md) {
            for (const transformKey of transformKeys) {
                // unset transformKey from data[] 
                delete data[transformKey]
                const transformInfo = md.transformations[transformKey]
                if (transformInfo.syncFirst) {
                    // handle these children independently first - return a list of IDs
                    const allIds = await syncListOfRecords (keystone, transformInfo.list, json[transformKey])
                    console.log("All IDS " + JSON.stringify(allIds, null, 3))
                    json[transformKey + "_ids"] = allIds.map(status => status.id)
                }

                const transformMutation = await transformations[transformInfo.name](keystone, transformInfo, localRecord, json, transformKey)
                if (transformMutation != null) {
                    console.log(" -- Updated [" + transformKey + "] to " + JSON.stringify(transformMutation))
                    data[transformKey] = transformMutation
                }
            }
        }
        console.log(Object.keys(data))
        if (Object.keys(data).length === 0) {
            return {status: 200, result: 'no-change', id: localRecord['id']}
        }
        console.log("UPDATING " + JSON.stringify(data))
        const nr = await update(keystone, entity, localRecord.id, data)
        console.log("--> RESULT " + nr)
        if (nr == null) {
            return {status: 400, result: 'update-failed'}
        } else {
            return {status: 200, result: 'updated', id: nr}
        }
    }
}

module.exports = {
    PutFeed: putFeedWorker,
    DeleteFeed: deleteFeedWorker
}