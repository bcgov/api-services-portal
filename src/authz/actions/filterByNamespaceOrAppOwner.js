const { filterByOwner } = require('./filterByUser')

const filterByNamespaceOrAppOwner = (context, value) => {
    const namespace = context['user']['namespace']
    return { OR: [ { namespace: namespace } , { application: filterByOwner(context, value) } ]}
}

module.exports = filterByNamespaceOrAppOwner