const actionFilterNS = (context, value) => {
    const namespace = context['user']['namespace']
    if (process.env.RULE_DEBUG) { 
        console.log("Action: Filter By User NS" + namespace)
    }
    return { namespace: namespace }
}

module.exports = actionFilterNS