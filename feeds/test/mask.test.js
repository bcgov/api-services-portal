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

test('masks secret fields of bundled and BC Gov plugins', () => {
  const plugins = [
    {
      name: 'aws-lambda',
      config: {
        aws_key: 'AKIA1',
        aws_secret: 's1',
        aws_region: 'ca-central-1',
      },
    },
    {
      name: 'azure-functions',
      config: { apikey: 'k1', clientid: 'c1', appname: 'app' },
    },
    { name: 'loggly', config: { key: 'k2', host: 'logs-01.loggly.com' } },
    {
      name: 'oauth2',
      config: {
        provision_key: 'p1',
        enable_password_grant: true,
        token_expiration: 7200,
      },
    },
    { name: 'session', config: { secret: 's2', cookie_name: 'session' } },
    { name: 'standard-webhooks', config: { secret_v1: 's3' } },
    {
      name: 'acme',
      config: {
        account_email: 'a@b.c',
        eab_kid: 'kid',
        eab_hmac_key: 'h1',
        storage_config: {
          vault: { token: 't1', host: 'vault' },
          consul: { token: 't2' },
        },
      },
    },
    {
      name: 'ai-proxy',
      config: {
        auth: {
          header_name: 'Authorization',
          header_value: 'v1',
          param_name: 'key',
          param_value: 'v2',
          aws_access_key_id: 'AKIA2',
          aws_secret_access_key: 's4',
          gcp_service_account_json: '{}',
        },
      },
    },
    {
      name: 'oidc',
      config: {
        client_id: 'my-client',
        client_secret: 's5',
        session_secret: 's6',
        ssl_client_priv_key: '/keys/k.pem',
        token_endpoint_auth_method: 'client_secret_post',
      },
    },
    {
      name: 'pep',
      config: {
        auth_header_name: 'X-PEP-Auth',
        auth_header_value: 'v3',
        target_url: 'https://pep',
      },
    },
  ].map(mask);

  const masked = JSON.stringify(plugins);
  [
    'AKIA1',
    's1',
    'k1',
    'c1',
    'k2',
    'p1',
    's2',
    's3',
    'a@b.c',
    'kid',
    'h1',
    't1',
    't2',
    'v1',
    'v2',
    'AKIA2',
    's4',
    's5',
    's6',
    '/keys/k.pem',
    'v3',
  ].forEach((secret) =>
    assert.equal(
      masked.includes(`"${secret}"`),
      false,
      `${secret} is not masked`
    )
  );
  // non-secret settings stay readable
  assert.equal(plugins[0].config.aws_region, 'ca-central-1');
  assert.equal(plugins[1].config.appname, 'app');
  assert.equal(plugins[2].config.host, 'logs-01.loggly.com');
  assert.equal(plugins[4].config.cookie_name, 'session');
  assert.equal(plugins[6].config.storage_config.vault.host, 'vault');
  assert.equal(plugins[7].config.auth.header_name, 'Authorization');
  assert.equal(plugins[7].config.auth.param_name, 'key');
  assert.equal(plugins[8].config.client_id, 'my-client');
  assert.equal(
    plugins[8].config.token_endpoint_auth_method,
    'client_secret_post'
  );
  assert.equal(plugins[9].config.auth_header_name, 'X-PEP-Auth');
  assert.equal(plugins[9].config.target_url, 'https://pep');
  assert.equal(plugins[3].config.enable_password_grant, true);
  assert.equal(plugins[3].config.token_expiration, 7200);
});

test('masks credential values in transformer header, query and body lists', () => {
  const { config } = mask({
    name: 'request-transformer',
    config: {
      add: {
        headers: [
          'Authorization:Bearer abc.def',
          'X-API-Key:k3',
          'X-Request-Source:portal',
        ],
        querystring: ['api_key:k4', 'format:json'],
        body: ['client_secret:s7', 'grant_type:client_credentials'],
      },
      replace: { headers: ['x-auth-token: t3'], querystring: [], body: [] },
      append: { headers: ['Cookie:session=abc'] },
      remove: { headers: ['Authorization'] },
      rename: { headers: ['X-Old:X-New'] },
    },
  });
  assert.deepEqual(config.add.headers, [
    'Authorization:****',
    'X-API-Key:****',
    'X-Request-Source:portal',
  ]);
  assert.deepEqual(config.add.querystring, ['api_key:****', 'format:json']);
  assert.deepEqual(config.add.body, [
    'client_secret:****',
    'grant_type:client_credentials',
  ]);
  assert.deepEqual(config.replace.headers, ['x-auth-token:****']);
  assert.deepEqual(config.append.headers, ['Cookie:****']);
  assert.deepEqual(config.remove.headers, ['Authorization']);
  assert.deepEqual(config.rename.headers, ['X-Old:X-New']);
});

