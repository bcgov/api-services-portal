const { builtinModules } = require("module")

const matchCondition = (context, value) => {
    if (process.env.RULE_DEBUG) { 
        console.log("MatchFieldKey ? " + value)
    }
    return (context['fieldKey'] == value)
}

module.exports = matchCondition