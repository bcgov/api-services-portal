const { test } = require('node:test');
const assert = require('node:assert/strict');

const mask = require('../kong/mask');

// shape of a Kong 3.x rate-limiting plugin from the admin API, which returns
// both the nested redis object and the deprecated flat redis_* fields
function rateLimiting() {
  return {
    name: 'rate-limiting',
    config: {
      minute: 100,
      policy: 'redis',
      redis_host: 'redis.platform.internal',
      redis_port: 6379,
      redis_password: 'platform-password',
      redis_username: 'platform-user',
      redis_ssl: false,
      redis: {
        host: 'redis.platform.internal',
        port: 6379,
        password: 'platform-password',
        username: 'platform-user',
        database: 0,
        ssl: false,
        timeout: 2000,
      },
    },
  };
}

test('masks nested Kong 3.x redis credentials', () => {
  const { config } = mask(rateLimiting());
  assert.equal(config.redis.password, '****');
  assert.equal(config.redis.username, '****');
  assert.equal(config.redis.host, '****');
  assert.equal(config.redis.port, 6379);
  assert.equal(config.redis.database, 0);
  assert.equal(config.redis.timeout, 2000);
});

test('masks legacy top-level redis fields', () => {
  const { config } = mask(rateLimiting());
  assert.equal(config.redis_password, '****');
  assert.equal(config.redis_username, '****');
  assert.equal(config.redis_host, '****');
  assert.equal(config.redis_port, 6379);
  assert.equal(config.minute, 100);
  assert.equal(config.policy, 'redis');
});

test('no secret survives anywhere in the masked config', () => {
  const masked = JSON.stringify(mask(rateLimiting()));
  assert.equal(masked.includes('platform-password'), false);
  assert.equal(masked.includes('platform-user'), false);
  assert.equal(masked.includes('redis.platform.internal'), false);
});

test('masks sentinel credentials in a nested redis object', () => {
  const { config } = mask({
    name: 'rate-limiting',
    config: {
      redis: { sentinel_username: 'sentinel-user', sentinel_password: 'x' },
    },
  });
  assert.equal(config.redis.sentinel_username, '****');
  assert.equal(config.redis.sentinel_password, '****');
});

test('masks redis objects nested deeper than config.redis', () => {
  const { config } = mask({
    name: 'acme',
    config: { storage_config: { redis: { host: 'r', password: 'secret' } } },
  });
  assert.equal(config.storage_config.redis.password, '****');
  assert.equal(config.storage_config.redis.host, '****');
});

test('leaves unset credentials as null instead of masking them', () => {
  const { config } = mask({
    name: 'rate-limiting',
    config: {
      policy: 'local',
      redis_password: null,
      redis: { host: null, password: null, port: 6379 },
    },
  });
  assert.equal(config.redis_password, null);
  assert.equal(config.redis.host, null);
  assert.equal(config.redis.password, null);
});

test('leaves plugins without config, or without secrets, unchanged', () => {
  assert.deepEqual(mask({ name: 'cors' }), { name: 'cors' });
  const acl = {
    name: 'acl',
    config: { allow: ['group-a'], hide_groups_header: false },
  };
  assert.deepEqual(mask(structuredClone(acl)), acl);
});
