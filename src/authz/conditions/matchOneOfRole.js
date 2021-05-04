const { builtinModules } = require("module")

const matchCondition = (context, values) => {
    const roles = context['user']['roles']
    if (process.env.RULE_DEBUG) { 
        console.log("IN ROLE? " + roles + " == " + values)
    }
    return roles == null || roles.length == 0 ? false : roles.filter(r => values.includes(r)).length != 0
}

module.exports = matchCondition