const filterByProductNSOrActiveEnvironment = (context, value) => {
    const namespace = context['user']['namespace']
    if (process.env.RULE_DEBUG) { 
        console.log("Action: filterByProductNSOrActiveEnvironment = " + namespace)
    }
    
    return { OR: [ { environments_some: { active: true } } , { namespace: namespace } ]}
}

module.exports = filterByProductNSOrActiveEnvironment