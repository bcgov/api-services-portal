const matchCondition = (context, values) => {
    return values.includes(context['baseQueryName'])
}

module.exports = matchCondition