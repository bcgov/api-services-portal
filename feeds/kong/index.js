const fs = require('fs')
const { transfers } = require('../utils/transfers')
const { portal } = require('../utils/portal')

const mask = require('./mask')

async function sync({url, workingPath, destinationUrl}) {
    const exceptions = []
    const xfer = transfers(workingPath, url, exceptions)

    // await xfer.copy (`/services`, 'gw-services')
    // await xfer.copy (`/routes`, 'gw-routes')
    // await xfer.copy (`/consumers`, 'gw-consumers')
    // await xfer.copy (`/plugins`, 'gw-plugins')
    //await xfer.copy (`/acls`, 'gw-acls')

    // Now, send to portal
    // await xfer.concurrentWork(loadProducer(xfer, destinationUrl, 'gw-services', 'name', 'service', '/feed/GatewayService'))
    // await xfer.concurrentWork(loadProducer(xfer, destinationUrl, 'gw-routes', 'name', 'route', '/feed/GatewayRoute'))
    // await xfer.concurrentWork(loadProducer(xfer, destinationUrl, 'gw-consumers', 'username', 'consumer', '/feed/Consumer'))
    // await xfer.concurrentWork(loadGroupsProducer(xfer, destinationUrl, '/feed/GatewayGroup'))
    await xfer.concurrentWork(loadAppsProducer(xfer, destinationUrl, 'gw-consumers', 'name', 'service', '/feed/Application'))
}

function loadProducer (xfer, destinationUrl, file, name, type, feedPath) {
    const destination = portal(destinationUrl)
    const items = xfer.get_json_content(file)['data']
    const allPlugins = xfer.get_json_content ('gw-plugins')['data'].map(mask)
    let index = 0
    return () => {
        if (index == items.length) {
            console.log("Finished producing "+ index + " records.")
            return null
        }
        const item = items[index]
        index++
        const nm = item[name]
        item['plugins'] = findAllPlugins (allPlugins, type, item['id'])
        console.log(nm + ` with ${item['plugins'].length} plugins`)

        return destination.fireAndForget(feedPath, item)
        .then ((result) => console.log(`[${nm}] OK`, result))
        .catch (err => console.log(`[${nm}] ERR ${err}`))
    }
}

function toNamespace (tags) {
    if (tags != null) {
        return tags.filter(tag => tag.startsWith('ns.') && tag.indexOf('.', 3) == -1).map(tag => tag.substring(3))[0]
    } else {
        return null
    }
}

function loadGroupsProducer (xfer, destinationUrl, feedPath) {
    const destination = portal(destinationUrl)
    const allPlugins = xfer.get_json_content ('gw-plugins')['data'].map(mask)
    const items = []
    allPlugins
        .filter(p => p.name == 'acl')
        .map(p => { 
            return p.config.allow.map(a => { 
                items.push({ namespace: toNamespace(p.tags), name: a })
            })
        })

    let index = 0
    return () => {
        if (index == items.length) {
            console.log("Finished producing "+ index + " records.")
            return null
        }
        const item = items[index]
        index++
        const nm = `${item['namespace']}.${item['name']}`

        item['id'] = nm

        return destination.fireAndForget(feedPath, item)
        .then ((result) => console.log(`[${nm}] OK`, result))
        .catch (err => console.log(`[${nm}] ERR ${err}`))
    }
}

function loadAppsProducer (xfer, destinationUrl, file, name, type, feedPath) {
    const destination = portal(destinationUrl)
    const items = []
    const allACLS = xfer.get_json_content ('gw-acls')['data']
    xfer.get_json_content(file)['data'].map (item => {
        // Create an application of any Consumer that has atleast one ACL Group
        const acls = allACLS
            .filter(acl => acl.group != 'idir' && acl.group != 'gwa_github_developer')
            .filter(acl => acl.consumer.id == item.id)
        if (item.username.endsWith('@sm-idir') 
            || item.username.endsWith('@idir')
            || item.username.endsWith('@github')) {
            return
        }
        if (acls.length > 0) {
            const acl_groups = acls.map(acl => acl.group).join(', ')
            items.push({
                owner: 'apsowner',
                description: 'Legacy - generated because this Consumer has an ACL '+acl_groups,
                id: 'legacy_' + item.username
            })
        } else {
        }
    });

    let index = 0
    return () => {
        if (index == items.length) {
            console.log("Finished producing "+ index + " records.")
            return null
        }
        const item = items[index]
        index++
        const nm = item['id']

        return destination.fireAndForget(feedPath, item)
        .then ((result) => console.log(`[${nm}] OK`, result))
        .catch (err => console.log(`[${nm}] ERR ${err}`))
    }
}

function findAllPlugins (allPlugins, type, serviceOrRouteId) {
    const childs = []
    allPlugins.map(plugin => {
        if (plugin[type] != null && serviceOrRouteId === plugin[type]['id']) {
            childs.push(plugin)
        }
    })
    return childs
}

module.exports = {
    sync: sync
}