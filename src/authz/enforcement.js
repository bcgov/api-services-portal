const fs = require('fs')
const csv = require('csv-parser')

let rules = {
    rulePath: fs.realpathSync('authz/matrix.csv', []),
    ts: 0,
    cache: null
}

refreshRules()

if (process.env.NODE_ENV == 'development') {
    fs.watch(rules.rulePath, (eventType, filename) => {
        console.log("Watch Detected: " + eventType)
        refreshRules()
    })
}

const { filterByOwner, filterByRequestor } = require('./actions/filterByUser')
const { rewireTypes } = require('@graphql-tools/utils')

const actions = {
    "filterByActiveOrProductNS": require('./actions/filterByActiveOrProductNS'),
    "filterByEnvActiveOrProductNS": require('./actions/filterByEnvActiveOrProductNS'),
    "filterByEnvironmentPackageNS": require('./actions/filterByEnvironmentPackageNS'),
    "filterByOwner": filterByOwner,
    "filterByRequestor": filterByRequestor,
    "filterByPackageNS": require('./actions/filterByPackageNS'),
    "filterByProductNSOrActiveEnvironment": require('./actions/filterByProductNSOrActiveEnvironment'),
    "filterByUserNS": require('./actions/filterByUserNS'),
    "filterByActive": require('./actions/filterByActive'),
    "filterByActiveEnvironment": require('./actions/filterByActiveEnvironment'),
}

const conditions = {
    "matchOneOfRole": require('./conditions/matchOneOfRole'),
    "inRole": require('./conditions/inRole'),
    "matchFieldKey": require('./conditions/matchFieldKey'),
    "matchListKey": require('./conditions/matchListKey'),
    "matchOneOfOperation": require('./conditions/matchOneOfOperation'),
    "matchOperation": require('./conditions/matchOperation'),
    "matchUserNS": require('./conditions/matchUserNS'),
    "matchQueryName": require('./conditions/matchQueryName'),
}

// Use a decision matrix to determine who is allowed to do what
function EnforcementPoint ({ listKey, fieldKey, gqlName, operation, itemId, originalInput, authentication: { item } }) {

    console.log("*** ACCESS *** (" +  gqlName + ") " + listKey + " " + fieldKey + " [" + (itemId == null ? "":itemId) + "] " + operation + " by " + (item == null ? "ANON":item.name))
    try {
        if (fs.statSync(rules.rulePath).mtimeMs != rules.ts) {
            refreshRules()
        }
        const roles = item == null ? ['guest']:item.roles
        const ctx = {
            operation: operation,
            listKey: listKey,
            fieldKey: fieldKey,
            gqlName: gqlName,
            item: {},
            user: {
                id: item == null ? null : item.userId,
                roles: roles,
                namespace: item == null ? null : item.namespace,
                item: originalInput
            }
        }

        if (rules.cache == null) {
            return false
        }

        for ( rule of rules.cache) {
            let ruleConditionState = true
            const matches = []
            for ( key of Object.keys(rule)) {
                if (!(['result','ID'].includes(key)) && !(Object.keys(actions).includes(key)) && !(key in conditions)) {
                    //console.log("WARNING! " + key + " not a valid rule!")
                }
                if (fieldKey != null && rule['matchFieldKey'] == "") {
                    continue
                }

                if (key != "result" && key in conditions && rule[key] != "" && rule[key] != null) {
                    const result = conditions[key](ctx, rule[key])
                    if (result == false) {
                        ruleConditionState = false
                        break
                    } else {
                        matches.push(key)
                    }
                }
            }
            if (ruleConditionState && rule['result'] === 'allow') {
                //console.log(" Matches " + matches)
                //console.log(JSON.stringify(rule, null, 4))
                for ( akey of Object.keys(rule).filter(k => Object.keys(actions).includes(k))) {
                    //console.log("Post actions for " + akey + " : " + rule[akey])
                    if (rule[akey] != "" && rule[akey] != null) {
                        const result = actions[akey](ctx, rule[akey])
                        if (result) {
                            console.log("--> FILTER " + JSON.stringify(result))
                            return result
                        }
                    }
                }
                //console.log("--> ALLOW")
                return true
            }
            if (ruleConditionState && rule['result'] === 'deny') {
                console.log("--> DENY")
                console.log(JSON.stringify(rule, null, 2))
                return false
            }
        }
        console.log("--> DENY : No RULES FOUND")
        console.log(JSON.stringify(ctx, null, 2))
        return false
    } catch (err) {
        console.log("--> DENY : ERROR")
        console.log("Unexpected Error - " + err)
        return false
    }
}

function refreshRules() {
    const results = []
    fs.createReadStream(rules.rulePath)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      rules.cache = results
      rules.ts = fs.statSync(rules.rulePath).mtimeMs
    })
}

module.exports = {
    EnforcementPoint: EnforcementPoint,
    FieldEnforcementPoint: EnforcementPoint
}
