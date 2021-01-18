const fetch = require('node-fetch')

function graphql(query, variables = {}) {
    return fetch('http://localhost:7000/admin/api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        variables,
        query,
      }),
    }).then(x => x.json()).then(json => {
        if ('errors' in json) {
            throw Error ("Failed GRAPHQL " + JSON.stringify(json, null, 4))
        } else {
            return json
        }
    })
}

async function lookup_id_from_attr (entity, attr, value) {
    const GET = `
        query Get($val: String) {
            all${entity}(where: {${attr}: $val}) {
                id
            }
        }
    `
    const result = await graphql(GET, { val : value })
    if (result.data['all' + entity].length == 0) {
        return null
    } else {
        return result.data['all' + entity][0].id
    }
}

async function lookup_id_from_name (entity, name) {
    return lookup_id_from_attr(entity, 'name', name)
}

module.exports = {
    graphql: graphql,
    lookup_id_from_name: lookup_id_from_name,
    lookup_id_from_attr: lookup_id_from_attr
}