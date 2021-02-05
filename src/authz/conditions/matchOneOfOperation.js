const { builtinModules } = require("module")

const matchCondition = (context, value) => {
    if (process.env.RULE_DEBUG) { 
        console.log("MatchOneOfOperation ? " + value)
    }
    const values = value.split(',').map(v => v.trim())
    return values.includes(context['operation'])
}

module.exports = matchCondition