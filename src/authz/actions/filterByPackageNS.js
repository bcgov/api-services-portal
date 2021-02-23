const filterByPackageNS = (context, value) => {
    const namespace = context['user']['namespace']
    if (process.env.RULE_DEBUG) { 
        console.log("Action: Filter By Product NS" + namespace)
    }
    
    return { product: { namespace: namespace } }
}

module.exports = filterByPackageNS