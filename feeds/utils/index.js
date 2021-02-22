const fs = require('fs')

const fetch = require('node-fetch')

function checkStatus(res) {
    if (res.ok) { // res.status >= 200 && res.status < 300
        return res;
    } else {
        throw Error(res.statusText);
    }
}

async function copyv2 (baseUrl, path, filename, index = 0) {
    const out = '../../_data/' + filename + '-' + index + '.json'
    return fetch (`${baseUrl}${path}`)
    .then (checkStatus)
    .then (data => data.json())
    .then (json => {
        fs.writeFileSync(out, JSON.stringify(json, null, 4), null);
        console.log("WROTE "+  filename)
        if (json.next != null) {
            copyv2 (baseUrl, json.next, filename, index + 1 )
        }
    })
    .catch (err => {
        console.log("COPY ERROR " + filename + " - " + err)
        throw(err)
    })
}
async function copy (url, filename, index = 0) {
    return copyv3 ('../../_data', url, filename, index)
}

async function copyv3 (workingPath, url, filename, index = 0) {
    console.log("Fetching " + url)
    const out = workingPath + '/' + filename + '-' + index + '.json'
    return fetch (url)
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
        throw(err)
    })
}

function read (filename) {
    return readv2('../../_data', filename)
}

function readv2 (workingPath, filename) {
    const infile = workingPath + '/' + filename + '.json'
    return JSON.parse(fs.readFileSync(infile))
}

function iterate_through_json_content(location, next) {
    fs.readdir('../../_data/' + location, (err, files) => {
        if (err) {
            throw(err)
        }
        files.forEach((file) => {
          data = JSON.parse(fs.readFileSync('../../_data/' + location + '/' + file))
          next(file, data)
        })
    })
}

function get_json_content(location, file) {
    let index = 0
    let data = []
    while (true) {
        filePath = '../../_data/' + location + '/' + file + "-" + index + ".json"
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
}

function create_key_map (list, idKey) {
    const map = {}
    for (item of list) {
        map[item[idKey]] = item
    }
    return map
}

function lookup_namespace (item) {
    const tag = ('tags' in item && item['tags'] != null ? item.tags.filter(t => t.startsWith('ns.') && t.indexOf('.', 3) == -1)[0] : null)
    return tag == null ? null : tag.substr(3)
}

module.exports = {
    read: read,
    readv2: readv2,
    copy: copy,
    copyv2: copyv2,
    copyv3: copyv3,
    get_json_content: get_json_content,
    iterate_through_json_content: iterate_through_json_content,
    create_key_map: create_key_map,
    lookup_namespace: lookup_namespace
}