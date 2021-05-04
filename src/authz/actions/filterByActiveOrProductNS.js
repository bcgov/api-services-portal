const filterByActiveOrProductNS = (context, value) => {
    const namespace = context['user']['namespace']
    if (process.env.RULE_DEBUG) { 
        console.log("Action: filterByActiveOrProductNS = " + namespace)
    }
    
    return { OR: [ { active: true } , { product: { namespace: namespace } } ]}
}

module.exports = filterByActiveOrProductNS