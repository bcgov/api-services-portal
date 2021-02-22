const fs = require('fs')
const fetch = require('node-fetch')
const PromisePool = require('es6-promise-pool')
const { checkStatus } = require('./checkStatus')

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
            
        },

        iterate_through_json_content_sync: function iterate_through_json_content_sync(location, next) {
            const files = fs.readdirSync(workingPath + "/" + location)
            files.forEach((file) => {
                data = JSON.parse(fs.readFileSync(workingPath + "/" + location + '/' + file))
                next(file, data)
            })
        },
        
        iterate_through_json_content: function iterate_through_json_content(location, next) {
            fs.readdir(workingPath + "/" + location, (err, files) => {
                if (err) {
                    throw(err)
                }
                files.forEach((file) => {
                  data = JSON.parse(fs.readFileSync(workingPath + "/" + location + '/' + file))
                  next(file, data)
                })
            })
        },
        
        get_json_content: function get_json_content(file) {
            let index = 0
            let data = []
            while (true) {
                filePath = workingPath + '/' + file + "-" + index + ".json"
                console.log("READ " + filePath)
                if (fs.existsSync(filePath)) {
                    fileData = JSON.parse(fs.readFileSync(filePath))
                    data = data.concat(fileData['data'])
                    index++
                } else {
                    console.log("RETURNING " + data.length)
                    return { next: null, data: data }
                }
            }
        },
        
        create_key_map: function create_key_map (list, idKey) {
            const map = {}
            for (item of list) {
                map[item[idKey]] = item
            }
            return map
        }
    }
}

module.exports = {
    transfers: transfers
}