import fs from 'fs';
import { Logger } from '../logger';
import crypto from 'crypto';

const logger = Logger('whitelist');

const whitelistPath = fs.realpathSync('authz/graphql-whitelist');

const whitelist = {
  list: {} as any,
};

function refreshWhitelist() {
  const _list: any = {};
  fs.readdirSync(whitelistPath).forEach(function (file: string) {
    let queryBuffer: Buffer = fs.readFileSync(whitelistPath + '/' + file);
    let query = queryBuffer.toString();
    var hash = crypto.createHash('md5').update(query).digest('hex');
    _list[hash] = {
      query,
    };
  });
  whitelist.list = _list;
}

export function addToWhitelist(
  referer: string,
  operation: string,
  query: string
) {
  var hash = crypto.createHash('md5').update(query).digest('hex');
  logger.info('ADD : [%s] (%s) %j', hash, operation, query);
  let re = new RegExp('[a-f0-9-]{24}');
  const filename =
    typeof referer === 'undefined'
      ? 'unknown'
      : referer.replace(re, '').replace(/\W/g, '');
  fs.writeFileSync(
    `${whitelistPath}/${filename}-${hash.substr(0, 6)}.gql`,
    query
  );
}

export function loadWhitelistAndWatch(watch: boolean) {
  refreshWhitelist();

  if (watch) {
    fs.watch(whitelistPath, (eventType, filename) => {
      logger.info('Watch Detected: ' + eventType);
      refreshWhitelist();
    });
  }
}

export function checkWhitelist(query: string) {
  var hash = crypto.createHash('md5').update(query).digest('hex');
  if (hash in whitelist.list) {
    logger.info('HIT : [%s] %j', hash, query);
    return true;
  } else {
    logger.info('MISS: [%s] %j', hash, query);
    return false;
  }
}
