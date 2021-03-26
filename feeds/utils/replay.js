
var fs = require('fs'),
    readline = require('readline'),
    stream = require('stream');

const { transfers } = require('../utils/transfers')
const { portal } = require('../utils/portal')

async function replay({workingPath, destinationUrl, source}) {
    const exceptions = []
    const xfer = transfers(workingPath, null, exceptions)

    // Now, send to portal
    await xfer.concurrentWork(loadProducer(xfer, source, destinationUrl))
}

async function loadProducer (xfer, source, destinationUrl) {
    const destination = portal(destinationUrl, false)

    var instream = fs.createReadStream('feeds.log');
    
    var rl = readline.createInterface({
        input: instream,
        terminal: false
    });

    const it = rl[Symbol.asyncIterator]();

    const items = []
    for await (const line of it) {
        items.push(line)
    }

    console.log("Items = "+items.length)
    let index = 0
    return () => {
        if (index == items.length) {
            console.log("Finished producing "+ index + " records.")
            return null
        }
        const item = JSON.parse(items[index]);        
        index++

        if (source == null || item['source'] === source) {
            return destination.fireAndForget(item['url'], item['payload'])
            .then ((result) => console.log(`[${index}] ${item['url']} - OK`, result))
            .catch (err => console.log(`[${index}] - ERR ${item} - ${err}`))
        } else {
            return new Promise ((resolve, reject) => resolve())
        }
    }
}

module.exports = replay