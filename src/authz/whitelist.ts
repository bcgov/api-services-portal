import fs from 'fs'
import { Logger } from '../logger'
import crypto  from 'crypto'

const logger = Logger('whitelist')

const whitelistPath = fs.realpathSync('authz/whitelist.json')

const whitelist = {
    list: {} as any
}

function refreshWhitelist() {
    let rawdata : Buffer = fs.readFileSync(whitelistPath);
    whitelist.list = JSON.parse(rawdata.toString());    
}

export function addToWhitelist (operation: string, query: string) {
    var hash = crypto.createHash('md5').update(query).digest('hex');
    whitelist.list[hash] = { operation: operation, query: query }
    logger.info("ADD : [%s] %j", hash, query)
    fs.writeFileSync(whitelistPath, JSON.stringify(whitelist.list, null, 5))
}

export function loadWhitelistAndWatch (watch: boolean) {
    refreshWhitelist()

    if (watch) {
        fs.watch(whitelistPath, (eventType, filename) => {
            logger.info("Watch Detected: " + eventType)
            refreshWhitelist()
        })
    }
}

export function checkWhitelist (query : string) {
    var hash = crypto.createHash('md5').update(query).digest('hex');
    if (hash in whitelist.list) {
        logger.info("HIT : [%s] %j", hash, query)
        return true
    } else {
        logger.info("MISS: [%s] %j", hash, query)
        return false
    }
}