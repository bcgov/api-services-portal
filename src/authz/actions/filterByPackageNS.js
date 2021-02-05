const filterByPackageNS = (context, value) => {
    const namespace = context['user']['namespace']
    if (process.env.RULE_DEBUG) { 
        console.log("Action: Filter By Package NS" + namespace)
    }
    
    return { package: { namespace: namespace } }
}

module.exports = filterByPackageNS