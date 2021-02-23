const filterByEnvironmentPackageNS = (context, value) => {
    const namespace = context['user']['namespace']
    if (process.env.RULE_DEBUG) { 
        console.log("Action: Filter By Package NS" + namespace)
    }
    
    return { productEnvironment: { product: { namespace: namespace } } }
}

module.exports = filterByEnvironmentPackageNS