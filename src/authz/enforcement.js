const fs = require('fs')

let rules = {
    rulePath: fs.realpathSync('authz/matrix.csv', []),
    ts: fs.statSync('authz/matrix.csv').mtime,
    cache: null
}

// Use a decision matrix to determine who is allowed to do what
function EnforcementPoint ({ listKey, operation, itemId, authentication: { item } }) {
    console.log("*** ACCESS *** " + listKey + " [" + (itemId == null ? "":itemId) + "] " + operation + " by " + (item == null ? "ANON":item.name))
    if (fs.statSync('authz/matrix.csv').mtime != rules.ts) {
        console.log("RELOAD RULES...")
    }
    return true
}

module.exports = {
    EnforcementPoint: EnforcementPoint
}
