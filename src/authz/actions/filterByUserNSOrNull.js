const actionFilterNS = (context, value) => {
    const namespace = context['user']['namespace']
    if (process.env.RULE_DEBUG) { 
        console.log("Action: Filter By User NS" + namespace)
    }
    return { OR: [ { namespace: namespace } , {namespace: null} ] }
}

module.exports = actionFilterNS