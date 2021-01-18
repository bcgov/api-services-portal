

// Use a decision matrix to determine who is allowed to do what
function EnforcementPoint ({ listKey, operation, itemId, authentication: { item } }) {
    console.log("*** ACCESS *** " + listKey + " [" + (itemId == null ? "":itemId) + "] " + operation + " by " + (item == null ? "ANON":item.name))
    return true
}

module.exports = {
    EnforcementPoint: EnforcementPoint
}
