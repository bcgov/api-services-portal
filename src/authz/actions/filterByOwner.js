const actionFilterByOwner = (context, value) => {
    const userId = context['user']['id']
    if (process.env.RULE_DEBUG) { 
        console.log("Action: Filter By Owner " + userId)
    }
    const _filter = { owner: userId }
    console.log("FILTER: " + JSON.stringify(_filter))
    return _filter
}

module.exports = actionFilterByOwner