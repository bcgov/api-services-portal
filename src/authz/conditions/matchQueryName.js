const { builtinModules } = require("module")

const matchCondition = (context, value) => {
    return (context['gqlName'] == value)
}

module.exports = matchCondition