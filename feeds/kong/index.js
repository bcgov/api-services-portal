const fs = require('fs')
const { transfers } = require('../utils/transfers')
const { portal } = require('../utils/portal')

async function sync({url, workingPath, destinationUrl}) {
    const exceptions = []
    xfer = transfers(workingPath, url, exceptions)

    await xfer.copy (`/services`, 'gw-services')
    await xfer.copy (`/routes`, 'gw-routes')
    await xfer.copy (`/consumers`, 'gw-consumers')
    await xfer.copy (`/plugins`, 'gw-plugins')

    // Now, send to portal
    destination = portal(destinationUrl)

    xfer.get_json_content('gw-services')['data'].map(svc => {
        const name = svc['name']
        svc['plugins'] = findAllPlugins (xfer, 'service', svc['id'])
        console.log(name + ` with ${svc['plugins'].length} plugins`)

        destination.fireAndForget('/feed/GatewayService', svc)
        .then ((result) => console.log(`[${name}] OK`, result))
        .catch (err => console.log(`[${name}] ERR ${err}`))
    })

    xfer.get_json_content('gw-routes')['data'].map(route => {
        const name = route['name']
        route['plugins'] = findAllPlugins (xfer, 'route', route['id'])
        console.log(name + ` with ${route['plugins'].length} plugins`)

        destination.fireAndForget('/feed/GatewayRoute', route)
        .then ((result) => console.log(`[${name}] OK`, result))
        .catch (err => console.log(`[${name}] ERR ${err}`))
    })

    xfer.get_json_content('gw-consumers')['data'].map(consu => {
        const name = consu['username']
        consu['plugins'] = findAllPlugins (xfer, 'consumer', consu['id'])
        console.log(name + ` with ${consu['plugins'].length} plugins`)

        destination.fireAndForget('/feed/Consumer', consu)
        .then ((result) => console.log(`[${name}] OK`, result))
        .catch (err => console.log(`[${name}] ERR ${err}`))
    })
}

function findAllPlugins (xfer, type, serviceOrRouteId) {
    const childs = []
    xfer.get_json_content ('gw-plugins')['data'].map(plugin => {
        if (plugin[type] != null && serviceOrRouteId === plugin[type]['id']) {
            childs.push(plugin)
        }
    })
    return childs
}

module.exports = {
    sync: sync
}