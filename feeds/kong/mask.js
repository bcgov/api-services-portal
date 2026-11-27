// Plugin config from Kong can hold secrets, which must be masked before the
// config is sent to the Portal (where it is stored and shown in reports).
//
// The config is walked at any depth and masked by:
// - field name: fields whose name marks them as a secret (passwords, secrets,
//   keys, tokens, credentials). This covers every field that Kong 3.9 flags as
//   `encrypted` or `referenceable` in its bundled plugin schemas, and the
//   secret fields of the BC Gov plugins (e.g. oidc client_secret, pep
//   auth_header_value). Booleans and numbers are never masked.
// - Redis connection details: host, username and password of any `redis`
//   object (Kong 3.x) and the legacy flat `redis_*` fields.
// - header and parameter values: `Name:value` entries in transformer lists
//   (request-transformer, response-signer, ...) and `{ Name: value }` header
//   maps (http-log, opentelemetry) whose name marks them as a credential.
// - value content, in any string: PEM private key blocks, credentials in URLs
//   (user:password@ and secret query parameters) and Bearer/Basic tokens.

const MASK = '****';

// legacy flat fields, e.g. config.redis_host
const redisFields = ['redis_host', 'redis_username', 'redis_password'];

// fields of a nested redis object, e.g. config.redis.host
const nestedRedisFields = [
  'host',
  'username',
  'password',
  'sentinel_username',
  'sentinel_password',
];

// Kong `encrypted` fields that the name patterns below do not cover
const secretFields = [
  'account_email',
  'aws_assume_role_arn',
  'clientid',
  'credentials',
  'eab_kid',
  'gcp_service_account_json',
  'key_alt',
];

const secretFieldPatterns = [
  /passw(or)?d/, // password, redis_password, sentinel_password, passwd
  /secret/, // client_secret, session_secret, aws_secret, secret_v1
  /api_?key/, // apikey, api_key
  /(^|_)token$/, // token (vault, consul), auth_token, access_token
  /(^|_)username$/, // username, redis_username
  /(^|_)priv(ate)?_key$/, // private_key, ssl_client_priv_key
  /(^|_)(aws_access_key_id|access_key|aws_key)$/,
  /(^|_)(hmac|provision|signing)_key$/, // eab_hmac_key, provision_key
  /^key$/, // loggly key
  /(^|_)(header|param)_value$/, // auth.header_value, pep auth_header_value
];

function isSecretField(key) {
  const name = key.toLowerCase();
  return (
    secretFields.includes(name) ||
    secretFieldPatterns.some((pattern) => pattern.test(name))
  );
}

// header, query string and body parameter names that carry credentials
function isSecretName(name) {
  const compact = name.toLowerCase().replace(/[-_\s]/g, '');
  return (
    ['authorization', 'proxyauthorization', 'cookie', 'setcookie'].includes(
      compact
    ) ||
    /apikey|token|secret|passw(or)?d|credential/.test(compact) ||
    compact.endsWith('key')
  );
}

// transformer lists of `Name:value` entries, e.g. config.add.headers
const nameValueListFields = ['headers', 'querystring', 'body', 'json'];

const pemPrivateKey =
  /-----BEGIN [A-Z0-9 ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z0-9 ]*PRIVATE KEY-----/g;
const urlUserInfo = /\b([a-z][a-z0-9+.-]*:\/\/)[^\s/?#@]+@/gi;
const urlQueryParam = /([?&])([^=&#\s]+)=([^&#\s]*)/g;
const authScheme = /\b(Bearer|Basic)\s+[A-Za-z0-9._~+/=-]+/g;

function scrubString(value) {
  return value
    .replace(pemPrivateKey, MASK)
    .replace(urlUserInfo, `$1${MASK}@`)
    .replace(urlQueryParam, (match, sep, name, paramValue) =>
      isSecretName(name) && paramValue !== '' ? `${sep}${name}=${MASK}` : match
    )
    .replace(authScheme, `$1 ${MASK}`);
}

function maskNameValueEntry(entry) {
  const separator = entry.indexOf(':');
  if (separator <= 0) {
    return entry;
  }
  const name = entry.substring(0, separator);
  const value = entry.substring(separator + 1);
  return isSecretName(name.trim()) && value.trim() !== ''
    ? `${name}:${MASK}`
    : entry;
}

function maskValue(value) {
  return value === null || value === undefined ? value : MASK;
}

function isMaskable(value) {
  return (
    value !== null &&
    value !== undefined &&
    typeof value !== 'boolean' &&
    typeof value !== 'number'
  );
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function maskNode(node, parentKey) {
  if (Array.isArray(node)) {
    node.forEach((element, index) => {
      if (typeof element === 'string') {
        const entry = nameValueListFields.includes(parentKey)
          ? maskNameValueEntry(element)
          : element;
        node[index] = scrubString(entry);
      } else {
        maskNode(element, parentKey);
      }
    });
  } else if (isPlainObject(node)) {
    Object.keys(node).forEach((key) => {
      const value = node[key];
      if (redisFields.includes(key)) {
        node[key] = maskValue(value);
      } else if (isSecretField(key) && isMaskable(value)) {
        node[key] = MASK;
      } else if (key === 'redis' && isPlainObject(value)) {
        nestedRedisFields
          .filter((field) => field in value)
          .forEach((field) => {
            value[field] = maskValue(value[field]);
          });
        maskNode(value, key);
      } else if (key === 'headers' && isPlainObject(value)) {
        Object.keys(value)
          .filter((name) => isSecretName(name) && isMaskable(value[name]))
          .forEach((name) => {
            value[name] = MASK;
          });
        maskNode(value, key);
      } else if (typeof value === 'string') {
        node[key] = scrubString(value);
      } else {
        maskNode(value, key);
      }
    });
  }
  return node;
}

const mask = function (plugin) {
  if ('config' in plugin) {
    maskNode(plugin['config'], 'config');
  }
  return plugin;
};

module.exports = mask;
