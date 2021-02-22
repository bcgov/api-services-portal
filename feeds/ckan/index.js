const fs = require('fs')
const { transfers } = require('../utils/transfers')
const { portal } = require('../utils/portal')

async function sync({url, workingPath, destinationUrl}) {
    fs.mkdirSync(workingPath + '/orgs', { recursive: true })
    fs.mkdirSync(workingPath + '/groups', { recursive: true })
    fs.mkdirSync(workingPath + '/packages', { recursive: true })

    const exceptions = []
    xfer = transfers(workingPath, url, exceptions)

    // await xfer.copy ('/api/action/group_list', 'group-keys')
    // await xfer.copy ('/api/action/organization_list', 'organization-keys')
    // await xfer.copy ('/api/action/package_list', 'package-keys')

    // await xfer.concurrentWork (producer(xfer, 'group-keys-0', '/api/action/group_show', 'groups/'))
    // await xfer.concurrentWork (producer(xfer, 'package-keys-0', '/api/action/package_show', 'packages/'), 10)
    // await xfer.concurrentWork (producer(xfer, 'organization-keys-0', '/api/action/organization_show', 'orgs/'))
    console.log("Exceptions? " + (exceptions.length == 0 ? "NO":"YES!"))
    console.log(JSON.stringify(exceptions, null, 4))

    // Now, send to portal
    destination = portal(destinationUrl)

    xfer.iterate_through_json_content ('orgs', async (file, json) => {
        const data = json['result']
        if (isOrgUnit(data)) {
            return
        }
        console.log(data['name'])
        data['orgUnits'] = findAllChildren (xfer, data['name'])
        destination.fireAndForget('/feed/Organization', data)
        .then ((result) => console.log(`[${data['name']}] OK`, result))
        .catch (err => console.log(`[${data['name']}] ERR ${err}`))
    })
}

function producer (xfer, keyFile, apiCall, outFolder) {
    const data = xfer.read(keyFile)
    let index = 0
    return () => {
        if (index == data['result'].length) {
            console.log("Finished producing "+ index + " records.")
            return null
        }
        const item = data['result'][index]
        index++
        return xfer.copy (apiCall + '?id=' + item, outFolder + item)
    }
}

function findAllChildren (xfer, parentName, cb) {
    const childs = []
    xfer.iterate_through_json_content_sync ('orgs', (file, json) => {
        data = json['result']
        if (isThisAChildOfParent(data, parentName)) {
            childs.push(data)
        }
    })
    return childs
}

function isThisAChildOfParent (data, parentName) {
    if (data.groups.length > 0) {
        for (grp of data.groups) {
                if (grp['name'] === parentName) {
                    return true
                }
        }
    }
    return false
}

function isOrgUnit (data) { 
    return data.groups.length > 0
}

module.exports = {
    sync: sync
}