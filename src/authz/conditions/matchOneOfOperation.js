const { builtinModules } = require("module")

const matchCondition = (context, values) => {
    if (process.env.RULE_DEBUG) { 
        console.log("MatchOneOfOperation ? " + values)
    }
    return values.includes(context['operation'])
}

module.exports = matchCondition