const { builtinModules } = require("module")

const matchCondition = (context, value) => {
    const roles = context['user']['roles']
    if (process.env.RULE_DEBUG) { 
        console.log("IN ROLE? " + roles + " == " + value)
    }
    const values = value.split(',').map(v => v.trim())
    return roles == null || roles.length == 0 ? false : roles.filter(r => values.includes(r)).length != 0
}

module.exports = matchCondition