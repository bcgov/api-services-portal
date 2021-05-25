const matchCondition = (context, values) => {
    const scopes = context['user']['scopes']
    if (process.env.RULE_DEBUG) { 
        console.log("IN SCOPE? " + scopes + " == " + values)
    }
    return scopes == null || scopes.length == 0 ? false : scopes.filter(r => values.includes(r)).length != 0
}

module.exports = matchCondition