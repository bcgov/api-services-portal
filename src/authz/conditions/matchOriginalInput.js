const matchCondition = (field) => (context, value) => {
    if (process.env.RULE_DEBUG) { 
        console.log("Match Original Input ? " + field + " = " + value)
    }
    return (context[item][field] == value)
}

module.exports = {
    matchIsApprove: matchCondition('isApproved')
}
