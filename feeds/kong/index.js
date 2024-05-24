const fs = require('fs');
const { transfers } = require('../utils/transfers');
const { portal } = require('../utils/portal');
const { v4: uuidv4 } = require('uuid');
const mask = require('./mask');
const { Logger } = require('../logger');

const log = Logger('kong');

async function scopedSync(
  { url, workingPath, destinationUrl },
  scope,
  scopeKey
) {
  if (scope == 'consumer') {
    await scopedSyncByConsumer({ url, workingPath, destinationUrl }, scopeKey);
  } else if (scope == 'namespace') {
    await scopedSyncByNamespace({ url, workingPath, destinationUrl }, scopeKey);
  } else {
    throw Error('Scoped Sync not supported for ' + scope);
  }
}

async function scopedSyncByNamespace(
  { url, workingPath, destinationUrl },
  namespace
) {
  const exceptions = [];

  const scopedDir = `${workingPath}/${uuidv4()}`;
  const xfer = transfers(scopedDir, url, exceptions);
  await xfer.copy(`/services?tags=ns.${namespace}`, 'gw-services');
  await xfer.copy(`/routes?tags=ns.${namespace}`, 'gw-routes');
  await xfer.copy(`/consumers?tags=ns.${namespace}`, 'gw-consumers');
  await xfer.copy(`/plugins?tags=ns.${namespace}`, 'gw-plugins');
  await xfer.copy(`/acls?tags=ns.${namespace}`, 'gw-acls');

  // Now, send to portal
  await xfer.concurrentWork(
    loadProducer(
      xfer,
      destinationUrl,
      'gw-services',
      'name',
      'service',
      '/feed/GatewayService'
    )
  );
  await xfer.concurrentWork(
    loadProducer(
      xfer,
      destinationUrl,
      'gw-routes',
      'name',
      'route',
      '/feed/GatewayRoute'
    )
  );
  await xfer.concurrentWork(
    loadProducer(
      xfer,
      destinationUrl,
      'gw-consumers',
      'username',
      'consumer',
      '/feed/GatewayConsumer'
    )
  );
  await xfer.concurrentWork(
    loadGroupsProducer(xfer, destinationUrl, '/feed/GatewayGroup')
  );

  xfer.resultCollector().output();

  // remove any GatewayService or GatewayRoutes that no longer exist in Kong
  const destination = portal(destinationUrl);

  const cleanupEntities = [
    { entity: 'GatewayService', file: 'gw-services' },
    { entity: 'GatewayRoute', file: 'gw-routes' },
  ];
  for (item of cleanupEntities) {
    const current = await destination.get(
      '/feed/' + item.entity + '/namespace/' + namespace
    );
    const items = xfer.get_json_content(item.file)['data'];
    for (cur of current.filter(
      (cur) =>
        items.filter((target) => target['id'] === cur.extForeignKey).length == 0
    )) {
      const nm = item.entity + ':' + cur.extForeignKey;
      await destination
        .fireAndForgetDeletion('/feed/' + item.entity + '/' + cur.extForeignKey)
        .then((result) => log.debug(`[${nm}] DELETED`))
        .catch((err) => log.error(`[${nm}] DELETION ERR ${err}`));
    }
  }

  fs.rmSync(scopedDir, { recursive: true });
}

async function scopedSyncByConsumer(
  { url, workingPath, destinationUrl },
  scopeKey
) {
  const exceptions = [];
  const scopedDir = `${workingPath}/${uuidv4()}`;
  const xfer = transfers(scopedDir, url, exceptions);

  // limit by a tag
  await xfer.copyOne(`/consumers/${scopeKey}`, `gw-consumers`);
  await xfer.copy(`/consumers/${scopeKey}/plugins`, 'gw-plugins');
  await xfer.copy(`/consumers/${scopeKey}/acls`, 'gw-acls');

  // Consumer + aclGroups + plugins
  await xfer.concurrentWork(
    loadProducer(
      xfer,
      destinationUrl,
      'gw-consumers',
      'username',
      'consumer',
      '/feed/GatewayConsumer'
    )
  );

  xfer.resultCollector().output();

  fs.rmSync(scopedDir, { recursive: true });
}

