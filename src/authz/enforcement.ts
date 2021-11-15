import fs from 'fs';
import csv from 'csv-parser';
import { Logger } from '../logger';
import e from 'express';

const logger = Logger('authz');

interface Rules {
  rulePath: string;
  ts: number;
  cache: RuleEntry[];
}

enum RuleResult {
  Allow = 'allow',
  Deny = 'deny',
}

enum RuleAnswer {
  T,
  F,
  NA,
}

interface RuleEntry {
  matchQueryName?: string;
  matchListKey?: string;
  matchOperation?: string;
  matchNotOneOfFieldKey?: string;
  matchOneOfFieldKey?: string;
  matchOneOfOperation?: string[];
  matchUserNS?: string;
  inRole?: string;
  matchOneOfRole?: string[];
  result?: RuleResult;
  filters?: string[];
}

let rules: Rules = {
  rulePath: fs.realpathSync('authz/matrix.csv'),
  ts: 0,
  cache: null,
};

const { filterByOwner, filterByRequestor } = require('./actions/filterByUser');
const { rewireTypes } = require('@graphql-tools/utils');

const actions: any = {
  noop: require('./actions/noop'),
  filterByAppOwner: require('./actions/filterByAppOwner'),
  filterByActiveOrProductNS: require('./actions/filterByActiveOrProductNS'),
  filterByEnvActiveOrProductNS: require('./actions/filterByEnvActiveOrProductNS'),
  filterByEnvironmentProductNSOrNS: require('./actions/filterByEnvironmentProductNSOrNS'),
  filterByEnvironmentPackageNS: require('./actions/filterByEnvironmentPackageNS'),
  filterByNamespaceOrAppOwner: require('./actions/filterByNamespaceOrAppOwner'),
  filterByNamespaceOrPublic: require('./actions/filterByNamespaceOrPublic'),
  filterByOwner: filterByOwner,
  filterByOwnerOrRelated: require('./actions/filterByOwnerOrRelated'),
  filterBySelf: require('./actions/filterBySelf'),
  filterByRequestor: filterByRequestor,
  filterByPackageNS: require('./actions/filterByPackageNS'),
  filterByProductNSOrActiveEnvironment: require('./actions/filterByProductNSOrActiveEnvironment'),
  filterByTemporaryIdentity: require('./actions/filterByTemporaryIdentity'),
  filterByUserNS: require('./actions/filterByUserNS'),
  filterByUserNSOrNull: require('./actions/filterByUserNSOrNull'),
  filterByActive: require('./actions/filterByActive'),
  filterByActiveEnvironment: require('./actions/filterByActiveEnvironment'),
};

const conditions: any = {
  matchOneOfBaseQueryName: require('./conditions/matchOneOfBaseQueryName'),
  matchNotOneOfFieldKey: require('./conditions/matchNotOneOfFieldKey'),
  matchOneOfFieldKey: require('./conditions/matchOneOfFieldKey'),
  matchOneOfRole: require('./conditions/matchOneOfRole'),
  matchOneOfScope: require('./conditions/matchOneOfScope'),
  matchOneOfListKey: require('./conditions/matchOneOfListKey'),
  inRole: require('./conditions/inRole'),
  matchFieldKey: require('./conditions/matchFieldKey'),
  matchListKey: require('./conditions/matchListKey'),
  matchOneOfOperation: require('./conditions/matchOneOfOperation'),
  matchOperation: require('./conditions/matchOperation'),
  matchUserNS: require('./conditions/matchUserNS'),
  matchQueryName: require('./conditions/matchQueryName'),
};

export const FieldEnforcementPoint = EnforcementPoint;

