const actionFilterBy = (field) => (context, value) => {
    const userId = context['user']['id']
    if (process.env.RULE_DEBUG) { 
        console.log("Action: Filter By " + field + " == " + userId)
    }
    const _filter = { }
    _filter[field] = { id : userId }
    return _filter
}

module.exports = {
    filterByOwner: actionFilterBy('owner'),
    filterByRequestor: actionFilterBy('requestor')
}
