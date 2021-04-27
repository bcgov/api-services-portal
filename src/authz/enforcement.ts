import fs from 'fs'
import csv from 'csv-parser'
import { Logger } from '../logger'
import e from 'express'

const logger = Logger('authz')

interface Rules {
    rulePath: string
    ts: number
    cache: RuleEntry[]
}

enum RuleResult {
    Allow = "allow",
    Deny = "deny"
}

enum RuleAnswer {
    T, F, NA
}

interface RuleEntry {
    matchQueryName?: string
    matchListKey?: string
    matchOperation?: string
    matchOneOfOperation?: string[]
    matchFieldKey?: string
    matchUserNS?: string
    inRole?: string
    matchOneOfRole?: string[]
    result?: RuleResult
    filters?: string[]
}

let rules : Rules = {
    rulePath: fs.realpathSync('authz/matrix.csv'),
    ts: 0,
    cache: null
}


const { filterByOwner, filterByRequestor } = require('./actions/filterByUser')
const { rewireTypes } = require('@graphql-tools/utils')

const actions : any = {
    "filterByActiveOrProductNS": require('./actions/filterByActiveOrProductNS'),
    "filterByEnvActiveOrProductNS": require('./actions/filterByEnvActiveOrProductNS'),
    "filterByEnvironmentPackageNS": require('./actions/filterByEnvironmentPackageNS'),
    "filterByOwner": filterByOwner,
    "filterByOwnerOrRelated": require('./actions/filterByOwnerOrRelated'),
    "filterByRequestor": filterByRequestor,
    "filterByPackageNS": require('./actions/filterByPackageNS'),
    "filterByProductNSOrActiveEnvironment": require('./actions/filterByProductNSOrActiveEnvironment'),
    "filterByUserNS": require('./actions/filterByUserNS'),
    "filterByUserNSOrNull": require('./actions/filterByUserNSOrNull'),
    "filterByActive": require('./actions/filterByActive'),
    "filterByActiveEnvironment": require('./actions/filterByActiveEnvironment'),
}

const conditions : any = {
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
export function EnforcementPoint ({ listKey, fieldKey, gqlName, operation, itemId, originalInput, authentication: { item } } : any) {

    logger.debug("*** ACCESS *** (" +  gqlName + ") L=" + listKey + " F=" + fieldKey + " [" + (itemId == null ? "":itemId) + "] " + operation + " by " + (item == null ? "ANON":item.username))
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
            logger.warn("No cache!")
            return false
        }

        for ( const rule  of rules.cache) {
            const result = ((ruleConditionState) => {
                const matches = []
                for ( const key of Object.keys(rule)) {
                    const value : any = (rule as any)[key]
                    if (!(['result','ID', 'filters'].includes(key)) && !(Object.keys(actions).includes(key)) && !(key in conditions)) {
                        logger.warn("WARNING! '%s' not a valid rule!", key)
                    }
                    if (fieldKey != null && rule['matchFieldKey'] == "") {
                        continue
                    }

                    if (key != "result" && key in conditions && value != "" && value != null) {
                        const result = conditions[key](ctx, value)
                        if (result == false) {
                            ruleConditionState = false
                            break
                        } else {
                            matches.push(key)
                        }
                    }
                }
                if (ruleConditionState && rule.result === RuleResult.Allow) {
                    if (rule.filters != null) {
                        for ( const filterId of rule.filters) {
                            if (!(filterId in actions)) {
                                logger.debug("--> DENY")
                                logger.warn("WARNING! Filter not found! '%s'", filterId)
                                return false
                            }
                            const result = actions[filterId](ctx, "Y")
                            if (result) {
                                logger.debug("--> FILTER %j", result)
                                return result
                            }
                        }
                    }
                    return true
                }
                if (ruleConditionState && rule.result === RuleResult.Deny) {
                    logger.debug("--> DENY")
                    logger.debug("%j", rule)
                    return false
                }
                return "NA"
            })(true)
            if (result === "NA") {
            } else {
                return result
            }
        }
        logger.debug("--> DENY : No RULES FOUND")
        logger.debug("%j", ctx)
        return false
    } catch (err) {
        logger.debug("--> DENY : ERROR")
        logger.debug("Unexpected Error - %s", err)
        return false
    }
}

function convertToArray(str : string) : string[] {
    return str == null || str === "" ? null : str.split(',').map((v : string) => v.trim()) 
}

function refreshRules() {
    const results : RuleEntry[] = []
    fs.createReadStream(rules.rulePath)
    .pipe(csv())
    .on('data', (data) => {
        ['matchOneOfOperation', 'matchOneOfRole', 'filters'].map((f: string) => {
            data[f] = convertToArray(data[f])
        })
        results.push(data)
    })
    .on('end', () => {
      rules.cache = results
      rules.ts = fs.statSync(rules.rulePath).mtimeMs
    })
}

export function loadRulesAndWatch (watch: boolean) {
    refreshRules()

    if (watch) {
        fs.watch(rules.rulePath, (eventType, filename) => {
            logger.info("Watch Detected: " + eventType)
            refreshRules()
        })
    }
}
