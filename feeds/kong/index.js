const fs = require('fs')
const { transfers } = require('../utils/transfers')
const { portal } = require('../utils/portal')

async function sync({url, workingPath, destinationUrl}) {
    const exceptions = []
    const xfer = transfers(workingPath, url, exceptions)

    await xfer.copy (`/services`, 'gw-services')
    await xfer.copy (`/routes`, 'gw-routes')
    await xfer.copy (`/consumers`, 'gw-consumers')
    await xfer.copy (`/plugins`, 'gw-plugins')

    // Now, send to portal
    await xfer.concurrentWork(loadProducer(xfer, destinationUrl, 'gw-services', 'name', 'service', '/feed/GatewayService'))
    await xfer.concurrentWork(loadProducer(xfer, destinationUrl, 'gw-routes', 'name', 'route', '/feed/GatewayRoute'))
    await xfer.concurrentWork(loadProducer(xfer, destinationUrl, 'gw-consumers', 'username', 'consumer', '/feed/Consumer'))
}

function loadProducer (xfer, destinationUrl, file, name, type, feedPath) {
    const destination = portal(destinationUrl)
    const items = xfer.get_json_content(file)['data']
    const allPlugins = xfer.get_json_content ('gw-plugins')['data']
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

function findAllPlugins (allPlugins, type, serviceOrRouteId) {
    const childs = []
    .map(plugin => {
        if (plugin[type] != null && serviceOrRouteId === plugin[type]['id']) {
            childs.push(plugin)
        }
    })
    return childs
}

module.exports = {
    sync: sync
}