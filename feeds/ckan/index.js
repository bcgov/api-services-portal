const fs = require('fs')
const { transfers } = require('../utils/transfers')

async function sync({url, workingPath, destinationUrl}) {
    fs.mkdirSync(workingPath + '/orgs', { recursive: true })
    fs.mkdirSync(workingPath + '/groups', { recursive: true })
    fs.mkdirSync(workingPath + '/packages', { recursive: true })

    const exceptions = []
    xfer = transfers(workingPath, url, exceptions)

    // await xfer.copy ('/api/action/group_list', 'group-keys')
    // await xfer.copy ('/api/action/organization_list', 'organization-keys')
    // await xfer.copy ('/api/action/package_list', 'package-keys')

    await xfer.concurrentWork (producer(xfer, 'group-keys-0', '/api/action/group_show', 'groups/'))
    // await xfer.concurrentWork (producer(xfer, 'package-keys-0', '/api/action/package_show', 'packages/'), 10)
    // await xfer.concurrentWork (producer(xfer, 'organization-keys-0', '/api/action/organization_show', 'orgs/'))
    console.log("Exceptions? " + (exceptions.length == 0 ? "NO":"YES!"))
    console.log(JSON.stringify(exceptions, null, 4))
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


module.exports = {
    sync: sync
}