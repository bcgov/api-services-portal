
const matchCondition = (context, values) => {
    return !values.includes(context['fieldKey'])
}

module.exports = matchCondition