// Use a decision matrix to determine who is allowed to do what
export function EnforcementPoint(params: any) {
  const {
    listKey,
    fieldKey,
    gqlName,
    operation,
    itemId,
    itemIds,
    originalInput,
    authentication: { item },
    context,
  } = params;

  logger.debug(
    '*** ACCESS *** (' +
      gqlName +
      '):(' +
      context.baseQueryName +
      ') L=' +
      listKey +
      ' F=' +
      fieldKey +
      ' [' +
      (itemId == null ? '' : itemId) +
      ', ' +
      itemIds +
      '] ' +
      operation +
      ' by ' +
      (item == null ? 'ANON' : item.username)
  );
  try {
    if (fs.statSync(rules.rulePath).mtimeMs != rules.ts) {
      refreshRules();
    }
    const roles = item == null ? ['guest'] : JSON.parse(item.roles);
    const ctx = {
      operation: operation,
      listKey: listKey,
      fieldKey: fieldKey,
      gqlName: gqlName,
      baseQueryName: context.baseQueryName,
      item: {},
      user: {
        tid: item == null ? null : item.id,
        id: item == null ? null : item.userId,
        roles: roles,
        scopes: item == null ? null : item.scopes,
        namespace: item == null ? null : item.namespace,
        item: originalInput,
      },
    };

    if (rules.cache == null) {
      logger.warn('No cache!');
      return false;
    }

    for (const rule of rules.cache) {
      if (
        fieldKey != null &&
        rule['matchOneOfFieldKey'] == null &&
        rule['matchNotOneOfFieldKey'] == null
      ) {
        continue;
      }
      if (
        fieldKey == null &&
        (rule['matchOneOfFieldKey'] != null ||
          rule['matchNotOneOfFieldKey'] != null)
      ) {
        continue;
      }
      const result: any = ((ruleConditionState) => {
        const matches = [];
        for (const key of Object.keys(rule)) {
          const value: any = (rule as any)[key];
          if (
            !['result', 'ID', 'filters'].includes(key) &&
            !Object.keys(actions).includes(key) &&
            !(key in conditions)
          ) {
            logger.warn("WARNING! '%s' not a valid rule!", key);
          }

          if (
            key != 'result' &&
            key in conditions &&
            value != '' &&
            value != null
          ) {
            const result = conditions[key](ctx, value);
            if (result == false) {
              ruleConditionState = false;
              break;
            } else {
              matches.push(key);
            }
          }
        }
        if (matches.length == 0) {
          return 'NA';
        }
        if (ruleConditionState && rule.result === RuleResult.Allow) {
          if (rule.filters != null) {
            const filters = [];
            for (const filterId of rule.filters) {
              if (!(filterId in actions)) {
                logger.debug('--> DENY');
                logger.warn("WARNING! Filter not found! '%s'", filterId);
                return false;
              }
              const result = actions[filterId](ctx, 'Y');
              if (result) {
                logger.debug('--> FILTER %j', result);
                filters.push(result);
              }
            }
            if (filters.length == 1) {
              return filters[0];
            } else {
              return `{ AND: [ ${filters.join(',')} ] }` as any;
            }
          }
          return true;
        }
        if (ruleConditionState && rule.result === RuleResult.Deny) {
          logger.debug('--> DENY');
          logger.debug('%j', rule);
          return false;
        }
        return 'NA';
      })(true);
      if (result === 'NA') {
      } else {
        return result;
      }
    }
    logger.debug('--> DENY : No RULES FOUND');
    logger.debug('%j', ctx);
    return false;
  } catch (err) {
    logger.debug('--> DENY : ERROR');
    logger.debug('Unexpected Error - %s', err);
    return false;
  }
}

function convertToArray(str: string): string[] {
  return str == null || str === ''
    ? null
    : str.split(',').map((v: string) => v.trim());
}

function refreshRules() {
  const results: RuleEntry[] = [];
  fs.createReadStream(rules.rulePath)
    .pipe(csv())
    .on('data', (data) => {
      [
        'matchOneOfBaseQueryName',
        'matchOneOfOperation',
        'matchOneOfRole',
        'matchOneOfFieldKey',
        'matchNotOneOfFieldKey',
        'filters',
      ].map((f: string) => {
        data[f] = convertToArray(data[f]);
      });
      results.push(data);
    })
    .on('end', () => {
      rules.cache = results;
      rules.ts = fs.statSync(rules.rulePath).mtimeMs;
    });
}

export function loadRulesAndWatch(watch: boolean) {
  refreshRules();

  if (watch) {
    fs.watch(rules.rulePath, (eventType, filename) => {
      logger.info('Watch Detected: ' + eventType);
      refreshRules();
    });
  }
}
