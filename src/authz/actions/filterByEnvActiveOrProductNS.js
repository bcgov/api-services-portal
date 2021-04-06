const filterByProductNSOrActiveEnvironment = (context, value) => {
    const namespace = context['user']['namespace']
    if (process.env.RULE_DEBUG) { 
        console.log("Action: filterByProductNSOrActiveEnvironment = " + namespace)
    }
    
    return { OR: [ { productEnvironment: { product: { namespace: namespace } } } , { productEnvironment: { active: true } } ] }
}

module.exports = filterByProductNSOrActiveEnvironment