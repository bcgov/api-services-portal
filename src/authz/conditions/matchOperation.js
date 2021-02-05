const { builtinModules } = require("module")

const matchCondition = (context, value) => {
    if (process.env.RULE_DEBUG) { 
        console.log("MatchOperation ? " + value)
    }
    return (context['operation'] == value)
}

module.exports = matchCondition