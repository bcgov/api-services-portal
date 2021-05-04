const actionFilterNS = (context, value) => {
    if (process.env.RULE_DEBUG) { 
        console.log("Action: Filter By User NS" + namespace)
    }
    const _filter = { environments_some: { active: true } }
    return _filter
}

module.exports = actionFilterNS