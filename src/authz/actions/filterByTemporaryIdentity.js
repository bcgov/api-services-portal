const filterByTemporaryIdentity = (context, value) => {
    const tid = context['user']['tid']
    return { id : tid }
}

module.exports = filterByTemporaryIdentity
