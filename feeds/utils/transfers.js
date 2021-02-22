const fs = require('fs')
const fetch = require('node-fetch')
const PromisePool = require('es6-promise-pool')

function checkStatus(res) {
    if (res.ok) { // res.status >= 200 && res.status < 300
        return res;
    } else {
        throw Error(res.statusText);
    }
}

function transfers (workingPath, baseUrl, exceptions) {
    fs.mkdirSync(workingPath, { recursive: true })

    return {

        copy: async function (url, filename, index = 0) {
            console.log("Fetching " + baseUrl + url)
            const out = workingPath + '/' + filename + '-' + index + '.json'
            return fetch (baseUrl + url)
            .then (checkStatus)
            .then (data => data.json())
            .then (json => {
                fs.writeFileSync(out, JSON.stringify(json, null, 4), null);
                console.log("WROTE "+  filename)
                if (json.next != null) {
                    copyv3 (workingPath, json.next, filename, index + 1 )
                }
            })
            .catch (err => {
                console.log("COPY ERROR " + filename + " - " + err)
                exceptions.push({relativeUrl:url, filename:filename, error:"" + err})
            })
        },
        read: function (filename) {
            const infile = workingPath + '/' + filename + '.json'
            return JSON.parse(fs.readFileSync(infile))
        },
        concurrentWork: function(producer, concurrency = 5) {
            var pool = new PromisePool(producer, concurrency)
            
            // Start the pool.
            var poolPromise = pool.start()
            
            // Wait for the pool to settle.
            return poolPromise.then(function () {
                console.log('All promises fulfilled')
            }, function (error) {
                console.log('Some promise rejected: ' + error.message)
                throw Exception ('Some promise rejected: ' + error.message)
            })
            
        }
    }
}

module.exports = {
    transfers: transfers
}