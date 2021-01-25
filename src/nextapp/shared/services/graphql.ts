
const graphql = function (query, variables = {}) {
    return fetch('/admin/api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        variables,
        query,
      }),
    }).then(x => x.json()).then(json => {
        console.log(query)
        console.log(JSON.stringify(json, null, 4))
        if ('errors' in json) {
            throw Error("Errors!")
        }
        return json
    });
}

export default graphql