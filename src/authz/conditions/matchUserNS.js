const matchCondition = (context, value) => {
    if (process.env.RULE_DEBUG) { 
        console.log("Match User NS ? " + context['user']['namespace'])
    }
    return (context['item']['namespace'] == context['user']['namespace'])
}

module.exports = matchCondition