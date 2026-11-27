// Some plugin config from Kong is sensitive and must be masked before it is
// sent to the Portal, such as the platform's Redis credentials for rate limiting.
//
// Kong 3.x carries the Redis settings in a nested `config.redis` object as well
// as in the legacy top-level `redis_*` fields, so the config is walked at any depth.

const MASK = '****';

// legacy flat fields, e.g. config.redis_password
const redisFields = ['redis_host', 'redis_username', 'redis_password'];

// fields of a nested redis object, e.g. config.redis.password
const nestedRedisFields = [
  'host',
  'username',
  'password',
  'sentinel_username',
  'sentinel_password',
];

function maskValue(value) {
  return value === null || value === undefined ? value : MASK;
}

function maskConfig(node) {
  if (Array.isArray(node)) {
    node.forEach(maskConfig);
  } else if (node !== null && typeof node === 'object') {
    Object.keys(node).forEach((key) => {
      const value = node[key];
      if (redisFields.includes(key)) {
        node[key] = maskValue(value);
      } else if (
        key === 'redis' &&
        value !== null &&
        typeof value === 'object' &&
        !Array.isArray(value)
      ) {
        nestedRedisFields
          .filter((field) => field in value)
          .forEach((field) => {
            value[field] = maskValue(value[field]);
          });
        maskConfig(value);
      } else {
        maskConfig(value);
      }
    });
  }
  return node;
}

const mask = function (plugin) {
  if ('config' in plugin) {
    maskConfig(plugin['config']);
  }
  return plugin;
};

module.exports = mask;
