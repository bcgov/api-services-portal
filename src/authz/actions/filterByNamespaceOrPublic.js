const filterByNamespaceOrPublic = (context, value) => {
    const namespace = 'namespace' in context['user'] ? context['user']['namespace'] : null
    if (namespace == null) {
        return { isPublic: true }
    } else {
        return { OR: [ { namespace: namespace } , { isPublic: true } ]}
    }
}

module.exports = filterByNamespaceOrPublic