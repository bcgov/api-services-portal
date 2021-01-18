const fs = require('fs')

const fetch = require('node-fetch')

function checkStatus(res) {
    if (res.ok) { // res.status >= 200 && res.status < 300
        return res;
    } else {
        throw Error(res.statusText);
    }
}

async function copy (url, filename) {
    const out = '../../_data/' + filename + '.json'
    return fetch (url)
    .then (checkStatus)
    .then (data => data.json())
    .then (json => {
        fs.writeFileSync(out, JSON.stringify(json, null, 4), null);
        console.log("WROTE "+  filename)
    })
    .catch (err => {
        console.log("COPY ERROR " + filename + " - " + err)
        throw(err)
    })
}

function read (filename) {
    const infile = '../../_data/' + filename + '.json'
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
    return JSON.parse(fs.readFileSync('../../_data/' + location + '/' + file))
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
    copy: copy,
    get_json_content: get_json_content,
    iterate_through_json_content: iterate_through_json_content,
    create_key_map: create_key_map,
    lookup_namespace: lookup_namespace
}