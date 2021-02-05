const { builtinModules } = require("module")

const matchCondition = (context, value) => {
    const roles = context['user']['roles']
    if (process.env.RULE_DEBUG) { 
        console.log("IN ROLE? " + roles + " == " + value)
    }
    return roles == null || roles.length == 0 ? false : roles.includes(value)
}

module.exports = matchCondition