test('masks credential values in response-signer header lists', () => {
  const { config } = mask({
    name: 'response-signer',
    config: {
      add: { headers: ['X-Signing-Key:k5'], json: ['token:t4', 'status:ok'] },
      private_key_location: '/keys/sign.pem',
    },
  });
  assert.deepEqual(config.add.headers, ['X-Signing-Key:****']);
  assert.deepEqual(config.add.json, ['token:****', 'status:ok']);
  // a key file path is not a secret
  assert.equal(config.private_key_location, '/keys/sign.pem');
});

test('masks credential values in header maps', () => {
  const { config } = mask({
    name: 'http-log',
    config: {
      http_endpoint: 'https://logs.example.com/ingest',
      headers: {
        Authorization: 'Splunk abc',
        'X-Api-Key': 'k6',
        'X-Source': 'kong',
      },
    },
  });
  assert.deepEqual(config.headers, {
    Authorization: '****',
    'X-Api-Key': '****',
    'X-Source': 'kong',
  });
  assert.equal(config.http_endpoint, 'https://logs.example.com/ingest');
});

test('masks credentials inside URLs', () => {
  const { config } = mask({
    name: 'http-log',
    config: {
      http_endpoint:
        'https://svc-user:svc-pass@logs.example.com/ingest?token=t5&source=kong',
      queue: { name: 'q' },
    },
  });
  assert.equal(
    config.http_endpoint,
    'https://****@logs.example.com/ingest?token=****&source=kong'
  );
});

test('masks PEM private keys and bearer tokens in any string', () => {
  const pem =
    '-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEA\nabc\n-----END RSA PRIVATE KEY-----';
  const { config } = mask({
    name: 'pre-function',
    config: {
      access: [
        `local key = [[${pem}]]`,
        'kong.service.request.set_header("Authorization", "Bearer eyJhbGciOi.payload.sig")',
      ],
      some_cert: '-----BEGIN CERTIFICATE-----\nMIIB\n-----END CERTIFICATE-----',
    },
  });
  assert.equal(config.access[0], 'local key = ****');
  assert.equal(
    config.access[1],
    'kong.service.request.set_header("Authorization", "****")'
  );
  // certificates are public
  assert.equal(config.some_cert.includes('BEGIN CERTIFICATE'), true);
});

test('does not mask non-secret config of common plugins', () => {
  const plugins = [
    {
      name: 'key-auth',
      config: {
        key_names: ['X-API-KEY'],
        hide_credentials: true,
        key_in_header: true,
        anonymous: null,
      },
    },
    {
      name: 'jwt-keycloak',
      config: {
        allowed_iss: ['https://sso/realms/r'],
        cookie_names: [],
        header_names: ['Authorization'],
        secret_is_base64: false,
      },
    },
    {
      name: 'cors',
      config: {
        origins: ['*'],
        credentials: true,
        headers: ['Authorization', 'Content-Type'],
      },
    },
    {
      name: 'kong-upstream-jwt',
      config: {
        private_key_location: '/etc/keys/key.pem',
        key_id: 'kid-1',
        header: 'GW-JWT',
      },
    },
    {
      name: 'trust-kms',
      config: { key_id: 'k', signature_header_key: 'X-Signature' },
    },
  ];
  assert.deepEqual(
    plugins.map((p) => mask(structuredClone(p))),
    plugins
  );
});

test('masks secrets in pre-function and post-function code, keeping the code', () => {
  ['pre-function', 'post-function'].forEach((name) => {
    const { config } = mask({
      name,
      config: {
        access: [
          'local api_key = "k7"\nkong.service.request.set_header("X-Api-Key", api_key)',
          'kong.service.request.set_header("Authorization", "Bearer abc123def")',
          'kong.response.set_header("X-Partner-Key", "k9")',
          'ngx.header["X-Auth-Token"] = "t6"',
          'kong.response.set_header("Content-Type", "application/json")',
          'local partner = "p7"',
        ],
        log: [],
      },
    });
    assert.deepEqual(config, {
      access: [
        'local api_key = "****"\nkong.service.request.set_header("X-Api-Key", api_key)',
        'kong.service.request.set_header("Authorization", "****")',
        'kong.response.set_header("X-Partner-Key", "****")',
        'ngx.header["X-Auth-Token"] = "****"',
        'kong.response.set_header("Content-Type", "application/json")',
        // a secret under a name that does not look secret is not found
        'local partner = "p7"',
      ],
      log: [],
    });
  });
});

