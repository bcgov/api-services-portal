
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
    }).then(x => x.json());
}

export default graphql