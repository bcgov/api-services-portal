const { builtinModules } = require("module")

const matchCondition = (context, value) => {
    if (process.env.RULE_DEBUG) { 
        console.log("MatchListKey ? " + value)
    }
    return (context['listKey'] == value)
}

module.exports = matchCondition