test('masks the redis host but not other host fields', () => {
  const plugins = [
    { name: 'loggly', config: { host: 'logs-01.loggly.com', key: 'k8' } },
    { name: 'syslog', config: { host: 'syslog.internal', port: 514 } },
    { name: 'rate-limiting', config: { redis: { host: 'redis.internal' } } },
  ].map(mask);
  assert.equal(plugins[0].config.host, 'logs-01.loggly.com');
  assert.equal(plugins[1].config.host, 'syslog.internal');
  assert.equal(plugins[2].config.redis.host, '****');
});

test('keeps rename lists, which hold names rather than values', () => {
  const { config } = mask({
    name: 'request-transformer',
    config: {
      rename: {
        headers: ['X-API-Key:X-Upstream-Key'],
        querystring: ['apikey:key'],
        body: ['token:access_token'],
      },
    },
  });
  assert.deepEqual(config.rename, {
    headers: ['X-API-Key:X-Upstream-Key'],
    querystring: ['apikey:key'],
    body: ['token:access_token'],
  });
});

test('keeps Kong vault references visible', () => {
  const { config } = mask({
    name: 'rate-limiting',
    config: {
      redis: { password: '{vault://env/redis-pass}', host: 'redis.internal' },
      client_secret: '{vault://hcv/oidc/secret}',
      add: { headers: ['X-Api-Key:{vault://env/upstream-key}'] },
    },
  });
  assert.equal(config.redis.password, '{vault://env/redis-pass}');
  assert.equal(config.redis.host, '****');
  assert.equal(config.client_secret, '{vault://hcv/oidc/secret}');
  assert.deepEqual(config.add.headers, [
    'X-Api-Key:{vault://env/upstream-key}',
  ]);
});

test('keeps WWW-Authenticate challenge parameters', () => {
  const { config } = mask({
    name: 'response-transformer',
    config: {
      add: { headers: ['WWW-Authenticate:Bearer realm="api"'] },
      message: 'use Bearer abc123def',
    },
  });
  assert.deepEqual(config.add.headers, ['WWW-Authenticate:Bearer realm="api"']);
  assert.equal(config.message, 'use Bearer ****');
});

test('masks more secret field names', () => {
  const { config } = mask({
    name: 'custom-plugin',
    config: {
      pwd: 'p1',
      db_pass: 'p2',
      key_passphrase: 'p3',
      authorization_value: 'v4',
      partner_credentials: { id: 'c1' },
      hide_credentials: true,
      pass_stripped_path: false,
    },
  });
  assert.deepEqual(config, {
    pwd: '****',
    db_pass: '****',
    key_passphrase: '****',
    authorization_value: '****',
    partner_credentials: '****',
    hide_credentials: true,
    pass_stripped_path: false,
  });
});

test('masks more credential header and parameter names', () => {
  const { config } = mask({
    name: 'request-transformer',
    config: {
      add: {
        headers: ['X-Auth:a1', 'X-Signature:s8', 'X-Request-Id:r1'],
      },
      url: 'https://h/p?sig=s1&pwd=p1&pass=p2&code=c1',
    },
  });
  assert.deepEqual(config.add.headers, [
    'X-Auth:****',
    'X-Signature:****',
    'X-Request-Id:r1',
  ]);
  assert.equal(config.url, 'https://h/p?sig=****&pwd=****&pass=****&code=c1');
});

test('masks secret-named assignments inside strings', () => {
  const { config } = mask({
    name: 'custom-plugin',
    config: {
      json_body: '{"client_secret":"s9","grant_type":"client_credentials"}',
      script: 'local api_key = "k1"\nlocal region = "ca"',
      dsn: 'Server=db;User Id=u;Password=p9;',
    },
  });
  assert.equal(
    config.json_body,
    '{"client_secret":"****","grant_type":"client_credentials"}'
  );
  assert.equal(config.script, 'local api_key = "****"\nlocal region = "ca"');
  assert.equal(config.dsn, 'Server=db;User Id=u;Password=****;');
});

test('masks tokens, JWTs, AWS key IDs and PGP keys in any string', () => {
  const { config } = mask({
    name: 'custom-plugin',
    config: {
      values: [
        'authorization: bearer abcdefghijk',
        'Splunk 1234-abcd',
        'Token t0k3n',
        'local t = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.sig"',
        'AKIAABCDEFGHIJKLMNOP',
        '-----BEGIN PGP PRIVATE KEY BLOCK-----\nabc\n-----END PGP PRIVATE KEY BLOCK-----',
      ],
    },
  });
  assert.deepEqual(config.values, [
    'authorization: bearer ****',
    'Splunk ****',
    'Token ****',
    'local t = "****"',
    '****',
    '****',
  ]);
});
