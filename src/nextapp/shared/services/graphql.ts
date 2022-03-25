const graphql = function (query, variables = {}) {
  return fetch('/gql/api', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      variables,
      query,
    }),
  })
    .then((x) => x.json())
    .then((json) => {
      if ('errors' in json) {
        const err = json['errors'][0];
        if ('data' in err) {
          if ('messages' in err['data']) {
            throw Error(err['data']['messages'][0]);
          }
        }
        throw Error(JSON.stringify(json));
      }
      return json;
    });
};

export default graphql;
