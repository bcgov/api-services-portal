
var fs = require('fs'),
    readline = require('readline'),
    stream = require('stream');

const { transfers } = require('../utils/transfers')
const { portal } = require('../utils/portal')

async function push({workingPath, destinationUrl, items}) {
    const exceptions = []
    const xfer = transfers(workingPath, null, exceptions)

    // Now, send to portal
    await xfer.concurrentWork(loadProducer(destinationUrl, items), 1)
    console.log(exceptions)
}

async function loadProducer (destinationUrl, items) {
    const destination = portal(destinationUrl, false)

    console.log("Items = "+items.length)
    let index = 0
    return () => {
        if (index == items.length) {
            console.log("Finished producing "+ index + " records.")
            return null
        }
        const item = items[index]        
        index++

        return destination.fireAndForget(`/feed/${item['entity']}`, item['record'])
        .then ((result) => console.log(`[${index}] ${item['entity']} - OK`, result))
        .catch (err => console.log(`[${index}] - ERR ${item} - ${err}`))
    }
}

module.exports = push