async function sync({ url, workingPath, destinationUrl }) {
  const exceptions = [];
  const xfer = transfers(workingPath, url, exceptions);

  await xfer.copy(`/services`, 'gw-services');
  await xfer.copy(`/routes`, 'gw-routes');
  await xfer.copy(`/consumers`, 'gw-consumers');
  await xfer.copy(`/plugins`, 'gw-plugins');
  await xfer.copy(`/acls`, 'gw-acls');

  // Now, send to portal
  await xfer.concurrentWork(
    loadProducer(
      xfer,
      destinationUrl,
      'gw-services',
      'name',
      'service',
      '/feed/GatewayService'
    )
  );
  await xfer.concurrentWork(
    loadProducer(
      xfer,
      destinationUrl,
      'gw-routes',
      'name',
      'route',
      '/feed/GatewayRoute'
    )
  );
  await xfer.concurrentWork(
    loadProducer(
      xfer,
      destinationUrl,
      'gw-consumers',
      'username',
      'consumer',
      '/feed/GatewayConsumer'
    )
  );

  await xfer.concurrentWork(
    loadGroupsProducer(xfer, destinationUrl, '/feed/GatewayGroup')
  );

  xfer.resultCollector().output();

  //await xfer.concurrentWork(loadProducer(xfer, destinationUrl, 'gw-products', 'name', 'product', '/feed/Product'))
  //await xfer.concurrentWork(loadServiceAccessProducer(xfer, destinationUrl, 'gw-consumers', '/feed/ServiceAccess'))
}

function loadProducer(xfer, destinationUrl, file, name, type, feedPath) {
  const destination = portal(destinationUrl);
  const items = xfer.get_json_content(file)['data'];
  const allPlugins = xfer.get_json_content('gw-plugins')['data'].map(mask);
  const allACLs =
    type == 'consumer' ? xfer.get_json_content('gw-acls')['data'] : null;
  let index = 0;

  log.debug('[producer] %s : %d records', file, items.length);

  return () => {
    if (index == items.length) {
      log.info('[producer] %s : Finished %d records', file, items.length);
      return null;
    }
    const item = items[index];
    xfer.inject_hash_and_source('kong', item);

    index++;
    const nm = item[name];

    item['plugins'] = findAllPlugins(
      allPlugins,
      type,
      item['id'],
      type == 'consumer'
    );

    item['plugins'].map((plugin) =>
      xfer.inject_hash_and_source('kong', plugin)
    );

    item['plugins']
      .filter((plugin) => plugin.tags == null)
      .map((plugin) => {
        plugin['tags'] = [];
      });

    // if (item['plugins'].length == 0) {
    //     return new Promise ((resolve, reject) => resolve())
    // }
    // log.debug(nm + ` with ${item['plugins'].length} plugins`);

    if (type == 'consumer') {
      item['aclGroups'] = allACLs
        .filter((acl) => acl.consumer.id == item['id'])
        .map((acl) => acl.group);
    } else {
      item['plugins'].map((p) => {
        p['service'] = null;
        p['route'] = null;
      });
    }
    return destination
      .fireAndForget(feedPath, item)
      .then((result) => {
        xfer.resultCollector().inc(result['result']);

        log.debug('%s -> %s OK', file, result);
      })
      .catch((err) => {
        xfer.resultCollector().inc('exception');
        log.error('%s', err);
        log.error('%j', item);
      });
  };
}

function toNamespace(tags) {
  if (tags != null) {
    return tags
      .filter((tag) => tag.startsWith('ns.') && tag.indexOf('.', 3) == -1)
      .map((tag) => tag.substring(3))[0];
  } else {
    return null;
  }
}

function loadGroupsProducer(xfer, destinationUrl, feedPath) {
  const destination = portal(destinationUrl);
  const allPlugins = xfer
    .get_json_content('gw-plugins')
    ['data'].map(mask)
    .filter((p) => p.enabled);
  const items = [];
  allPlugins
    .filter((p) => p.name == 'acl')
    .map((p) => {
      p.config.allow?.forEach((a) => {
        items.push({ namespace: toNamespace(p.tags), name: a });
      });
    });

  log.debug('[loadGroupsProducer] (%s) %d records', feedPath, items.length);

  let index = 0;

  return () => {
    if (index == items.length) {
      log.info(
        '[loadGroupsProducer] %s : Finished %d records',
        feedPath,
        items.length
      );
      return null;
    }
    const item = items[index];
    xfer.inject_hash_and_source('kong', item);
    if (item['namespace'] == null) {
      item['namespace'] = 'unknown';
    }
    index++;
    const nm = `${item['namespace']}.${item['name']}`;

    item['id'] = nm;

    return destination
      .fireAndForget(feedPath, item)
      .then((result) => {
        xfer.resultCollector().inc(result['result']);
        log.debug('%s -> %s OK', feedPath, result);
      })
      .catch((err) => {
        xfer.resultCollector().inc('exception');
        log.error(`[${nm}] ERR ${err}`);
      });
  };
}

function findAllPlugins(
  allPlugins,
  type,
  consumerOrServiceOrRouteId,
  includeConsumers = false
) {
  const childs = [];
  allPlugins.map((plugin) => {
    if (
      plugin[type] != null &&
      consumerOrServiceOrRouteId === plugin[type]['id']
    ) {
      if (plugin['consumer'] == null || includeConsumers) {
        childs.push(plugin);
      }
    }
  });
  return childs;
}

module.exports = {
  sync: sync,
  scopedSync: scopedSync,
};
